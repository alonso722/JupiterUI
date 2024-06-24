import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { toast } from 'react-toastify';

const AddProcessForm = ({ department, onClose }) => {
  const [processName, setProcessName] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const effectMounted = useRef(false);
  const [data, setData] = useState([]);
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState('');
  const [subDepartments, setSubDepartments] = useState([]);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('');

  const fetchData = () => {
    api.get('/user/departments/fetch')
        .then((response) => {
            console.log(response.data.data);
            const fetchedData = response.data.data.map(item => ({
                id: item.id,
                department: item.department,
                manager: item.manager || '-', 
                parent: item.parent || '-',   
                left: item.left || '-',       
                right: item.right || '-',     
            }));
            
            setData(fetchedData);
            setRefreshTable(false);
        })
        .catch((error) => {
            console.error("Error al consultar procesos:", error);
        });
    };

  useEffect(() => {
    if (effectMounted.current === false) {
        fetchData();
    }      
    effectMounted.current = true;
  }, []);

  const handleAddDepartment = (selectedDepartments) => {
    if (!processName) {
      toast.error("Por favor, nombre el departamento");
      return;
    }
    const processDetails = {
      processName,
      departments: selectedDepartments,
      editor: { name: "editor", uuid: "uet1" },
      revisor: { name: "revisor", uuid: "urt1" },
      aprobator: { name: "aprobator", uuid: "uapt1" },
      organization: 1, 
    };
  
    if (fileInfo) {
      processDetails.filePath = fileInfo.path; 
      processDetails.fileTitle = fileInfo.asignedTitle; 
      processDetails.fileName = fileInfo.name;
    }
    if (annexesInfo) {
      processDetails.annexes = annexesInfo;
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

  const departments = [
    { id: 41, name: 'Direccion general' },
    { id: 42, name: 'Direcciones' },
  ];

  const departmentsFilter = (selected) => {
    const id = selected.id;    
    console.log("Departamento seleccionado:", {id});
    api.post('/user/departments/filter', {id})
    .then((response) => {
        console.log(response.data.data);
        setSubDepartments(response.data.data); 
    })
    .catch((error) => {
      console.error("Error al consultar procesos:", error);
    });
  };

  const handleDepartmentChange = (department) => {
    setSelected(department);
    departmentsFilter(department);
  };

  const handleSubDepartmentChange = (subDepartment) => {
    setSelectedSubDepartment(subDepartment);
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
                placeholder="Nombre del area o departamento"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
              />
            </h2>
            <p className="mb-4 text-black">Detalles del departamento:</p>
            <div className='max-h-[350px] h-[250px] text-black'>
              <Listbox value={selected} onChange={handleDepartmentChange} className="max-w-[100px] text-black">
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Seleccione que es su area superior:</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                        <span className="flex items-center">
                          <span className="ml-3 block truncate">{selected.name || 'Selecciona una opción'}</span>
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
                          {departments.map((department) => (
                            <Listbox.Option
                              key={department.id}
                              className={({ active }) =>
                                `${active ? 'bg-indigo-600 text-white' : 'text-gray-900'} relative cursor-default select-none py-2 pl-3 pr-9`
                              }
                              value={department}>
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}>
                                      {department.name}
                                    </span>
                                  </div>
                                  {selected ? (
                                    <span
                                      className={`${active ? 'text-white' : 'text-indigo-600'} absolute inset-y-0 right-0 flex items-center pr-4`}>
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

              {/* Renderiza si hay subDepartments */}
              {subDepartments.length > 0 && (
                <div className='mt-4'>
                  <Listbox value={selectedSubDepartment} onChange={handleSubDepartmentChange} className="max-w-[100px] text-black">
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Seleccione un area:</Listbox.Label>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                            <span className="flex items-center">
                              <span className="ml-3 block truncate">{selectedSubDepartment.department || 'Selecciona una opción'}</span>
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
                              {subDepartments.map((subDepartment) => (
                                <Listbox.Option
                                  key={subDepartment.id}
                                  className={({ active }) =>
                                    `${active ? 'bg-indigo-600 text-white' : 'text-gray-900'} relative cursor-default select-none py-2 pl-3 pr-9`
                                  }
                                  value={subDepartment}>
                                  {({ selected, active }) => (
                                    <>
                                      <div className="flex items-center">
                                        <span className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}>
                                          {subDepartment.department}
                                        </span>
                                      </div>
                                      {selected ? (
                                        <span
                                          className={`${active ? 'text-white' : 'text-indigo-600'} absolute inset-y-0 right-0 flex items-center pr-4`}>
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
            </div>
          </div>
        </div>
        <div className="mt-9 flex justify-end">
          <button onClick={() => handleAddDepartment(selectedDepartments)} className="bg-[#2C1C47] p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]">
            Añadir departamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProcessForm;
