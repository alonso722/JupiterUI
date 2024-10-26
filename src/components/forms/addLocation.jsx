import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';
import DepartmentsChecks from '../misc/checkbox/departmentsChecks';

const AddLocationForm = ({ onClose, rowData }) => {
  const [locationName, setLocationName] = useState('');
  const [locationLatitude, setLocationLatitude] = useState('');
  const [locationLongitude, setLocationLongitude] = useState('');
  
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
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
        setLocationName(rowData.name);
        setLocationLatitude(rowData.latitude);
        setLocationLongitude(rowData.longitude);
        setData(rowData)
      }
    }
    effectMounted.current = true;
  }, [rowData]);

  const handleAddLocation = () => {

    if (!locationName) {
      showToast('error',"Por favor, nombre el corporativo");
      return;
    }
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }

    const locationDetails = {
      orga: parsedPermissions.Organization,
      name: locationName,
      latitude: locationLatitude,
      longitude: locationLongitude
    };

    if (locationDetails) {
      api.post('/user/location/add', locationDetails)
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

  const handleEditLocation = () => {
    if (!locationName) {
      showToast('error',"Por favor, nombre el corporativo");
      return;
    }

    const locationDetails = {
      id: data.id,
      name: locationName,
      latitude: locationLatitude,
      longitude: locationLongitude
    };

    if (locationDetails) {
      api.post('/user/location/edit', locationDetails)
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[300px] relative">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-2xl mt-[15px] mb-4 text-black">
              <input
                type="text"
                placeholder="Nombre de la organización"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
          </div>
        </div>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-xl mt-[15px] mb-4 text-black">
              <input
                type="text"
                placeholder="Latitud de la organización"
                value={locationLatitude}
                onChange={(e) => setLocationLatitude(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
          </div>
        </div>
        <div className='flex'>
          <div className='w-[400px]'>
            <h2 className="text-xl mt-[15px] mb-4 text-black">
              <input
                type="text"
                placeholder="Longitud de la organización"
                value={locationLongitude}
                onChange={(e) => setLocationLongitude(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"/>
            </h2>
          </div>
        </div>
        <div className='max-h-[300px] h-[200px]'>
          <DepartmentsChecks selectedOptions={selectedDepartments} setSelectedOptions={setSelectedDepartments} />
        </div>
        <div className="mt-4 flex justify-end">
          {data.id ? (
            <button 
              onClick={handleEditLocation} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[10px]"
              style={{ backgroundColor: secondary }}>
              Editar ubicación
            </button>
          ) : (
            <button 
              onClick={handleAddLocation} 
              className="p-2 rounded text-white ml-5 mr-[20px] h-[50px] w-[250px] mt-[10px]"
              style={{ backgroundColor: secondary }}>
              Añadir ubicación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLocationForm;
