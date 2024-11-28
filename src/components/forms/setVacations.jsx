import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';

const VacationsForm = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [days, setDays] = useState([]);
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [yearsDays, setYearsDays] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isBlockMode, setIsBlockMode] = useState(false);
  const { secondary } = useColors();
  const effectMounted = useRef(false);
  const api = useApi();


  const fetchData = () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }

    const organization = parsedPermissions.Organization;
    api.post('/user/vacations/fetch', { organization })
        .then((response) => {
          setDays(response.data);
        })
        .catch((error) => {
            console.error("Error al consultar usuarios:", error);
        });
  };

  useEffect(() => {
    if (!effectMounted.current) {
      fetchData();
      effectMounted.current = true;
    }
  }, []);

  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  const handleAddYear = () => {
    console.log(yearStart, yearEnd)
    if(yearEnd && yearStart>yearEnd){
      showToast('warning', "La año de termino del bloque no debe ser previo al de inicio");
      return;
    }
    const newEntry = {
      start: yearStart,
      end: isBlockMode ? yearEnd : yearStart,
      days: yearsDays,
    };

    setDays((prevLinks) => [...prevLinks, newEntry]);
    setYearStart('');
    setYearEnd('');
    setYearsDays('');
    setIsInputVisible(false);
  };

  const handleRemoveYear = (index) => {
    setDays((prevLinks) => prevLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (days.length === 0) {
      showToast('warning', "Agregue al menos un ajuste");
      return;
    }
  
    const hasInvalidDays = days.some((entry) => entry.days < 12);
  
    if (hasInvalidDays) {
      showToast('error', "Los días asignados deben ser más de 12");
      return;
    }
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const orga = parsedPermissions?.Organization;
    let adjustment = {};
    adjustment.days = days;
    adjustment.orga = orga;

    api.post('/user/vacations/adjustment', adjustment)
      .then((response) => {
        if(response.status == 200){
          showToast('success', "Asignaciones ajustadas");
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al consultar procesos:", error);
      });

  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[900px] max-h-[600px] relative">
        <button
          onClick={onClose}
          className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-2xl mb-2 text-black">Días asignados por tiempo laborado</h2>
        <p className="text-[11px] text-slate-400 mb-4">
          De no realizar un ajuste en los días, se asignarán los establecidos en la Ley Federal del Trabajo*
        </p>
        <div className="flex">
          <div className="mb-4 ml-5 pl-5 border-l-2 border-gray-300 w-[400px]">
            <h3 className="mb-2 text-black">Añadir ajuste</h3>
            <div className="flex flex-wrap h-[200px] overflow-y-auto border-b-2 border-gray-300">
              {days.map((link, index) => (
                <div
                  key={index}
                  className="bg-gray-200 text-black p-2 m-1 rounded flex items-center max-h-[40px] max-w-[400px] overflow-hidden whitespace-nowrap"
                  title={`${link.start} - ${link.end}: ${link.days} días`}
                >
                  <span className="truncate">
                    Año {link.start}{link.start !== link.end ? ` a ${link.end}` : ''}: {link.days} días
                  </span>
                  <button onClick={() => handleRemoveYear(index)} className="ml-2 text-red-500">
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {isInputVisible && (
              <div className="items-center my-1">
                <div className="flex items-center mb-2">
                  <label className="text-black mr-2">Asignación para bloque de años</label>
                  <input
                    type="checkbox"
                    checked={isBlockMode}
                    onChange={(e) => setIsBlockMode(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Año inicial"
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  className="p-2 text-black border-b-2 border-gray-300 focus:border-grey-500 outline-none"
                />
                {isBlockMode && (
                  <input
                    type="number"
                    placeholder="Año final"
                    value={yearEnd}
                    onChange={(e) => setYearEnd(e.target.value)}
                    className="p-2 text-black border-b-2 border-gray-300 focus:border-grey-500 outline-none ml-2"
                  />
                )}
                <input
                  type="number"
                  placeholder="Días asignados"
                  value={yearsDays}
                  onChange={(e) => setYearsDays(e.target.value)}
                  className="p-2 text-black border-b-2 border-gray-300 focus:border-grey-500 outline-none ml-2"/>
                <button
                  onClick={handleAddYear}
                  className="ml-2 bg-gray-300 text-black px-2 py-1 rounded">
                  +
                </button>
              </div>
            )}
            <button
              onClick={() => setIsInputVisible(true)}
              className="ml-2 bg-gray-300 text-black p-2 mt-1 rounded"
            >
              Agregar
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="p-2 rounded text-white"
            style={{ backgroundColor: secondary }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VacationsForm;
