import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import UserInfoModal from '@/components/modals/userInfoModal';
import LaboralInfoModal from '@/components/modals/laboralInfoModal';
import DocsViewer from '../misc/docViewer/docViewer';
import { CiEdit, CiSaveDown2 } from "react-icons/ci";
import { IoMdDocument } from "react-icons/io";

import { useColors } from '@/services/colorService';

export const Profile = ({ departmentFilter, userFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [file, setFile] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [inventory, setInv] = useState([]);
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

            if(userFilter){
              userType.uuid = userFilter
            }

            userType.token = token;
            const profileResponse = await api.post('/user/users/profile', userType);
            const fullName = `${profileResponse.data.name} ${profileResponse.data.last}`;
            setName(fullName)
            setPhone(profileResponse.data.phone)
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

    const fetchInventory = () => {
      let parsedPermissions;
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
      }
      let organization = {};
      organization.organization = parsedPermissions.Organization;
      organization.uuid = parsedPermissions.uuid;
      if(userFilter){
        organization.uuid = userFilter
      }
      api.post('/user/assignation/fetch', organization)
        .then((response) => {
          const fetchedData = response.data.map(item => ({
            id: item.id,
            object: item.object,
            user: item.phone,
            location: item.locationName,
            locationId: item.location,
            uuid: item.uuid,
            chars:item.chars,
            status:item.status    
          }));
          setInv(fetchedData);
          })
          .catch((error) => {
              console.error("Error al consultar asignados:", error);
          });
    };

    useEffect(() => {
      fetchData();
      fetchInventory();
    }, []);
    
    const enableEditMode = () => {
      setEditMode(true); 
    };

    const viewArchive = () => {
      setIsModalOpen(true); 
    };

    const handleReplace = (file, key) => {
      let filecom = {};
      filecom.file = file;
      filecom.type = key;
      switch (key) {          
        case 'cv':
        case 'socio':
        case 'recommendationP':
        case 'data':
        case 'recommendation':
        case 'conf':
        case 'contract':
        case 'annx':
            replaceLI(filecom);
            break;

        default:
            replace(filecom);
            break;
      }
    };

    const replace = (filecom) => { 
      let update ={};
      update.uuid = userFilter;
      update.file= filecom.file;
      update.type = filecom.type;   
      api.post('/user/users/replaceFile', update)
      .then((response) => {
        if (response.status === 200) {
          fetchData();
          fetchInventory();
          showToast('success', 'Archivo retirado.');
        }
      })
      .catch((error) => {
        console.error("Error al consultar procesos:", error);
      });
    }

    const replaceLI = (filecom) => {    
      let update ={};
      update.uuid = userFilter;
      update.file= filecom.file;
      update.type = filecom.type;
      api.post('/user/users/replaceFileLI', update)
      .then((response) => {
        if (response.status === 200) {
          fetchData();
          fetchInventory();
          showToast('success', 'Archivo retirado.');
        }
      })
      .catch((error) => {
        console.error("Error al consultar procesos:", error);
      });
    }

    const handleFileUploadSwitch = (e, fileType) => {
      switch (fileType) {          
          case 'cv':
          case 'socio':
          case 'recommendationP':
          case 'data':
          case 'recommendation':
          case 'conf':
          case 'contract':
          case 'annx':
              handleFileUploadLI(e, fileType);
              break;
          default:
              handleFileUpload(e, fileType);
              break;
      }
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
          if(userFilter){
            filems.uuid = userFilter;
          }
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
          if(userFilter){
            filems.uuid = userFilter;
          }
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
    
    const enableEditModeLI = () => {
        setEditModeLI(true); 
    };

    const handleSaveClick = () => {
      let update = {};
      update.uuid = permissions.uuid;
      update.phone = phone;
      if (isEditable) {
        api.post('/user/users/updatePhone', update)
        .then((response) => {
          if (response.status === 200) {
            showToast('success', 'Archivo cargado con éxito.');
            fetchData();
          }
        })
        .catch((error) => {
          console.error("Error al almacenar el archivo:", error);
        });

      }
      setIsEditable(!isEditable);
    };

    return (
        <div className="mt-[60px] ml-[100px] w-[100%] text-neutral-50 rounded flex">
            <div className="mt-8 text-black  ">
              <div className="mb-5">
                <div className="flex">
                    <h1 className="text-black text-xl mb-5 ">
                        <strong>Información personal</strong>
                    </h1>
                    {userFilter ? (
                      <p className="text-black text-xl mb-5 ml-2">
                        <strong>de {name}</strong> 
                      </p>
                    ) : (
                      <p></p>
                    )}
                  </div>
                    <div className="ml-3 flex">
                        <div className="">
                            <div className="flex justify-between">
                              <div className="relative">
                                <p className="text-[#B1B5C3]">
                                  <strong>Teléfono:</strong>
                                </p>
                                <input
                                  type="text"
                                  placeholder="Teléfono celular"
                                  value={phone ?? ""}
                                  onChange={(e) => setPhone(e.target.value)}
                                  disabled={!isEditable}
                                  className={`w-full rounded-lg bg-[#EDF2F7] text-[#777E90] pl-3 pr-10 py-2 ${
                                    isEditable ? "cursor-text" : "cursor-not-allowed"
                                  }`}
                                />
                                {isEditable ? (
                                  <CiSaveDown2
                                    className="absolute right-3 top-[45px] transform -translate-y-1/2 text-[#4A90E2] cursor-pointer"
                                    onClick={handleSaveClick} style={{  color: primary }} 
                                  />
                                ) : (
                                  <CiEdit
                                    className="absolute right-3 top-[45px] transform -translate-y-1/2 text-[#777E90] cursor-pointer"
                                    onClick={handleSaveClick} style={{  color: primary }} 
                                  />
                                )}
                              </div>
                              <div>
                                <p className="mr-9 text-[#B1B5C3]"><strong>Correo:</strong></p>
                                <p className="rounded-lg bg-[#EDF2F7] text-[#777E90] pl-3 pr-5 py-2"> {info.mail}</p>
                              </div>  
                              {userFilter && (
                                <button
                                  onClick={() => viewArchive()}
                                  className="p-2 rounded text-white h-[30px] text-[10px] mt-6 ml-3 mr-[20px]"
                                  style={{ backgroundColor: primary }}>
                                  Archivos anteriores
                                </button>
                              )}
                            </div>
                            <div className="">
                                <div className="bg-white overflow-auto relative">
                                    <div className='rounded  px-5 max-h-[200px] overflow-y-auto overflow-x-hidden mt-4'>
                                      <ul className='w-full '>
                                        {[
                                          { label: 'Acta de nacimiento', key: 'birth', file: info.birth },
                                          { label: 'Comp. de domicilio', key: 'address', file: info.address },
                                          { label: 'Ident. Oficial', key: 'dni', file: info.dni },
                                          { label: 'Certificado médico', key: 'medic', file: info.medic },
                                          { label: 'Licencia de conducir', key: 'driver', file: info.driver },
                                          { label: 'Comprobante de estudios', key: 'studies', file: info.studies },
                                          { label: 'Constancia de situación fiscal', key: 'fiscal', file: info.fiscal }, 
                                          { label: 'CURP', key: 'curp', file: info.curp },
                                          { label: 'Número de Seguro Social', key: 'nss', file: info.nss },
                                          { label: 'Cuenta Bancaria', key: 'bills', file: info.bills },
                                          { label: 'Crédito INFONAVIT', key: 'saving', file: info.saving },
                                        ].map(({ label, key, file }) => (
                                          <li
                                            key={key}
                                            className={`my-2 rounded-lg p-2 flex items-center justify-between ${file ? 'bg-[#EDF2F7]' : 'bg-[#ffffff]'}`}>
                                            <div className="flex">
                                              <div
                                                className="w-4 h-4 mr-2 mt-1 rounded-full mt-2"
                                                style={{
                                                  backgroundColor: file ? primary : 'white',
                                                  borderWidth: '1px',
                                                  borderStyle: 'solid',
                                                  borderColor: secondary,
                                                }}
                                              />
                                              <IoMdDocument
                                                className="w-[15px] h-[18px] mr-1 mt-2"
                                                style={{ color: secondary, width: '15px', height: '18px' }}
                                              />
                                              <p
                                                className={`text-center ${file ? 'underline cursor-pointer' : ''}`}
                                                onClick={file ? () => openViewer(file) : undefined}>
                                                {label}
                                              </p>
                                              {userFilter && file && (
                                                <button
                                                  onClick={() => handleReplace(file, key)}
                                                  className="p-2 rounded text-white text-[10px] ml-3 mr-[20px]"
                                                  style={{ backgroundColor: secondary }}>
                                                  Solicitar actualización
                                                </button>
                                              )}
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
                                                  onChange={(e) => handleFileUploadSwitch(e, key)}
                                                  className="pl-8 text-black file:rounded-lg file:text-white file:bg-white file:border-none file:max-w-5 file:pl-9 file:mr-[-9%]"
                                                  style={{ paddingLeft: '30px' }}
                                                />
                                              </div>
                                            ) : (
                                              <p className='ml-4 pr-3 underline'>Archivo cargado</p>
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
                  <div className="flex">
                    <h1 className="text-black text-xl mb-5 ">
                        <strong>Información laboral</strong>
                    </h1>
                    {userFilter ? (
                      <p className="text-black text-xl mb-5 ml-2">
                        <strong>de {name}</strong> 
                      </p>
                    ) : (
                      <p></p>
                    )}
                  </div>
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
                                  { label: 'Currículum', key: 'cv', file: infoLI.cv },
                                  { label: 'Requisición de personal', key: 'data', file: infoLI.data },
                                  { label: 'Referencia Laboral', key: 'recommendation', file: infoLI.recommendation },
                                  { label: 'Autorizacion de contratación', key: 'conf', file: infoLI.conf },
                                  { label: 'Cartilla', key: 'socio', file: infoLI.socio },
                                  { label: 'Recomendaciones', key: 'recommendationP', file: infoLI.recommendationP },
                                  { label: 'Contrato', key: 'contract', file: infoLI.contract },                                         
                                  { label: 'Hoja de control', key: 'annx', file: infoLI.annx }
                                ].map(({ label, key, file }) => (
                                  <li
                                    key={key}
                                    className={`my-2 rounded-lg  p-2 flex items-center justify-between ${file ? 'bg-[#EDF2F7]' : 'bg-[#ffffff]'}`}
                                    >
                                    <div className="flex">
                                      <div
                                        className="w-4 h-4 mr-2 mt-1 rounded-full ml-4"
                                        style={{  
                                          backgroundColor: file ? primary : 'white',
                                          borderWidth: '1px',
                                          borderStyle: 'solid',
                                          borderColor: secondary 
                                        }}
                                      />
                                      <IoMdDocument className="w-[15px] h-[18px] mr-1 mt-1" style={{ color: secondary, width: '15px', height: '18px' }} />
                                        <p 
                                          className={`text-center ${file ? 'underline cursor-pointer' : ''}`} 
                                          onClick={file ? () => openViewer(file) : undefined}>
                                          {label}
                                        </p>
                                        {userFilter && file && (
                                                <button
                                                  onClick={() => handleReplace(file, key)}
                                                  className="p-2 rounded text-white text-[10px] ml-3 mr-[20px]"
                                                  style={{ backgroundColor: secondary }}>
                                                  Solicitar actualización
                                                </button>
                                              )}
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
                                          onChange={(e) => handleFileUploadSwitch(e, key)}
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
              {isModalOpen && <UserInfoModal isOpen={isModalOpen} uuid={userFilter} onClose={() => setIsModalOpen(false)} />}
              {isModalOpen2 && <LaboralInfoModal isOpen={isModalOpen2} uuid={permissions} onClose={() => setIsModalOpen2(false)} />}
              {isViewerOpen && (
                <DocsViewer
                  url={urlToView}
                  onClose={closeViewer}/>
              )}
            </div>
            <div className="text-black mt-[80px] ml-[5%] pl-[5%] border-l-4 w-[20%]">
              <p className="mb-4"><strong>Equipo asignado:</strong></p>
              {inventory.map((item, index) => (
                <div key={index}>
                  <p className="">-{item.object}:</p>
                  <ul className="ml-4 list-disc">
                    {item.chars.map((char, charIndex) => (
                      <li key={charIndex}>
                        {char.characteristics}: {char.charValue || 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
    );
};

export default Profile;
