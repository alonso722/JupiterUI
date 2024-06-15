import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';

const Incident = ({ incident, onClose }) => {
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (effectMounted.current === false) {
        const fetchIncident = async () => {
            // try {
            //   const responseDoc = await api.post('/user/document/fetch', incident.id);
            //   const fetchDocument = responseDoc.data.data[0];
            //   setDocument(fetchDocument);

            //   setIncidentStatus(incidentStatuses);
            // } catch (error) {
            //   console.error("Error al consultar procesos:", error);
            // }
          };
        fetchIncident();
    }
    effectMounted.current = true;
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#2C1C47] bg-opacity-30 p-3">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[60%] relative">
        <button onClick={onClose} className="bg-red-600 rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold hover:text-gray-700">
          &times;
        </button>
        <div className='text-black'>
          <div className='flex'>
            <h2 className="text-2xl mb-4">Detalle del Incidente</h2>
            <h2 className='right-2'> {incident.attend ? 'Atendido' : 'No atendido'}</h2>
          </div>
          <p>ID: {incident.id}</p>
          <p>Tipo: {incident.type}</p>
          <p>UUID: {incident.uuid}</p>
          <p>Proceso: {incident.process}</p>
          <p>Incidente: {incident.incident}</p>
        </div>
      </div>
    </div>
  );
};

export default Incident;
