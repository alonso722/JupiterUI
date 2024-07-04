import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const DepartmentsChecks = ({ handleCheckboxChange, onSelectionChange, selectedOptions, setSelectedOptions }) => {
  const [options, setOptions] = useState([]);
  //const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchSearch, setSearch] = useState('');
  const [permissions, setPermissions] = useState([]);
  const effectMounted = useRef(false);
  const api = useApi();

  const fetchDepartments = (search) => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
        console.log(parsedPermissions)
        if (parsedPermissions.Type === 5) {
            router.push('/dashboard/home');
        }
        setPermissions(parsedPermissions);
    }
    console.log(parsedPermissions.Organization)
    if (search) {
      api.post('/user/departments/search', { search })
        .then((response) => {
          setOptions(response.data.data.map(option => ({ ...option, })));
        })
        .catch((error) => {
          console.error("Error al consultar departamentos:", error);
        });
    } else {
      setOptions([]);
    }
  };

  useEffect(() => {
    if (!effectMounted.current) {
      fetchDepartments('');
      effectMounted.current = true;
    }
  }, []);

  useEffect(() => {
    if (effectMounted.current) {
      fetchDepartments(searchSearch);
    }
  }, [searchSearch]);

  const handleAddOption = (option) => {
    const index = selectedOptions.findIndex(selected => selected.id === option.id);
    if (index === -1) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      const updatedOptions = [...selectedOptions];
      updatedOptions.splice(index, 1);
      setSelectedOptions(updatedOptions);
    }
  };

  const handleRemoveOption = (option) => {
    const updatedOptions = selectedOptions.filter(selected => selected.id !== option.id);
    setSelectedOptions(updatedOptions);
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
  }, [selectedOptions]);

  return (
    <div className='text-black my-[5px]'>
      <div className="relative">
        <input 
          type="text" 
          className="outline outline-1 outline-gray-300 text-black px-2 py-2 rounded" 
          placeholder="Buscar departamentos"
          value={searchSearch}
          onChange={handleInputChange}
        />
      </div>
      {searchSearch && (
        <div className="flex mt-2 max-h-[100px] overflow-x-auto">
          {options.filter(option => !selectedOptions.some(selected => selected.id === option.id)).map((option, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-200 mr-4">
              <span>{option.department}</span>
              <button 
                className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                onClick={() => handleAddOption(option)}>
                +
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='border mt-3 p-2 max-h-[170px] '>
        <h3 className='text-black'>
          <b>Departamentos seleccionados:</b>
        </h3>
        <div className='max-h-[200px] flex overflow-x-auto'>
          {selectedOptions.map((option, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-200 ">
              <span className='min-w-[50px]'>{option.department}</span>
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

export default DepartmentsChecks;
