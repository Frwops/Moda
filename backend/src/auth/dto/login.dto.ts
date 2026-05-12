import { Matches, IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

const gmailConsumer = /@(gmail|googlemail)\.com$/i;

export class LoginDto {
  @IsEmail()
  @Matches(gmailConsumer, {
    message: 'emailMustBeGmailConsumer',
  })
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
