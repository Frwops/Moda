import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { Repository } from 'typeorm';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';

const BCRYPT_COST = 12;
const ACCESS_TTL_SEC = 900;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthTokensBody = {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly tokenType: 'Bearer';
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private assertGmailConsumerDomain(email: string): void {
    if (!/@(gmail|googlemail)\.com$/i.test(email)) {
      throw new ForbiddenException('gmailConsumerOnly');
    }
  }

  private hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw, 'utf8').digest('hex');
  }

  private async issueTokens(user: User): Promise<{ body: AuthTokensBody; refreshRaw: string }> {
    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        typ: 'access',
      },
      { expiresIn: ACCESS_TTL_SEC },
    );

    const refreshRaw = randomBytes(48).toString('base64url');
    const tokenHash = this.hashRefreshToken(refreshRaw);
    const expiresAt = new Date(Date.now() + REFRESH_MS);

    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        revokedAt: null,
      }),
    );

    return {
      body: {
        accessToken,
        expiresIn: ACCESS_TTL_SEC,
        tokenType: 'Bearer',
      },
      refreshRaw,
    };
  }

  async register(dto: RegisterDto): Promise<{ body: AuthTokensBody; refreshRaw: string }> {
    const email = this.normalizeEmail(dto.email);
    this.assertGmailConsumerDomain(email);

    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('emailAlreadyRegistered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = this.users.create({
      email,
      passwordHash,
      googleSub: null,
    });
    await this.users.save(user);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<{ body: AuthTokensBody; refreshRaw: string }> {
    const email = this.normalizeEmail(dto.email);
    this.assertGmailConsumerDomain(email);

    const user = await this.users.findOne({ where: { email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('invalidCredentials');
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('invalidCredentials');
    }

    return this.issueTokens(user);
  }

  async googleAuth(dto: GoogleAuthDto): Promise<{ body: AuthTokensBody; refreshRaw: string }> {
    const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(clientId);
    let payload: TokenPayload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      const p = ticket.getPayload();
      if (!p?.sub || !p.email) {
        throw new UnauthorizedException('invalidGoogleToken');
      }
      payload = p;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('invalidGoogleToken');
    }

    const googleEmail = payload.email;
    if (!googleEmail) {
      throw new UnauthorizedException('invalidGoogleToken');
    }
    const email = this.normalizeEmail(googleEmail);
    this.assertGmailConsumerDomain(email);

    const sub = payload.sub;
    if (!sub) {
      throw new UnauthorizedException('invalidGoogleToken');
    }

    const bySub = await this.users.findOne({ where: { googleSub: sub } });
    if (bySub) {
      return this.issueTokens(bySub);
    }

    const byEmail = await this.users.findOne({ where: { email } });
    if (byEmail) {
      if (byEmail.googleSub && byEmail.googleSub !== sub) {
        throw new ConflictException('accountConflict');
      }
      byEmail.googleSub = sub;
      await this.users.save(byEmail);
      return this.issueTokens(byEmail);
    }

    const user = this.users.create({
      email,
      passwordHash: null,
      googleSub: sub,
    });
    await this.users.save(user);
    return this.issueTokens(user);
  }

  async refresh(refreshRaw: string | undefined): Promise<{ body: AuthTokensBody; refreshRaw: string }> {
    if (!refreshRaw || refreshRaw.length < 32) {
      throw new UnauthorizedException('invalidRefresh');
    }

    const tokenHash = this.hashRefreshToken(refreshRaw);
    const row = await this.refreshTokens.findOne({ where: { tokenHash } });

    const now = new Date();
    if (!row || row.revokedAt !== null || row.expiresAt <= now) {
      throw new UnauthorizedException('invalidRefresh');
    }

    row.revokedAt = now;
    await this.refreshTokens.save(row);

    const user = await this.users.findOne({ where: { id: row.userId } });
    if (!user) {
      throw new UnauthorizedException('invalidRefresh');
    }

    return this.issueTokens(user);
  }

  async logout(refreshRaw: string | undefined): Promise<void> {
    if (!refreshRaw) {
      return;
    }
    const tokenHash = this.hashRefreshToken(refreshRaw);
    await this.refreshTokens.update({ tokenHash }, { revokedAt: new Date() });
  }

  async getProfile(userId: string): Promise<{ id: string; email: string }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email };
  }
}
