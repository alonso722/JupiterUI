import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import useApi from '@/hooks/useApi';
import Incident from '../details/incident';

const status = [
  { id: 1, column: 'Edicion' },
  { id: 2, column: 'Revision' },
  { id: 3, column: 'Aprobacion' },
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

  useEffect(() => {
    if (effectMounted.current === false) {
      const fetchDocument = async () => {
        try {
          const initialStatus = status.find(state => state.column === card.column) || status[0];
          console.log("card antes de obtener departamentos", card)
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
          console.log(departmentId)
          const responseAnx = await api.post('/user/annexe/fetch', ids);
          const fetchAnnexe = responseAnx.data.data;
          console.log("response de anexos",fetchAnnexe)
          setAnnexe(fetchAnnexe);

        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };

      fetchDocument();
      fetchAnnexes();
      effectMounted.current = true;
    }
  }, [card.column, api]);

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
      window.open('http://localhost:8030/api/v1/file?f=' + path, '_blank');
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

  const handleCheckboxChange = (value) => {
    setAttend(value);
  };
  
  const handleSubmit = async () => {
    const confirmationStatus = attendReq ? 1 : 0;
    const uuid = localStorage.getItem('uuid');
    console.log(confirmationStatus, incident, uuid); 
    
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
    console.log("id del log ", logId);
    const incidentSnd = {};
    incidentSnd.incident = incident;
    incidentSnd.attend = confirmationStatus;
    incidentSnd.uuid = uuid;
    incidentSnd.process = card.id;
    incidentSnd.type = 1;
    incidentSnd.id = logId;

    try {
      await api.post('/user/incident/create', incidentSnd);
    } catch (error) {
      console.error("Error al hacer el registro de incidente:", error);
    }
    fetchAnnexes();
    fetchDocument();
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
  return (
    <div className="fixed inset-0 flex items-center justify-center zIndex: 2 bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] h-[700px] relative">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className='flex'>
          <div className='w-[50%] ml-2'>
            <p className='text-black'>
              {departmentNameF && `${departmentNameF}`}
            </p>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">{card.name}</h2>
            <p className="mt-[15px] text-black mb-1">Documentos asignado al proceso:</p>
            <div className='flex'>
              <div className='w-[40%] flex flex-col items-center justify-center rounded border-2 border-indigo-200/50 mb-2 mr-4'>
                <p className="mt-[15px] text-black"><strong>{document.title}</strong></p>
                <img src={getFileIcon(document.name)} alt="File Icon" className="w-[100px] h-[100px] mt-[10px]" />
                <p className="mt-[px] mb-4 text-black">{document.name}</p>
              </div>
              <div className='w-[40%] flex flex-col items-center justify-center rounded border-2 border-indigo-200/50 mb-2'>
                {documentsANX.length > 0 ? (
                  <>
                    <p className="mt-[15px] text-black"><strong>{documentsANX[0].title}</strong></p>
                    <img src={getFileAnxIcon(documentsANX)} alt="File Icon" className="w-[100px] h-[100px] mt-[10px]" />
                    <p className="mt-[px] mb-4 text-black">{documentsANX.length > 1 ? "" : documentsANX[0].name}</p>
                  </>
                ) : (
                  <p className="mt-[15px] text-black">No hay anexos para el proceso.</p>
                )}
              </div>
            </div>
            <div>
              <button onClick={() => handleDownload(document.path)} className='bg-[#2C1C47] p-2 rounded text-white'>
                Descargar documento
              </button>
            </div>
            <div className='mt-7 text-black rounded border-2 border-indigo-200/50 p-2 w-[90%]'>
              <textarea
                type="text"
                value={incident}
                onChange={handleInputChange}
                placeholder="Agrega un comentario o incidencia"
                className="w-full border-none focus:outline-none h-[120px] " />
            </div>
            <div className="flex items-center mt-4">
              <button onClick={handleSubmit} className='bg-[#2C1C47] p-2 rounded text-white'>
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
          <div className='mt-10 border-l-4 p-3 w-[500px]'>
            <Listbox value={selected} onChange={setSelected} className="w-[100px]">
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Estado del proceso</Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 w-[100px]">
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
            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 max-w-[500px]">
              <p>Detalles del proceso:</p>
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
            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 max-w-[500px] h-[300px] overflow-auto">
              <h1><strong>Registro de eventos:</strong></h1>
              {logsPrnt.length > 0 ? (
                logsPrnt.map((log, index) => (
                  <div
                    key={index}
                    className={`mt-2 shadow-lg rounded border-2 border-indigo-200/40 p-2 mb-2 ${log.type === 21 ? 'cursor-pointer' : ''}`}
                    onClick={log.type === 21 ? () => handleLogClick(log) : null}>
                    {log.type === 21 && <p className="text-[#2C1C47] font-bold underline">{incidentStatus[log.id]}</p>}
                    <li className='mb-2'>
                      <strong>{log.name}</strong> 
                      , realizó <strong>{getEventTypeText(log.type)}</strong>.
                      <strong>{new Date(log.created).toLocaleString()}</strong> 
                    </li>
                  </div>
                ))
              ) : (
                <p>No hay registros de eventos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
        {isModalOpen && selectedIncident && (
          <Incident incident={selectedIncident} onClose={handleCloseModal} />
        )}
      <DocumentDownload isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Details;
