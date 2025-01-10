import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useColors } from '@/services/colorService';
import moment from 'moment';
import 'moment/locale/es';
import { getDistance, isPointWithinRadius } from 'geolib';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { add, eachDayOfInterval, endOfMonth, format, getDay, isToday, parse, startOfToday, sub } from 'date-fns';

import { es } from 'date-fns/locale';

moment.locale('es');

const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
  const { primary, secondary } = useColors();
  const api = useApi();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });
  const [isChecked, setIsChecked] = useState(false);
  const [time, setTime] = useState('');

  let today = startOfToday();
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy')); 
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  let daysInMonth = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  let firstDayWeekday = getDay(firstDayCurrentMonth);
  let lastDayCurrentMonth = endOfMonth(firstDayCurrentMonth);
  let lastDayWeekday = getDay(lastDayCurrentMonth);

  let previousMonthDays = eachDayOfInterval({
    start: sub(firstDayCurrentMonth, { days: firstDayWeekday }),
    end: sub(firstDayCurrentMonth, { days: 1 }),
  });

  let nextMonthDays = [];
  let daysToAdd = 0;

  if (lastDayWeekday < 6) {
    daysToAdd = 7 - lastDayWeekday;
  }

  nextMonthDays = eachDayOfInterval({
    start: add(lastDayCurrentMonth, { days: 1 }),
    end: add(lastDayCurrentMonth, { days: daysToAdd + 7 }),
  });

  let allDays = [
    ...previousMonthDays,
    ...daysInMonth,
    ...nextMonthDays,
  ];

  let limitedDays = allDays.slice(0, 42);

  const previousMonth= async () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy')); 
  }

  const nextMonth = async () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy')); 
  }
  
  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  useEffect(() => {
    const updateTime = () => {
        const currentTime = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, 
        });
        setTime(currentTime);
    };

    updateTime(); 

    const intervalId = setInterval(updateTime, 60000); 

    return () => clearInterval(intervalId); 
}, []);

  const fetchEvents = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    try {
      const response = await api.post('/user/event/fetch', { uuid });
      const events = response.data;
  
      const formattedEvents = events.map(event => ({
        title: event.title,
        start: new Date(event.start),  
        end: new Date(event.end),      
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };

  const getChecks = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    try {
      const response = await api.post('/user/event/getChecks', { uuid });
      const events = response.data;
      const entranceDate = new Date(new Date(events.entrance).getTime() + 6 * 60 * 60 * 1000);
      const currentDate = new Date();
      const differenceInHours = (currentDate - entranceDate) / (1000 * 60 * 60);
      if (differenceInHours < 10) {
        setIsChecked(true);
      }
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };

  useEffect(() => {
    getChecks();
    fetchEvents();
  }, []);
  
  const handleAddEvent = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    if (!newEvent?.title){
      showToast('error',"Por favor, nombre el evento...");
      return;
    }
    if (newEvent?.start && newEvent?.end && new Date(newEvent.end) < new Date(newEvent.start)) {
      showToast('warning', "Revise las fechas de inicio y fin");
      return;
    }

    try {
      await api.post('/user/event/add', {
        ...newEvent,
        type: 2,
        uuid: uuid
      });
      showToast('success',"Evento registrado");
      setShowModal(false);
  
      fetchEvents();
    } catch (error) {
      console.error('Error al añadir el evento:', error);
    }
  };

  const handleAddEntrace = () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;

    if (navigator.geolocation) {
        // Configuración para alta precisión y manejo de tiempo
        const options = {
            enableHighAccuracy: true, // Solicitar alta precisión
            timeout: 5000,           // Tiempo máximo para obtener la ubicación
            maximumAge: 0            // No usar datos en caché
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                console.log("Coordenadas entrada:", latitude, longitude);

                // Código comentado para el envío de datos a la API
                // api.post('/user/event/addEntrace', { 
                //   ...newEvent,
                //   latitude,
                //   longitude,
                //   type: 1,       
                //   title: 'Entrada',
                //   orga: organization, 
                //   uuid: uuid  
                // })
                // .then((response) => {
                //     getChecks();
                //     showToast('success', "Entrada registrada");
                // })
                // .catch((error) => {
                //     const errorMessage = error.response && error.response.data
                //         ? `Entrada no registrada: ${error.response.data}`
                //         : "Entrada no registrada: Error desconocido";
                //     showToast('warning', errorMessage);
                //     console.error('Error al añadir el evento:', error);
                // });        

                // setEvents([...events, { 
                //   ...newEvent,
                //   type: 1,       
                //   title: 'Entrada'  
                // }]);
                // setShowModal(false);
                // setNewEvent({ title: '', start: new Date(), end: new Date() });
            },
            (error) => {
                showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
                console.error('Error al obtener la ubicación:', error);
            },
            options // Pasar opciones de configuración
        );
    } else {
        showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
        console.error('Geolocalización no es soportada por este navegador.');
    }
};

  const handleAddLeave = () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;

    if (navigator.geolocation) {
        // Configuración para alta precisión y manejo de tiempo
        const options = {
            enableHighAccuracy: true, // Solicitar alta precisión
            timeout: 5000,           // Tiempo máximo para obtener la ubicación
            maximumAge: 0            // No usar datos en caché
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                console.log("Coordenadas obtenidas:", latitude, longitude);

                // Código comentado para el envío de datos a la API
                // api.post('/user/event/addLeave', { 
                //   ...newEvent,
                //   latitude,
                //   longitude,
                //   type: 1,       
                //   title: 'Salida',
                //   orga: organization, 
                //   uuid: uuid  
                // })
                // .then((response) => {
                //   getChecks();
                //   showToast('success',"Salida registrada");
                // })
                // .catch((error) => {
                //   console.error('Error al añadir el evento:', error);
                // });
                // setShowModal(false);
                // setNewEvent({ title: '', start: new Date(), end: new Date() });
            },
            (error) => {
                showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
                console.error('Error al obtener la ubicación:', error);
            },
            options // Pasar opciones de configuración
        );
    } else {
        showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
        console.error('Geolocalización no es soportada por este navegador.');
    }
};

  const handleNavigation = () => {
        const path = '/dashboard/home/calendar';
    window.location.href = path;
};

return (
  <>
  <div className='ml-[70px]'>
    <div className='text-black shadow-lg px-6 pt-5 pb-2 flex rounded-2xl'>
      <div>
        <div><strong>Checador</strong>
        </div>
        <div className=' text-[30px] text-[#777E90]'>
          {time}
        </div>
      </div>
      <div className='ml-4'>
        <div>
          <button
            className={`px-2 py-1 pointer rounded-lg text-[15px] w-[110%] text-white mb-2 mr-2 flex items-center justify-center`}
            style={{
              backgroundColor: primary,
              // opacity: isChecked ? 0.7 : 1, 
              // cursor: isChecked ? 'not-allowed' : 'pointer', 
            }}
            onClick={
              //!isChecked ?
               handleAddEntrace 
              // : undefined
              } 
            //disabled={isChecked} 
          >
            entrada
            {/* {isChecked ? (
              <span className="text-[13px] font-semibold text-center">Entrada registrada</span>
            ) : (
              'Registrar entrada'
            )} */}
          </button>
        </div>
        <div>
          <button
            className={`px-2 py-1 pointer rounded-lg text-[13px] w-[110%] text-white mb-2 mr-2 flex items-center justify-center`}
            style={{
              backgroundColor: primary,
              // opacity: !isChecked ? 0.7 : 1, 
              // cursor: !isChecked ? 'not-allowed' : 'pointer', 
            }}
            onClick={
              //isChecked ? 
              handleAddLeave 
              // : undefined
            } 
            //disabled={!isChecked} 
          >
            salida
            {/* {!isChecked ? (
              <span className="text-[13px] font-semibold text-center">Sin entrada</span>
            ) : (
              'Registrar salida'
            )} */}
          </button>
        </div>
      </div>
    </div>
    <div className='mt-[70px] ml-[1%]py-2 h-[350px] p-2 rounded-lg shadow-xl text-[12px] text-black'>
      <div className="">
        <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
          <div className="">
            <div className='mt-3' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center cursor-pointer" onClick={() => handleNavigation()}>
                <img src="/icons/xpnd.png" alt="Icono" className="h-3 w-3 mr-2 cursor-pointer" /> 
                <p className='cursor-pointer underline'>Calendario</p>
              </div>
              <button className='px-2 py-1 text-[14px] pointer rounded-lg text-white' style={{ backgroundColor: primary }} onClick={() => setShowModal(true)}>
                + Agendar
              </button>
            </div>
            <div className="flex items-center mt-5 pl-3 pr-1">
              <h2 className="flex-auto font-semibold text-gray-900">
                {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: es })}
              </h2>
              <button
                type="button"
                onClick={previousMonth}
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500">
                <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={nextMonth}
                type="button"
                className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500">
                <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-3 text-xs leading-6 text-center text-gray-500">
              <div>D</div>
              <div>L</div>
              <div>M</div>
              <div>X</div>
              <div>J</div>
              <div>V</div>
              <div>S</div>
            </div>
            <div className="grid grid-cols-7 text-sm">
              {limitedDays.map((day, index) => {
                const isPreviousMonth = day < firstDayCurrentMonth;
                const isNextMonth = day > lastDayCurrentMonth;
                return (
                  <div key={`${day.toString()}-${index}`} className="py-1">
                    <div
                      className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[12px] ${
                        isPreviousMonth || isNextMonth ? 'text-gray-400' : 
                        isToday(day) ? 'bg-blue-200 text-blue-500' : 'text-gray-900 hover:bg-gray-200'
                      }`}>
                      <time dateTime={format(day, 'yyyy-MM-dd')}>
                        {format(day, 'd')}
                      </time>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] h-[32%] relative">
            <h3 className='mt-2'>Añadir Evento</h3>
            <input
              type='text'
              placeholder='Título'
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}/>
            <div className='text-black'>
              <p className='mt-2'>Inicio:</p>
              <input
                type='datetime-local'
                value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}/>
                <p className='mt-2'>Fin:</p>
              <input
                type='datetime-local'
                value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}/>
            </div>
            <button className='rounded text-white p-1' onClick={handleAddEvent} style={{ backgroundColor: primary}}>
              Añadir
            </button>
            <button className='bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700' onClick={() => setShowModal(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  </>
);
};

export default CustomCalendar;
