import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import useApi from '@/hooks/useApi';

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
  const [roles, setRoles] = useState({});
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (effectMounted.current === false) {
      const fetchDocument = async () => {
        try {
          const initialStatus = status.find(state => state.column === card.column) || status[0];
          console.log("Roles para datos<<<<<,", card);
          const responseDep = await api.post('/user/departments/getName', card);
          const departmentName = responseDep.data.data;
          console.log("Nameeeeee", departmentName)
          setDeptName(departmentName);

          const responseDoc = await api.post('/user/document/fetch', card);
          const fetchDocument = responseDoc.data.data[0];
          setDocument(fetchDocument);
          setSelected(initialStatus);

          const responseRole = await api.post('/user/role/fetch', fetchDocument);
          const rolesData = responseRole.data.data;
          setRoles(rolesData);

        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };

      fetchDocument();
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
        return '/icons/question.png'; // Icono default
    }
  };

  const handleDownload = (path) => {
    console.log("path de descarga!!!!", path);
    if (path) {
      window.open('http://localhost:8030/api/v1/file?f=' + path, '_blank');
    } else {
      console.error("URL del documento no está disponible");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] h-[700px] relative">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className='flex'>
          <div className='w-[50%] '>
          <p className='text-black'>
            {departmentNameF && `${departmentNameF}`}
          </p>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">{card.name}</h2>
            <p className="mb-4 text-black">Detalles del proceso</p>
            <p className="mt-[15px] text-black">Documento asignado al proceso:</p>
            <div className='w-[50%] flex flex-col items-center justify-center'>
              <p className="mt-[15px] text-black">{document.title}</p>
              <img src={getFileIcon(document.name)} alt="File Icon" className="w-[100px] h-[100px] mt-[10px]" />
              <p className="mt-[px] mb-4 text-black">{document.name}</p>
            </div>
            <div>
              <button onClick={() => handleDownload(document.path)} className='bg-[#2C1C47] p-2 rounded text-white'>
                Descargar documento
              </button>
            </div>
            <div className='mt-4 text-black rounded border-1 border-indigo-200/50 p-2 w-[750px] h-[50px]'>
              <h3>Descripcion del proceso</h3>
            </div>
            <div className='mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[90%]'>
              <input
                type="text"
                placeholder="Agrega un comentario"
                className="w-full border-none focus:outline-none"
              />
            </div>
            <div>
              <button className='mt-4 bg-[#2C1C47] p-2 rounded text-white'>
                Enviar comentario
              </button>
            </div>
          </div>
          <div className='mt-10 border-l-4 p-3 w-[500px] '>
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
          </div>
        </div>
      </div>
      <DocumentDownload isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Details;
