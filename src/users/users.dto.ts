import { Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidateNested
} from 'class-validator';


export class UsuarioDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateUserRequestDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UsuarioDto)
  user: UsuarioDto;
}