import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { IoIosSearch } from "react-icons/io";

const DepartmentsChecks = ({ handleCheckboxChange, onSelectionChange, selectedOptions, setSelectedOptions, selectedOrgId }) => {
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
            router.push('/dashboard/kanban'); 
        }
        setPermissions(parsedPermissions);
    }
    if (search) {
      let organization = parsedPermissions.Organization;
      if(!organization){
        organization=selectedOrgId;
      }
      if (organization) {
          api.post('/user/departments/search', { search, organization })
              .then((response) => {
                  setOptions(response.data.data.map(option => ({ ...option })));
              })
              .catch((error) => {
                  console.error("Error al consultar departamentos:", error);
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
  }, [selectedOrgId]);

  return (
    <div className='text-black mb-[5px]'>
      <div className="relative">
        <IoIosSearch 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" 
          size={20} 
        />
        <input 
          type="text" 
          className="outline outline-1 outline-gray-300 text-black pl-8 pr-2 py-2 rounded w-full" 
          placeholder="Buscar departamentos"
          value={searchSearch}
          onChange={handleInputChange}
        />
      </div>
      {searchSearch && (
        <div className="flex mt-2 max-h-[100px] overflow-x-auto">
          {options.filter(option => !selectedOptions.some(selected => selected.id === option.id)).map((option, index) => (
            <div key={index} className="flex items-center justify-between px-2 border-2 rounded-lg border-gray-200 mr-4">
              <span 
                className='max-w-[300px] w-auto truncate' 
                title={option.department} >
                {option.department}
              </span>
              <button 
                className=" text-black px-2 py-1 rounded ml-2"
                onClick={() => handleAddOption(option)}>
                +
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='p-2 max-h-[170px] '>
        <h3 className='text-black'>
          <b>Departamentos seleccionados:</b>
        </h3>
        <div className='border-2 rounded-lg h-[100px] flex overflow-x-auto'>
          {selectedOptions.map((option, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-200 ">
              <span className='min-w-[50px] max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap'>
                {option.department}
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

export default DepartmentsChecks;
