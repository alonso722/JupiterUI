import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';

const DocumentUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const effectMounted = useRef(false);
  const api = useApi();

  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

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
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <h2 className="text-2xl mb-4 text-black">Cargar documento</h2>
        <input type="file" onChange={handleFileChange} className="mb-4" />
        {file && (
          <div className="mb-4 text-black">
            <p>Archivo seleccionado: {file.name}</p>
            <p>Tamaño: {file.size < 1024 ? file.size + " bytes" : file.size < 1048576 ? (file.size / 1024).toFixed(2) + " KB" : (file.size / 1048576).toFixed(2) + " MB"}</p>
          </div>
        )}
        <input
          type="text"
          placeholder="Título del documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded text-black"
        />
        <button
          onClick={handleSubmit}
          className={`p-2 rounded text-white ${!file ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2C1C47] hover:bg-[#1B1130] cursor-pointer'}`}
          disabled={!file} 
        >
          Cargar
        </button>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
