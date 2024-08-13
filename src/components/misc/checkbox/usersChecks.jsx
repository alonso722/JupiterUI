import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const UsersChecks = ({ handleCheckboxChange, onSelectionChange, selectedOptions, setSelectedOptions, selectedOrgId }) => {
  const [options, setOptions] = useState([]);
  const [searchSearch, setSearch] = useState('');
  const [permissions, setPermissions] = useState([]);
  const effectMounted = useRef(false);
  const api = useApi();

  const fetchDepartments = (search) => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
        if (parsedPermissions.Type === 5) {
            router.push('/dashboard/home'); 
        }
        setPermissions(parsedPermissions);
    }
    if (search) {
      let organization = parsedPermissions.Organization;
      if (!organization) {
        organization = selectedOrgId;
      }
      if (organization) {
        api.post('/user/process/fetchUsersList', { search, orga: parsedPermissions })
          .then((response) => {
            console.log("Users list:", response.data);
            setOptions(response.data.map(option => ({ ...option })));
          })
          .catch((error) => {
            console.error("Error al consultar usuarios:", error);
          });
      } else {
        console.warn("El valor de organization es inválido o no está definido.");
        setOptions([]);
      }
    }
  };

  useEffect(() => {
    if (!effectMounted.current) {
      fetchDepartments('', selectedOrgId);
      effectMounted.current = true;
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (effectMounted.current) {
      fetchDepartments(searchSearch, selectedOrgId);
    }
  }, [searchSearch, selectedOrgId]);

  const handleAddOption = (option) => {
    const index = selectedOptions.findIndex(selected => selected.userUuid === option.userUuid);
    if (index === -1) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      const updatedOptions = [...selectedOptions];
      updatedOptions.splice(index, 1);
      setSelectedOptions(updatedOptions);
    }
  };

  const handleRemoveOption = (option) => {
    const updatedOptions = selectedOptions.filter(selected => selected.userUuid !== option.userUuid);
    setSelectedOptions(updatedOptions);
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className='text-black my-[5px]'>
      <div className="relative">
        <input 
          type="text" 
          className="outline outline-1 outline-gray-300 text-black px-2 py-2 rounded" 
          placeholder="Buscar usuarios"
          value={searchSearch}
          onChange={handleInputChange}
        />
      </div>
      {searchSearch && (
        <div className="flex mt-2 max-h-[100px] overflow-x-auto">
          {options.filter(option => !selectedOptions.some(selected => selected.userUuid === option.userUuid)).map((option, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-200 mr-4">
              <span 
                className='max-w-[300px] w-auto truncate' 
                title={option.userName}>
                {option.userName}
              </span>
              <button 
                className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                onClick={() => handleAddOption(option)}>
                +
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='border mt-3 p-2 max-h-[170px]'>
        <h3 className='text-black'>
          <b>Usuarios seleccionados:</b>
        </h3>
        <div className='max-h-[200px] flex overflow-x-auto'>
          {selectedOptions.map((option, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-200">
              <span className='min-w-[50px] max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap'>
                {option.userName}
              </span>
              <button 
                className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                onClick={() => handleRemoveOption(option)}>
                -
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersChecks;
