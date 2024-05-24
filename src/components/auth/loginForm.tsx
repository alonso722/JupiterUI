import { validateSync } from 'class-validator';
import { useRouter } from 'next/navigation'; 
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { Input } from '../form/input';
import { CredentialsValidation } from '@/validation/credentialsValidation';
import { Button } from '../form/button';
import PasswordInput from '../form/passwordInput';
import { CLink } from '../link';
import { colors } from '../types/enums/colors';
import useApi from '@/hooks/useApi';

interface LoginFormValues {
    email: string | null;
    password: string | null;
}

export default function LoginForm({
    queryParams,
}: {
    queryParams: string;
}) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter(); 

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const api= useApi();
    const [errors, setErrors] = useState<LoginFormValues>({
        email: '',
        password: '',
    });

    const submitForm = useCallback(() => {
        setIsLoading(true);
        api.post('/user/auth/login', { 
            email: email,
            password: password,
        })
        .then((response) => {
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 2000);
            toast.success('Usuario y contraseña correctos');
            // localStorage
            console.log("data en response",response.data.token)
            localStorage.setItem('token', response.data.token);
            router.push(`/auth/complete?token=${response.data}`);     
        })
        .catch((error) => {
            console.error("Error al realizar la solicitud:", error); 
            setErrorMessage(error.response || "Error desconocido");
            setShowErrorMessage(true); 
            setTimeout(() => setShowErrorMessage(false), 2000); 
            toast.error(error.response || "Error en los datos");
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [api, email, password, router, queryParams]);

    const validate = useCallback(
        (e?: React.MouseEvent<HTMLButtonElement>) => {
            e?.preventDefault();
            setIsLoading(true);
            const dto = new CredentialsValidation();
            dto.email = email;
            dto.password = password;
            const errors = validateSync(dto);
            if (errors.length <= 0) {
                submitForm();
            } else {
                setIsLoading(false);
            }
        },
        [email, password, submitForm]
    );
    const onPwdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            validate();
        }
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    validate(); 
                }}>
                <div className="mb-7 grid grid-rows-1">
                    <label htmlFor="" className="justify-center mb-2 flex w-full">
                        Correo electrónico
                    </label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="Dirección de correo electrónico."/>
                </div>
                <div className=" mb-3 grid grid-rows-1">
                    <label htmlFor="" className="justify-center mb-2 flex w-full">
                        Contraseña
                    </label>
                    <PasswordInput
                        password={password}
                        setPassword={setPassword}
                        onKeyDown={onPwdKeyDown}
                        error={errors.password}
                        placeholder="Contraseña"/>
                </div>
                <div>
                    <CLink
                        href="/auth/forgot-password"
                        className="mb-4 mt-2 flex text-[11px] text-[#2C1C47] no-underline">
                        ¿Olvidó su contraseña?
                    </CLink>
                </div>
                <div className="grid grid-rows-1">
                    <Button
                        rounded
                        isLoading={isLoading}
                        type="submit" 
                        onClick={validate}
                        color={colors.ALTERNATIVE}>
                        Entrar
                    </Button>
                </div>
            </form>
        </>
    );
}
