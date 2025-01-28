import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

const DocsViewer = ({ url, onClose }) => {
  const [fileContent, setFileContent] = useState(null);
  const [error, setError] = useState(null);
  const effectMounted = useRef(false);

  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  useEffect(() => {
    if (!effectMounted.current) {
    const fetchFileContent = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);

        if (blob.type !== "application/pdf") {
          setError('Visualización solo disponible para PDFs');
          showToast('error', 'Visualización solo disponible para PDFs');
          return; 
        }

        const fileData = {
          uri: fileUrl,
          fileType: blob.type,
        };
        setFileContent([fileData]);
        setError(null);

        return () => URL.revokeObjectURL(fileUrl);
      } catch (error) {
        console.error('Error fetching file:', error);
        setError(error.message);
        showToast('error', 'Error al visualizar documento');
      }
    };

    fetchFileContent();
    effectMounted.current = true;
  }
  }, [url]);

  return (
    <div className="fixed mt-3 inset-0 flex items-center justify-center z-50 bg-[#2C1C47] bg-opacity-30 md:px-0">
      <div className="bg-white mt-8 md:p-6 rounded-lg shadow-lg w-[90%] h-[85%] md:w-[50%] md:h-[80%] relative flex flex-col text-black">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-center items-center flex-grow overflow-auto mt-9">
          {fileContent && (
            <DocViewer
              documents={fileContent}
              pluginRenderers={DocViewerRenderers}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsViewer;
