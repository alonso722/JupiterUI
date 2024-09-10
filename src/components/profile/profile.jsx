import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import UserInfoModal from '@/components/modals/userInfoModal';
import LaboralInfoModal from '@/components/modals/laboralInfoModal';

export const Profile = ({ departmentFilter, processFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [file, setFile] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [info, setInfo] = useState({});
    const [uuid, setUuid] = useState(null)
    const effectMounted = useRef(false);
    const api = useApi();

    const showToast = (type, message) => {
        toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
        });
      };

    useEffect(() => {
        if (effectMounted.current === false) { 
            let parsedPermissions;
            const storedPermissions = localStorage.getItem('permissions');
            const token = localStorage.getItem('token');
            if (storedPermissions) {
                parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            }

            const userType = parsedPermissions;
            const uuid = parsedPermissions.uuid;
            setUuid(uuid)
        
            const orga = parsedPermissions.Organization;
            userType.token = token;
            api.post('/user/users/profile', userType)
                .then((response) => {
                    console.log(response.data)
                    setInfo(response.data, parsedPermissions)
                    
                })
                .catch((error) => {
                    console.error("Error al consultar procesos:", error);
                });
            effectMounted.current = true;
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
          showToast('error', 'Solo se permiten archivos PDF.');
          setFile(null); 
        } else {
          setFile(selectedFile);
          handleSubmit(selectedFile);
        }
      };

    const handleSubmit = async (selectedFile, parsedPermissions) => {
        if (!selectedFile) {
          showToast('error', 'Por favor, seleccione un archivo para cargar.');
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        console.log( selectedFile)
        try {
          const response = await api.post('/user/file/store', formData);
          console.log(response)
          let filems = response.data.data;
          let path = response.data.path;
          
          filems.uuid = permissions.uuid;
          if (response) {
            console.log(filems)
            api.post('/user/users/addDni', filems)
            .then((response) => {
                console.log(response)
                if (response.status === 200) {
                    showToast('success', 'Documento cargado con éxito.');
                }
            })
            .catch((error) => {
                console.error("Error al consultar procesos:", error);
            });
            } else {
                console.error('Error al cargar el archivo:', response.statusText);
                alert('Error al cargar el archivo');
            }
        } catch (error) {
          console.error('Error en la solicitud:', error);
          alert('Error en la solicitud');
        }
      };


    return (
        <div className="mt-[110px] ml-[100px] mr-[250px] w-[100%] text-neutral-50 rounded ">
            <h1 className="text-black text-4xl">
                <strong>Mi cuenta</strong>
            </h1>
            <div className="mt-8 text-black  ">
                <div className="mb-8">
                    <h1 className="text-black text-xl mb-5">
                        <strong>Infomación personal</strong>
                    </h1>
                    <div className="ml-3 flex">
                        <div className="w-[500px]">
                            <p className="my-2 w-[50%]"><strong>Correo:</strong> {info.mail}</p>
                            <p className="my-2 w-[50%]"><strong>Teléfono:</strong> {info.phone}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className='w-[120px] bg-[#EDF2F7] text-black p-2 rounded'>
                            Ver Información y documentos
                        </button>
                    </div>
                </div>
                <div>
                    <h1 className="text-black text-xl mb-5">
                        <strong>Información laboral</strong>
                    </h1>
                    <div className="ml-3 flex">
                        <div className="">
                            <p className="my-2"><strong>Departamento:</strong> {info.departmentName}</p>
                            <div className="mt-4 rounded-lg w-[500px] ">
                                <h2 className="mb-4 text-black"><strong>CV:</strong></h2>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen2(true)} className='w-[120px] bg-[#EDF2F7] text-black p-2 mt-2 rounded'>
                            Ver Información y documentos
                        </button>
                    </div>
                </div> 
                {isModalOpen && <UserInfoModal isOpen={isModalOpen} uuid={permissions} onClose={() => setIsModalOpen(false)} />}
                {isModalOpen2 && <LaboralInfoModal isOpen={isModalOpen2} uuid={permissions} onClose={() => setIsModalOpen2(false)} />}
            </div>
        </div>
    );
};

export default Profile;
