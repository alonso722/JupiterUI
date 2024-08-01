import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import useApi from '@/hooks/useApi';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';
import { toast } from 'react-toastify';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const DocumentUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const effectMounted = useRef(false);
  const api = useApi();

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      showToast('error','Por favor, seleccione un archivo para cargar.');
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

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      showToast('error','Por favor, seleccione al menos un archivo para cargar.');
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
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
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
          placeholder="Título de la carpeta documento"
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
  const [organizationsS, setOrgas] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
  };

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
      let parsedPermissions;
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
          parsedPermissions = JSON.parse(storedPermissions);
          if (parsedPermissions.Type === 5) {
              router.push('/dashboard/home');
          }
          if (parsedPermissions.Type === 6) {
            api.get('/user/organization/fetch')
            .then((response) => {
                const fetchedData = response.data.data.map(item => ({
                    id: item.id,
                    organization: item.organization,    
                }));
                setOrgas(fetchedData);
            })
            .catch((error) => {
                console.error("Error al consultar procesos:", error);
            });
        }
          setPermissions(parsedPermissions);
      }
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

  const handleAddProcess = () => {
    if (!processName) {
      showToast('error', "Por favor, nombre el proceso");
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
    } else{
      showToast('error', "Por favor, cargue un documento principal");
      return;
    }
    if(annexesInfo){
      processDetails.annexes = annexesInfo;
    }else{
      showToast('error', "Por favor, cargue los anexos");
      return;
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-[950px] h-[550px] relative">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
      <div className='flex'>
        <div className=''>
          <div className='w-[400px]'>
            <div className='flex'> 
            <div className='bg-[#F1CF2B] h-[13px] w-[13px] mt-[25px] mr-2'>.</div>            
              <h2 className="text-2xl mt-[15px] mb-2 text-black">
                <input
                  type="text"
                  placeholder="Nombre del proceso"
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
              </h2>
            </div>
            {permissions.Type === 6 && (
            <div className='mb-2 p-1 text-black'>
              <Listbox value={selectedOrgId} onChange={setSelectedOrgId} className="max-w-[100px]">
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-black">Organización</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                        <span className="flex items-center">
                          <span className="ml-3 block truncate">
                            {organizationsS.find(org => org.id === selectedOrgId)?.organization || "Selecciona..."}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {organizationsS.map((org) => (
                            <Listbox.Option
                              key={org.id}
                              className={({ active }) =>
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-black',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={org.id}>
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span
                                      className={classNames(selected ? 'font-semibold text-black' : 'font-normal text-black', 'ml-3 block truncate')}>
                                      {org.organization}
                                    </span>
                                  </div>
                                  {selected ? (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}>
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
          )}
            <div className='max-h-[300px] h-[200px]'>
              <DepartmentsChecks selectedOptions={selectedDepartments} setSelectedOptions={setSelectedDepartments} selectedOrgId={selectedOrgId} />
            </div>
          </div>
          <div className=" flex justify-end">
            <div className='flex mt-[30px]'>
              <button onClick={() => setIsModalOpen(true)} className='flex bg-[#EDF2F7] text-black p-2 mt-2 rounded'>
              <img src='/icons/doc.svg' alt='Iconos' width={19} height={21} className='mr-[13px]'/>
                Cargar documento
              </button>
              <button onClick={() => setIsModal2Open(true)} className='flex ml-[23px] bg-[#EDF2F7] text-black p-2 rounded mt-2'>
              <img src='/icons/clip.svg' alt='Iconos' width={16} height={22} className='mr-[13px]'/>
                Cargar anexos
              </button>
            </div>
          </div>
        <button onClick={() => handleAddProcess(selectedDepartments)} className="bg-[#2C1C47] py-1 rounded text-white ml-5 mr-[20px] h-[30px] w-[130px] mt-[30px]">
          Añadir proceso
        </button>
        </div>
        <div className='flex w-[400px] p-4 justify-center mt-[70px] rounded border-2 ml-[60px]'>
          {fileInfo && (
            <div className="text-black flex flex-col items-center">
              <h2 className="mb-2">Documento cargado:</h2>            
              <img src={getFileIcon(fileInfo.extension)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
              <p
                className='w-[150px] text-black text-center mx-[14px] overflow-hidden text-ellipsis whitespace-nowrap'
                title={fileInfo.name}>
                {fileInfo.name}
              </p>
            </div>
          )}
          {annexesInfo && (
            <div className="text-black flex flex-col items-center ml-6">
              <h2 className="mb-2">Anexos:</h2>
              <img src={getAnnexesIcon(annexesInfo)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
              <p
                className='w-[150px] text-black text-center overflow-hidden text-ellipsis whitespace-nowrap'
                title={annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}>
                {annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}
              </p>
            </div>
          )}
        </div>
        </div>
        {isModalOpen && <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFileUpload={handleFileUpload} />}
        {isModal2Open && <AnnexesUploadModal isOpen={isModal2Open} onClose={() => setIsModal2Open(false)} onAnnexesUpload={handleAnnexesUpload} />}
      </div>
    </div>
  );
};

export default AddProcessForm;
