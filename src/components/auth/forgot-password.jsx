import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { Input } from '../form/input';
import { Button } from '../form/button';
import { colors } from '../types/enums/colors';
import useApi from '@/hooks/useApi';

const RecoveryForm = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false); // Controla la vista del formulario
    const [verificationCode, setVerificationCode] = useState(''); // Estado para el código de verificación
    const api = useApi();

    const showToast = (type, message) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    const submitForm = useCallback(() => {
        setIsLoading(true);
        api.post('/user/auth/forgot', { email })
            .then((response) => {
                console.log(response);
                const { data } = response;

                if (data === 'Correo encontrado') {
                    showToast('success', 'Correo enviado exitosamente');
                    setIsCodeSent(true); // Cambia el estado para mostrar el input de código
                } else if (data === 'Correo no encontrado') {
                    showToast('error', 'El correo electrónico no está registrado');
                } else {
                    showToast('error', 'Respuesta inesperada del servidor');
                }
            })
            .catch((error) => {
                console.error("Error al realizar la solicitud:", error);
                const errorMessage = error.response && error.response.data && error.response.data.error
                    ? error.response.data.error
                    : "Error al enviar el correo";

                showToast('error', errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [api, email]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isCodeSent) {
            handleVerificationSubmit();
        } else {
            submitForm();
        }
    };

    const handleVerificationSubmit = () => {
        // Lógica para manejar la verificación del código...
        console.log("Código de verificación ingresado:", verificationCode);
        showToast('success', 'Código verificado correctamente');
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-md p-6 w-[90%] max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        {isCodeSent ? "Introduce el código de verificación" : "Recuperar Contraseña"}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        {isCodeSent ? (
                            <>
                                <label htmlFor="verificationCode" className="mb-2 text-[#425466]">
                                    Se envió un código, introduzca el código
                                </label>
                                <Input
                                    type="text"
                                    id="verificationCode"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Introduce el código de 6 dígitos"
                                    maxLength={6}
                                    className="mb-4 bg-[#EDF2F7] text-[#7A828A]"
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor="email" className="mb-2 text-[#425466]">
                                    Correo electrónico
                                </label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Introduce tu correo electrónico"
                                    className="mb-4 bg-[#EDF2F7] text-[#7A828A]"
                                />
                            </>
                        )}
                        <Button
                            rounded
                            isLoading={isLoading}
                            type="submit" 
                            color={colors.PRIMARY}
                            className="w-full text-black"
                        >
                            {isCodeSent ? "Verificar Código" : "Enviar"}
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-4 text-sm text-[#777E90] hover:underline"
                        >
                            Cancelar
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RecoveryForm;
