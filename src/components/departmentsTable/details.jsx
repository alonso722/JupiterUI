import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import dotenv from 'dotenv';
dotenv.config();
import { useColors } from '@/services/colorService';

const Annexes = ({ onClose, department }) => {
  const effectMounted = useRef(false);
  const [info, setInfo] = useState([]);
  const api = useApi();
  const [urlToView, setFileUrl] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const { primary, secondary } = useColors();
  const [permissions, setPermissions] = useState([]);

  const openViewer = (path) => {
    setFileUrl(process.env.NEXT_PUBLIC_MS_FILES + '/api/v1/file?f=' + path);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  useEffect(() => {
    if (effectMounted.current === false) {
      const fetchAnnexes = async () => {
        try {
          const responseDep = await api.post('/user/departments/getIdByName', { departmentFilter:department });
          const deptId = responseDep.data.data;
          const deptInfo = await api.post('/user/departments/getDeptInfo', { id:deptId });
          const info = deptInfo.data;
          const managerUser = info.users.find(user => user.uuid === info.t02_department_manager);
          if (managerUser) {
              info.t02_department_manager = `${managerUser.userName} ${managerUser.userLast}`;
          }
          setInfo(info);
        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };
      fetchAnnexes();
      effectMounted.current = true;
    }
  }, [api, department]);

  const getFileIcon = (filename) => {
    if (!filename) {
      return '/icons/question.png';
    }
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '/icons/pdf.png';
      case 'doc':
      case 'docx':
        return '/icons/doc.png';
      case 'xls':
      case 'xlsx':
        return '/icons/excel.png';
      default:
        return '/icons/question.png';
    }
  };

  const handleAnxDownload = async (path) => {
    if (path) {
      window.open(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path, '_blank');
      //const uuid = localStorage.getItem('uuid');
      let parsedPermissions;
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
          parsedPermissions = JSON.parse(storedPermissions);
          setPermissions(parsedPermissions);
      }
      const uuid = parsedPermissions.uuid;

      const log = {};
      log.uuid = uuid;
      log.type = 24;
      log.id = department;
      try {
        await api.post('/user/log/setLog', log);
      } catch (error) {
        console.error("Error al hacer el registro:", error);
      }
    } else {
      console.error("URL del documento no está disponible");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg relative w-[1000px] overflow-hidden">
            <button
                onClick={onClose}
                className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
                &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-black">{info.t02_department_name}</h2>
            <div className='flex w-full text-black'>
              <div className='w-[40%]'>
                <p className='mb-3'>Lista de colaboradores del departamento:</p>
                {Array.isArray(info.users) && info.users.length > 0 ? (
                    info.users.map((user, index) => (
                        <div key={index} className="flex-shrink-0 flex flex-col items-start justify-center w-full">
                            <p className="text-black text-sm">
                                -{user.userName} {user.userLast}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No hay colaboradores disponibles.</p>
                )}
              </div>
              <div className='border-l-4 pl-4'>
                <p>Informacion del departamento:</p>
                <p>Manager: {info.t02_department_manager ? info.t02_department_manager : 'Sin encargado'}</p>
              </div>
          </div>
        </div>
    </div>
  );
};

export default Annexes;
