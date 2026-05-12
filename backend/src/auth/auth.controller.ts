import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_PATH = '/api/v1/auth';

@Controller('auth')
@Throttle({ default: { limit: 60, ttl: 60000 } })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setRefreshCookie(res: Response, refreshRaw: string): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(REFRESH_COOKIE, refreshRaw, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: REFRESH_PATH,
      maxAge,
    });
  }

  private clearRefreshCookie(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: REFRESH_PATH,
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { body, refreshRaw } = await this.auth.register(dto);
    this.setRefreshCookie(res, refreshRaw);
    return body;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { body, refreshRaw } = await this.auth.login(dto);
    this.setRefreshCookie(res, refreshRaw);
    return body;
  }

  @Post('google')
  async google(
    @Body() dto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { body, refreshRaw } = await this.auth.googleAuth(dto);
    this.setRefreshCookie(res, refreshRaw);
    return body;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const { body, refreshRaw } = await this.auth.refresh(raw);
    this.setRefreshCookie(res, refreshRaw);
    return body;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(raw);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.auth.getProfile(req.user.userId);
  }
}
