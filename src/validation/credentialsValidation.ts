import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CredentialsValidation {
    
    @IsString()
    @IsNotEmpty({message: "Ingrese su email"})
    @IsEmail({}, {message: 'Ingrese un email valido.'})
    email : string = '';


    @IsString()
    @IsNotEmpty({message: 'Ingrese su contraseña'})
    password : string='';
}