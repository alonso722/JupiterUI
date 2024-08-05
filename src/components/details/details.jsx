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
  const [roles, setRoles] = useState({});
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
        try {
          const initialStatus = status.find(state => state.column === card.column) || status[0];
          const responseDep = await api.post('/user/departments/getName', card);
          const departmentName = responseDep.data.data;
          setDeptName(departmentName);

          const responseDoc = await api.post('/user/document/fetch', card);
          const fetchDocument = responseDoc.data.data[0];
          setDocument(fetchDocument);
          setSelected(initialStatus);

          const responseRole = await api.post('/user/role/fetch', fetchDocument);
          const rolesData = responseRole.data.data;
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
    if(file.length > 1){
      return '/icons/folder.png';
    } else{
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
      const uuid = localStorage.getItem('uuid');

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
      const uuid = localStorage.getItem('uuid');

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
    const uuid = localStorage.getItem('uuid');
    
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
        return " una actualización del estado del proceso";
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
  };

  const handleView = (path) => {
    setFileUrl(process.env.NEXT_PUBLIC_MS_FILES+'/api/v1/file?f=' + path);
    setIsModalOpen(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center zIndex: 2 bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] h-[600px] relative">
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
            <div className='relative'>
              <div className='justify-between flex space-x-2 mb-[10px]'>
                <p className="mt-[8px] text-black mb-2">Documentos asignado al proceso</p>
                <div className=' pr-[50px]'>
                  <button 
                      onClick={() => setView('icons')} 
                      className={`p-2 mr-2 rounded border-2 ${view === 'icons' ? 'bg-[#2C1C47]' : ''}`}>
                      <img src='/icons/icons.svg' alt='Iconos' width={24} height={24} />
                  </button>
                  <button 
                    onClick={() => setView('list')} 
                    className={`p-2 rounded border-2 ${view === 'list' ? 'bg-[#2C1C47]' : ''}`}>
                    <img src='/icons/list.svg' alt='Lista' width={24} height={24} />
                  </button>
                </div>
              </div>
              {view === 'icons' ? (
                <div className='flex max-w-[95%]'>
                    <div className='flex flex-col items-center w-[40%] mr-[10%]'>
                      <div className='w-[170px] px-4 flex flex-col items-center justify-center rounded-lg border-2 border-indigo-200/50 mb-2'>
                        <p className="mt-[15px] text-black"><strong>{document.title}</strong></p>
                        <img
                          onClick={() => openViewer(document.path)}
                          src={getFileIcon(document.name)}
                          alt="File Icon"
                          className="w-[50%] h-[100%] mt-[10px] cursor-pointer"/>
                        <p className="mt-[px] mb-4 text-black">{document.name}</p>
                      </div>
                      <button onClick={() => handleDownload(document.path)} className='bg-[#2C1C47] p-2 rounded text-white'>
                        Descargar
                      </button>
                    </div>
                    <div className='flex flex-col items-center w-[40%]'>
                      <div className={`w-[170px] px-4 flex flex-col items-center justify-center rounded-lg border-2 border-indigo-200/50 mb-2 ${documentsANX.length > 1 ? 'cursor-pointer' : ''}`}
                        onClick={documentsANX.length > 1 ? openModalAnx : undefined}>
                        {documentsANX.length > 0 ? (
                        <>
                          <p className={`mt-[15px] text-black ${documentsANX.length > 1 ? 'underline cursor-pointer' : ''}`}>
                            <strong>{documentsANX[0].title}</strong>
                          </p>
                          <img
                            onClick={documentsANX.length === 1 ? () => openViewer(documentsANX[0].path) : undefined}
                            src={getFileAnxIcon(documentsANX)}
                            alt="File Icon"
                            className={`w-[50%] h-[100%] mt-[10px] ${documentsANX.length === 1 ? 'cursor-pointer' : ''}`}/>
                          <p className="mt-[px] mb-4 text-black">{documentsANX.length > 1 ? "cursor-pointer \u00A0" : documentsANX[0].name}</p>
                        </>
                        ) : (
                          <p className="mt-[15px] text-black mb-4">No hay anexos para el proceso.</p>
                        )}
                      </div>
                      {documentsANX.length === 1 && (
                        <button onClick={() => handleAnxDownload(documentsANX[0].path)} className='bg-[#2C1C47] p-2 rounded text-white'>
                          Descargar
                        </button>
                      )}
                    </div>
                  </div>
                  ) : (
                  <div className='flex flex-col max-w-[95%]'>
                      <div className='w-full px-4 flex flex-col border-b-2 border-indigo-200/50 mb-4'>
                          <p className="text-lg font-bold mb-2">Documentos</p>
                          <div className='flex flex-col'>
                              <div className='flex items-center mb-2'>
                                  <img 
                                      src={getFileIcon(document.name)} 
                                      alt="File Icon" 
                                      className='w-[70px] h-[70px] mr-2' 
                                  />
                                  <div className='flex'>
                                    <div className='flex mr-[58px] mt-[5px]'>
                                      <p className="text-black mr-[20px]"><strong>{document.title}</strong></p>
                                      <p className="text-black">{document.name}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleDownload(document.path)} 
                                      className='bg-[#2C1C47] p-2 rounded text-white'>
                                      Descargar documento
                                    </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className='w-full px-4 flex flex-col border-b-2 border-indigo-200/50'>
                          <p className="text-lg font-bold mb-2">Anexos</p>
                          <div className='flex flex-col'>
                              {documentsANX.length > 0 ? (
                                  documentsANX.map((anx, index) => (
                                      <div key={index} className='flex items-center mb-2'>
                                          <img 
                                              src={getFileAnxIcon([anx])} 
                                              alt="File Icon" 
                                              className='w-[18px] h-[18px] mr-2' 
                                          />
                                          <div className='flex-grow'>
                                              <p className="text-black"><strong>{anx.title}</strong></p>
                                              <p className="text-black">{anx.name}</p>
                                          </div>
                                          <button 
                                              onClick={() => handleAnxDownload(anx.path)} 
                                              className='bg-[#2C1C47] p-2 rounded text-white'
                                          >
                                              Descargar anexo
                                          </button>
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-black">No hay anexos para el proceso.</p>
                              )}
                          </div>
                      </div>
                  </div>
                )}
            </div>
            <div className='mt-7 text-black rounded-lg border-2 border-[#B5B5BD] p-2 w-[90%]'>
              <textarea
                type="text"
                value={incident}
                onChange={handleInputChange}
                placeholder="Agrega un comentario o incidencia"
                className="w-full border-none focus:outline-none h-[80%] " />
            </div>
            <div className="flex items-center mt-4">
              <button onClick={handleSubmit} className='bg-[#B5B5BD] p-2 rounded text-[#7A828A]'>
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
                <div className="flex items-center">
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
          <div className='mt-10 border-l-4 p-3 max-w-[50%]'>
            <Listbox value={selected} onChange={setSelected} className=" max-w-[100px]">
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Estado del proceso</Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
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
                      leaveTo="opacity-0">
                      <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {status.map((state) => (
                          <Listbox.Option
                            key={state.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                              )
                            }
                            value={state}>
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  <span
                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                    {state.column}
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
            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[100%] max-w-[630px] overflow-x-auto whitespace-nowrap">
  <p className='text-[18px]'><strong>Detalles del proceso:</strong></p>
  <p className='mt-4'>
    {roles.editor && <>Editado por: <strong>{roles.editor.name}</strong></>}
  </p>
  <p>
    {roles.revisor && <>Revisado por: <strong>{roles.revisor.name}</strong></>}
  </p>
  <p>
    {roles.aprobator && <>Aprobado por: <strong>{roles.aprobator.name}</strong></>}
  </p>
  <p>Fecha de aprobación</p>
</div>

            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[100%] max-w-[630px] h-[45%] overflow-auto">
              <h1 className='text-[18px]'><strong>Registro de eventos:</strong></h1>
              {logsPrnt.length > 0 ? (
                logsPrnt.map((log, index) => (
                  <div
                      key={index}
                      className={`mt-2 border-b-4 border-[#B5B5BD] mr-[20px] pr-[200px]  p-2 mb-2 ${log.type === 21 ? 'cursor-pointer' : ''}`}
                      onClick={log.type === 21 ? () => handleLogClick(log) : null}>
                      {log.type === 21 && <p className="">{incidentStatus[log.id]}</p>}
                      <div className='mb-2'>
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
