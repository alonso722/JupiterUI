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
import RecoveryForm from './forgot-password'; 
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

    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const openForgotPasswordModal = () => {
        setIsForgotPasswordOpen(true);
    };

    const closeForgotPasswordModal = () => {
        setIsForgotPasswordOpen(false);
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
            router.push(`/auth/complete?token=${response.data.token}`);     
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
            <div className="flex items-center justify-center min-h-screen px-4 py-5 md:py-[10px]">
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    validate();
                    }}
                    className="w-full max-w-md bg-white rounded-md px-6 md:px-[40px] py-6 md:py-8 flex flex-col items-center shadow-md">
                    <Image
                    src="/logos/Lg_JIso.svg"
                    alt="Logo"
                    width={217}
                    height={48}
                    className="mt-4 md:mt-[30px]"
                    />
                    <p className="text-black text-center mb-4 mt-4 md:my-[16px] font-semibold">
                    Inicia sesión para acceder
                    </p>
                    <div className="mb-4 w-full flex flex-col">
                    <label htmlFor="email" className="mb-2 text-[#425466]">
                        Correo electrónico
                    </label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="Escribe tu correo electrónico"
                        className="w-full bg-[#EDF2F7] text-[#7A828A]"
                    />
                    </div>
                    <div className="mb-4 w-full flex flex-col">
                    <label htmlFor="password" className="mb-2 text-[#425466]">
                        Contraseña
                    </label>
                    <PasswordInput
                        password={password}
                        setPassword={setPassword}
                        onKeyDown={onPwdKeyDown}
                        error={errors.password}
                        placeholder="Escribe tu contraseña"
                    />
                    </div>
                    <div className="flex justify-start w-full mt-1">
                        <button
                            type="button"
                            onClick={openForgotPasswordModal}
                            className="text-xs text-[#777E90] hover:underline">
                            ¿Olvidó su contraseña?
                        </button>
                    </div>
                    <div className="w-full mt-6">
                        <button
                            type="submit"
                            onClick={validate}
                            className="w-full bg-[#FDD500] py-3 rounded-full text-black font-medium hover:bg-[#E5C200] transition">
                            Entrar
                        </button>
                    </div>
                    {/* Si necesitas reactivar AuthOptions */}
                    {/* <p className="my-4 text-center text-[#777E90]">o accede mediante otra cuenta</p>
                    <AuthOptions /> */}
                    {/* <div className="flex justify-center text-sm font-semibold mt-4">
                    <p className="text-[#777E90] mr-2">¿Aún no tienes una cuenta?</p>
                    <CLink href="/registro" className="text-black">
                        Regístrate gratis
                    </CLink>
                    </div> */}
                </form>
            </div>
            {isForgotPasswordOpen && <RecoveryForm onClose={closeForgotPasswordModal} />}
        </>
    );
}
