'use client';
import { validateSync } from 'class-validator';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/form/button';
import { colors } from '@/components/types/enums/colors';
import LoginForm from '@/components/auth/loginForm';
import LandingNav from '@/app/landing/landingNav';
import PasswordInput from '@/components/form/passwordInput';
import useApi from '@/hooks/useApi';

// Simulación temporal de DTO (debes importar tu clase real si existe)
class CredentialsValidation {
  email = '';
  password = '';
}

export default function Page(props) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const queryParams = useMemo(() => {
    if (props.searchParams?.callback) {
      return `?callback=${encodeURIComponent(props.searchParams.callback)}`;
    } else {
      return '';
    }
  }, [props.searchParams?.callback]);

  const submitForm = useCallback(() => {
    setIsLoading(true);
    api.post('/user/auth/login', { 
        email: email,
        password: password,
    })
    .then((response) => {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
        localStorage.setItem('token', response.data.token);
        router.push(`/meetings/view`);     
    })
    .catch((error) => {
        console.error("Error al realizar la solicitud:", error); 
        const errorMessage = error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : "Error en los datos";

        setErrorMessage(errorMessage);
        setShowErrorMessage(true); 
        setTimeout(() => setShowErrorMessage(false), 2000); 
    })
    .finally(() => {
        setIsLoading(false);
    });
  }, [api, email, password, router]);

  const validate = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    const dto = new CredentialsValidation();
    dto.email = email;
    dto.password = password;
    const validationErrors = validateSync(dto);
    if (validationErrors.length <= 0) {
      submitForm();
    } else {
      setIsLoading(false);
    }
  }, [email, password, submitForm]);

  const onPwdKeyDown = (e) => {
    if (e.key === 'Enter') {
      validate(e);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <LandingNav />
      <div className="flex flex-1 items-center justify-center bg-center bg-cover bg-[url('/login/lgbg.png')]">
        <div className="flex items-center justify-center min-h-screen px-4 py-5 md:py-[10px]">
          <form
            onSubmit={validate}
            className="w-full max-w-md bg-white rounded-md px-6 md:px-[40px] py-6 md:py-8 flex flex-col items-center shadow-md"
          >
            <Image
              src="/logos/Lg_JIso.svg"
              alt="Logo"
              width={217}
              height={48}
              className="mt-4 md:mt-[30px]"
            />
            <p className="text-black text-center mb-4 mt-4 md:my-[16px] font-semibold">
              Inicia sesión para acceder a las salas de reunión
            </p>
            <div className="mb-4 w-full flex flex-col">
              <label htmlFor="email" className="mb-2 text-[#425466]">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Escribe tu contraseña"
              />
            </div>
            <div className="w-full mt-6">
              <button
                type="submit"
                className="w-full bg-[#FDD500] py-3 rounded-full text-black font-medium hover:bg-[#E5C200] transition"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
