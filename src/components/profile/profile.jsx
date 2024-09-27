import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import UserInfoModal from '@/components/modals/userInfoModal';
import LaboralInfoModal from '@/components/modals/laboralInfoModal';
import DocsViewer from '../misc/docViewer/docViewer';

export const Profile = ({ departmentFilter, processFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [file, setFile] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [info, setInfo] = useState({});
    const [profesionalInfo, setPInfo] = useState({});
    const [uuid, setUuid] = useState(null)
    const [editMode, setEditMode] = useState(false); 
    const [infoLI, setInfoLI] = useState({});
    const [editModeLI, setEditModeLI] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [urlToView, setFileUrl] = useState(null);
    const effectMounted = useRef(false);
    const api = useApi();

    const openViewer = (path) => {
        setFileUrl(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path);
        setIsViewerOpen(true);
      };
    
      const closeViewer = () => {
        setIsViewerOpen(false);
      };

    const showToast = (type, message) => {
        toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
        });
      };

      useEffect(() => {
        const fetchData = async () => {
            try {
                let parsedPermissions;
                const storedPermissions = localStorage.getItem('permissions');
                const token = localStorage.getItem('token');
                if (storedPermissions) {
                    parsedPermissions = JSON.parse(storedPermissions);
                    setPermissions(parsedPermissions);
                }
    
                const userType = parsedPermissions;
                const uuid = parsedPermissions.uuid;
                setUuid(uuid);
    
                userType.token = token;
                const profileResponse = await api.post('/user/users/profile', userType);
                setInfo(profileResponse.data, parsedPermissions);
    
                if (userType) {
                    const profilePResponse = await api.post('/user/users/profileP', userType);
                    setInfoLI(profilePResponse.data);
                } else {
                    console.error("UUID is not defined");
                }
            } catch (error) {
                console.error("Error al consultar los perfiles:", error);
            }
        };
        fetchData();
    }, []);
    
      const enableEditMode = () => {
        setEditMode(true); 
      };
    
      const handleFileUpload = async (e, fileType) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
          showToast('error', 'Por favor, seleccione un archivo para cargar.');
          return;
        }
        if (selectedFile.type !== 'application/pdf') {
          showToast('error', 'Solo se permiten archivos PDF.');
        } else {
    
          const formData = new FormData();
          formData.append('file', selectedFile);
          try {
            const response = await api.post('/user/file/store', formData);
            let filems = response.data.data;
            filems.type = fileType;
            filems.uuid = uuid.uuid;
            let path = response.data.path;
    
            if (response) {
              api.post('/user/users/store', filems)
                .then((response) => {
                  if (response.status === 200) {
                    showToast('success', 'Archivo cargado con éxito.');
                    fetchData();
                  }
                })
                .catch((error) => {
                  console.error("Error al almacenar el archivo:", error);
                });
            } else {
              console.error('Error al cargar el archivo:', response.statusText);
              alert('Error al cargar el archivo');
            }
          } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Error en la solicitud');
          }
        }
    };
    
    const enableEditModeLI = () => {
        setEditModeLI(true); 
    };

    const handleFileUploadLI = async (e, fileType) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
          showToast('error', 'Por favor, seleccione un archivo para cargar.');
          return;
        }
        if (selectedFile.type !== 'application/pdf') {
          showToast('error', 'Solo se permiten archivos PDF.');
        } else {
          const formData = new FormData();
          formData.append('file', selectedFile);
          try {
            const response = await api.post('/user/file/store', formData);
            let filems = response.data.data;
            filems.type = fileType;
            filems.uuid = uuid.uuid;
            let path = response.data.path;
    
            if (response) {
              api.post('/user/users/storeP', filems)
                .then((response) => {
                  if (response.status === 200) {
                    showToast('success', 'Archivo cargado con éxito.');
                    fetchData();
                  }
                })
                .catch((error) => {
                  console.error("Error al almacenar el archivo:", error);
                });
            } else {
              console.error('Error al cargar el archivo:', response.statusText);
              alert('Error al cargar el archivo');
            }
          } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Error en la solicitud');
          }
        }
    };

    return (
        <div className="mt-[60px] ml-[100px] mr-[250px] w-[100%] text-neutral-50 rounded ">
            <div className="mt-8 text-black  ">
                <div className="mb-5">
                    <h1 className="text-black text-xl mb-5">
                        <strong>Infomación personal</strong>
                    </h1>
                    <div className="ml-3 flex">
                        <div className="">
                            <div className="flex">
                                <p className="mr-9"><strong>Correo:</strong> {info.mail}</p>
                                <p className=""><strong>Teléfono:</strong> {info.phone}</p>   
                            </div>
                            <div className="">
                                <div className="bg-white overflow-auto relative">
                                    <div className='rounded border-2 px-5 max-h-[200px] overflow-y-auto mt-4'>
                                        <ul className='w-full '>
                                            {[
                                            { label: 'Identificación', key: 'dni', file: info.dni },
                                            { label: 'Acta de nacimiento', key: 'birth', file: info.birth },
                                            { label: 'CURP', key: 'curp', file: info.curp },
                                            { label: 'Comprobante de domicilio', key: 'address', file: info.address },
                                            { label: 'Comprobante de estudios', key: 'studies', file: info.studies },
                                            { label: 'Número de Seguro Social', key: 'nss', file: info.nss },
                                            { label: 'Licencia de conducir', key: 'driver', file: info.driver },
                                            { label: 'Aviso de retención INFONAVIT', key: 'saving', file: info.saving },
                                            { label: 'Estado de cuenta', key: 'bills', file: info.bills },
                                            { label: 'Constancia de situqacion fiscal', key: 'fiscal', file: info.fiscal },
                                            { label: 'Certificado medico', key: 'medic', file: info.medic }
                                            ].map(({ label, key, file }) => (
                                            <li
                                                key={key}
                                                className='border-b-2 p-2 flex items-center justify-between cursor-pointer'
                                                onClick={() => file && openViewer(file)}>
                                                    <div className="flex">
                                                        <div
                                                        className={`w-4 h-4 mr-2 mt-1 rounded-full ${file ? 'bg-green-500' : 'bg-red-500'} ml-4`}/>
                                                        <p className='text-center'>{label}</p>
                                                    </div>
                                                {!file || editMode ? (
                                                <input type="file" onChange={(e) => handleFileUpload(e, key)} className="ml-4" />
                                                ) : (
                                                <p className='ml-4 underline'>Archivo cargado</p>
                                                )}
                                                {editMode && (
                                                <button
                                                    onClick={enableEditMode}
                                                    className="flex items-center justify-center w-8 h-8 ml-4">
                                                    <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                                                </button>
                                                )}
                                            </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h1 className="text-black text-xl mb-5 ">
                        <strong>Información laboral</strong>
                    </h1>
                    <div className="ml-3 flex">
                        <div className=" flex">
                            <div className="bg-white  overflow-auto">
                                <div>
                                    <p className="my-2 w-[70%]">
                                        <strong>Departamento:</strong> {infoLI.departmentName || 'N/A'}
                                    </p>
                                    <p className="my-2">
                                        <strong>Dirección:</strong> 
                                        {[
                                            infoLI.contact?.t13_contact_street + 
                                            (infoLI.contact?.t13_contact_int ? ` #${infoLI.contact.t13_contact_int}` : ''),
                                            infoLI.contact?.t13_contact_colony,
                                            infoLI.contact?.t13_contact_del,
                                            infoLI.contact?.t13_contact_state
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                                <div className="mb-12">
                                    <div className="ml-3 flex">
                                        <div className="">
                                        <div className="bg-white overflow-auto relative">
                                            <div className="rounded border-2 px-5 max-h-[200px] overflow-y-auto">
                                            <ul className="w-full">
                                                {[
                                                { label: 'Contrato', key: 'contract', file: infoLI.contract },
                                                { label: 'Currículum Vitae', key: 'cv', file: infoLI.cv },
                                                { label: 'Recomendación profesional', key: 'recommendation', file: infoLI.recommendation },
                                                { label: 'Recomendación personal', key: 'recommendationP', file: infoLI.recommendationP },
                                                { label: 'Aviso de confidencialidad', key: 'conf', file: infoLI.conf },
                                                { label: 'Aviso de protección de datos', key: 'data', file: infoLI.data },
                                                { label: 'Socioeconómico', key: 'socio', file: infoLI.socio },
                                                { label: 'Anexos', key: 'annx', file: infoLI.annx }
                                                ].map(({ label, key, file }) => (
                                                <li
                                                    key={key}
                                                    className="border-b-2 p-2 flex items-center justify-between cursor-pointer"
                                                    onClick={() => file && openViewer(file.path)}>
                                                    <div className="flex">
                                                        <div
                                                        className={`w-4 h-4 mr-2 rounded-full ${file ? 'bg-green-500' : 'bg-red-500'} mt-1`}/>
                                                        <p className="text-center">{label}:</p> 
                                                    </div>
                                                    
                                                    {!file || editModeLI ? (
                                                    <input type="file" onChange={(e) => handleFileUploadLI(e, key)} className="ml-4" />
                                                    ) : (
                                                    <p className="ml-4 underline">Archivo cargado</p>
                                                    )}
                                                    {editModeLI && (
                                                    <button
                                                        onClick={enableEditModeLI}
                                                        className="flex items-center justify-center w-8 h-8 ml-4"
                                                    >
                                                        <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                                                    </button>
                                                    )}
                                                </li>
                                                ))}
                                            </ul>
                                            </div>
                                        </div>
                                        {isViewerOpen && (
                                            <DocsViewer
                                            url={urlToView}
                                            onClose={closeViewer}
                                            />
                                        )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
                {isModalOpen && <UserInfoModal isOpen={isModalOpen} uuid={permissions} onClose={() => setIsModalOpen(false)} />}
                {isModalOpen2 && <LaboralInfoModal isOpen={isModalOpen2} uuid={permissions} onClose={() => setIsModalOpen2(false)} />}
                {isViewerOpen && (
                <DocsViewer
                    url={urlToView}
                    onClose={closeViewer}/>
                )}
            </div>
        </div>
    );
};

export default Profile;
