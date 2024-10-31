import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import DocsViewer from '../misc/docViewer/docViewer';

const UserInfoModal = ({ isOpen, uuid }) => {
  const [info, setInfo] = useState({});
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [urlToView, setFileUrl] = useState(null);
  const [editMode, setEditMode] = useState(false); 
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

  const loadUserProfile = () => {
    api.post('/user/users/profile', uuid)
      .then((response) => {
        setInfo(response.data);
      })
      .catch((error) => {
        console.error("Error al consultar el perfil del usuario:", error);
      });
  };

  const enableEditMode = () => {
    setEditMode(true); 
  };

  useEffect(() => {
    if (effectMounted.current === false) {
      loadUserProfile();
      effectMounted.current = true;
    }
  }, [uuid]);

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
                loadUserProfile();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white mt-[70px] p-6 rounded-lg shadow-lg w-[40%] overflow-auto relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <h2 className="text-2xl mb-4 text-black">Mi información</h2>
        <div>
          <div className="flex">
            <p className="my-2 w-[50%]"><strong>Nombre:</strong> {info.name}</p>
            <p className="my-2"><strong>Apellido:</strong> {info.last}</p>
          </div>
          <div className="flex">
            <p className="my-2 w-[50%]"><strong>Correo:</strong> {info.mail}</p>
            <p className="my-2"><strong>Teléfono:</strong> {info.phone}</p>
          </div>
        </div>
        <h2 className="text-xl mb-4 mt-4 text-black">Mis documentos</h2>
        <div className='rounded border-2 px-5 max-h-[300px] overflow-y-auto'>
          <ul className='w-full max-w-[550px]'>
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
                className='border-b-2 p-2 flex items-center justify-between cursor-pointer'
                onClick={() => file && openViewer(file)}>
                <div
                  className={`min-w-4 min-h-4 mr-2 rounded-full ${file ? 'bg-green-500' : 'bg-red-500'} ml-4`}/>
                <p className='text-center'>{label}:</p>
                {!file || editMode ? (
                  <input type="file" onChange={(e) => handleFileUpload(e, key)} className="ml-4" />
                ) : (
                  <p className='ml-4'>Archivo cargado</p>
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
      {isViewerOpen && (
          <DocsViewer
            url={urlToView}
            onClose={closeViewer}/>
        )}
    </div>
  );
};

export default UserInfoModal;
