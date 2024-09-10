import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import DocsViewer from '../misc/docViewer/docViewer';

const LaboralInfoModal = ({ isOpen, onClose, uuid }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState({});
  const effectMounted = useRef(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [urlToView, setFileUrl] = useState(null);
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

      api.post('/user/users/profileP', uuid)
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      showToast('error', 'Solo se permiten archivos PDF.');
      setFile(null); 
    } else {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showToast('error', 'Por favor, seleccione un archivo para cargar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/user/file/store', formData);
      let filems = response.data.data;
      let path = response.data.path;
      let titleAsig = title;
      filems.asignedTitle = title;
      if (response) {
        onFileUpload({ ...filems, path, titleAsig });
        onClose();
      } else {
        console.error('Error al cargar el archivo:', response.statusText);
        alert('Error al cargar el archivo');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error en la solicitud');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-[500px] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <h2 className="text-2xl mb-4 text-black">Mi información laboral</h2>
        <div>
          <p className="my-2 w-[50%] "><strong>Departamento:</strong> {info.departmentName || 'N/A'}</p>
          <div className="flex">
            <p className="my-2 w-[50%]"><strong>Calle:</strong> {info.contact?.t13_contact_street || 'N/A'}</p>
            <p className="my-2"><strong>Numero:</strong> {info.contact?.t13_contact_int || 'N/A'}</p>
          </div>
          <div className="flex">
            <p className="my-2 w-[50%]"><strong>Colonia:</strong> {info.contact?.t13_contact_colony || 'N/A'}</p>
            <p className="my-2"><strong>Delegación:</strong> {info.contact?.t13_contact_del || 'N/A'}</p>
          </div>
          <div className="flex">
            <p className="my-2 w-[50%]"><strong>Estado:</strong> {info.contact?.t13_contact_state || 'N/A'}</p> 
          </div>
        </div>
        <h2 className="text-xl mb-4 text-black">Mis documentos</h2>
        <div className='rounded border-2 p-2 flex justify-between'>
          <div className='rounded border-2 p-2 flex flex-col items-center justify-center w-full max-w-[300px]'>
            <p className="text-center mb-2">CV:</p>
            {!info.record?.t14_user_record_cv ? (
              <>
                <p className="text-center">Sin CV,</p>
                <p className="text-center">por favor cargue uno...</p>
                <input type="file" onChange={(e) => handleFileUpload(e, 'cv')} className="mb-4" />
                {file && (
                  <div className="mb-4 text-black flex flex-col items-center">
                    <img
                      onClick={() => document && openViewer(document.path)}
                      src='/icons/pdf.png'
                      alt="File Icon"
                      className="w-[50%] h-auto mt-[10px] cursor-pointer"
                    />
                    <p>Archivo seleccionado: {file.name}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.cv)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[50%] h-auto mt-[10px] cursor-pointer"
                />
              </div>
            )}
          </div>
          <div className='rounded border-2 p-2 flex flex-col items-center justify-center w-full max-w-[300px]'>
            <p className="text-center mb-2">Contract:</p>
            {!info.record?.t14_user_record_contract ? (
              <>
                <p className="text-center">Sin contracto,</p>
                <p className="text-center">por favor cargue uno...</p>
                <input type="file" onChange={(e) => handleFileUpload(e, 'contract')} className="mb-4" />
                {file && (
                  <div className="mb-4 text-black flex flex-col items-center">
                    <img
                      onClick={() => document && openViewer(document.path)}
                      src='/icons/pdf.png'
                      alt="File Icon"
                      className="w-[50%] h-auto mt-[10px] cursor-pointer"
                    />
                    <p>Archivo seleccionado: {file.name}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.contract)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[50%] h-auto mt-[10px] cursor-pointer"
                />
              </div>
            )}
          </div>
          <div className='rounded border-2 p-2 flex flex-col items-center justify-center w-full max-w-[300px]'>
            <p className="text-center mb-2">Socio:</p>
            {!info.record?.t14_user_record_socio ? (
              <>
                <p className="text-center">Sin socio,</p>
                <p className="text-center">por favor cargue uno...</p>
                <input type="file" onChange={(e) => handleFileUpload(e, 'socio')} className="mb-4" />
                {file && (
                  <div className="mb-4 text-black flex flex-col items-center">
                    <img
                      onClick={() => document && openViewer(document.path)}
                      src='/icons/pdf.png'
                      alt="File Icon"
                      className="w-[50%] h-auto mt-[10px] cursor-pointer"
                    />
                    <p>Archivo seleccionado: {file.name}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.socio)}
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

export default LaboralInfoModal;
