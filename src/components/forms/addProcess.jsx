import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';

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
      alert('Por favor, seleccione un archivo para cargar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      console.log("se envia archivo!", file.name);
      console.log("/user/file/store", formData, file.name, file);
      const response = await api.post('/user/file/store', formData);
      let filems = response.data.data;
      let path = response.data.path;
      let titleAsig = title;
      filems.asignedTitle = title;
      console.log("response ec file,", filems);
      if (response) {
        console.log('Archivo cargado exitosamente:', path, title);
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
        <h2 className="text-2xl mb-4">Cargar documento</h2>
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

const AddProcessForm = ({ card, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processName, setProcessName] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fileInfo, setFileInfo] = useState(null); 
  const effectMounted = useRef(false);
  const api = useApi();
  const [users, setUsers] = useState([]);

  const handleSelectionDepartment = (selectedDepartments) => {
    setSelectedDepartments(selectedDepartments);
    console.log("Selected departments in AddForm:", selectedDepartments);
  };

  const handleFileUpload = (filems) => {
    setFileInfo(filems); // Actualiza el estado con la información del archivo cargado
  };

  useEffect(() => {
    console.log("Departamentos seleccionados:", selectedDepartments);
    if (effectMounted.current === false) {
      api.post('/user/process/fetchUsers')
        .then((response) => {
          console.log("response en front", response.data);
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
    const processDetails = {
      processName,
      departments: selectedDepartments,
      editor: { name: "editor", uuid: "uet1" },
      revisor: { name: "revisor", uuid: "urt1" },
      aprobator: { name: "aprobator", uuid: "uapt1" },
      state: 1, // Añadir estado
    };
  
    if (fileInfo) {
      processDetails.filePath = fileInfo.path; 
      processDetails.fileTitle = fileInfo.asignedTitle; // Asignando el título del documento
      processDetails.fileName = fileInfo.name;
    }
  
    if (processDetails.processName) {
      processDetails.editor.uuid = "uet1";
      processDetails.revisor.uuid = "urt1";
      processDetails.aprobator.uuid = "uapt1";
      console.log("Objeto para enviar al backkkkkkkkkkk", processDetails);
      api.post('/user/process/addTab', processDetails)
        .then((response) => {
          console.log("response en front de insercion", response.data);
          if (response.data === 200) {
            console.log("La inserción fue exitosa. Cerrando la ventana.");
            onClose(); // Cerrar la ventana cuando la inserción sea exitosa
          }
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
    } else {
      console.log("Error: No se ha nombrado el proceso.");
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
        return '/icons/question.png'; // Icono default
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
                className="w-full border-none focus:outline-none"
              />
            </h2>
            <p className="mb-4 text-black">Detalles del proceso:</p>
            <div className='max-h-[350px] h-[350px]'>
              <DepartmentsChecks selectedOptions={selectedDepartments} setSelectedOptions={setSelectedDepartments} />
            </div>
          </div>
        </div>

        {fileInfo && (
          <div className="mb-4 text-black items-center justify-center">
            <h2>Documento cargado:</h2>            
            <img  src={getFileIcon(fileInfo.extension)} alt="File Icon" className="w-[100px] h-[100px] ml-[20px]" />
            <p
              className='w-[150px] text-black text-center justify-center overflow-hidden text-ellipsis whitespace-nowrap'
              title={fileInfo.name}>
              {fileInfo.name}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={() => setIsModalOpen(true)} className='bg-[#2C1C47] p-2 rounded text-white mr-[160px]'>
            Cargar documento
          </button>
          <button onClick={() => handleAddProcess(selectedDepartments)} className="bg-[#2C1C47] p-2 rounded text-white mr-[20px]">
            Añadir proceso
          </button>
        </div>
        {isModalOpen && <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFileUpload={handleFileUpload} />}
      </div>
    </div>
  );
};

export default AddProcessForm;
