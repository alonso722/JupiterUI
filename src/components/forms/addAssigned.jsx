import React, { useState, useEffect, useRef, Fragment } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useColors } from '@/services/colorService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AddAssignedForm = ({ assignation, onClose }) => {
  const [userName, setUserName] = useState('');
  const [userLast, setUserLast] = useState('');
  const [userMail, setUserMail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [selectedObject, setSelectedObject] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]); 
  const effectMounted = useRef(false);
  const api = useApi();
  const [objects, setObjects] = useState([]);
  const { primary, secondary } = useColors();

  const showToast = (type, message) => {
    toast[type](message, { position: 'top-center', autoClose: 2000 });
  };

  const handleSelectionObject = (selectedItem) => {
    setSelectedObject([selectedItem]);
    console.log(selectedItem)
    const charsWithValues = (selectedItem.chars || []).map(char => ({
      id:char.id,
      characteristic: char.characteristics,
      value: ''  
    }));
    console.log(charsWithValues)
    setSelectedChars(charsWithValues);
  };

  const handleCharChange = (index, newValue) => {
    const updatedChars = [...selectedChars];
    updatedChars[index].value = newValue; 
    console.log(updatedChars)
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

  useEffect(() => {
    if (!effectMounted.current) {
      fetchData();
      effectMounted.current = true;
    }
  }, []);

  const handleAddUser = () => {
    const userDetails = {
      object: selectedItem.object,
      characteristics: selectedChars
    };

    console.log(userDetails, selectedObject)

    // api.post('/assignation/users/add', userDetails)
    //   .then((response) => {
    //     if (response.data.code === 200) {
    //       onClose();
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error al añadir asignación:", error);
    //   });
  };

  const handleEditUser = () => {
    if (!userName) {
      showToast('error', "Por favor, nombre al usuario");
      return;
    }

    const userDetails = {
      uuid,
      name: userName,
      lastName: userLast,
      email: userMail,
      characteristics: selectedChars
    };

    api.post('/assignation/users/edit', userDetails)
      .then((response) => {
        if (response.data.code === 200) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al editar asignación:", error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[520px] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <div>
          <h2 className="text-2xl mb-4 text-black">Asignar equipo:</h2>
          <Listbox value={selectedObject} onChange={handleSelectionObject} className="max-w-[100px] mb-4 text-black">
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-black">Equipo de resguardo:</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white text-black py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedObject.length > 0 ? selectedObject[0].object : "Seleccionar equipo"}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {objects.map((item) => (
                        <Listbox.Option key={item.id} className={({ active }) =>
                          classNames(active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9')}
                          value={item}>
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
          {assignation ? (
            <button onClick={handleEditUser} className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]" style={{ backgroundColor: secondary }}>
              Editar asignación
            </button>
          ) : (
            <button onClick={handleAddUser} className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]" style={{ backgroundColor: secondary }}>
              Añadir asignación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAssignedForm;
