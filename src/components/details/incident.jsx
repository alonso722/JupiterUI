import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';

const Incident = ({ incident, onClose }) => {
  const [details, setDetails] = useState({});
  const effectMounted = useRef(false);
  const { primary, secondary } = useColors();
  const api = useApi();

  useEffect(() => {
    if (!effectMounted.current) {
      const id = incident.id;
      const fetchIncident = async () => {
        try {
          const response = await api.post('/user/incident/getDetails', { id });
          setDetails(response.data);
          const fetchId = response.data.id
          if(response.data.incidentType == 1 && response.data.status ==1){
          try {
            const response = await api.post('/user/incident/updateStatus', { fetchId });
            if (response.data === 200) {
              onClose(); 
            }
          } catch (error) {
            console.error("Error al hacer el registro:", error);
          }
        }
        } catch (error) {
          console.error("Error al consultar procesos:", error);
        }
      };
      fetchIncident();
      effectMounted.current = true;
    }
  }, [api, incident]);

  function getEventTypeText(type) {
    switch (type) {
      case 1:
        return "Solo verificación de lectura. Incidente resuelto...";
      case 2:
        return "Acción descrita en el incidente.";
      default:
        return "Evento desconocido";
    }
  }

  const handleAttend = async (id) => {
    try {
      const response = await api.post('/user/incident/updateStatus', { id });
      if (response.data === 200) {
        onClose(); 
      }
    } catch (error) {
      console.error("Error al hacer el registro:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#2C1C47] bg-opacity-30 p-3">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[640px] relative pb-[60px]">
      <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
        &times;
      </button>
        <div className='text-black'>
          <div className='flex mx-[55px] border-b-2 border-[#B5B5BD] mt-6 mb-[20px] pb-[20px]'>
            <p className='mr-[117px]'>Estado:</p>
            <h2 className={` ${details.status ? 'text-red-500 ' : ''}`}>
              <strong>{details.status ? 'No atendido' : 'Atendido'}</strong>
            </h2>
          </div>
          <div className='flex border-b-2 mx-[55px] border-[#B5B5BD] mb-[20px] pb-[20px]'>
            <p className='mr-[50px]'>Acción a realizar:</p>
            <p> <strong>{getEventTypeText(details.incidentType)}</strong></p>
          </div>      
          <div className=' flex border-b-2 mx-[55px] border-[#B5B5BD] mb-[20px] pb-[20px]'>
            <p className='mr-[68px]'>Realizado por: </p>
            <p><strong>{incident.name}</strong></p>
          </div>  
          <div className=' mx-[55px] flex mb-4 overflow-y-auto h-[200px]'>
            <p className='mr-[100px]'>Incidente:</p>
            <p><strong>{details.content}</strong></p>
          </div>  

        </div>
        {details.incidentType === 2 && (
          <button 
            onClick={() => handleAttend(details.id)}
            className="rounded absolute w-[150px] right-2 font-bold hover:text-gray-700 p-2 mr-4"
            style={{ backgroundColor: secondary }}>
            Acción resuelta
          </button>
        )}
      </div>
    </div>
  );
};

export default Incident;
