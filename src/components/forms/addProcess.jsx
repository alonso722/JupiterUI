import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import useApi from '@/hooks/useApi';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';
import UsersChecks from '../misc/checkbox/usersChecks';
import { toast } from 'react-toastify';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import DocumentUploadModal from '@/components/modals/documentUploadModal';
import AnnexesUploadModal from '@/components/modals/annexesUploadModal';
import InstructionsUploadModal from '@/components/modals/instructionsUploadModal';
import { useColors } from '@/services/colorService';

const AddProcessForm = ({ card, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [processName, setProcessName] = useState('');
  const [depName, setDepName] = useState('');
  const [privileges, setPrivileges] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fileInfo, setFileInfo] = useState(null); 
  const [annexesInfo, setAnnexesInfo] = useState(null);
  const [instructionsInfo, setInstructionsInfo] = useState(null);
  const [linksInfo, setLinksInfo] = useState(null); 
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
  const [description, setDescription] = useState(''); 
  const { primary, secondary } = useColors();

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

  const handleInstructionsUpload = (filems) => {
    setInstructionsInfo(filems); 
  };

  const handleSetLinks = (links) => {
    setLinksInfo(links); 
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
        setLinksInfo(workflowInfo.links)
        setDescription(workflowInfo.t08_workflow_description)
    }
  }, [workflowInfo, ]);
  
  const handleAddProcess = async () => {
    if (!processName) {
      showToast('error', "Por favor, nombre el proceso");
      return;
    }

    if (description && description.length > 150) {
      showToast('error', "La descripción no puede tener más de 150 caracteres");
      return;
    }    

    if (!selectedDepartments) {
      showToast('error', "Por favor, seleccione al menos un departamento");
      return;
    }
  
    try {
      const response = await api.post('/user/process/fetchUsers', { selectedDepartments });
      const usersData = response.data;
      setUsers(usersData);
      
      const processDetails = {
        processName,
        description,
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
      showToast('error', "Los usuarios no pueden tener más de un rol por proceso.");
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
      if (linksInfo) {
        processDetails.links = linksInfo;
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

    if (description && description.length > 150) {
      showToast('error', "La descripción no puede tener más de 150 caracteres");
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
        description,
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
        showToast('error', "Los usuarios no pueden tener más de un rol por proceso.");
        return;
    }
      if (fileInfo) {
        processDetails.filePath = fileInfo.path;
        if(fileInfo.titleAsig){
          processDetails.fileTitle = fileInfo.titleAsig;
        } else{
          processDetails.fileTitle = fileInfo.title;
        }
        processDetails.fileName = fileInfo.name;
      }
      if (annexesInfo) {
        processDetails.annexes = annexesInfo;
      }
      if (linksInfo) {
        processDetails.links = linksInfo;
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
  if (annexesInfo && linksInfo && linksInfo.links > 0) {
    return '/icons/folder.png';
  }
  if (extension.length > 1) {
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


  const handleInputChange = (event) => {
    setDescription(event.target.value); 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50 px-5">
      <div className="bg-white p-6 rounded-lg shadow-lg md:w-[1000px] md:h-[92%] h-[570px] relative md:mt-0 mt-[11%] overflow-y-auto">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <div className='md:flex md:h-full md:pb-0'>
          <div className=''>
            <div className='md:w-[400px]'>
            <p className='text-black'>
              {workflowInfo ? workflowInfo.dName : ''}
            </p>
              <div className='flex'> 
                <div style={{ backgroundColor: primary || '#F1CF2B' }} className='h-[13px] w-[13px] mt-[25px] mr-2'></div>            
                <h2 className="text-2xl mt-[15px] mb-2 text-black">
                  <input
                    type="text"
                    placeholder="Nombre del proceso"
                    defaultValue={workflowInfo ? workflowInfo.t08_workflow_name : ""}
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    className="md:w-full border-b border-gray-300 focus:border-purple-500 outline-none"
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
            <div className='flex md:w-[400px] w-[20%] py-2 justify-center'>
              {fileInfo && (
                <div className="text-black mt-[15px] flex flex-col items-center">
                  <h2 className="mt-1">Documento cargado:</h2>
                  <img src={getFileIcon(fileInfo.extension)} alt="File Icon" className="w-[80px] h-[80px] mb-2" />
                  <p className='w-[150px] text-black text-center mx-[5px] overflow-hidden text-ellipsis whitespace-nowrap' title={fileInfo.name}>
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
            {privileges === 1 || privileges === 2 ? (
              <div>
                <div className="flex ml-[10px]">
                  <div className='flex md:mt-[10px]'>
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
                <div className='mt-3'>
                  <textarea 
                    type="text"
                    value={description || ""}
                    onChange={handleInputChange}
                    placeholder="Descripción del proceso"
                    className='w-full text-black h-[80px] max-h-[80px] border-2 px-2 rounded overflow-auto border-indigo-200/50'>
                  </textarea>
                </div>
              </div>      
            ) : null}
            <button
              onClick={() => card ? handleEditProcess(selectedDepartments) : handleAddProcess(selectedDepartments)}
              className=" hidden md:block py-1 rounded text-white ml-5 mr-[20px] h-[30px] w-[130px] mt-[10px]"
              style={{ backgroundColor: secondary }}
            >
              {card ? 'Editar proceso' : 'Añadir proceso'}
            </button>
          </div>
          {permissions.Type !== 1 && permissions.Type !== 6 ? (
            <div className='ml-3 rounded border-2 w-[400px] mt-[20px] h-[630px]'>
              <div className='md:flex flex-col p-3'>
                <h2 className='text-black text-lg font-semibold mb-2'>Información del proceso:</h2>
                <div className='text-black mb-3'>
                  <h3 className='text-md font-medium'>Editor:</h3>
                  {workflowInfo.t08_workflow_editor && workflowInfo.t08_workflow_editor.length > 0 ? (
                    <p>{workflowInfo.t08_workflow_editor[0].name} {workflowInfo.t08_workflow_editor[0].last}</p>
                  ) : (
                    <p>No hay editor asignado</p>
                  )}
                </div>
                <div className='text-black mb-3'>
                  <h3 className='text-md font-medium'>Revisor:</h3>
                  {workflowInfo.t08_workflow_revisor && workflowInfo.t08_workflow_revisor.length > 0 ? (
                    <p>
                      {workflowInfo.t08_workflow_revisor.map(revisor => `${revisor.name} ${revisor.last}`).join(', ')}
                    </p>
                  ) : (
                    <p>No hay revisor(es) asignado(s)</p>
                  )}
                </div>
                <div className='text-black mb-3'>
                  <h3 className='text-md font-medium'>Aprobador:</h3>
                  {workflowInfo.t08_workflow_aprobator && workflowInfo.t08_workflow_aprobator.length > 0 ? (
                    <p>
                      {workflowInfo.t08_workflow_aprobator.map(aprobator => `${aprobator.name} ${aprobator.last}`).join(', ')}
                    </p>
                  ) : (
                    <p>No hay aprobador(es) asignado(s)</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className='md:ml-3 rounded border-2 mt-[20px] max-h-[600px] overflow-y-auto md:w-[500px]'>
              <div className='mb-2 px-5 mt-[10px] text-black'>
                <Listbox 
                  value={selectedEditor} 
                  onChange={(value) => setSelectedEditor(value)} 
                  className="max-w-[100px]"
                >
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium leading-6 text-black">Editor</Listbox.Label>
                      <div className="relative mt-2">
                        <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                          <span className="flex items-center">
                            <span className="ml-3 block truncate">
                              {selectedEditor && selectedEditor.name ? `${selectedEditor.name} ${selectedEditor.last || ''}` : "Selecciona..."}
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
                                    {selected && (
                                      <span className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}>
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    )}
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
              <div className='md:flex justify-between mt-3 '>
                <div className='ml-5 max-h-[300px] h-[200px] max-w-[200px]'>
                  <p className="block text-sm font-medium leading-6 text-black">Revisor</p>
                  <UsersChecks className='bg-black' selectedOptions={selectedRevisor} setSelectedOptions={setSelectedRevisor} selectedOrgId={selectedOrgId} />
                </div>
                <div className='max-h-[300px] h-[200px] max-w-[200px] mr-3 ml-5 md:ml-0'>
                  <p className="block text-sm font-medium leading-6 text-black">Aprobador</p>
                  <UsersChecks selectedOptions={selectedAprobator} setSelectedOptions={setSelectedAprobator} selectedOrgId={selectedOrgId} />
                </div>
              </div>
              <div className='mt-[20px] max-h-[300px] h-[200px] max-w-[200px] ml-5'>
                <p className="block text-sm font-medium leading-6 text-black">Consultores</p>
                <UsersChecks selectedOptions={selectedConsultor} setSelectedOptions={setSelectedConsultor} selectedOrgId={selectedOrgId} />
              </div>
            </div>
          )}
            <button
              onClick={() => card ? handleEditProcess(selectedDepartments) : handleAddProcess(selectedDepartments)}
              className=" md:hidden block py-1 rounded text-white ml-5 mr-[20px] h-[30px] w-[130px] my-[20px] mb-1"
              style={{ backgroundColor: secondary }}
            >
              {card ? 'Editar proceso' : 'Añadir proceso'}
            </button>
        </div>
        {isModalOpen && <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFileUpload={handleFileUpload} />}
        {isModal2Open && <AnnexesUploadModal isOpen={isModal2Open} processId={card} onClose={() => setIsModal2Open(false)} onAnnexesUpload={handleAnnexesUpload} onLinks={handleSetLinks} />}
      </div>
    </div>
  );
};

export default AddProcessForm;
