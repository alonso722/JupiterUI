import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';
import { ro } from 'date-fns/locale';

const AddInventoryForm = ({ onClose, rowData }) => {
  const [object, setObject] = useState([]);
  const effectMounted = useRef(false);
  const [data, setData] = useState({});
  const [chars, setChars] = useState([]);
  const [charInput, setCharInput] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const api = useApi();
  const { primary, secondary } = useColors();

  const showToast = (type, message) => {
    toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
    });
  };

  useEffect(() => {
    if (effectMounted.current === false) {
        if (rowData) {
            const characteristicsValues = rowData.chars.map((char) => char.characteristics);
            setChars(characteristicsValues);  
            setObject(rowData.object);
            setData(rowData);
        }
    }
    effectMounted.current = true;
}, [rowData]);

  const handleAddLocation = () => {
    if (!object) {
      showToast('error',"Por favor, nombre el equipo");
      return;
    }
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }

    const objectDetails = {
      organization: parsedPermissions.Organization,
      name: object,
      chars: chars
    };

    if (objectDetails) {
      api.post('/user/inventory/add', objectDetails)
        .then((response) => {
          if (response.status === 200) {
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error al añadir equipo:", error);
        });
    }
  };

  const handleEditLocation = () => {
    if (!object) {
      showToast('error',"Por favor, nombre el departamento");
      return;
    }

    const objectDetails = {
      id: rowData.id,
      object: object,
      chars: chars
    };

    if (objectDetails) {
      api.post('/user/inventory/edit', objectDetails)
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

  const handleCharAdd = () => {
    if (charInput.trim() !== '') {
      setChars((prevChars) => [...prevChars, charInput.trim()]);
      setCharInput('');
    }
  };

  const handleCharRemove = (index) => {
    setChars((prevChars) => prevChars.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[60%] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
            &times;
        </button>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-xl mt-[15px] mb-4 text-black">
              <input
                type="text"
                placeholder="Equipo personal"
                value={object}
                onChange={(e) => setObject(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
          </div>
        </div>
        <div className="mb-4 ml-5 pl-5 border-l-2 border-gray-300 w-[90%]">
          <h3 className="mb-2 text-black">Añadir especificación</h3>
            <div className="flex flex-wrap h-[100px] overflow-y-auto border-b-2 border-gray-300">
              {chars.map((char, index) => (
                <div
                  key={index}
                  className="bg-gray-200 text-black p-2 m-1 rounded flex items-center max-h-[40px] max-w-[350px] overflow-hidden whitespace-nowrap"
                  title={char}>
                    <span className="truncate">{char}</span>
                    <button
                      onClick={() => handleCharRemove(index)}
                      className="ml-2 text-red-500">
                      &times;
                    </button>
                </div>
              ))}
            </div>
                {isInputVisible && (
                    <div className="items-center my-1">
                    <input
                        type="text"
                        placeholder="Escribe la especificación"
                        value={charInput}
                        onChange={(e) => setCharInput(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleCharAdd();
                            setIsInputVisible(false); 
                        }
                        }}
                        className="p-2 text-black border-b-2 border-gray-300 focus:border-grey-500 outline-none"/>
                    <button
                        onClick={() => {
                        handleCharAdd();
                        setIsInputVisible(false); 
                        }}
                        className="ml-2 mt-2 bg-gray-300 text-black px-2 py-1 rounded">
                        +
                    </button>
                    </div>
                )}
                <button
                    onClick={() => setIsInputVisible(true)}
                    className="ml-2 bg-gray-300 text-black p-2 mt-1 rounded">
                    Agregar
                </button>
            </div>
        <div className="mt-4 flex justify-end">
          {data.id ? (
            <button 
              onClick={handleEditLocation} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[10px]"
              style={{ backgroundColor: secondary }}>
              Editar equipo
            </button>
          ) : (
            <button 
              onClick={handleAddLocation} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[10px]"
              style={{ backgroundColor: secondary }}>
              Añadir equipo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddInventoryForm;
