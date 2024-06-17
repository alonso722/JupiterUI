import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const Incident = ({ incident, onClose }) => {
  const [details, setDetails] = useState({});
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (!effectMounted.current) {
      console.log("incidente en la accion", incident);
      const id = incident.id;
      const fetchIncident = async () => {
        try {
          const response = await api.post('/user/incident/getDetails', { id });
          setDetails(response.data);
          console.log("data para resolver incidencia",response.data)
          const fetchId = response.data.id
          if(response.data.incidentType == 1 && response.data.status ==1){
          try {
            const response = await api.post('/user/incident/updateStatus', { fetchId });
            console.log(response);
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
    console.log("en funcion de endpoint", id);
    try {
      const response = await api.post('/user/incident/updateStatus', { id });
      console.log(response);
      if (response.data === 200) {
        onClose(); 
      }
    } catch (error) {
      console.error("Error al hacer el registro:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#2C1C47] bg-opacity-30 p-3">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[60%] relative pb-[60px]">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className='text-black'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className={`mx-auto ${details.status ? 'text-red-500 ' : ''}`}>
              {details.status ? 'No atendido' : 'Atendido'}
            </h2>
          </div>          
          <p>Acción a realizar: <strong>{getEventTypeText(details.incidentType)}</strong></p>
          <p>Realizado por: {incident.name}</p>
          <p className='mt-8'>Incidente:</p>
          <p><strong>{details.content}</strong></p>
        </div>
        {details.incidentType === 2 && (
          <button 
            onClick={() => handleAttend(details.id)}
            className="bg-[#2C1C47] rounded absolute w-[150px] right-2 font-bold hover:text-gray-700 p-2 mr-4">
            Acción resuelta
          </button>
        )}
      </div>
    </div>
  );
};

export default Incident;
