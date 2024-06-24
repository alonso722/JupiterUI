import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';
import { toast } from 'react-toastify';

const DocumentUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const effectMounted = useRef(false);
  const api = useApi();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Por favor, seleccione un archivo para cargar.');
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
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 right-2 pb-1 w-[35px] text-2xl font-bold hover:text-gray-700">
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
          className="mb-4 w-full p-2 border border-gray-300 rounded text-black"/>
        <textarea
          placeholder="Descripción del documento"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded text-black"/>
        <button onClick={handleSubmit} className="bg-[#2C1C47] p-2 rounded text-white">
          Cargar
        </button>
      </div>
    </div>
  );
};

const AnnexesUploadModal = ({ isOpen, onClose, onAnnexesUpload }) => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const effectMounted = useRef(false);
  const api = useApi();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Por favor, seleccione al menos un archivo para cargar.');
      return;
    }

    try {
      const uploadedFiles = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/user/file/store', formData);
        let filems = response.data.data;
        let path = response.data.path;
        filems.asignedTitle = title;
        uploadedFiles.push({ ...filems, path, title });
      }

      if (uploadedFiles.length > 0) {
        onAnnexesUpload(uploadedFiles);
        onClose();
      } else {
        console.error('Error al cargar los archivos');
        alert('Error al cargar los archivos');
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
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 right-2 pb-1 w-[35px] text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <h2 className="text-2xl mb-4 text-black">Cargar anexos</h2>
        <input type="file" multiple onChange={handleFileChange} className="mb-4" />
        {files.length > 0 && (
          <div className="mb-4 text-black">
            {files.map((file, index) => (
              <div key={index} className="mb-2 flex justify-between items-center">
                <div>
                  <p>Archivo: {file.name}</p>
                  <p>Tamaño: {file.size < 1024 ? file.size + " bytes" : file.size < 1048576 ? (file.size / 1024).toFixed(2) + " KB" : (file.size / 1048576).toFixed(2) + " MB"}</p>
                </div>
                <button onClick={() => handleRemoveFile(index)} className="ml-4 bg-red-500 text-white p-1 rounded">Eliminar</button>
              </div>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Título del documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded text-black"/>
        <textarea
          placeholder="Descripción del documento"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded text-black"/>
        <button onClick={handleSubmit} className="bg-[#2C1C47] p-2 rounded text-white">
          Cargar
        </button>
      </div>
    </div>
  );
};

const AddProcessForm = ({ card, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [processName, setProcessName] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fileInfo, setFileInfo] = useState(null); 
  const [annexesInfo, setAnnexesInfo] = useState(null); 
  const effectMounted = useRef(false);
  const api = useApi();
  const [users, setUsers] = useState([]);

  const handleSelectionDepartment = (selectedDepartments) => {
    setSelectedDepartments(selectedDepartments);
  };

  const handleFileUpload = (filems) => {
    setFileInfo(filems); 
  };

  const handleAnnexesUpload = (filems) => {
    setAnnexesInfo(filems); 
  };

  useEffect(() => {
    if (effectMounted.current === false) {
      api.post('/user/process/fetchUsers')
        .then((response) => {
          const usersData = response.data;
          setUsers(usersData);
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
      effectMounted.current = true;
    }
  }, []);

  const handleAddProcess = (selectedDepartments) => {
    if (!processName) {
      toast.error( "Por favor, nombre el proceso");
      return;
    }
    const processDetails = {
      processName,
      departments: selectedDepartments,
      editor: { name: "editor", uuid: "uet1" },
      revisor: { name: "revisor", uuid: "urt1" },
      aprobator: { name: "aprobator", uuid: "uapt1" },
      state: 1, 
    };
  
    if (fileInfo) {
      processDetails.filePath = fileInfo.path; 
      processDetails.fileTitle = fileInfo.asignedTitle; 
      processDetails.fileName = fileInfo.name;
    }
    if(annexesInfo){
      processDetails.annexes = annexesInfo;
    }
  
    if (processDetails.processName) {
      processDetails.editor.uuid = "uet1";
      processDetails.revisor.uuid = "urt1";
      processDetails.aprobator.uuid = "uapt1";
      api.post('/user/process/addTab', processDetails)
        .then((response) => {
          if (response.data === 200) {
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
    } else {
    }
  };
  
  const getFileIcon = (extension) => {
    switch (extension.toLowerCase()) {
      case '.pdf':
        return '/icons/pdf.png';
      case '.doc':
      case '.docx':
        return '/icons/doc.png';
      case '.xls':
      case '.xlsx':
        return '/icons/excel.png';
      default:
        return '/icons/question.png'; 
    }
  };

  const getAnnexesIcon = (extension) => {
    if(extension.length > 1){
      return '/icons/folder.png';
    } else {
      switch (extension[0].extension.toLowerCase()) {
        case '.pdf':
          return '/icons/pdf.png';
        case '.doc':
        case '.docx':
          return '/icons/doc.png';
        case '.xls':
        case '.xlsx':
          return '/icons/excel.png';
        default:
          return '/icons/question.png'; 
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[700px] relative">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">
            <input
                type="text"
                placeholder="Nombre del proceso"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
            <p className="mb-4 text-black">Detalles del proceso:</p>
            <div className='max-h-[350px] h-[250px]'>
              <DepartmentsChecks selectedOptions={selectedDepartments} setSelectedOptions={setSelectedDepartments} />
            </div>
          </div>
        </div>
        <div className='flex  justify-center '>
          {fileInfo && (
            <div className="mb-4 text-black items-center justify-end">
              <h2>Documento cargado:</h2>            
              <img src={getFileIcon(fileInfo.extension)} alt="File Icon" className="w-[100px] h-[100px] ml-[20px] mr-[160px]" />
              <p
                className='w-[150px] text-black text-center justify-center overflow-hidden text-ellipsis whitespace-nowrap'
                title={fileInfo.name}>
                {fileInfo.name}
              </p>
            </div>
          )}
          {annexesInfo && (
            <div className="mb-4 text-black flex flex-col items-center justify-center">
              <h2>Anexos:</h2>
              <img src={getAnnexesIcon(annexesInfo)} alt="File Icon" className="w-[100px] h-[100px]"/>
              <p
                className='w-[150px] text-black text-center overflow-hidden text-ellipsis whitespace-nowrap'
                title={annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}>
                {annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}
              </p>
            </div>
          )}
        </div>
        <div className="mt-9 flex justify-end">
          <div className='flex'>
          <button onClick={() => setIsModalOpen(true)} className='underline text-black p-2 mt-6 rounded'>
            Cargar documento
          </button>
          <button onClick={() => setIsModal2Open(true)} className='underline text-black p-2 rounded mt-6'>
            Cargar anexos
          </button>
          </div>
          <button onClick={() => handleAddProcess(selectedDepartments)} className="bg-[#2C1C47] p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]">
            Añadir proceso
          </button>
        </div>
        {isModalOpen && <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFileUpload={handleFileUpload} />}
        {isModal2Open && <AnnexesUploadModal isOpen={isModal2Open} onClose={() => setIsModal2Open(false)} onAnnexesUpload={handleAnnexesUpload} />}
      </div>
    </div>
  );
};

export default AddProcessForm;
