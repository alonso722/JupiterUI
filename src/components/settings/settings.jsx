import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import Image from 'next/image';
import { SketchPicker } from 'react-color';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';

export const Settings = ({ initialPrimaryColor = "##F1CF2B", initialSecondaryColor = "#442E69" }) => {
    const [permissions, setPermissions] = useState([]);
    const [info, setInfo] = useState({});
    const [priColor, setPriColor] = useState(initialPrimaryColor); 
    const [secColor, setSecColor] = useState(initialSecondaryColor);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [files, setFile] = useState([]);
    const [logoUrl, setLogoUrl] = useState('');
    const { primary, secondary } = useColors();
    const effectMounted = useRef(false);
    const api = useApi();

    const showToast = (type, message) => {
        toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
        });
    };

    useEffect(() => {
        if (!effectMounted.current) {
            const fetchData = async () => {
                try {
                    let parsedPermissions;
                    const storedPermissions = localStorage.getItem('permissions');
                    if (storedPermissions) {
                        parsedPermissions = JSON.parse(storedPermissions);
                        setPermissions(parsedPermissions);
                    }
            
                    const profileResponse = await api.post('/user/organization/getSets', parsedPermissions);
                    const data = profileResponse.data.data;
                    const imageData = data.t01_organization_logo;
            
                    if (imageData?.data) { 
                        const arrayBuffer = imageData.data;  
                        const blob = new Blob([new Uint8Array(arrayBuffer)], { type: data.t01_logo_mimetype });
                        const url = URL.createObjectURL(blob);
                        setLogoUrl(url);
                    } else {
                        console.log("No hay logo disponible"); 
                    }
            
                    setPriColor(data.t01_primary_color || initialPrimaryColor);
                    setSecColor(data.t01_secondary_color || initialSecondaryColor);
                    setInfo(data);
                } catch (error) {
                    console.error("Error al consultar los perfiles:", error);
                }
            };
            
            fetchData();
            effectMounted.current = true;
        }
    }, [api]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && !['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
            showToast('error', 'Solo se permiten archivos de imagen (JPEG, PNG, GIF).');
            setFile(null);
        } else {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!files) {
            showToast('error', 'Por favor, seleccione un archivo para cargar.');
            return;
        }
        const file = Array.isArray(files) ? files[0] : files;
        if (!file.type.startsWith('image/')) {
            showToast('error', 'El archivo seleccionado no es una imagen.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const orga = permissions.Organization || '';
        formData.append('orga', orga);

        try {
            const response = await api.post('/user/organization/updateLogo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'orgaId': orga,
                },
            });

            if (response.status === 200) {
                showToast('success', 'Imagen cargada exitosamente.');
                closeModal();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);  
            } else {
                showToast('error', 'Error al cargar la imagen.');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            showToast('error', 'Error en la solicitud.');
        }
    };

    const handlePrimaryColorChange = (newColor) => {
        setPriColor(newColor.hex); 
    };

    const handleSecondaryColorChange = (newColor) => {
        setSecColor(newColor.hex); 
    };

    const handleUpdateColor = async () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions');
        parsedPermissions = JSON.parse(storedPermissions);
        try {
            let sets = {
                orga: parsedPermissions.Organization,
                primary: priColor,
                secondary: secColor,
            };
            const response = await api.post('/user/organization/setSets', { sets });
            if (response.status === 200) {
                showToast('success', 'Colores actualizados exitosamente');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);  
            } else {
                showToast('error', 'Error al actualizar los colores');
            }
        } catch (error) {
            console.error('Error al actualizar los colores:', error);
            showToast('error', 'Error al actualizar los colores');
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="mt-[60px] ml-[100px] mr-[250px] w-[100%] text-neutral-50 rounded">
            <div className="mt-8 text-black">
                <div className="mb-5">
                    <h1 className="text-black text-xl mb-5">
                        <strong>Personalización</strong>
                    </h1>
                </div>
                <div className="flex">
                    <div>
                        <div className="flex ">
                            <div className="mb-5 mr-20">
                                <h2 className="text-lg mb-3">Selecciona un color primario:</h2>
                                <SketchPicker 
                                    color={priColor} 
                                    onChangeComplete={handlePrimaryColorChange} />
                            </div>
                            <div className="mb-5">
                                <h2 className="text-lg mb-3">Selecciona un color secundario:</h2>
                                <SketchPicker 
                                    color={secColor} 
                                    onChangeComplete={handleSecondaryColorChange} />
                            </div> 
                        </div>
                        <button 
                            className="mt-5 ml-[180px] bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                            onClick={handleUpdateColor}>
                            Actualizar Colores
                        </button>
                    </div>
                    <div className="flex flex-col justify-center items-center h-full ml-[200px]">
                    <p className="text-lg mb-3">Su logo actual:</p>
                        <div className="flex items-center pb-4 pt-5">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="Logo"
                                    width={180}
                                    height={29}
                                />
                            ) : (
                                <p className="text-white">No hay logo disponible</p> 
                            )}
                        </div>
                        <button
                            onClick={openModal}
                            className="bg-white text-black mt-4 rounded-lg p-3 border-2">
                            <p>Cambiar logo</p>
                        </button> 
                    </div>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
                            <button onClick={closeModal} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
                                &times;
                            </button>
                            <h2 className="text-2xl mb-4 text-black">Cargar nuevo logo</h2>
                            <input type="file" onChange={handleFileChange} className="mb-4" />
                            <div>                    
                                <button
                                    onClick={handleSubmit}
                                    className={`p-2 rounded text-white ${!files ? 'cursor-not-allowed' : 'hover:bg-[#1B1130] cursor-pointer'}`}
                                    style={{ backgroundColor: !files ? 'gray' : secondary }}
                                    disabled={!files}
                                    >
                                    Cargar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
