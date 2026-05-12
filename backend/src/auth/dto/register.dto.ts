import { Matches, IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

const gmailConsumer = /@(gmail|googlemail)\.com$/i;

/** OWASP-style: length + mixed case + digit + symbol */
const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).+$/;

export class RegisterDto {
  @IsEmail()
  @Matches(gmailConsumer, {
    message: 'emailMustBeGmailConsumer',
  })
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(strongPassword, {
    message: 'passwordTooWeak',
  })
  password!: string;
}
