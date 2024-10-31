import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import UserInfoModal from '@/components/modals/userInfoModal';
import LaboralInfoModal from '@/components/modals/laboralInfoModal';
import DocsViewer from '../misc/docViewer/docViewer';
import { IoMdDocument } from "react-icons/io";

import { useColors } from '@/services/colorService';

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
    
    const { primary, secondary } = useColors(); 

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

      useEffect(() => {
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
            filems.uuid = uuid;
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
            filems.uuid = uuid;
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
                            <div className="flex justify-between">
                              <div>
                                <p className="text-[#B1B5C3]"><strong>Teléfono:</strong></p> 
                                <p className="rounded-lg bg-[#EDF2F7] text-[#777E90] pl-3 pr-5 py-2"> {info.phone}</p> 
                              </div>
                              <div>
                                <p className="mr-9 text-[#B1B5C3]"><strong>Correo:</strong></p>
                                <p className="rounded-lg bg-[#EDF2F7] text-[#777E90] pl-3 pr-5 py-2"> {info.mail}</p>
                              </div>   
                            </div>
                            <div className="">
                                <div className="bg-white overflow-auto relative">
                                    <div className='rounded  px-5 max-h-[200px] overflow-y-auto overflow-x-hidden mt-4'>
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
                                            { label: 'Constancia de situación fiscal', key: 'fiscal', file: info.fiscal },
                                            { label: 'Certificado médico', key: 'medic', file: info.medic }
                                            ].map(({ label, key, file }) => (
                                            <li
                                                key={key}
                                                className={`my-2 rounded-lg  p-2 flex items-center justify-between cursor-pointer ${file ? 'bg-[#EDF2F7]' : 'bg-[#ffffff]'}`}y
                                                onClick={() => file && openViewer(file)}>
                                                    <div className="flex">
                                                      <div
                                                        className="w-4 h-4 mr-2 mt-1 rounded-full ml-4"
                                                        style={{  backgroundColor: file ? primary : 'white',
                                                                  borderWidth: '1px',
                                                                  borderStyle: 'solid',
                                                                  borderColor: secondary }}
                                                      />
                                                      <IoMdDocument className="w-[15px] h-[18px] mr-1 mt-1" style={{ color: secondary, width: '15px', height: '18px' }} />
                                                        <p className='text-center'>{label}</p>
                                                    </div>
                                                {!file || editMode ? (
                                                  <div className="relative flex py-[5px] items-center border-2 border-[#777E90] rounded-md w-[40%]">
                                                    <img
                                                      src="/icons/addoc.png"
                                                      alt="Icono"
                                                      className="absolute h-[16px] w-[13px] right-[220px]"
                                                    />
                                                    <input
                                                      type="file"
                                                      onChange={(e) => handleFileUpload(e, key)}
                                                      className="pl-8 text-black file:rounded-lg file:text-white file:bg-white file:border-none file:max-w-5 file:pl-9 file:mr-[-9%]"
                                                      style={{ paddingLeft: '30px' }}
                                                    />
                                                  </div>
                                                ) : (
                                                <p className='ml-4  pr-3 underline'>Archivo cargado</p>
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
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-[#B1B5C3]"><strong>Departamento:</strong></p>
                                    <p className="rounded-lg bg-[#EDF2F7] text-[#777E90] pl-3 pr-5 py-2">{infoLI.departmentName || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="mr-9 text-[#B1B5C3]"><strong>Dirección:</strong></p>
                                    <p className="rounded-lg bg-[#EDF2F7] text-[#777E90] pl-3 pr-5 py-2">                                        
                                      {[
                                            infoLI.contact?.t13_contact_street + 
                                            (infoLI.contact?.t13_contact_int ? ` #${infoLI.contact.t13_contact_int}` : ''),
                                            infoLI.contact?.t13_contact_colony,
                                            infoLI.contact?.t13_contact_del,
                                            infoLI.contact?.t13_contact_state
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="">
                                  <div className="bg-white overflow-auto relative">
                                    <div className='rounded  px-5 max-h-[200px] overflow-y-auto overflow-x-hidden my-4'>
                                        <ul className='w-full '>
                                        {[
                                          { label: 'Contrato', key: 'contract', file: infoLI.contract },
                                          { label: 'Currículum Vitae', key: 'cv', file: infoLI.cv },
                                          { label: 'Recomendación profesional', key: 'recommendation', file: infoLI.recommendation },
                                          { label: 'Recomendación personal', key: 'recommendationP', file: infoLI.recommendationP },
                                          { label: 'Aviso de confidencialidad', key: 'conf', file: infoLI.conf },
                                          { label: 'Aviso de protección de datos', key: 'data', file: infoLI.data },
                                          { label: 'Estudio socioeconómico', key: 'socio', file: infoLI.socio },
                                          { label: 'Anexos', key: 'annx', file: infoLI.annx }
                                        ].map(({ label, key, file }) => (
                                            <li
                                                key={key}
                                                className={`my-2 rounded-lg  p-2 flex items-center justify-between cursor-pointer ${file ? 'bg-[#EDF2F7]' : 'bg-[#ffffff]'}`}y
                                                onClick={() => file && openViewer(file)}>
                                                    <div className="flex">
                                                      <div
                                                        className="w-4 h-4 mr-2 mt-1 rounded-full ml-4"
                                                        style={{  backgroundColor: file ? primary : 'white',
                                                                  borderWidth: '1px',
                                                                  borderStyle: 'solid',
                                                                  borderColor: secondary }}
                                                      />
                                                      <IoMdDocument className="w-[15px] h-[18px] mr-1 mt-1" style={{ color: secondary, width: '15px', height: '18px' }} />
                                                        <p className='text-center'>{label}</p>
                                                    </div>
                                                {!file || editMode ? (
                                                  <div className="relative flex py-[5px] items-center border-2 border-[#777E90] rounded-md w-[40%]">
                                                    <img
                                                      src="/icons/addoc.png"
                                                      alt="Icono"
                                                      className="absolute h-[16px] w-[13px] right-[220px]"
                                                    />
                                                    <input
                                                      type="file"
                                                      onChange={(e) => handleFileUploadLI(e, key)}
                                                      className="pl-8 text-black file:rounded-lg file:text-white file:bg-white file:border-none file:max-w-5 file:pl-9 file:mr-[-9%]"
                                                      style={{ paddingLeft: '30px' }}
                                                    />
                                                  </div>
                                                ) : (
                                                <p className='ml-4  pr-3 underline'>Archivo cargado</p>
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
