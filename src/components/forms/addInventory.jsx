import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';
import { ro } from 'date-fns/locale';

const AddInventoryForm = ({ onClose, rowData }) => {
  const [object, setObject] = useState([]);
  const effectMounted = useRef(false);
  const [data, setData] = useState({});
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
        setObject(rowData.object);
        setData(rowData)
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
      name: object
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
      object: object
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[30%] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
            &times;
        </button>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-xl mt-[35px] mb-4 text-black">
              <input
                type="text"
                placeholder="Equipo personal"
                value={object}
                onChange={(e) => setObject(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
          </div>
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
