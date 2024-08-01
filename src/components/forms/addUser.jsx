import React, { useState, useEffect, useRef, Fragment } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AddUserForm = ({ user, onClose }) => {
  const [userName, setUserName] = useState('');
  const [userLast, setUserLast] = useState('');
  const [userMail, setUserMail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const effectMounted = useRef(false);
  const api = useApi();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [data, setData] = useState({});

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
  };

  const roles = [    
    { id: 2, name: 'Editor' },
    { id: 3, name: 'Revisor' },
    { id: 4, name: 'Aprobador' },
    { id: 5, name: 'Consultor' },
  ];

  const handleSelectionDepartment = (selectedDepartment) => {
    setSelectedDepartments([selectedDepartment]);
  };

  const fetchData = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    try {
      const response = await api.post('/user/departments/fetch', { organization });
      const fetchedData = response.data.data.map(item => ({
        id: item.id,
        department: item.department,   
      }));
      setDepartments(fetchedData);
    } catch (error) {
      console.error("Error al consultar departamentos:", error);
    }
  };
  

  useEffect(() => {
    if (effectMounted.current === false) {
      fetchData();
      api.post('/user/process/fetchUsers')
        .then((response) => {
          const usersData = response.data;
          setUsers(usersData);
        })
        .catch((error) => {
          console.error("Error al consultar procesos:", error);
        });
      effectMounted.current = true;
    }
  }, []);
  useEffect(() => {
    if (user && departments.length > 0) {
      const department = departments.find(dept => dept.department === user.rowData.department);
      setSelectedDepartments(department ? [department] : []);
      switch (user.rowData.role) {
        case 'Administrador':
          user.rowData.role = 1;
          break;
        case 'Editor':
          user.rowData.role = 2;
          break;
        case 'Revisor':
          user.rowData.role = 3;
          break;
        case 'Aprobador':
          user.rowData.role = 4;
          break;
        case 'Consultor':
          user.rowData.role = 5;
          break;
        default:
          user.rowData.role = 5;
      }
      setSelectedRole(user.rowData.role);
      setData(user);

      const fetchData = () => {
        const uuid = user.rowData.uuid;
        api.post('/user/users/fetchEdit', { uuid })
          .then((response) => {
            const fetchedData = {
              uuid: user.rowData.uuid,
              name: response.data.name,
              last: response.data.last,
              mail: response.data.mail,
              pass: response.data.pass,
            };
            setData(fetchedData);
            setUserName(fetchedData.name);
            setUserLast(fetchedData.last);
            setUserMail(fetchedData.mail);
            setUserPass(fetchedData.pass);
          })
          .catch((error) => {
            console.error("Error al consultar usuario:", error);
          });
      };
      fetchData();
    }
  }, [user, departments]);
  
  const handleAddUser = () => {
    if (!userName) {
      showToast('error',"Por favor, nombre al usuario");
      return;
    }

    const userRole = roles.find(role => role.id === selectedRole);
    let roleName = userRole ? userRole.name : '';
    const roleInitial = roleName === 'Aprobador' ? 'ap' : roleName.charAt(0);
    const uuid = `u${userName.substring(0, 3)}${userLast.substring(0, 3)}${roleInitial}`;

    switch (roleName) {
      case 'Editor':
        roleName = 2;
        break;
      case 'Revisor':
        roleName = 3;
        break;
      case 'Aprobador':
        roleName = 4;
        break;
      case 'Consultor':
        roleName = 5;
        break;
      default:
        roleName = 5;
        break;
    }

    const userDetails = {
      userName,
      userLast,
      userMail,
      userPass,
      department: selectedDepartments[0].department,
      role: roleName,
      uuid,
    };

    const showToast = (type, message) => {
      toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
      });
    };

    api.post('/user/users/add', userDetails)
    .then((response) => {
      if (response.data.code === 200) {
        onClose();
      }
    })
    .catch((error) => {
      console.error("Error al consultar procesos:", error);
    });
  };

  
  const handleEditUser = () => {
    if (!userName) {
      showToast('error',"Por favor, nombre al usuario");
      return;
    }

    const userRole = roles.find(role => role.id === selectedRole);
    let roleName = userRole ? userRole.name : '';
    const roleInitial = roleName === 'Aprobador' ? 'ap' : roleName.charAt(0);
    const uuid =user.rowData.uuid;

    switch (roleName) {
      case 'Editor':
        roleName = 2;
        break;
      case 'Revisor':
        roleName = 3;
        break;
      case 'Aprobador':
        roleName = 4;
        break;
      case 'Consultor':
        roleName = 5;
        break;
      default:
        roleName = 5;
        break;
    }

    const userDetails = {
      userName,
      userLast,
      userMail,
      userPass,
      department: selectedDepartments[0].department,
      role: roleName,
      uuid,
    };

    api.post('/user/users/edit', userDetails)
    .then((response) => {
      if (response.data.code === 200) {
        onClose();
      }
    })
    .catch((error) => {
      console.error("Error al consultar procesos:", error);
    });
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[520px] relative">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
        <div>
          <div className='w-[400px]'>
            <h2 className="text-2xl mb-4 text-black">Datos del usuario:</h2>
          </div>
          <p className=" mt-[15px] mb-4 text-black w-[70%]">
            <input
              type="text"
              placeholder="Nombre del usuario"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
            />
          </p>
          <p className=" mt-[15px] mb-4 text-black w-[70%]">
            <input
              type="text"
              placeholder="Apellidos del usuario"
              value={userLast}
              onChange={(e) => setUserLast(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
            />
          </p>
          <Listbox value={selectedDepartments} onChange={handleSelectionDepartment} className="max-w-[100px] mb-4">
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Departamento</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedDepartments.length > 0 ? selectedDepartments[0].department : "Seleccionar departamento"}
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
                      {departments.map((department) => (
                        <Listbox.Option
                          key={department.id}
                          className={({ active }) =>
                            classNames(
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                          }
                          value={department}>
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                  {department.department}
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
          <div className='mt-4'>
          <Listbox value={selectedRole} onChange={setSelectedRole} className="max-w-[100px] mt-9">
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Rol del usuario</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedRole ? roles.find(role => role.id === selectedRole).name : "Seleccionar rol"}
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
                      {roles.map((role) => (
                        <Listbox.Option
                          key={role.id}
                          className={({ active }) =>
                            classNames(
                              active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                          }
                          value={role.id}>
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                  {role.name}
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

          <p className=" mt-[20px] mb-4 text-black w-[70%]">
            <input
              type="text"
              placeholder="Email"
              value={userMail}
              onChange={(e) => setUserMail(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
            />
          </p>
          <p className=" mt-[20px] mb-4 text-black w-[70%]">
            <input
              type="text"
              placeholder="Contraseña"
              value={userPass}
              onChange={(e) => setUserPass(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
            />
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          {user ?(
            <button onClick={handleEditUser} className="bg-[#2C1C47] p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]">
              Editar usuario
            </button>
          ) : (
            <button onClick={handleAddUser} className="bg-[#2C1C47] p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]">
              Añadir usuario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
