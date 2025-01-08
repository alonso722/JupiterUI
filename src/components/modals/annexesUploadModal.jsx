import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';

const AnnexesUploadModal = ({ isOpen, onClose, onAnnexesUpload, onLinks, processId }) => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [links, setLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const { primary, secondary } = useColors();
  const effectMounted = useRef(false);
  const api = useApi();

  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  useEffect(() => {
    if (effectMounted.current === false) {
      if (processId?.id) {
        const id = processId.id;
        api.post('/user/annexe/fetch', { prId: id })
          .then((response) => {
            if (response?.data?.data?.length > 0 && response.data.data[0].title) {
                setTitle(response.data.data[0].title);
            }
            
            if (Array.isArray(response.data.data)) {
              const fetchedFiles = response.data.data.map(file => ({
                ...file,
                asignedTitle: file.title || 'Sin título',
                existing: true, 
              }));
              setFiles(fetchedFiles); 
            } else {
              showToast('error', 'La respuesta del servidor no es un array.');
            }
          })
          .catch((error) => {
            console.error("Error al consultar el proceso:", error);
            showToast('error', 'Error al consultar el proceso.');
          });

          api.post('/user/annexe/links', { id })
          .then((response) => {
            if (response?.data?.data?.length > 0 && response.data.data[0].title) {
                setTitle(response.data.data[0].title);
            }
            if (Array.isArray(response.data.data)) {
              const fetchedLinks = response.data.data.map(link => link.link);
              setLinks(fetchedLinks); 
            } else {
              showToast('error', 'La respuesta del servidor no es un array.');
            }
          })
          .catch((error) => {
            console.error("Error al consultar los links:", error);
            showToast('error', 'Error al consultar los links.');
          });
      }
      effectMounted.current = true;
    }
  }, [processId?.id]);
  

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      name: file.name,
      size: file.size,
      asignedTitle: title,
      existing: false, 
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleLinkAddition = () => {
    if (linkInput.trim() !== '') {
      setLinks((prevLinks) => [...prevLinks, linkInput.trim()]);
      setLinkInput('');
    }
  };

  const handleLinkRemove = (index) => {
    setLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0 && links.length === 0) {
      showToast('error', 'Por favor, seleccione al menos un archivo para cargar o ingrese un link.');
      return;
    }

    if(!title){
      showToast('error', 'Por favor, nombre el archivo o carpeta');
      return;
    }

    try {
      const uploadedFiles = [];
      for (const file of files) {
        if (!file.existing) {
          const formData = new FormData();
          formData.append('file', file.file);

          const response = await api.post('/user/file/store', formData);
          const filems = response.data.data;
          const path = response.data.path;
          filems.asignedTitle = title;
          uploadedFiles.push({ ...filems, path, title });
        } else {
            uploadedFiles.push({
                id: file.id,
                name: file.name,
                path: file.path,
                asignedTitle: title,
                extension: '.' + file.name.split('.').pop(), 
              });             
        }
      }

      let annxLinks = {
        title: title,
        links: links
      };

      onLinks(annxLinks);
      if (uploadedFiles.length > 0) {
        onAnnexesUpload(uploadedFiles);
      }
      onClose();
    } catch (error) {
      console.error('Error en la solicitud:', error);
      showToast('error', 'Error en la solicitud.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[900px] max-h-[600px] relative">
        <button
          onClick={onClose}
          className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-2xl mb-4 text-black">Anexos</h2>
        <div className='flex '>
            <div className='w-[400px]'>
            <input
          type="text"
          placeholder="Título de la carpeta de anexos o del documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full p-2 border-b border-gray-300 rounded text-black mt-9"/>
                <input type="file" multiple onChange={handleFileChange} className="mb-4" />
                {files.length > 0 && (
                    <div className="mb-4 text-black max-h-[170px] overflow-y-auto">
                        {files.map((file, index) => (
                        <div key={index} className="mb-2 flex justify-between items-center">
                            <div>
                            <p>Archivo: {file.name}</p>
                            <p>
                                Tamaño:{' '}
                                {file.size < 1024
                                ? file.size + ' bytes'
                                : file.size < 1048576
                                ? (file.size / 1024).toFixed(2) + ' KB'
                                : (file.size / 1048576).toFixed(2) + ' MB'}
                            </p>
                            </div>
                            <button
                                onClick={() => handleRemoveFile(index)}
                                className="ml-4 bg-red-500 text-white p-1 rounded">
                                Eliminar
                            </button>
                        </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-4 ml-5 pl-5 border-l-2 border-gray-300 w-[400px]">
                <h3 className="mb-2 text-black text-[#AEAEB7]"><b>Añadir link</b></h3>
                <div className=" flex-wrap h-[200px] overflow-y-auto border-b-2 border-gray-300">
                  <div className="items-center my-1">
                    <input
                      type="text"
                      placeholder="Link"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleLinkAddition();
                          setIsInputVisible(false); 
                        }
                      }}
                      className="p-2 text-black border-b-2 border-gray-300 focus:border-grey-500 outline-none"/>
                      <button
                        onClick={() => {
                        handleLinkAddition();
                        setIsInputVisible(false); 
                        }}
                        className="ml-2 bg-gray-300 text-black px-2 py-1 rounded">
                        +
                      </button>
                    </div>
                    {links.map((link, index) => (
                      <div className="flex" key={index}>
                        <div
                          className="bg-gray-200 text-black p-2 m-1 rounded flex items-center max-h-[40px] max-w-[350px] overflow-hidden whitespace-nowrap"
                          title={link}>
                          <span className="truncate">{link}</span>
                          <button
                            onClick={() => handleLinkRemove(index)}
                            className="ml-2 text-red-500">
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
            </div>
        </div>
        <div className='flex justify-end'>
          <button 
            onClick={handleSubmit} 
            className="p-2 rounded text-white"
            style={{ backgroundColor: secondary }}>
            Cargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnexesUploadModal;
