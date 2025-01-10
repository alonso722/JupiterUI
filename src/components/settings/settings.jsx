import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import Image from 'next/image';
import { SketchPicker } from 'react-color';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';
import UsersChecks from '../misc/checkbox/usersChecks';

export const Settings = ({ initialPrimaryColor = "##F1CF2B", initialSecondaryColor = "#442E69" }) => {
    const [permissions, setPermissions] = useState([]);
    const [info, setInfo] = useState({});
    const [priColor, setPriColor] = useState(initialPrimaryColor); 
    const [secColor, setSecColor] = useState(initialSecondaryColor);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [files, setFile] = useState([]);
    const [values, setValues] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [logoUrl, setLogoUrl] = useState('');
    const [history, setHistory] = useState('');
    const [vision, setVision] = useState('');
    const [mision, setMision] = useState('');
    const { primary, secondary } = useColors();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const effectMounted = useRef(false);
    const api = useApi();
    const [newValue, setNewValue] = useState("");
    const [newDocument, setNewDocument] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const showToast = (type, message) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    const handleAddValue = () => {
        let updatedValues = Array.isArray(values) ? values : [];
    
        if (newValue.trim()) {
            setValues([
                ...updatedValues, 
                { 
                    value: newValue, 
                    description: newDescription.trim() || "" 
                }
            ]);
            setNewValue("");
            setNewDescription("");
        }
    };    

    const handleEditValue = (index, field, value) => {
        setValues((prevValues) => {
            const updatedValues = [...prevValues];
            updatedValues[index] = {
                ...updatedValues[index],
                [field]: value,
            };
            return updatedValues;
        });
    };
    
    const handleRemoveValue = (index) => {
      const updatedValues = values.filter((_, i) => i !== index);
      setValues(updatedValues);
    };

    const handleAddDocument = () => {
        if (newDocument.trim() !== "") {
            setDocuments([...documents, newDocument]);
            setNewDocument(""); 
        }
    }; 

    const handleRemoveDocument = (index) => {
        const updatedDocuments = documents.filter((_, i) => i !== index);
        setDocuments(updatedDocuments);
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
                    setHistory(data.t01_organization_history)
                    setVision(data.t01_organization_vision)
                    setMision(data.t01_organization_mision)
                    setDocuments(data.documents)
                    const valuesString = data.t01_organization_values; 
                    const valuesArray = JSON.parse(valuesString);
                    setValues(valuesArray);        
                    setSelectedUsers(data.users)     
                    if (imageData?.data) { 
                        const arrayBuffer = imageData.data;  
                        const blob = new Blob([new Uint8Array(arrayBuffer)], { type: data.t01_logo_mimetype });
                        const url = URL.createObjectURL(blob);
                        setLogoUrl(url);
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

    const handleUpdateSets = async () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions');
        parsedPermissions = JSON.parse(storedPermissions);
        try {
            let sets = {
                orga: parsedPermissions.Organization,
                vision: vision,
                mision: mision,
                history: history,
                primary: priColor,
                secondary: secColor,
                values: values,
                documents: documents,
                users: Array.isArray(selectedUsers) ? selectedUsers.map(user => user.uuid) : []

            };
            const response = await api.post('/user/organization/setSets', { sets });
            if (response.status === 200) {
                showToast('success', 'Personalización actualizada');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);  
            } else {
                showToast('error', 'Error al actualizar las personalizaciones');
            }
        } catch (error) {
            console.error('Error al actualizar las personalizaciones:', error);
            showToast('error', 'Error al actualizar las personalizaciones');
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="mt-[60px] ml-[100px] w-[90%] text-neutral-50 rounded items-center justify-center">
            <div className="mt-8 text-black">
                <div className="mb-2 justify-between flex">
                    <h1 className="text-black text-xl mb-3">
                        <strong>Personalización de la empresa</strong>
                    </h1>
                    <div>                    
                        <button 
                        className="text-white py-1 px-4 text-[12px] rounded-full"
                        onClick={handleUpdateSets}
                        style={{ 
                            backgroundColor: primary,
                        }}>
                        Actualizar cambios
                    </button>
                    </div>
                </div>
                <div className="flex w-full"> 
                    <div className="px-5 mr-2 w-[40%]">                    
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between w-full pb-4 pt-2">
                                <p className="text-black text-[13px]"><b>Logo actual:</b></p>
                                <div className="flex-1 flex justify-center">
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
                                    className="bg-white text-black text-[13px] rounded-full p-2 border-2">
                                    <p><b>Cambiar logo</b></p>
                                </button>
                            </div> 
                        </div>
                        <div className=" flex w-full justify-between">
                            <div className="mb-5 mr-2">
                                <h2 className="text-[15px] mb-3"><b>Selecciona un color primario:</b></h2>
                                <SketchPicker 
                                    className="w-[45%]"
                                    color={priColor} 
                                    onChangeComplete={handlePrimaryColorChange} />
                            </div>
                            <div className="mb-5">
                                <h2 className="text-[15px] mb-3"><b>Selecciona un color secundario:</b></h2>
                                <SketchPicker 
                                className="w-[45%]"
                                    color={secColor} 
                                    onChangeComplete={handleSecondaryColorChange} />
                            </div> 
                        </div>
                    </div>
                    <div className=" pl-5 w-[60%]">
                        <h2 className="text-[13px] mb-1"><b>Historia de la organizacion</b></h2>
                        <p className="text-xl text-black">
                            <textarea
                                type="text"
                                placeholder="Historia de la organizacion"
                                value={history || ""}
                                onChange={(e) => setHistory(e.target.value)}
                                className="w-full py-1 h-[70px] px-3 border-gray-300 rounded focus:border-purple-500 outline-none"
                                style={{
                                    backgroundColor: `#EDF2F7` 
                                }}
                            />
                        </p>
                        <h2 className="text-[13px] mb-1"><b>Misión de la organizacion</b></h2>
                        <p className="text-xl text-black">
                        
                            <textarea
                                type="text"
                                placeholder="Misión de la organización"
                                value={mision || ""}
                                onChange={(e) => setMision(e.target.value)}
                                className="w-full h-[70px] py-1 px-3 border-gray-300  rounded focus:border-purple-500 outline-none"
                                style={{
                                    backgroundColor: `#EDF2F7`, 
                                }}
                            />
                        </p>
                        <h2 className="text-[13px] mb-1"><b>Visión de la organizacion</b></h2>
                        <p className="text-xl mt-[5px] mb-2 text-black">
                            <textarea
                                type="text"
                                placeholder="Visión de la organización"
                                value={vision || ""}
                                onChange={(e) => setVision(e.target.value)}
                                className="w-full py-1 px-3 h-[70px] rounded border-gray-300 focus:border-purple-500 outline-none"
                                style={{
                                    backgroundColor: `#EDF2F7`, 
                                }}
                            />
                        </p>
                        <div className="flex justify-between">
                            <div className="max-h-[180px]">
                                <h2 className=" text-[12px]"><b>Valores</b></h2>
                                <div className="flex items-center mt-2 mr-5 border-2 w-[250px] rounded-lg">
                                    <div className="flex m-2">
                                        <div>
                                            <input
                                                type="text"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                className="p-2  font-bold w-[90%]"
                                                placeholder="Agregar nuevo valor"
                                            />
                                        <input
                                            type="text"
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            className="p-2 "
                                            placeholder="Agregar descripción"
                                        />

                                        </div>
                                        <button
                                            className=" text-black px-1 py-1 mr-2 rounded hover:bg-gray-300"
                                            onClick={handleAddValue}>
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 max-h-[100px] overflow-y-auto">
                                    {(values ?? []).map((item, index) => (
                                        <div key={index} className="flex items-center border-2 w-[250px] overflow-y-auto rounded-lg mt-[10px] mb-2">
                                            <div className="m-2 w-full flex bg-[#EDF2F7] rounded-lg px-2">
                                                <input
                                                    type="text"
                                                    value={item.value}
                                                    onChange={(e) => handleEditValue(index, 'value', e.target.value)}
                                                    className="w-full bg-[#EDF2F7] p-1 mr-2 font-bold rounded "
                                                />
                                                <button
                                                    className=" text-black px-1 py-1 rounded"
                                                    onClick={() => handleRemoveValue(index)}>
                                                    x
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="max-h-[200px] mx-[1%]">
                                <h2 className="mb-2 text-[12px]"><b>Documentos requeridos</b></h2>
                                <div className="flex items-center mb-2 border-2 w-[230px] rounded-lg">
                                    <input
                                        type="text"
                                        value={newDocument} 
                                        onChange={(e) => setNewDocument(e.target.value)} 
                                        className="p-2 mr-2"
                                        placeholder="Agregar documento"
                                    />
                                    <button
                                        className="text-black px-1 py-1 mr-2 rounded"
                                        onClick={handleAddDocument}>
                                        +
                                    </button>
                                </div>
                                <div className="overflow-y-auto h-[140px]">
                                    {(documents ?? []).map((document, index) => (
                                        <div key={index} className="my-2 w-full flex bg-[#EDF2F7] rounded-lg px-2">
                                            <input
                                                type="text"
                                                value={document} 
                                                readOnly
                                                className="bg-[#EDF2F7]"
                                                title={document}
                                            />
                                            <button
                                                className="text-black px-1 py-1 rounded"
                                                onClick={() => handleRemoveDocument(index)}>
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='max-h-[300px] h-[200px] max-w-[200px] mr-3'>
                                <p className="block mb-2 text-[12px] text-black"><b>Encargados de RH</b></p>
                                <UsersChecks selectedOptions={selectedUsers} setSelectedOptions={setSelectedUsers}/>
                            </div>
                        </div>
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
