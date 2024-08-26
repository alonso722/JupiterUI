import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import DocsViewer from '../misc/docViewer/docViewer';
import dotenv from 'dotenv';
dotenv.config();

const Annexes = ({ onClose, cardId }) => {
  const effectMounted = useRef(false);
  const [annexe, setAnnexe] = useState([]);
  const api = useApi();
  const [urlToView, setFileUrl] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);

  const openViewer = (path) => {
    setFileUrl(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  useEffect(() => {
    if (effectMounted.current === false) {
      const fetchAnnexes = async () => {
        const prId = cardId;
        try {
          const responseAnx = await api.post('/user/annexe/fetch', { prId });
          const fetchAnnexe = responseAnx.data.data;
          setAnnexe(fetchAnnexe);
        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };

      fetchAnnexes();
      effectMounted.current = true;
    }
  }, [api, cardId]);

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
      log.id = cardId;
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
          className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black">Anexos al proceso</h2>
        <div className="flex p-2 overflow-x-auto mx-2">
          {annexe.length > 0 ? (
            <div className="flex space-x-5">
              {annexe.map((anx) => (
                <div
                  key={anx.id}
                  className="flex-shrink-0 flex flex-col items-center justify-center mr-5 w-[120px]"
                >
                  <div className="mb-4 rounded border-2 border-indigo-200/50 flex flex-col items-center justify-center px-4 w-full">
                    <img
                      onClick={() => openViewer(anx.path)}
                      src={getFileIcon(anx.name)}
                      alt="File Icon"
                      className="w-[100px] h-[100px] mt-[10px] cursor-pointer object-contain"
                    />
                    <p className="mt-2 mb-4 text-black text-center text-sm">
                      {anx.name.length > 18 ? `${anx.name.slice(0, 18)}...` : anx.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAnxDownload(anx.path)}
                    className="bg-[#2C1C47] p-2 rounded text-white text-sm"
                  >
                    Descargar anexo
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay anexos para el proceso.</p>
          )}
        </div>
      </div>
      {isViewerOpen && (
        <DocsViewer
          url={urlToView}
          onClose={closeViewer}
        />
      )}
    </div>
  );
};

export default Annexes;
