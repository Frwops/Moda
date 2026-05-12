import { IsString, MinLength, MaxLength } from 'class-validator';

export class GoogleAuthDto {
  /** Google Identity Services credential (JWT) */
  @IsString()
  @MinLength(100)
  @MaxLength(8192)
  idToken!: string;
}
