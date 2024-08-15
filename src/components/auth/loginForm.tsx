import { validateSync } from 'class-validator';
import { useRouter } from 'next/navigation'; 
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { Input } from '../form/input';
import { CredentialsValidation } from '@/validation/credentialsValidation';
import { Button } from '../form/button';
import PasswordInput from '../form/passwordInput';
import { CLink } from '../link';
import { colors } from '../types/enums/colors';
import useApi from '@/hooks/useApi';
import Image from 'next/image';
import AuthOptions from './authOptions';

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

    const showToast = (type: 'success' | 'error', message: string) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    const submitForm = useCallback(() => {
        setIsLoading(true);
        api.post('/user/auth/login', { 
            email: email,
            password: password,
        })
        .then((response) => {
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 2000);
            showToast('success', 'Usuario y contraseña correctos');
            localStorage.setItem('token', response.data.token);
            router.push(`/auth/complete?token=${response.data}`);     
        })
        .catch((error) => {
            console.error("Error al realizar la solicitud:", error); 
            const errorMessage = error.response && error.response.data && error.response.data.error
                ? error.response.data.error
                : "Error en los datos";
    
            setErrorMessage(errorMessage);
            setShowErrorMessage(true); 
            setTimeout(() => setShowErrorMessage(false), 2000); 
            showToast('error', errorMessage);
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
            <div className="flex items-center justify-center min-h-screen">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        validate(); 
                    }}
                    className='h-[573px] w-[451px] bg-white rounded-md px-[40px] flex flex-col items-center'>
                    <Image
                        src="/logos/Lg_JIso.svg"
                        alt="Logo"
                        width={217}
                        height={48}
                        className='mt-[30px]'
                    />
                    <p className='text-black mb-4 my-[16px] font-semibold'>
                        Inicia sesión para acceder    
                    </p>                    
                    <div className="mb-3 w-[376px] flex flex-col items-center ">
                        <label htmlFor="email" className="mb-2 w-full text-[#425466]">
                            Correo electrónico
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            placeholder="Dirección de correo electrónico."
                            className="w-full bg-[#EDF2F7] text-[#7A828A]"
                        />
                    </div>
                    <div className="w-[376px] flex flex-col items-center">
                        <label htmlFor="password" className="mb-2 text-[#425466] w-full">
                            Contraseña
                        </label>
                        <PasswordInput
                            password={password}
                            setPassword={setPassword}
                            onKeyDown={onPwdKeyDown}
                            error={errors.password}
                            placeholder="Contraseña"
                        />
                    </div>
                    <div className="mr-[255px] flex mt-[8px] w-[120px]">
                        <CLink
                            href="/auth/forgot-password"
                            className="mb-4 text-[11px] text-[#777E90] no-underline">
                            ¿Olvidó su contraseña?
                        </CLink>
                    </div>
                    <div className="w-[376px] mt-[10px] flex justify-center">
                        <Button
                            rounded
                            isLoading={isLoading}
                            type="submit" 
                            onClick={validate}
                            color={colors.PRIMARY}
                            className="w-full outline-0">
                            Entrar
                        </Button>
                    </div>
                    <p className='my-[17px] text-[#777E90]'>o accede mediante otra cuenta</p>
                    <AuthOptions/>
                    <div className='flex font-semibold mt-[26px]'>
                        <p className='text-[#777E90] mr-[5px]'>¿Aún no tienes una cuenta? </p>
                        <p> Registrate gratis</p>
                    </div>
                </form>
            </div>
        </>
    );
}
