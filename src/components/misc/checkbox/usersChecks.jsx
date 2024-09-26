import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const UsersChecks = ({ handleCheckboxChange, onSelectionChange, selectedOptions, setSelectedOptions, selectedOrgId }) => {
  const [options, setOptions] = useState([]);
  const [searchSearch, setSearch] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [showOptions, setShowOptions] = useState(false); 
  const effectMounted = useRef(false);
  const api = useApi();
  const containerRef = useRef(null); 

  const fetchDepartments = (search) => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
      if (parsedPermissions.Type === 5) {
        router.push('/dashboard/kanban');
      }
      setPermissions(parsedPermissions);
    }
    if (search !== undefined) {
      let organization = parsedPermissions?.Organization || selectedOrgId;
      if (organization) {
        api.post('/user/process/fetchUsersList', { search, orga: parsedPermissions })
          .then((response) => {
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
    if (searchSearch !== '') {
      fetchDepartments(searchSearch);
    } else {
      setOptions([]);
    }
  }, [searchSearch, selectedOrgId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddOption = (option) => {
    if (!selectedOptions.some(selected => selected.uuid === option.uuid)) {
      const newSelectedOptions = [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions);

      setOptions(options.filter(opt => opt.uuid !== option.uuid));
    }
  };

  const handleRemoveOption = (option) => {
    const newSelectedOptions = selectedOptions.filter(selected => selected.uuid !== option.uuid);
    setSelectedOptions(newSelectedOptions);

    if (!options.some(opt => opt.uuid === option.uuid)) {
      setOptions([...options, option]);
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setShowOptions(true);
  };

  const handleClickInput = () => {
    setShowOptions(true);
    if (options.length === 0 && searchSearch === '') {
      fetchDepartments('');
    }
  };

  return (
    <div className='text-black my-[5px]' ref={containerRef}> {/* Añadido ref aquí */}
      <div className="relative">
        <input
          type="text"
          className="outline outline-1 outline-gray-300 text-black px-2 py-2 rounded"
          placeholder="Buscar usuarios"
          value={searchSearch}
          onChange={handleInputChange}
          onClick={handleClickInput}
        />
      </div>
      {showOptions && (
        <div className="mt-2 max-h-[100px] overflow-x-auto">
          {options.filter(option => !selectedOptions.some(selected => selected.uuid === option.uuid)).map((option, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-200 mr-4">
              <span
                className='max-w-[300px] w-auto truncate'
                title={option.name}>
                {option.name} {option.last}
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
                {option.name && option.name.length > 0 ? `${option.name} ${option.last}` : `${option.name} ${option.last}`}
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
