import React, { useState, useEffect, Fragment, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';
import UsersChecks from '../misc/checkbox/usersChecks';
import InventoryChecks from '../misc/checkbox/inventoryChecks';

const AddMeetingRoomForm = ({ onClose, rowData, locations }) => {
  const [name, setName] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const effectMounted = useRef(false);
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
      let parsedPermissions;
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
      }
      const organization= parsedPermissions.Organization;
    }
    effectMounted.current = true;
  }, [rowData]);

const handleAddMeetingRoom = () => {
  if (!name) {
    showToast('error', "Por favor, nombre la sala");
    return;
  }

  if (!selectedLocationId) {
    showToast('error', "Por favor, seleccione un corporativo");
    return;
  }

  let parsedPermissions;
  const storedPermissions = localStorage.getItem('permissions');
  if (storedPermissions) {
    parsedPermissions = JSON.parse(storedPermissions);
  }

  const locationDetails = {
    orga: parsedPermissions.Organization,
    name: name,
    locationId: parseInt(selectedLocationId), 
    selectedUsers: selectedUsers.map(user => user.uuid)
  };
  api.post('/user/meetingRoom/add', locationDetails)
    .then((response) => {
      if (response.status === 200) {
        onClose();
      }
    })
    .catch((error) => {
      console.error("Error al añadir sala:", error);
    });
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50 px-5 md:px-0">
      <div className="bg-white p-6 rounded-lg shadow-lg md:w-[400px] h-[400px] relative overflow-x-auto w-full text-black">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>
        <div className='text-lg'>
          <b>Agregar una sala de reuniones</b>
        </div>
        <div>
          Seleccione un corporativo
        </div>
        {Array.isArray(locations) && locations.length > 0 && (
            <select
            className="w-[70%] border rounded px-3 py-2 mt-4"
            onChange={(e) => {
                setSelectedLocationId(e.target.value); 
                const selected = locations.find(d => d.id === parseInt(e.target.value));
                const parsed = selected?.object ? JSON.parse(selected.object) : [];
            }}
            >
            <option value="">Selecciona una opción</option>
            {locations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
        <div className=" mt-[20px] mb-4 text-black w-[70%]">
            <p className='mb-2'>Nombre de la sala</p>
            <input
                type="text"
                placeholder="Nombre de la sala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
            />
        </div>
        <div className='max-h-[300px] h-[200px] max-w-[200px] mr-3 ml-5 md:ml-0'>
          <p className="block text-sm font-medium leading-6 text-black">Colaboradores permitidos a reservar la sala</p>
          <UsersChecks selectedOptions={selectedUsers} setSelectedOptions={setSelectedUsers}/>
        </div>

        <div className="mt-9 flex justify-end">
            <button 
              onClick={handleAddMeetingRoom} 
              className="px-2 py-1 rounded text-white ml-5 mr-[20px]  mt-[10px]"
              style={{ backgroundColor: secondary }}>
              Añadir sala
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddMeetingRoomForm;
