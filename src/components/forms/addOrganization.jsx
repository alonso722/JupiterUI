import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';

const AddOrganizationForm = ({ onClose, rowData }) => {
  const [organizationName, setOrganizationName] = useState('');
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
        setOrganizationName(rowData.organization);
        setData(rowData)
      }
    }
    effectMounted.current = true;
  }, [rowData]);

  const handleAddOrganization = () => {
    if (!organizationName) {
      showToast('error',"Por favor, nombre el departamento");
      return;
    }

    const organizationDetails = {
      name: organizationName
    };

    if (organizationDetails) {
      api.post('/user/organization/add', organizationDetails)
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

  const handleEditOrganization = () => {
    if (!organizationName) {
      showToast('error',"Por favor, nombre el departamento");
      return;
    }

    const organizationDetails = {
      id: data.id,
      name: organizationName,
    };

    if (organizationDetails) {
      api.post('/user/organization/edit', organizationDetails)
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[250px] relative">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">
              <input
                type="text"
                placeholder="Nombre de la organización"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          {data.id ? (
            <button 
              onClick={handleEditOrganization} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]"
              style={{ backgroundColor: secondary }}
            >
              Editar organización
            </button>
          ) : (
            <button 
              onClick={handleAddOrganization} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[30px]"
              style={{ backgroundColor: secondary }}
            >
              Añadir organización
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddOrganizationForm;
