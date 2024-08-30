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
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeVerified, setIsCodeVerified] = useState(false); // Nuevo estado para verificar el código
    const [newPassword, setNewPassword] = useState(''); // Estado para nueva contraseña
    const [confirmPassword, setConfirmPassword] = useState(''); // Estado para confirmar contraseña
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
                const { data } = response;
                if (data === 'Correo encontrado y código enviado') {
                    showToast('success', 'Código de verificación enviado exitosamente');
                    setIsCodeSent(true); 
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

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (value.match(/^[0-9]$/)) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode.join(''));
            const nextInput = document.getElementById(`digit-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleVerificationSubmit = () => {
        setIsLoading(true);
        api.post('/user/auth/verifyCode', { email , verificationCode })
            .then((response) => {
                const { data } = response;
                if (data === 'Código verificado') {
                    showToast('success', 'Código verificado correctamente');
                    setIsCodeVerified(true); 
                } else {
                    showToast('error', data);
                }
            })
            .catch((error) => {
                console.error("Error al realizar la solicitud:", error);
                const errorMessage = error.response && error.response.data && error.response.data.error
                    ? error.response.data.error
                    : "Error al verificar el código";

                showToast('error', errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePasswordResetSubmit = () => {
        if (newPassword !== confirmPassword) {
            showToast('error', 'Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        api.post('/user/auth/resetPassword', { email, newPassword })
            .then((response) => {
                if(response.status == 200){
                    showToast('success', 'Contraseña restablecida correctamente');
                    onClose(); 
                } else{
                    showToast('error', 'Error al restablecer la contraseña');
                }
            })
            .catch((error) => {
                console.error("Error al restablecer la contraseña:", error);
                const errorMessage = error.response && error.response.data && error.response.data.error
                    ? error.response.data.error
                    : "Error al restablecer la contraseña";

                showToast('error', errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isCodeVerified) {
            handlePasswordResetSubmit();
        } else if (isCodeSent) {
            handleVerificationSubmit();
        } else {
            submitForm();
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-md p-6 w-[90%] max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        {isCodeVerified ? "Restablecer Contraseña" :
                         isCodeSent ? "Introduce el código de verificación" : 
                         "Recuperar Contraseña"}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        {isCodeVerified ? (
                            <>
                                <label htmlFor="newPassword" className="mb-2 text-[#425466]">
                                    Nueva Contraseña
                                </label>
                                <Input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Introduce tu nueva contraseña"
                                    className="mb-4 bg-[#EDF2F7] text-[#7A828A]"
                                />
                                <label htmlFor="confirmPassword" className="mb-2 text-[#425466]">
                                    Confirmar Contraseña
                                </label>
                                <Input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirma tu nueva contraseña"
                                    className="mb-4 bg-[#EDF2F7] text-[#7A828A]"
                                />
                            </>
                        ) : isCodeSent ? (
                            <>
                                <label htmlFor="verificationCode" className="mb-2 text-[#425466]">
                                    Se envió un código, introduzca el código
                                </label>
                                <div className="flex justify-between mb-4">
                                    {[...Array(6)].map((_, index) => (
                                        <input
                                            key={index}
                                            id={`digit-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={verificationCode[index] || ""}
                                            onChange={(e) => handleChange(e, index)}
                                            className="w-12 h-12 text-center bg-[#EDF2F7] text-[#7A828A] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7A828A] focus:border-transparent"
                                        />
                                    ))}
                                </div>
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
                            {isCodeVerified ? "Restablecer Contraseña" : 
                             isCodeSent ? "Verificar Código" : "Enviar"}
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
