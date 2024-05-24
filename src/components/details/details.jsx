import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const status = [
  { id: 1, column: 'Edicion' },
  { id: 2, column: 'Revision' },
  { id: 3, column: 'Aprobacion' },
  { id: 4, column: 'Aprobado' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const DocumentUploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    // Logic to handle the document submission
    console.log({ file, title, description });
    onClose(); // Close the modal after submission
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

const Details = ({ card, onClose }) => {
  const [selected, setSelected] = useState(status[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initialStatus = status.find(state => state.column === card.column) || status[0];
    setSelected(initialStatus);
  }, [card.column]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[1500px] h-[700px] relative">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className='flex'>
          <div className='w-[800px]'>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">{card.title}</h2>
            <p className="mb-4 text-black">Detalles de la tarjeta.</p>
            <div>
                <button onClick={() => setIsModalOpen(true)} className='bg-[#2C1C47] p-2 rounded text-white'>
                    Cargar documento
                </button>
            </div>
            <div className='mt-4 text-black rounded border-1 border-indigo-200/50 p-2 w-[750px] h-[350px]'>
                <h3>Descripcion del proceso</h3>
            </div>
            <div className='mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[750px]'>
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
          <div className='mt-10 border-l-4 p-3 max-w-[200px]'>
            <Listbox value={selected} onChange={setSelected}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Estado del proceso</Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
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
            <div className="mt-4 text-black rounded border-2 border-indigo-200/50 p-2 w-[500px]">
                <p>
                    Detalles del proceso:
                </p>
                <p className='mt-4'>
                    Editado por:
                </p>
                <p>
                   Revisado por:
                </p>
                <p>
                    Aprobado por:
                </p>
                <p>
                    Fecha de aprobacion
                </p>
            </div>
          </div>
        </div>
      </div>
      <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Details;
