import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import DocsViewer from '../misc/docViewer/docViewer';
import Image from 'next/image';

const LaboralInfoModal = ({ isOpen, onClose, uuid }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState({});
  const effectMounted = useRef(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
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

  const loadLaboralProfile = () => {
    api.post('/user/users/profileP', uuid)
      .then((response) => {
        setInfo(response.data);
      })
      .catch((error) => {
        console.error("Error al consultar el perfil laboral:", error);
      });
  };

  useEffect(() => {
    if (effectMounted.current === false) {
      loadLaboralProfile();
      effectMounted.current = true;
    }
  }, [uuid, loadLaboralProfile]);

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
          api.post('/user/users/storeP', filems)
            .then((response) => {
              if (response.status === 200) {
                showToast('success', 'Archivo cargado con éxito.');
                loadLaboralProfile();
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
        <h2 className="text-2xl mb-4 text-black">Mi información laboral</h2>
        <div>
          <p className="my-2 w-[70%] "><strong>Departamento:</strong> {info.departmentName || 'N/A'}</p>
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
        <div className='rounded border-2 px-5 max-h-[300px] overflow-y-auto'>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-1">CV:</p>
            {!info.cv || editMode ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'cv')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <div className="relative w-[10%] h-auto mt-[10px] cursor-pointer">
                        <Image
                          onClick={() => document && openViewer(document.path)}
                          src="/icons/pdf.png"
                          alt="File Icon"
                          layout="intrinsic"
                          objectFit="contain"
                        />
                      </div>
                      <button
                        onClick={enableEditMode}
                        className=" flex items-center justify-center w-8 h-8 ">
                        <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                      </button>
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <div className="relative w-[10%] h-auto cursor-pointer">
                  <Image
                    onClick={() => document && openViewer(info.cv)}
                    src="/icons/pdf.png"
                    alt="File Icon"
                    layout="intrinsic"
                    objectFit="contain"
                  />
                </div>
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-1">Recomendacion profesional:</p>
            {!info.recommendation ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'recommendation')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <div className="relative w-[10%] h-auto mt-[10px] cursor-pointer">
                        <Image
                          onClick={() => document && openViewer(document.path)}
                          src="/icons/pdf.png"
                          alt="File Icon"
                          layout="intrinsic"
                          objectFit="contain"
                        />
                      </div>
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.recommendation)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-1">Recomendacion personal:</p>
            {!info.recommendationP ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'recommendationP')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <img
                        onClick={() => document && openViewer(document.path)}
                        src='/icons/pdf.png'
                        alt="File Icon"
                        className="w-[10%] h-auto mt-[10px] cursor-pointer"
                      />
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.recommendationP)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-2">Contrato:</p>
            {!info.contract ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'contract')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <img
                        onClick={() => document && openViewer(document.path)}
                        src='/icons/pdf.png'
                        alt="File Icon"
                        className="w-[10%] h-auto mt-[10px] cursor-pointer"
                      />
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.contract)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto mt-[10px] cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-1">Aviso de confidencialidad:</p>
            {!info.conf ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'conf')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <img
                        onClick={() => document && openViewer(document.path)}
                        src='/icons/pdf.png'
                        alt="File Icon"
                        className="w-[10%] h-auto mt-[10px] cursor-pointer"
                      />
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.conf)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-1">Aviso de protección de datos:</p>
            {!info.data ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'data')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <img
                        onClick={() => document && openViewer(document.path)}
                        src='/icons/pdf.png'
                        alt="File Icon"
                        className="w-[10%] h-auto mt-[10px] cursor-pointer"
                      />
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.data)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-2">Socioeconomico:</p>
            {!info.socio ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'socio')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <img
                        onClick={() => document && openViewer(document.path)}
                        src='/icons/pdf.png'
                        alt="File Icon"
                        className="w-[10%] h-auto mt-[10px] cursor-pointer"
                      />
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.socio)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto mt-[10px] cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>
          <div className=' border-b-2 p-2 flex flex-col w-full max-w-[550px]'>
            <p className="text-center mb-1">Anexos:</p>
            {!info.annx ? (
              <>
                <div className='flex flex-col items-center'>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'annx')} className="mb-4" />
                  {file && (
                    <div className="mb-4 text-black flex flex-col items-center">
                      <img
                        onClick={() => document && openViewer(document.path)}
                        src='/icons/pdf.png'
                        alt="File Icon"
                        className="w-[10%] h-auto mt-[10px] cursor-pointer"
                      />
                      <p>Archivo seleccionado: {file.name}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-4 text-black flex flex-col items-center">
                <img
                  onClick={() => document && openViewer(info.annx)}
                  src='/icons/pdf.png'
                  alt="File Icon"
                  className="w-[10%] h-auto cursor-pointer"
                />
                <button
                  onClick={enableEditMode}
                  className=" flex items-center justify-center w-8 h-8 ">
                  <i className="fas fa-edit text-gray-600" style={{ fontSize: '14px' }}></i>
                </button>
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
