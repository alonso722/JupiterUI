import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const DepartmentsChecks = ({ handleCheckboxChange, onSelectionChange }) => {
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (!effectMounted.current) {
      api.get('/user/departments/list')
        .then((response) => {
          console.log("Render de checks");
          console.log("Departments", response.data);
          setOptions(response.data.data.map(option => ({ ...option, checked: false })));
        })
        .catch((error) => {
          console.error("Error al consultar departamentos:", error);
        });
      effectMounted.current = true;
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCheckboxClick = (index) => {
    const updatedOptions = [...options];
    updatedOptions[index].checked = !updatedOptions[index].checked;
    setOptions(updatedOptions);
    if (typeof handleCheckboxChange === 'function') {
      handleCheckboxChange(updatedOptions[index].id);
    }
  };

  const handleCloseDepartments = () => {
    const selected = options.filter(option => option.checked);
    setSelectedOptions(selected);
    console.log("Opciones seleccionadas:", selected);
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selected);
    }
    toggleDropdown();
  };

  return (
    <div className='text-black my-[10px]'>
      <p>Seleccione departamentos:</p>
      <div className="relative">
        <button onClick={dropdownOpen ? handleCloseDepartments : toggleDropdown} className="outline outline-1 outline-gray-300 text-black px-2 py-2 rounded">
          Departamentos {dropdownOpen ? "▲" : "▼"}
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 bg-white border border-gray-300 py-2 px-4 shadow">
            {options.map((option, index) => (
              <div key={`option${index}${option.id}`} className="flex items-center">
                <input
                  type="checkbox"
                  id={`option${index}${option.id}`}
                  checked={option.checked}
                  onChange={() => handleCheckboxClick(index)}
                  className="mr-2"
                />
                <label htmlFor={`option${index}${option.id}`} className="text-black">{option.department}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentsChecks;