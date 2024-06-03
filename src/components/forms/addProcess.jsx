import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';

const DocumentUploadModal = ({ isOpen, onClose }) => {
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
    formData.append('title', title);
    formData.append('description', description);

    try {
      console.log("se envia archivo!", file.name);
      const response = await api.post('http://localhost:8030/api/v1/file?f='+file.name, formData);
      console.log(response.data.data.md5)
      // if (response.ok) {
      //   const result = await response.json();
      //   console.log('Archivo cargado exitosamente:', result);
      //   // Aquí puedes manejar la respuesta del servidor
      //   onClose();
      // } else {
      //   console.error('Error al cargar el archivo:', response.statusText);
      //   alert('Error al cargar el archivo');
      // }
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
          className="mb-4 w-full p-2 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Descripción del documento"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded"
        />
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
  const effectMounted = useRef(false);
  const api = useApi();
  const [users, setUsers] = useState([]);

  const handleSelectionDepartment = (selectedDepartments) => {
    setSelectedDepartments(selectedDepartments);
    console.log("Selected departments in AddForm:", selectedDepartments);
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

  const userOptions = users.map(user => ({
    id: user.id,
    column: user.userName
  }));
  
  const handleAddProcess = (selectedDepartments) => {
    console.log(selectedDepartments)
    const processDetails = {
      processName,
      departments: selectedDepartments,
      editor: { name:  "editor", uuid: "uet1" },
      revisor: { name:  "revisor", uuid: "urt1" },
      aprobator: { name: "aprobator", uuid: "uapt1" },
    };
  
    if (processDetails.processName) {
      processDetails.editor.uuid =  "uet1" ;
      processDetails.revisor.uuid = "urt1" ;
      processDetails.aprobator.uuid = "uapt1";
      console.log(processDetails)
      console.log("Detalles del proceso con UUIDs:", processDetails);
      
      api.post('/user/process/addTa', processDetails)
      .then((response) => {
        console.log("response en front", response.data);
        const add = response.data;
      })
      .catch((error) => {
        console.error("Error al consultar procesos:", error);
      });
  
    } else {
      console.log("Error: No se han cargado usuarios.");
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
                    className="w-full border-none focus:outline-none"/>
            </h2>
            <p className="mb-4 text-black">Detalles del proceso:</p>
            <div className='max-h-[450px] h-[450px]'>
              <DepartmentsChecks selectedOptions={selectedDepartments} setSelectedOptions={setSelectedDepartments} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className='bg-[#2C1C47] p-2 rounded text-white mr-[160px]'>
            Cargar documento
          </button>
          <button onClick={() => handleAddProcess(selectedDepartments)} className="bg-[#2C1C47] p-2 rounded text-white mr-[20px]">
            Añadir proceso
          </button>
        </div>
        {isModalOpen && <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};

export default AddProcessForm;
