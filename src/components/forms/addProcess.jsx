import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import useApi from '@/hooks/useApi';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';
import UsersChecks from '../misc/checkbox/usersChecks';
import { toast } from 'react-toastify';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
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
  const [depName, setDepName] = useState('');
  const [privileges, setPrivileges] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fileInfo, setFileInfo] = useState(null); 
  const [annexesInfo, setAnnexesInfo] = useState(null); 
  const effectMounted = useRef(false);
  const api = useApi();
  const [organizationsS, setOrgas] = useState([]);
  const [users, setUsers] = useState([]);
  const [list, setUList] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [selectedEditor, setSelectedEditor] = useState({});
  const [selectedRevisor, setSelectedRevisor] = useState([]);
  const [selectedAprobator, setSelectedAprobator] = useState([]);
  const [selectedConsultor, setSelectedConsultor] = useState([]);
  const [workflowInfo, setInfo] = useState([]);
  const [workflows, setAccess] = useState([]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
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
      parsedPermissions = JSON.parse(storedPermissions);

      let par;
      const storedA = localStorage.getItem('workflows'); 
      try {
          par = JSON.parse(storedA);
      } catch (e) {
          console.error("Error al analizar el valor de localStorage:", e);
          par = null;
      }
      
      if (parsedPermissions.Type === 1 || parsedPermissions.Type === 6) {
          setPrivileges(1);
      } else if (par && typeof par === 'object' && par !== null) {
      
          if (par.editorOf && par.editorOf.includes(card.id)) {
              setPrivileges(2);
          } else if (par.revisorOf && par.revisorOf.includes(card.id)) {
              setPrivileges(3);
          } else if (par.aprobatorOf && par.aprobatorOf.includes(card.id)) {
              setPrivileges(4);
          } else {
              setPrivileges(0);
          }
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
  
      let parsedAccess;
      const storedAccess = localStorage.getItem('workflows');
      if (storedAccess) {
        parsedAccess = JSON.parse(storedAccess);
        setAccess(parsedAccess);
      }
  
      if (card?.id) {
        const id = card.id;
        api.post('/user/process/fetchEdit', { id })
          .then((info) => {
            setInfo(info.data); 
          })
          .catch((error) => {
            console.error("Error al consultar el proceso:", error);
          });
      }
  
      api.post('/user/process/fetchUsersList', { orga: parsedPermissions })
        .then((response) => {
          const fetchedData = response.data;
          setUList(fetchedData);
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
      
      setPermissions(parsedPermissions);    
      effectMounted.current = true;
    }
  }, []);
  
  useEffect(() => {
    if (workflowInfo && workflowInfo.t08_workflow_name) {
        setProcessName(workflowInfo.t08_workflow_name);
        setSelectedEditor(workflowInfo.t08_workflow_editor[0]);
        setSelectedRevisor(workflowInfo.t08_workflow_revisor);
        setSelectedAprobator(workflowInfo.t08_workflow_aprobator);
        setSelectedConsultor(workflowInfo.t08_workflow_consultor);
        setDepName(workflowInfo.dName);
        setFileInfo(workflowInfo.file)
        setAnnexesInfo(workflowInfo.anx)
    }
  }, [workflowInfo, ]);
  
  const handleAddProcess = async () => {
    if (!processName) {
      showToast('error', "Por favor, nombre el proceso");
      return;
    }
  
    try {
      const response = await api.post('/user/process/fetchUsers', { selectedDepartments });
      const usersData = response.data;
      setUsers(usersData);
      
      const processDetails = {
        processName,
        departments: selectedDepartments,
        editor: selectedEditor,
        revisor: selectedRevisor,
        aprobator: selectedAprobator,
        consultor: selectedConsultor,
        state: 1,
    };

    const ensureArray = (value) => {
      return Array.isArray(value) ? value : [];
  };
  
  const hasDuplicates = (array1, array2) => {
      return array1.some(item1 => array2.some(item2 => item1.uuid === item2.uuid));
  };
  
  const hasDuplicateRoles = () => {
    const editorArray = ensureArray([processDetails.editor]);
    const revisorArray = ensureArray(processDetails.revisor);
    const aprobatorArray = ensureArray(processDetails.aprobator);
    const consultorArray = ensureArray(processDetails.consultor);

    return (
        hasDuplicates(editorArray, revisorArray) ||
        hasDuplicates(editorArray, aprobatorArray) ||
        hasDuplicates(editorArray, consultorArray) ||  
        hasDuplicates(revisorArray, aprobatorArray) ||
        hasDuplicates(revisorArray, consultorArray) || 
        hasDuplicates(aprobatorArray, consultorArray)   
    );
};

  
  if (hasDuplicateRoles()) {
      showToast('error', "Los usuarios no pueden tener más de dos roles por proceso.");
      return;
  }
      
      if (fileInfo) {
        processDetails.filePath = fileInfo.path;
        processDetails.fileTitle = fileInfo.asignedTitle;
        processDetails.fileName = fileInfo.name;
      }
      if (annexesInfo) {
        processDetails.annexes = annexesInfo;
      }
      if (processDetails.processName) {
        api.post('/user/process/addTab', processDetails)
          .then((response) => {
            if (response.status === 200) {
              onClose();
            }
          })
          .catch((error) => {
            console.error("Error al consultar procesos:", error);
          });
      }
    } catch (error) {
      console.error("Error al consultar procesos:", error);
    }
  };

  const handleEditProcess = async () => {
    if (!processName) {
      showToast('error', "Por favor, nombre el proceso");
      return;
    }
  
    try {
      const formatUser = (user) => ({
        uuid: user.uuid,
        name: Array.isArray(user.name) ? user.name.join(', ') : user.name,
      });
  
      const processDetails = {
        processId: card.id,
        processName,
        editor: formatUser(selectedEditor),
        revisor: selectedRevisor.map(formatUser),
        aprobator: selectedAprobator.map(formatUser),
        consultor: selectedConsultor.map(formatUser),
      };


      const ensureArray = (value) => {
        return Array.isArray(value) ? value : [];
    };
    
    const hasDuplicates = (array1, array2) => {
        return array1.some(item1 => array2.some(item2 => item1.uuid === item2.uuid));
    };
    
    const hasDuplicateRoles = () => {
      const editorArray = ensureArray([processDetails.editor]);
      const revisorArray = ensureArray(processDetails.revisor);
      const aprobatorArray = ensureArray(processDetails.aprobator);
      const consultorArray = ensureArray(processDetails.consultor);
  
      return (
          hasDuplicates(editorArray, revisorArray) ||
          hasDuplicates(editorArray, aprobatorArray) ||
          hasDuplicates(editorArray, consultorArray) || 
          hasDuplicates(revisorArray, aprobatorArray) ||
          hasDuplicates(revisorArray, consultorArray) ||
          hasDuplicates(aprobatorArray, consultorArray)   
      );
  };
    
    if (hasDuplicateRoles()) {
        showToast('error', "Los usuarios no pueden tener más de dos roles por proceso.");
        return;
    }
      
      if (fileInfo) {
        processDetails.filePath = fileInfo.path;
        processDetails.fileTitle = fileInfo.title;
        processDetails.fileName = fileInfo.name;
      }
      if (annexesInfo) {
        processDetails.annexes = annexesInfo;
      }
      if (processDetails.processName) {
        api.post('/user/process/editTab', processDetails)
          .then((response) => {

            if (response.status === 200) {
              onClose();
            }
          })
          .catch((error) => {
            console.error("Error al consultar procesos:", error);
          });
      }
    } catch (error) {
      console.error("Error al consultar procesos:", error);
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
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[1000px] h-[92%] relative">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
      <div className='flex'>
        <div className=''>
          <div className='w-[400px]'>
          <p className='text-black'>
            {workflowInfo ? workflowInfo.dName : ''}
          </p>
            <div className='flex'> 
            <div className='bg-[#F1CF2B] h-[13px] w-[13px] mt-[25px] mr-2'></div>            
            <h2 className="text-2xl mt-[15px] mb-2 text-black">
              <input
                type="text"
                placeholder="Nombre del proceso"
                defaultValue={workflowInfo ? workflowInfo.t08_workflow_name : ""}
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
                disabled={permissions.Type !== 1 && permissions.Type !== 6}
              />
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
          {!card && (
            <div className='max-h-[300px] h-[200px]'>
              <DepartmentsChecks selectedOptions={selectedDepartments} setSelectedOptions={setSelectedDepartments} selectedOrgId={selectedOrgId} />
            </div>
          )}
          </div>
          {privileges === 1 || privileges === 2 ? (
            <div className="flex ml-[10px]">
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
          ) : null}
          <button
            onClick={() => card ? handleEditProcess(selectedDepartments) : handleAddProcess(selectedDepartments)}
            className="bg-[#2C1C47] py-1 rounded text-white ml-5 mr-[20px] h-[30px] w-[130px] mt-[30px]">
            {card ? 'Editar proceso' : 'Añadir proceso'}
          </button>
        </div>
        {permissions.Type !== 1 && permissions.Type !== 6 ? (
          <div className='ml-3 rounded border-2 mt-[20px] h-[630px]'>
            <div className='flex w-[450px] p-3 justify-center ml-[60px]'>
              {fileInfo && (
                <div className="text-black flex flex-col items-center">
                  <h2 className="mb-2">Documento cargado:</h2>
                  <img src={getFileIcon(fileInfo.extension)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
                  <p className='w-[150px] text-black text-center mx-[14px] overflow-hidden text-ellipsis whitespace-nowrap' title={fileInfo.name}>
                    {fileInfo.name}
                  </p>
                </div>
              )}
              {annexesInfo && (
                <div className="text-black flex flex-col items-center ml-6">
                  <h2 className="mb-2">Anexos:</h2>
                  <img src={getAnnexesIcon(annexesInfo)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
                  <p className='w-[150px] text-black text-center overflow-hidden text-ellipsis whitespace-nowrap' title={annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}>
                    {annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}
                  </p>
                </div>
              )}
            </div>
            <div className='flex flex-col p-3'>
              <h2 className='text-black text-lg font-semibold mb-2'>Información del Workflow:</h2>
              <div className='text-black mb-3'>
                <h3 className='text-md font-medium'>Editor:</h3>
                {workflowInfo.t08_workflow_editor && workflowInfo.t08_workflow_editor.length > 0 ? (
                  <p>{workflowInfo.t08_workflow_editor[0].name}</p>
                ) : (
                  <p>No hay editor asignado</p>
                )}
              </div>
              <div className='text-black mb-3'>
                <h3 className='text-md font-medium'>Revisor:</h3>
                {workflowInfo.t08_workflow_revisor && workflowInfo.t08_workflow_revisor.length > 0 ? (
                  <p>{workflowInfo.t08_workflow_revisor.map(revisor => revisor.name).join(', ')}</p>
                ) : (
                  <p>No hay revisor(es) asignado(s)</p>
                )}
              </div>
              <div className='text-black mb-3'>
                <h3 className='text-md font-medium'>Aprobador:</h3>
                {workflowInfo.t08_workflow_aprobator && workflowInfo.t08_workflow_aprobator.length > 0 ? (
                  <p>{workflowInfo.t08_workflow_aprobator.map(aprobator => aprobator.name).join(', ')}</p>
                ) : (
                  <p>No hay aprobador(es) asignado(s)</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='ml-3 rounded border-2 mt-[20px] h-[610px]'>
            <div className='flex w-[450px] p-3 justify-center ml-[60px]'>
              {fileInfo && (
                <div className="text-black flex flex-col items-center">
                  <h2 className="mb-2">Documento cargado:</h2>
                  <img src={getFileIcon(fileInfo.extension)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
                  <p className='w-[150px] text-black text-center mx-[14px] overflow-hidden text-ellipsis whitespace-nowrap' title={fileInfo.name}>
                    {fileInfo.name}
                  </p>
                </div>
              )}
              {annexesInfo && (
                <div className="text-black flex flex-col items-center ml-6">
                  <h2 className="mb-2">Anexos:</h2>
                  <img src={getAnnexesIcon(annexesInfo)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
                  <p className='w-[150px] text-black text-center overflow-hidden text-ellipsis whitespace-nowrap' title={annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}>
                    {annexesInfo.length > 1 ? annexesInfo[0].title : annexesInfo[0].name}
                  </p>
                </div>
              )}
            </div>
            <div className='mb-2 px-5 text-black'>
              <Listbox value={selectedEditor} onChange={(value) => {
                setSelectedEditor(value);
              }} className="max-w-[100px]">
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-black">Editor</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                        <span className="flex items-center">
                          <span className="ml-3 block truncate">
                            {selectedEditor ? `${selectedEditor.name} ${selectedEditor.last || ''}` : "Selecciona..."}
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
                          {list.map((user) => (
                            <Listbox.Option
                              key={user.uuid}
                              value={user}
                              className={({ active }) =>
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-black',
                                  'relative cursor-default select-none py-2 pl-3 pr-9')}>
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span
                                      className={classNames(selected ? 'font-semibold text-black' : 'font-normal text-black', 'ml-3 block truncate')}>
                                      {user.name} {user.last}
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
            <div className='flex justify-between mt-3'>
              <div className='ml-5 max-h-[300px] h-[200px] max-w-[200px]'>
                <p className="block text-sm font-medium leading-6 text-black">Revisor</p>
                <UsersChecks selectedOptions={selectedRevisor} setSelectedOptions={setSelectedRevisor} selectedOrgId={selectedOrgId} />
              </div>
              <div className='max-h-[300px] h-[200px] max-w-[200px] mr-3'>
                <p className="block text-sm font-medium leading-6 text-black">Aprobador</p>
                <UsersChecks selectedOptions={selectedAprobator} setSelectedOptions={setSelectedAprobator} selectedOrgId={selectedOrgId} />
              </div>
            </div>
            <div className='max-h-[300px] h-[200px] max-w-[200px] ml-5 pt-[60px]'>
              <p className="block text-sm font-medium leading-6 text-black">Consultores</p>
              <UsersChecks selectedOptions={selectedConsultor} setSelectedOptions={setSelectedConsultor} selectedOrgId={selectedOrgId} />
            </div>
          </div>
        )}
      </div>
        {isModalOpen && <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFileUpload={handleFileUpload} />}
        {isModal2Open && <AnnexesUploadModal isOpen={isModal2Open} onClose={() => setIsModal2Open(false)} onAnnexesUpload={handleAnnexesUpload} />}
      </div>
    </div>
  );
};

export default AddProcessForm;
