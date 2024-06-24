'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const FileViewer = dynamic(() => import('react-file-viewer'), { ssr: false });

const DocViewer = ({ url, onClose }) => {
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const mimeType = blob.type;

        if (mimeType === 'application/pdf') {
          setFileType('pdf');
        } else if (
          mimeType === 'application/msword' ||
          mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          setFileType('docx');
        } else if (
          mimeType === 'application/vnd.ms-excel' ||
          mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          setFileType('xlsx');
        } else {
          throw new Error('Unsupported file type');
        }

        if (typeof window !== 'undefined') {
          const reader = new FileReader();
          reader.onload = () => {
            setFileContent(reader.result);
          };
          reader.readAsDataURL(blob);
        }
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    fetchFileContent();
  }, [url]);

  const handleZoomIn = () => {
    setZoomLevel(prevZoom => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.1));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] h-[90%] relative flex flex-col text-black">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className="flex justify-center items-center flex-grow overflow-auto mt-9">
          <div
            className="w-full h-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
            {fileContent && fileType && (
              <FileViewer
                fileType={fileType}
                filePath={fileContent}
                onError={e => console.error('Error al mostrar el archivo:', e)}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button onClick={handleZoomIn} className="bg-[#2C1C47] p-2 rounded text-white">
            Zoom +
          </button>
          <button onClick={handleZoomOut} className="bg-[#2C1C47] p-2 rounded text-white">
            Zoom -
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
