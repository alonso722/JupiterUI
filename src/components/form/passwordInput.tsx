import { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { Input } from './input'; 

interface IPasswordINput {
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    error?: string | null;
    name?: string;
}

export default function PasswordInput({
    password,
    setPassword,
    placeholder,
    onKeyDown,
    error,
    name
}: IPasswordINput) {

    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <>
            <Input
                placeholder={placeholder}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                }}
                icon={showPassword ? AiFillEyeInvisible : AiFillEye}
                onIconClick={() => {
                    setShowPassword((v) => !v);
                }}
                onKeyDown={onKeyDown}
                error={error}
                name={name}
                className='p-2'
            />
        </>
    );
}
