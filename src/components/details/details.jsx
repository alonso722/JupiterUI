import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import useApi from '@/hooks/useApi';
import Incident from '../details/incident';
import Annexes from '../details/annexe';
import DocsViewer from '../misc/docViewer/docViewer';
import dotenv from 'dotenv';
import { toast } from 'react-toastify';
dotenv.config();
import { useColors } from '@/services/colorService';

const status = [
  { id: 1, column: 'Edición' },
  { id: 2, column: 'Revisión' },
  { id: 3, column: 'Aprobación' },
  { id: 4, column: 'Aprobado' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const DocumentDownload = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const api = useApi();

  if (!isOpen) return null;

  return <></>;
};

const Details = ({ card, onClose }) => {
  const [selected, setSelected] = useState(status[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentNameF, setDeptName] = useState({});
  const [document, setDocument] = useState({});
  const [documentsANX, setAnnexe] = useState({});
  const [links, setLinks] = useState([]);
  const [roles, setRoles] = useState({});
  const [updated, setDate] = useState({});
  const [description, setDescription] = useState('');
  const [incident, setIncident] = useState(''); 
  const [logsPrnt, setLogs] = useState([]);
  const [attendReq, setAttend] = useState(false); 
  const [incidentStatus, setIncidentStatus] = useState({}); 
  const [selectedIncident, setSelectedIncident] = useState(null);
  const effectMounted = useRef(false);
  const api = useApi();
  const [isModalAnxOpen, setModalAnxOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [urlToView, setFileUrl] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [renderKey, setRenderKey] = useState(Date.now());
  const [view, setView] = useState('icons');
  const [permissions, setPermissions] = useState([]);
  const [workflows, setAccess] = useState([]);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [privileges, setPrivileges] = useState('');
  const { primary, secondary } = useColors();

  const openViewer = (path) => {
    setFileUrl(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const openModalAnx = (id) => {
    setSelectedCardId(id);
    setModalAnxOpen(true);
  };

  const closeModalAnx = () => {
    setSelectedCardId(null);
    setModalAnxOpen(false);
  };

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
};

  useEffect(() => {
    if (effectMounted.current === false) {
      const fetchDocument = async () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }    
        
        let par;
        const storedA = localStorage.getItem('workflows'); 
        try {
            par = JSON.parse(storedA);
        } catch (e) {
            console.error("Error al analizar el valor de localStorage:", e);
            par = null;
        }
        
        const cardId = parseInt(card.id, 10);
        
        if (parsedPermissions.Type === 1 || parsedPermissions.Type === 6) {
          setPrivileges(1);
        } else if (par && typeof par === 'object' && par !== null) {
        
            if (par.editorOf && par.editorOf.includes(cardId)) {
                setPrivileges(2);
            } else if (par.revisorOf && par.revisorOf.includes(cardId)) {
                setPrivileges(3);
            } else if (par.aprobatorOf && par.aprobatorOf.includes(cardId)) {
                setPrivileges(4);
            } else {
                setPrivileges(0);
            }
        }         

        try {
          const initialStatus = status.find(state => state.column === card.column) || status[0];
          const responseDep = await api.post('/user/departments/getName', card);
          const departmentName = responseDep.data.data;
          setDeptName(departmentName);

          const responseDoc = await api.post('/user/document/fetch', card);
          const fetchDocument = responseDoc.data.data[0];
          setDocument(fetchDocument);
          setSelected(initialStatus);

          const responseRole = await api.post('/user/process/getRoles', card);
          const responseDate = await api.post('/user/process/getdate', card);
          const updateDate = responseDate.data.date;
          setDate(updateDate);
          const des = responseDate.data.description;
          setDescription(des);
          const rolesData = responseRole.data[0];
          setRoles(rolesData);

          const prId = card.id;
          const processLogs = await api.post('/user/log/getLogs', { prId });
          const prscdlogs = processLogs.data; 
          setLogs(prscdlogs);
          const incidentStatuses = {};
          for (const log of prscdlogs) {
            if (log.type === 21) {
              incidentStatuses[log.id] = await getIncidentStatus(log.id);
            }
          }
          setIncidentStatus(incidentStatuses);

        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };

      const fetchAnnexes = async () => {
        try {
          const responseDep = await api.post('/user/departments/getId', card);
          const departmentId = responseDep.data.departmentId;
          const ids ={};
          ids.prId= card.id;
          ids.deptId= departmentId;
          const responseAnx = await api.post('/user/annexe/fetch', ids);
          const fetchAnnexe = responseAnx.data.data;
          setAnnexe(fetchAnnexe);
          const responseLinks = await api.post('/user/annexe/links', { id: card.id });
          const fetchLinks = responseLinks.data.data;
          setLinks(fetchLinks);
        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };

      fetchDocument();
      fetchAnnexes();
      effectMounted.current = true;
    }
  }, [card.column, api, renderKey]);

  const getFileIcon = (filename) => {
    if (!filename) {
      return '/icons/question.png';
    }
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '/icons/pdf.png';
      case 'doc':
      case 'docx':
        return '/icons/doc.png';
      case 'xls':
      case 'xlsx':
        return '/icons/excel.png';
      default:
        return '/icons/question.png';
    }
  };

  const getFileAnxIcon = (file) => {
    if (file.length > 1 || file[0].link) {
      return '/icons/folder.png';
    } else {
      const fileName = file[0].name;
      const lastDotIndex = fileName.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        const extension = fileName.substring(lastDotIndex).toLowerCase();
        switch (extension) {
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
      } else {
        return '/icons/question.png';
      }
    }
  };
  
  const handleDownload = async (path) => {
    if (path) {
      window.open(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path, '_blank');
      const uuid = permissions.uuid;

      const log = {};
      log.uuid = uuid;
      log.type = 22;
      log.id = card.id;
      try {
        await api.post('/user/log/setLog', log);
      } catch (error) {
        console.error("Error al hacer el registro:", error);
      }
    } else {
      console.error("URL del documento no está disponible");
    }
  };

  const handleAnxDownload = async (path) => {
    if (path) {
      window.open(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path, '_blank');
      const uuid = permissions.uuid;

      const log = {};
      log.uuid = uuid;
      log.type = 24;
      log.id = card.id;
      try {
        await api.post('/user/log/setLog', log);
      } catch (error) {
        console.error("Error al hacer el registro:", error);
      }
    } else {
      console.error("URL del documento no está disponible");
    }
  };

  const handleCheckboxChange = (value) => {
    setAttend(value);
  };
  
  const handleSubmit = async () => {
    const confirmationStatus = attendReq ? 1 : 0;
    //const uuid = localStorage.getItem('uuid');
    //const perms = JSON.parse(permissions);ys
    const uuid = permissions.uuid;
    
    const log = {};
    log.uuid = uuid;
    log.type = 21;
    log.id = card.id;
    let logId= '';
    try {
      const response = await api.post('/user/log/setLog', log);
      logId = response.data[0];
    } catch (error) {
      console.error("Error al hacer el registro:", error);
    }
    const incidentSnd = {};
    incidentSnd.incident = incident;
    incidentSnd.attend = confirmationStatus;
    incidentSnd.uuid = uuid;
    incidentSnd.process = card.id;
    incidentSnd.type = attendReq;
    incidentSnd.id = logId;
    try {
      await api.post('/user/incident/create', incidentSnd);
      setIncident('');
      showToast('success','Se envió el comentario o incidencia.');
      setRenderKey(Date.now());
    } catch (error) {
      showToast('error','Error al enviar el comentario o incidencia.');
      console.error("Error al hacer el registro:", error);
    }
  };

  const handleInputChange = (event) => {
    setIncident(event.target.value); 
  };

  function getEventTypeText(type) {
    switch (type) {
      case 21:
        return " un comentario";
      case 22:
        return " una descarga";
      case 23:
        return `una actualización del estado del proceso a '${card.column}'`;
      case 24:
        return " una descarga del anexo";  
      default:
        return "Evento desconocido";
    }
  }
  
  const getIncidentStatus = async (id) => {
    try {
      const response = await api.post('/user/incident/getStatus', {id});
      switch (response.data) {
        case 2 :
          return 'Accion requerida';
        case 1 :
          return 'Accion requerida';
        case 0 :
          return 'Sin acciones necesarias';
        default:
          return 'Sin acciones necesarias';
      }
    } catch (error) {
      console.error("Error al hacer el registro:", error);
    }
  }

  const handleLogClick = (log) => {
    setSelectedIncident(log);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (newStatus) => {
    setNewStatus(newStatus);
    setUpdateModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    setSelected(newStatus);
    setUpdateModalOpen(false);

    if (newStatus.id === 3 || newStatus.id === 4) {
      handleStatusCheck(newStatus);
    } else {
      let log = {};
      log.id = card.column;
      log.uuid = permissions.uuid;
      log.type = 23;
      api.post('/user/process/update', {
        id: card.id,
        newColumn: newStatus.column,
      })
      .then( async (response) => {
        try {
          await api.post('/user/log/setLog', log);
        } catch (error) {
          console.error("Error al hacer el registro:", error);
        }
      })
      .catch((error) => {
        console.error("Error al actualizar la columna en backend:", error);
      });
      showToast('success','Se actualizo el estado del proceso.');
    }
  };

  const handleReject=()=>{
    setRejectModalOpen(true);
  }

  const handleConfirmReject=()=>{
    setRejectModalOpen(true);
    let log = {};
    log.id = card.id;
    log.uuid = permissions.uuid;
    log.type = 23;
    api.post('/user/process/reject', {
      id: card.id
    })
    .then( async (response) => {
      try {
        await api.post('/user/log/setLog', log);
      } catch (error) {
        console.error("Error al hacer el registro:", error);
      }
    })
    .catch((error) => {
      console.error("Error al actualizar la columna en backend:", error);
    });
    showToast('error','Se actualizo el estado del proceso, regresó a edición.');
    onClose();
  }


  const handleStatusCheck = (newStatus)=>{
    const vobo = {};
    vobo.uuid = permissions.uuid;
    vobo.process = parseInt(card.id);
    const state = newStatus.id;

    let log = {};
      log.id = card.id;
      log.uuid = permissions.uuid;
      log.type = 23;
    if(state == 3){
      api.post('/user/vobo/revisionA', vobo)
      .then( async (response) => {
        showToast('success','Se envió su visto bueno.');
        const left = response.data;
        if ( left == 0){
          api.post('/user/process/update', {
            id: card.id,
            newColumn: newStatus.column,
          })
          .then( async (response) => {
            try {
              await api.post('/user/log/setLog', log);
            } catch (error) {
              console.error("Error al hacer el registro:", error);
            }
          })
          .catch((error) => {
            console.error("Error al actualizar la columna en backend:", error);
          });
        } else {
          showToast('warning','Esperando la revisión de los demás encargados...');
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al actualizar la columna en backend:", error);
      });

    } else{
      api.post('/user/vobo/aprobationA', vobo)
      .then( async (response) => {
        showToast('success','Se envió su visto bueno.');
        const left = response.data;
        if ( left == 0){
          api.post('/user/process/update', {
            id: card.id,
            newColumn: newStatus.column,
          })
          .then( async (response) => {
            try {
              await api.post('/user/log/setLog', log);
            } catch (error) {
              console.error("Error al hacer el registro:", error);
            }
          })
          .catch((error) => {
            console.error("Error al actualizar la columna en backend:", error);
          });
        } else {
          showToast('warning','Esperando la revisión de los demás encargados...');
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al actualizar la columna en backend:", error);
      });

    }
  }

  const handleCancelUpdate = () => {
    setUpdateModalOpen(false);
  };

  const handleCancelReject = () => {
    setRejectModalOpen(false);
  };

  const isListboxDisabled = () => {
    if (permissions.Type === 1 || permissions.Type === 6) {
      return false;
    }
  
    let parsedWorkflows;
    const storedWorkflows = localStorage.getItem('workflows');
    if (storedWorkflows) {
      parsedWorkflows = JSON.parse(storedWorkflows);
    }
  
    let isDisabled = true;
  
    if (parsedWorkflows && card) {
      if (parsedWorkflows.coordinator === 0) {
        return true; 
      }
  
      const cardId = Number(card.id);
      if (card.column === "Edición") {
        isDisabled = !parsedWorkflows.editorOf.includes(cardId);
      } else if (card.column === "Revisión") {
        isDisabled = !parsedWorkflows.revisorOf.includes(cardId);
      } else if (card.column === "Aprobación") {
        isDisabled = !parsedWorkflows.aprobatorOf.includes(cardId);
      } else if (card.column === "Aprobado") {
        isDisabled = true; 
      } else {
        isDisabled = false; 
      }
    }
  
    return isDisabled;
  };
  

  const isdownloadDisabled = () => {
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
  };
  
  
  const filteredStatus = status.filter((state) => {
    if (selected.id === 1) {
      return state.id === 1 || state.id === 2;
    } else if (selected.id === 2) {
      return state.id === 2 || state.id === 3;
    } else if (selected.id === 3) {
      return state.id === 3 || state.id === 4;
    } else if (selected.id === 4) {
      return state.id === 4;
    }
    return false;
  });
  

  const modalMessage = selected.id === 2 || selected.id === 3
    ? "¿Estás seguro que deseas dar visto bueno al proceso?"
    : "¿Estás seguro de que deseas actualizar el estado del proceso?";

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
  };

  const handleView = (path) => {
    setFileUrl(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path);
    setIsModalOpen(true);
  };

  return (
    <div className="fixed mt-7 inset-0 flex items-center justify-center zIndex: 2 bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] h-[80%] relative">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
        <div className='flex'>
          <div className='min-w-[55%] max-w-[70%] ml-2 '>
            <p className='text-[#7A828A]'>
              {departmentNameF && `${departmentNameF}`}
            </p>
            <div className='flex'>
              <div className='bg-[#F1CF2B] h-[13px] w-[13px] mt-[25px] mr-2'>.</div>
              <h2 className="text-2xl mt-[15px] mb-4 text-black">Proceso | {card.name}</h2>
            </div>
            <div className='text-black border-2 mb-2 mr-2 p-1 overflow-y-auto  max-w-[400px] rounded h-[10%]'>
              <p>{description}</p>
            </div>
            <div className='relative '>
              <div className='justify-between flex space-x-2 mb-[5px]'>
                <p className="mt-[8px] text-black mb-2">Documentos asignado al proceso</p>
                <div className=' pr-[50px]'>
                  <button 
                    onClick={() => setView('icons')} 
                    className={`p-2 mr-2 rounded border-2 ${view === 'icons' ? '' : ''}`} 
                    style={{ backgroundColor: view === 'icons' ? secondary : '' }}>
                    <img src='/icons/icons.svg' alt='Iconos' width={24} height={24} />
                  </button>
                  <button 
                    onClick={() => setView('list')} 
                    className={`p-2 rounded border-2`} 
                    style={{ backgroundColor: view === 'list' ? secondary : '' }}>
                    <img src='/icons/list.svg' alt='Lista' width={24} height={24} />
                  </button>
                </div>
              </div>
              {view === 'icons' ? (
                <div className='flex flex-wrap justify-center items-center max-w-[95%]'>
                  <div className='flex flex-col items-center w-full sm:w-[40%] sm:mr-[10%] mb-4'>
                    <div className='w-full max-w-[170px] px-4 flex flex-col items-center justify-center rounded-lg border-2 border-indigo-200/50 mb-2'>
                      {document ? (
                        <p className="mt-[15px] text-black text-center">
                          <strong title={document.title || "Sin documento"}>
                            {document.title ? 
                              (document.title.length > 13 ? `${document.title.substring(0, 13)}...` : document.title) 
                              : "Sin documento"}
                          </strong>
                        </p>
                      ) : (
                        <p className="mt-[15px] text-black text-center">
                          <strong>Sin documento</strong>
                        </p>
                      )}
                      {document?.name ? (
                        <img
                          onClick={() => document && openViewer(document.path)}
                          src={getFileIcon(document.name)}
                          alt="File Icon"
                          className="w-[50%] h-auto mt-[10px] cursor-pointer"
                        />
                      ) : null}
                      <p className="mt-[15px] text-black text-center">

                      </p>
                    </div>
                    { privileges === 1 || privileges === 2 ? (
                      <button
                        onClick={() => handleDownload(document.path)}
                        className="p-1 rounded text-white"
                        style={{ backgroundColor: secondary }}>
                        Descargar
                      </button>
                    ): null}
                  </div>

                  <div className='flex flex-col items-center w-full sm:w-[40%] '>
                    <div className={`w-full max-w-[170px] px-4 flex flex-col items-center justify-center rounded-lg border-2 border-indigo-200/50 mb-2 ${(documentsANX?.length > 1 || links.length > 1) ? 'cursor-pointer' : ''}`}
                      onClick={(documentsANX?.length > 1 || links.length > 1) ? openModalAnx : undefined}>
                      {documentsANX?.length > 0 ? (
                        <>
                          <p className={`mt-[15px] text-black text-center ${documentsANX.length > 1 ? 'underline cursor-pointer' : ''}`}>
                            <strong>{documentsANX[0].title.length > 13 ? `${documentsANX[0].title.substring(0, 13)}...` : documentsANX[0].title}</strong>
                          </p>
                          <img
                            onClick={documentsANX.length === 1 ? () => openViewer(documentsANX[0].path) : undefined}
                            src={getFileAnxIcon(documentsANX)}
                            alt="File Icon"
                            className={`w-[50%] h-auto mt-[10px] ${documentsANX.length === 1 ? 'cursor-pointer' : ''}`}
                          />
                          <p className="mt-[5px] mb-2 text-black text-center">
                            {documentsANX.length > 1 
                              ? "\u00A0"
                              : (documentsANX[0]?.name && documentsANX[0].name.length > 13 
                                  ? `${documentsANX[0].name.substring(0, 13)}...`
                                  : documentsANX[0]?.name || "Nombre no disponible")}
                          </p>
                        </>
                      ) : links.length > 0 ? (
                        <>
                          <p className={`mt-[15px] text-black text-center ${links.length > 1 ? 'underline cursor-pointer' : ''}`}>
                            <strong>{links[0].title.length > 13 ? `${links[0].title.substring(0, 13)}...` : links[0].title}</strong>
                          </p>
                          <img
                            onClick={openModalAnx}
                            src={getFileAnxIcon(links)}
                            alt="File Icon"
                            className={`w-[50%] h-auto mt-[10px] ${links.length === 1 ? 'cursor-pointer' : ''}`}
                          />
                        </>
                      ) : (
                        <p className="mt-[15px] text-black mb-4">No hay anexos para el proceso.</p>
                      )}
                    </div>
                    {documentsANX?.length === 1 && permissions.Type !== 5 && (
                      <button
                        onClick={() => handleAnxDownload(documentsANX[0].path)}
                        className="p-1 rounded text-white"
                        style={{ backgroundColor: secondary }}>
                        Descargar
                      </button>
                    )}
                  </div>
                </div>
                ) : (
                <div className='flex flex-col max-w-[95%]'>
                  <div className='w-full  flex flex-col border-b-2 border-indigo-200/50 mb-4'>
                    <div className='flex flex-col'>
                    {document ? (
                      <div className='flex items-center'>
                        <img 
                          src={getFileIcon(document.name)} 
                          onClick={() => document && openViewer(document.path)}
                          alt="File Icon" 
                          className='w-[50px] h-[50px] cursor-pointer' 
                        />
                        <div className='flex-grow'>
                          <p className="text-black mr-[20px]"><strong>{document.title}</strong></p>
                          <p className="text-black">{document.name}</p>
                        </div>
                        {privileges === 1 || privileges === 2 ? (
                          <button
                            onClick={() => handleDownload(document.path)}
                            className="p-1 rounded text-white mr-1"
                            style={{ backgroundColor: secondary }}>
                            Descargar
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-black">Sin documento</p>
                    )}
                    </div>
                  </div>
                  <div className='w-full  flex flex-col  max-h-[100px] overflow-y-auto'>
                    <div className='flex flex-col'>
                      {documentsANX.length > 0 ? (
                        documentsANX.map((anx, index) => (
                          <div key={index} className='flex items-center pr-1'>
                            <img 
                              src={getFileAnxIcon([anx])} 
                              onClick={documentsANX.length === 1 ? () => openViewer(documentsANX[0].path) : undefined}
                              alt="File Icon" 
                              className='w-[50px] h-[50px]  cursor-pointer'/>
                            <div className='flex-grow'>
                              <p className="text-black">{anx.name}</p>
                            </div>
                            <button 
                              onClick={() => handleAnxDownload(anx.path)} 
                              className="p-1 rounded text-white"
                              style={{ backgroundColor: secondary }}>
                              Descargar
                            </button>
                          </div>
                        ))
                        ) : (
                        <p className="text-black">No hay anexos para el proceso.</p>
                      )}
                    </div>
                  </div>
                  <div className='w-full mb-2 flex flex-col border-b-2 max-h-[35px] overflow-y-auto border-indigo-200/50'>
                    <div className='flex flex-col'>
                      {links.length > 0 ? (
                        links.map((anx, index) => (
                          <div key={index} className='flex items-center pr-1'>
                            <div className='flex-grow'>
                              <p className="text-[#0ea5e9] text-sm flex">
                                +
                                <strong>
                                  <a href={anx.link} target="_blank" rel="noopener noreferrer">
                                     {anx.link.length > 40 ? `${anx.link.substring(0, 40)}...` : anx.link}
                                  </a>
                                </strong>
                              </p>
                            </div>
                          </div>
                        ))
                        ) : (
                        <p className="text-black">No hay links para el proceso.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className=' text-black rounded-lg border-2 border-[#B5B5BD] p-2 w-[90%]'>
              <textarea
                type="text"
                value={incident}
                onChange={handleInputChange}
                placeholder="Agrega un comentario o incidencia"
                className="w-full border-none focus:outline-none h-[80%] " />
            </div>
            <div className="flex items-center mt-2">
            <button 
              onClick={handleSubmit} 
              className={`p-2 rounded text-[#ffffff] ${secondary ? `bg-[${secondary}]` : ''} active:bg-[#B5B5BD]`}
            >
              Enviar
            </button>
              <div className="ml-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <label htmlFor="verificacion-lectura" className="text-black mr-2">Verificación de lectura</label>
                  <input
                    type="radio"
                    id="verificacion-lectura"
                    name="accion"
                    value="1"
                    onChange={() => handleCheckboxChange(1)}
                    className="form-radio"/>
                </div>
                <div className="flex items-center pr-4">
                  <label htmlFor="accion-necesaria" className="text-black mr-2">Acción necesaria</label>
                  <input
                    type="radio"
                    id="accion-necesaria"
                    name="accion"
                    value="2"
                    onChange={() => handleCheckboxChange(2)}
                    className="form-radio"/>
                </div>
              </div>
            </div>
          </div>
          <div className='mt-10 border-l-4 px-3 max-w-[50%] overflow-y-auto pr-5 '>
            <div className='flex'>
              <div className='w-[60%]'>
              <Listbox
                value={selected}
                onChange={handleStatusUpdate}
                className="max-w-[100px]"
                disabled={!document || isListboxDisabled()}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Estado del proceso</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button
                        className={`relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px] ${
                          !document || isListboxDisabled() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                        <span className="flex items-center">
                          <span className="ml-3 block truncate">{selected.column}</span>
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
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredStatus.map((state) => (
                            <Listbox.Option
                              key={state.id}
                              className={({ active }) =>
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={state}
                            >
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span
                                      className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                    >
                                      {state.column}
                                    </span>
                                  </div>
                                  {selected ? (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
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
              <div className="flex items-center pl-7">
                {!isListboxDisabled() && card.column !== "Edición" && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={handleReject}>
                    Rechazar
                  </button>
                )}
              </div>
            </div>
            {isUpdateModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[150px] relative flex flex-col justify-center items-center">
                  <h1 className="mb-[20px] text-center text-black">{modalMessage}</h1>
                  <div className="flex justify-between w-full px-8">
                    <button
                      className="text-white p-3 rounded-lg flex-grow mx-4"
                      style={{ backgroundColor: secondary }}
                      onClick={handleConfirmUpdate}>
                      Confirmar
                    </button>
                    <button
                      className="text-[#2C1C47] p-3 rounded-lg flex-grow mx-4"
                      style={{ backgroundColor: '#E6E8EC' }}
                      onClick={handleCancelUpdate}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isRejectModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[150px] relative flex flex-col justify-center items-center">
                  <h1 className="mb-[20px] text-center text-black">Está seguro de que desea rechazar este proceso?</h1>
                  <div className="flex justify-between w-full px-8">
                    <button
                      className="text-white p-3 rounded-lg flex-grow mx-4"
                      style={{ backgroundColor: secondary }}
                      onClick={handleConfirmReject}
                    >
                      Confirmar
                    </button>
                    <button
                      className="text-[#2C1C47] p-3 rounded-lg flex-grow mx-4"
                      style={{ backgroundColor: '#E6E8EC' }}
                      onClick={handleCancelReject}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[100%] max-w-[650px] max-h-[40%] overflow-auto whitespace-nowrap">
              {roles.editor && (
                <>
                  <p>Editado por:</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>
                        {roles.editor.name} {roles.editor.last}
                      </strong>
                    </li>
                  </ul>
                </>
              )}
              <div className='flex'>
                {roles.revisor && (
                  <div className="border-l-4 ml-2 pl-2">
                    <p>Revisado por:</p>
                    <strong>
                      <ul className="list-disc pl-5">
                        {roles.revisor.map((revisor, index) => (
                          <li key={index}>
                            {revisor.name} {revisor.last}
                          </li>
                        ))}
                      </ul>
                    </strong>
                  </div>
                )}
                {roles.aprobator && (
                  <div className="border-l-4 ml-2 pl-2">
                    <p>Aprobado por:</p>
                    <strong>
                      <ul className="list-disc pl-5">
                        {roles.aprobator.map((aprobator, index) => (
                          <li key={index}>
                            {aprobator.name} {aprobator.last}
                          </li>
                        ))}
                      </ul>
                    </strong>
                  </div>
                )}
              </div>
                {card.column === "Aprobado" && updated && !isNaN(new Date(updated).getTime()) && (
                  <>
                    <p>Fecha de aprobación:</p>
                    <p><strong>{new Date(updated).toLocaleString()}</strong></p>
                  </>
                )}
            </div>
            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[100%] max-w-[630px] h-[180px] max-h-[33%] overflow-auto">
              <h1 className='text-[18px]'><strong>Registro de eventos:</strong></h1>
              {logsPrnt.length > 0 ? (
                logsPrnt.map((log, index) => (
                  <div
                      key={index}
                      className={`mt-2 border-b-4 border-[#B5B5BD] mr-[20px] pr-[0px]  p-2 mb-2 ${log.type === 21 ? 'cursor-pointer' : ''}`}
                      onClick={log.type === 21 ? () => handleLogClick(log) : null}>
                      {log.type === 21 && <p className="">{incidentStatus[log.id]}</p>}
                      <div className='mb-2 '>
                          <strong>{log.name}</strong> 
                          , realizó <strong>{getEventTypeText(log.type)}</strong>.<br/>
                          <p className='text-[12px]'><br/>{new Date(log.created).toLocaleString()}</p>
                      </div>
                  </div>
                ))
              ) : (
                <p>No hay registros de eventos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
        {isViewerOpen && (
          <DocsViewer
            url={urlToView}
            onClose={closeViewer}/>
        )}
        {isModalOpen && selectedIncident && (
          <Incident incident={selectedIncident} onClose={handleCloseModal} />
        )}
      <DocumentDownload isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {isModalAnxOpen && <Annexes onClose={closeModalAnx} cardId={card.id} />}
    </div>
  );
};

export default Details;
