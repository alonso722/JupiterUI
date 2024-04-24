import { validateSync } from 'class-validator';
import { useRouter } from 'next/router'; 
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8070/';

import { Input } from '../form/input';
import { CredentialsValidation } from '@/validation/credentialsValidation';
import { Button } from '../form/button';
import PasswordInput from '../form/passwordInput';
import { CLink } from '../link';
import { colors } from '../types/enums/colors';

interface LoginFormValues {
    email: string | null;
    password: string | null;
}

export default function LoginForm({
    queryParams,
}: {
    queryParams: string;
}) {
    const router = useRouter(); // Cambia esta línea

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [errors, setErrors] = useState<LoginFormValues>({
        email: '',
        password: '',
    });

    const submitForm = useCallback(() => {
        setIsLoading(true);
        console.log("a")
        console.log("Datos que se están enviando al backend:", {
            email: email,
            password: password,
        });
        console.log("a")
        axios.post('/user/auth/login', { 
            email: email,
            password: password,
        }) .then((response) => {
            console.log("Respuesta del backend:", response.data); 
            toast.success(
                'Usuario y contraseña correctos'
            );
            console.log("Respuesta del backend:", response.data); 
            console.log("Redireccionando a /auth/complete/");
            router.push(`/auth/complete/`); 
        })
        .catch((error) => {
            console.error("Error al realizar la solicitud:", error); 
            console.log("Respuesta del backend:", error.response.data); 
            toast.error(error.response.data.message || "Error desconocido");
        })
            .finally(() => {
                setIsLoading(false);
            });
            console.log("b")
    }, [email, password, router, queryParams]);

    const validate = useCallback(
        (e?: React.MouseEvent<HTMLButtonElement>) => {
            e?.preventDefault();
            setIsLoading(true);
            const dto = new CredentialsValidation();
            dto.email = email;
            dto.password = password;
            const errors = validateSync(dto);
            if (errors.length > 0) {
            }
            if (errors.length <= 0) {
                submitForm();
            } else {
                setIsLoading(false);
            }
        },
        [email, password, submitForm]
    );

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    validate(); 
                }}>
                <div className="mb-7 grid grid-rows-1">
                    <label htmlFor="" className="mb-2 flex w-full">
                        Correo electrónico
                    </label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="Dirección de correo electrónico."/>
                </div>
                <div className="mb-3 grid grid-rows-1">
                    <label htmlFor="" className="mb-2 flex w-full">
                        Contraseña
                    </label>
                    <PasswordInput
                        password={password}
                        setPassword={setPassword}
                        error={errors.password}
                        placeholder="Contraseña"/>
                </div>
                <div>
                    <CLink
                        href="/auth/forgot-password"
                        className="mb-4 mt-2 flex text-[11px] text-[#777E90] no-underline">
                        ¿Olvidó su contraseña?
                    </CLink>
                </div>
                <div className="grid grid-rows-1">
                    <Button
                        rounded
                        isLoading={isLoading}
                        type="submit" 
                        >
                        Entrar
                    </Button>
                </div>
            </form>
        </>
    );
}
