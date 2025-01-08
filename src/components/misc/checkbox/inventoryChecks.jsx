import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const DepartmentsChecks = ({ handleCheckboxChange, onSelectionChange, selectedOptions, setSelectedOptions, selectedOrgId, rowData }) => {
  const [options, setOptions] = useState([]);
  const [searchSearch, setSearch] = useState(''); 
  const [permissions, setPermissions] = useState([]);
  const api = useApi();

  const fetchInventory = (search) => {
    const storedPermissions = localStorage.getItem('permissions'); 
    let organization = selectedOrgId;
    if (storedPermissions) {
      const parsedPermissions = JSON.parse(storedPermissions);
      setPermissions(parsedPermissions);
      if (parsedPermissions.Organization) {
        organization = parsedPermissions.Organization;
      }
    }
    if (organization) {
      api.post('/user/inventory/search', { search, organization })
        .then((response) => {
          const inventoryOptions = response.data.map(option => ({ ...option }));
          setOptions(inventoryOptions);
          selectMatchingOptions(inventoryOptions);
        })
        .catch((error) => {
          console.error("Error al consultar inventario:", error);
        });
    }
  };

  const selectMatchingOptions = (inventoryOptions) => {
    if (rowData && rowData.object) {
      const rowObjects = JSON.parse(rowData.object); 
      const matchingOptions = inventoryOptions.filter(option => {
        const match = rowObjects.includes(option.object);
        return match;
      });
      setSelectedOptions(matchingOptions);
    }
  };

  useEffect(() => {
    fetchInventory('');
  }, [selectedOrgId]);   

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
    if (searchSearch) {
      fetchInventory(searchSearch);
    }
  }, [searchSearch]);

  return (
    <div className='text-black my-[5px]'>
      <div className="relative">
        <input 
          type="text" 
          className="outline outline-1 outline-gray-300 text-black px-2 py-2 rounded" 
          placeholder="Buscar equipo"
          value={searchSearch}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex mt-2 max-h-[100px] overflow-x-auto">
        {options.length > 0 ? (
          options.filter(option => !selectedOptions.some(selected => selected.id === option.id)).map((option, index) => (
            <div key={index} className="flex items-center justify-between px-2 rounded-lg border-2 border-gray-200 mr-4">
              <span 
                className='max-w-[300px] w-auto truncate' 
                title={option.object} >
                {option.object}
              </span>
              <button 
                className="text-black px-2 py-1 rounded ml-2 "
                onClick={() => handleAddOption(option)}>
                +
              </button>
            </div>
          ))
        ) : (
          <div className="p-2 text-gray-500">No hay opciones disponibles</div>
        )}
      </div>
      <div className='border mt-3 p-2 max-h-[170px] '>
        <h3 className='text-black mb-2'>
          <b>Equipos seleccionados:</b>
        </h3>
        <div className='max-h-[200px] flex overflow-x-auto'>
          {selectedOptions.map((option, index) => (
            <div key={index} className="bg-[#EDF2F7] rounded-lg flex items-center justify-between px-2 border-2 mx-[2%] border-gray-200 ">
              <span className='min-w-[50px] max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap'>
                {option.object}
              </span>
              <button 
                className=" bg-[#EDF2F7] text-black px-2 py-1 rounded ml-2"
                onClick={() => handleRemoveOption(option)}>
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsChecks;
