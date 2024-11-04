import React, { useState, useEffect, useRef, Fragment } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useColors } from '@/services/colorService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AddAssignedForm = ({ assignation, onClose, rowData }) => {
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedObject, setSelectedObject] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]); 
  const effectMounted = useRef(false);
  const api = useApi();
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [objects, setObjects] = useState([]);
  const { primary, secondary } = useColors();

  const showToast = (type, message) => {
    toast[type](message, { position: 'top-center', autoClose: 2000 });
  };

  const handleSelectionUser = (selectedItem) => {
    setSelectedUser([selectedItem]);
  };

  const handleSelectionLocation = (selectedItem) => {
    setSelectedLocation([selectedItem]);
  };

  const handleSelectionObject = (selectedItem) => {
    setSelectedObject([selectedItem]);
    const charsWithValues = (selectedItem.chars || []).map(char => ({
      id: char.id,
      characteristic: char.characteristics,
      value: ''
    }));
    setSelectedChars(charsWithValues);
  };

  const handleCharChange = (index, newValue) => {
    const updatedChars = [...selectedChars];
    updatedChars[index].value = newValue; 
    setSelectedChars(updatedChars);
  };

  const fetchData = async () => {
    try {
      const storedPermissions = localStorage.getItem('permissions');
      const organization = storedPermissions ? JSON.parse(storedPermissions).Organization : null;
      const response = await api.post('/user/inventory/fetch', { organization });
      const fetchedData = response.data.map(item => ({
        id: item.id,
        object: item.object,
        chars: item.chars
      }));
      setObjects(fetchedData);
    } catch (error) {
      console.error("Error al consultar equipos:", error);
    }
  };

  const fetchUsers = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    api.post('/user/users/fetch', { organization })
      .then((response) => {
        const fetchedData = response.data.data.map(item => {
          return {
            uuid: item.uuid,
            name: item.name,
            last: item.last,
            department: item.department_name,
          };
        });
        setUsers(fetchedData);
      })
      .catch((error) => {
        console.error("Error al consultar usuarios:", error);
      });
  };

  const fetchLocations = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization= parsedPermissions.Organization;
    api.post('/user/location/fetch',{organization})
        .then((response) => {
            const fetchedData = response.data.map(item => ({
                id: item.id,
                name: item.name,
            }));
            setLocations(fetchedData);
        })
        .catch((error) => {
            console.error("Error al consultar departamentos:", error);
        });
  };

  useEffect(() => {
    if (!effectMounted.current) {
      fetchData();
      fetchUsers();
      fetchLocations();

      if (rowData) {
        if (rowData.user) {
          setSelectedUser([{ uuid: rowData.uuid, name: rowData.user.name, last: rowData.user.last }]);
        }
        if (rowData.location) {
          setSelectedLocation([{ id: rowData.locationId, name: rowData.location }]);
        }
        if (rowData.object) {
          setSelectedObject([{ id: rowData.id, object: rowData.object }]);
        }
        if (rowData.chars) {
          const prefilledChars = rowData.chars.map(char => ({
            id: char.id,
            characteristic: char.characteristics,
            value: char.charValue || ''
          }));
          setSelectedChars(prefilledChars);
        }
      }
      effectMounted.current = true;
    }
  }, [rowData]);

  const handleAddAssignation = () => {
    if (!selectedLocation) {
      showToast('error', "Por favor, seleccione un corporativo");
      return;
    }
    if (!selectedObject) {
      showToast('error', "Por favor, seleccione un equipo de resguardo");
      return;
    }
    if (!selectedUser) {
      showToast('error', "Por favor, seleccione un usuario");
      return;
    }
    const userDetails = {
      uuid: selectedUser[0].uuid,
      locationId: selectedLocation[0].id,
      objectId: selectedObject[0].id,
      characteristics: selectedChars
    };

    api.post('/user/assignation/add', userDetails)
      .then((response) => {
        if (response.data.code === 200) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al añadir asignación:", error);
      });
  };

  const handleEditAssignation = () => {
    if (!selectedLocation) {
      showToast('error', "Por favor, seleccione un corporativo");
      return;
    }
    if (!selectedObject) {
      showToast('error', "Por favor, seleccione un equipo de resguardo");
      return;
    }
    if (!selectedUser) {
      showToast('error', "Por favor, seleccione un usuario");
      return;
    }
    const userDetails = {
      id: rowData.id,
      uuid: selectedUser[0].uuid,
      locationId: selectedLocation[0].id,
      objectId: selectedObject[0].id,
      characteristics: selectedChars
    };

    api.post('/user/assignation/edit', userDetails)
      .then((response) => {
        if (response.status === 200) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al añadir asignación:", error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[520px] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <div>
          <h2 className="text-2xl mb-4 text-black">Asignar a:</h2>
          <Listbox value={selectedUser} onChange={handleSelectionUser} className="max-w-[100px] mb-4 text-black">
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-black">Colaborador:</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white text-black py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedUser.length > 0 ? selectedUser[0].name : "Seleccionar colaborador"}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {users.map((item) => (
                        <Listbox.Option key={item.uuid} className={({ active }) =>
                          classNames(active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                          value={item}>
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                  {item.name} {item.last}
                                </span>
                              </div>
                              {selected && (
                                <span className={classNames(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
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
        <div>
          <Listbox value={selectedLocation} onChange={handleSelectionLocation} className="max-w-[100px] mb-4 text-black">
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-black">Corporativo:</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white text-black py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedLocation.length > 0 ? selectedLocation[0].name : "Seleccionar colaborador"}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {locations.map((item) => (
                        <Listbox.Option key={item.id} className={({ active }) =>
                          classNames(active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                          value={item}>
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                  {item.name}
                                </span>
                              </div>
                              {selected && (
                                <span className={classNames(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
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
        <div>
          <Listbox value={selectedObject} onChange={!rowData ? handleSelectionObject : null} className="max-w-[100px] mb-4 text-black">
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-black">Equipo de resguardo:</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button
                    className={`relative w-full cursor-default rounded-md bg-white text-black py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px] ${
                      rowData ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!!rowData} 
                  >
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedObject.length > 0 ? selectedObject[0].object : "Seleccionar equipo"}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition show={open && !rowData} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {objects.map((item) => (
                        <Listbox.Option
                          key={item.id}
                          className={({ active }) =>
                            classNames(active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                          value={item}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                  {item.object}
                                </span>
                              </div>
                              {selected && (
                                <span className={classNames(active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4')}>
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
          {selectedChars.length > 0 && (
            <div className="mt-4 text-black">
              <h3 className="text-lg mb-2">Características del equipo:</h3>
              <div className='max-h-[100px] overflow-y-auto'>
                {selectedChars.map((char, index) => (
                  <div key={index} className="mt-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {char.characteristic}:
                    </label>
                    <input
                      type="text"
                      placeholder={`Valor para ${char.characteristic}`}
                      className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
                      value={char.value}
                      onChange={(e) => handleCharChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          {rowData ? (
            <button onClick={handleEditAssignation} className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]" style={{ backgroundColor: secondary }}>
              Editar asignación
            </button>
          ) : (
            <button onClick={handleAddAssignation} className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]" style={{ backgroundColor: secondary }}>
              Añadir asignación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAssignedForm;
