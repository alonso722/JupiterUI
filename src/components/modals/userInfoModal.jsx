import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import DocsViewer from '../misc/docViewer/docViewer';

const UserInfoModal = ({ isOpen, uuid, onClose }) => {
  const [files, setFiles] = useState([]);
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

  const getArchive = () => {
    let filesF = [];
    const typeMapping = {
        cv: 'Currículum',
        birth: 'Acta de nacimiento',
        address: 'Comp. de domicilio',
        dni: 'Ident. Oficial',
        socio: 'Cartilla',
        studies: 'Comprobante de estudios',
        recommendationP: 'Recomendaciones',
        nss: 'Número de Seguro Social',
        bills: 'Cuenta Bancaria',
        saving: 'Crédito INFONAVIT',
        data: 'Requisición de personal',
        recommendation: 'Referencia Laboral',
        conf: 'Autorizacion de contratación',
        medic: 'Certificado médico',
        driver: 'Licencia de conducir',
        fiscal: 'Constancia de situación fiscal',
        curp: 'CURP',
        contract: 'Contrato',
        annx: 'Hoja de control',
    };

    api.post('/user/users/getArchive', { uuid })
        .then((response) => {
            setFiles(response.data);
        })
        .catch((error) => {
            console.error("Error al consultar el perfil del usuario:", error);
        });
  };


  useEffect(() => {
    if (effectMounted.current === false) {
      getArchive();
      effectMounted.current = true;
    }
  }, [uuid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white mt-[70px] p-6 rounded-lg shadow-lg w-[40%] overflow-auto relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <h2 className="text-xl mb-4 mt-4 text-black">Documentos</h2>
        <div className='rounded border-2 px-5 max-h-[300px] overflow-y-auto'>
         <ul className='max-w-[550px] list-disc'>
            {files.map((item) => (
              <li key={item.file + item.docName} className="list-item">
                {!item.docName ? (
                  <p
                    className='inline underline cursor-pointer'
                    onClick={() => openViewer(item.file)}
                  >
                    Archivo desconocido
                  </p>
                ) : (
                  <span
                    className='inline underline cursor-pointer'
                    onClick={() => openViewer(item.file)}
                  >
                    {item.docName}
                  </span>
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
