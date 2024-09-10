import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import DocsViewer from '../misc/docViewer/docViewer';

const UserInfoModal = ({ isOpen, onClose, uuid }) => {
  const [dniFile, setDniFile] = useState(null);
  const [birthFile, setBirthFile] = useState(null);
  const [medicFile, setMedicFile] = useState(null);
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState({});
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
    if (effectMounted.current === false) {
      console.log(uuid);

      api.post('/user/users/profile', uuid)
        .then((response) => {
          console.log(response.data);
          setInfo(response.data);
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });

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
      if (fileType === 'dni') setDniFile(null);
      if (fileType === 'birth') setBirthFile(null);
      if (fileType === 'medic') setMedicFile(null);
    } else {
      if (fileType === 'dni') setDniFile(selectedFile);
      if (fileType === 'birth') setBirthFile(selectedFile);
      if (fileType === 'medic') setMedicFile(selectedFile);

      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const response = await api.post('/user/file/store', formData);
        let filems = response.data.data;
        let path = response.data.path;

        if (response) {
          console.log(filems);
          api.post('/user/users/addCv', filems)
            .then((response) => {
              console.log(response);
              if (response.status === 200) {
                showToast('success', 'Archivo cargado con éxito.');
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[1100px] max-[500px] relative">
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
        <div className='rounded border-2 p-2 flex justify-between'>
          <div className='rounded border-2 p-2 flex flex-col items-center justify-center w-full max-w-[300px]'>
            <p className="text-center mb-2">Identificación:</p>
            {!info.dni ? (
              <>
                <p className="text-center">Sin documento de identificación,</p>
                <p className="text-center">por favor cargue uno...</p>
                <input type="file" onChange={(e) => handleFileUpload(e, 'dni')} className="mb-4" />
                {dniFile && (
                  <div className="mb-4 text-black flex flex-col items-center">
                    <img
                      onClick={() => document && openViewer(document.path)}
                      src='/icons/pdf.png'
                      alt="File Icon"
                      className="w-[50%] h-auto mt-[10px] cursor-pointer"
                    />
                    <p>Archivo seleccionado: {dniFile.name}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.dni)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[50%] h-auto mt-[10px] cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className='rounded border-2 p-2 flex flex-col items-center justify-center w-full max-w-[300px]'>
            <p className="text-center mb-2">Acta de nacimiento:</p>
            {!info.birth ? (
              <>
                <p className="text-center">Sin acta de nacimiento,</p>
                <p className="text-center">por favor cargue una...</p>
                <input type="file" onChange={(e) => handleFileUpload(e, 'birth')} className="mb-4" />
                {birthFile && (
                  <div className="mb-4 text-black flex flex-col items-center">
                    <img
                      onClick={() => document && openViewer(document.path)}
                      src='/icons/pdf.png'
                      alt="File Icon"
                      className="w-[50%] h-auto mt-[10px] cursor-pointer"
                    />
                    <p>Archivo seleccionado: {birthFile.name}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.birth)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[50%] h-auto mt-[10px] cursor-pointer"
                />
              </div>
            )}
          </div>
          <div className='rounded border-2 p-2 flex flex-col items-center justify-center w-full max-w-[300px]'>
            <p className="text-center mb-2">Certificado médico:</p>
            {!info.medic ? (
              <>
                <p className="text-center">Sin certificado médico,</p>
                <p className="text-center">por favor cargue uno...</p>
                <input type="file" onChange={(e) => handleFileUpload(e, 'medic')} className="mb-4" />
                {medicFile && (
                  <div className="mb-4 text-black flex flex-col items-center">
                    <img
                      onClick={() => document && openViewer(document.path)}
                      src='/icons/pdf.png'
                      alt="File Icon"
                      className="w-[50%] h-auto mt-[10px] cursor-pointer"
                    />
                    <p>Archivo seleccionado: {medicFile.name}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.medic)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[50%] h-auto mt-[10px] cursor-pointer"
                />
              </div>
            )}
          </div>
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
