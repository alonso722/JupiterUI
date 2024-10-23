import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';

const AddDepartmentForm = ({ onClose, rowData }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [managerUuid, setManagerUuid] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const effectMounted = useRef(false);
  const [data, setData] = useState({});
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState('');
  const [subDepartments, setSubDepartments] = useState([]);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('');
  const [permissions, setPermissions] = useState([]);
  const { primary, secondary } = useColors();

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
  };

  const departments = [
    { id: 41, name: 'Direccion general' },
    { id: 42, name: 'Direcciones' },
  ];

  useEffect(() => {
    if (effectMounted.current === false) {
      let parsedPermissions;
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
          parsedPermissions = JSON.parse(storedPermissions);
          setPermissions(parsedPermissions);
      }
      if (rowData) {
        const fetchData = () => {
          const id = rowData.id;
          api.post('/user/departments/fetchEdit', { id })
            .then(async (response) => {
              const fetchedData = {
                id: response.data.id,
                name: response.data.name,
                manager: response.data.manager,
                parent: response.data.parent,
                type: response.data.type,
              };
              try{
                const deptInfo = await api.post('/user/departments/getDeptInfo', { id });
                const users = deptInfo.data.users;
                setUsers(users)
              }
              catch(error){
                console.error("Error al consultar procesos:", error);
              }
              setData(fetchedData);
              setDepartmentName(fetchedData.name);
              setManagerUuid(fetchedData.manager);
              const parentDepartment = departments.find(dep => dep.name === fetchedData.type);
              setSelected(parentDepartment || '');
              if (parentDepartment) {
                departmentsFilter(parentDepartment, fetchedData.parent);
              }
            })
            .catch((error) => {
              console.error("Error al consultar departamento:", error);
            });
        };
        fetchData();
      }
    }
    effectMounted.current = true;
  }, [rowData]);

  const departmentsFilter = (selected, parent) => {
    let id= {};
    id.id = selected.id;
    id.orga = permissions.Organization;
    api.post('/user/departments/filter', { id })
      .then((response) => {
        setSubDepartments(response.data.data);
        if (parent) {
          const parentSubDepartment = response.data.data.find(sub => sub.department === parent);
          setSelectedSubDepartment(parentSubDepartment || '');
        }
      })
      .catch((error) => {
        console.error("Error al consultar procesos:", error);
      });
  };

  const handleAddDepartment = () => {
    if (!departmentName) {
      showToast('error',"Por favor, nombre el departamento");
      return;
    }
    if (!selected || !selectedSubDepartment) {
      showToast('error',"Seleccione en las opciones");
      return;
    }

    const departmentDetails = {
      name: departmentName,
      parent: selectedSubDepartment.department,
      parentType: selected.name,
      organization: permissions.Organization
    };

    if (departmentDetails) {
      api.post('/user/departments/add', departmentDetails)
        .then((response) => {
          if (response.status === 200) {
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
    }
  };

  const handleEditDepartment = () => {
    if (!departmentName) {
      showToast('error',"Por favor, nombre el departamento");
      return;
    }

    const departmentDetails = {
      id: data.id,
      name: departmentName,
      manager:managerUuid,
      parent: selectedSubDepartment.department,
      parentType: selected.name,
    };

    if (departmentDetails) {
      api.post('/user/departments/edit', departmentDetails)
        .then((response) => {
          if (response.status === 200) {
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
    }
  };

  const handleDepartmentChange = (department) => {
    setSelected(department);
    setSelectedSubDepartment('');
    departmentsFilter(department);
  };

  const handleSubDepartmentChange = (subDepartment) => {
    setSelectedSubDepartment(subDepartment);
  };

  const handleManagerChange = (selectedUser) => {
    setManagerUuid(selectedUser);
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[500px] relative">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
        <div className='flex '>
          <div className=''>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">
              <input
                type="text"
                placeholder="Nombre del area o departamento"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
              />
            </h2>
            <p className="mb-4 text-black mt-3">Detalles del area o departamento:</p>
            {rowData && (
              <>
                {users.length > 0 ? (
                  <Listbox value={managerUuid} onChange={(selectedUser) => setManagerUuid(selectedUser.uuid)} className="w-[200px] max-w-[200px] text-black">
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Selecciona un gerente:</Listbox.Label>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-auto cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                              <span className="ml-3 block whitespace-nowrap">
                                {managerUuid
                                  ? (() => {
                                      const selectedUser = users.find(user => user.uuid === managerUuid);
                                      return selectedUser ? `${selectedUser.userName} ${selectedUser.userLast}` : 'Selecciona un gerente';
                                    })()
                                  : 'Selecciona un gerente'}
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
                              {users.map((user) => (
                                <Listbox.Option
                                  key={user.uuid}
                                  className={({ active }) =>
                                    `${active ? 'bg-indigo-600 text-white' : 'text-gray-900'} relative cursor-default select-none py-2 pl-3 pr-9`
                                  }
                                  value={user}>
                                  {({ selected, active }) => (
                                    <>
                                      <div className="flex items-center">
                                        <span className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}>
                                          {user.userName} {user.userLast}
                                        </span>
                                      </div>
                                      {selected ? (
                                        <span className={`${active ? 'text-white' : 'text-indigo-600'} absolute inset-y-0 right-0 flex items-center pr-4`}>
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
                ) : (
                  <p>Sin colaboradores en el departamento</p>
                )}
              </>
            )}
            <div className='max-h-[350px] h-[250px] text-black'>
              {data.type !== 41 && (
                <>
                  <Listbox value={selected} onChange={handleDepartmentChange} className=" w-[200px] max-w-[200px] text-black">
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Seleccione qué es su area superior:</Listbox.Label>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-auto cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                              <span className="ml-3 block whitespace-nowrap">{selected.name || 'Selecciona una opción'}</span>
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
                  {subDepartments.length > 0 && (
                    <div className='mt-3'>
                      <Listbox value={selectedSubDepartment} onChange={handleSubDepartmentChange} className="max-w-[100px] text-black">
                        {({ open }) => (
                          <>
                            <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Seleccione un area:</Listbox.Label>
                            <div className="relative mt-2">
                              <Listbox.Button className="relative w-auto cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
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
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {data.id ? (
            <button 
              onClick={handleEditDepartment} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[0px]"
              style={{ backgroundColor: secondary }}
            >
              Editar departamento
            </button>
          ) : (
            <button 
              onClick={handleAddDepartment} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]"
              style={{ backgroundColor: secondary }}
            >
              Añadir departamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentForm;
