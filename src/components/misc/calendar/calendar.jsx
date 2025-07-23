import React, { useState, useEffect, useRef } from 'react';
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
  const effectMounted = useRef(false);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFar, setIsFar] = useState(false);
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
    start: sub(firstDayCurrentMonth, { days: firstDayWeekday === 0 ? 7 : firstDayWeekday }),
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
      const currentDateTime = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setTime(currentDateTime);
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
      setIsLoading(false)
      if (differenceInHours < 20) {
        setIsChecked(true);
      }
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };

  useEffect(() => {
    if (effectMounted.current === false) {
    getChecks();
    fetchEvents();
    effectMounted.current = true;
  }
  }, [fetchEvents]);

    const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('device_id', deviceId);
      document.cookie = `device_id=${deviceId}; path=/; max-age=31536000`;
    }
    return deviceId;
  };

  const getIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (error) {
      console.error('Error al obtener IP:', error);
      return '0.0.0.0';
    }
  };
  
  const handleAddEvent = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions?.uuid;
    if (!newEvent?.title) {
      showToast('error', "Por favor, nombre el evento...");
      return;
    }
  
    const { startDate, startTime, endDate, endTime } = newEvent;
    
    const [startHour, startMinute] = startTime.split(":");
    const [endHour, endMinute] = endTime.split(":");
    
    const start = new Date(`${startDate}T${startHour}:${startMinute}:00`);
    const end = new Date(`${endDate}T${endHour}:${endMinute}:00`);
    if (end <= start) {
      showToast('warning', "Revise las fechas de inicio y fin");
      return;
    }
  
    try {
      await api.post('/user/event/add', {
        title: newEvent.title,  
        start,                   
        end,                     
        type: 2,
        uuid: uuid
      });
  
      showToast('success', "Evento registrado");
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error al añadir el evento:', error);
    }
  };

  const handleAddEntraceExt = async () => {
    setIsLoading(true);
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }

    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;
    const device_id = getDeviceId();
    const ip_address = await getIp();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          api.post('/user/event/addEntraceExt', {
            ...newEvent,
            latitude,
            longitude,
            type: 1,
            title: 'Entrada',
            orga: organization,
            uuid: uuid,
            device_id,
            ip_address
          })
          .then((response) => {
            getChecks();
            showToast('success', `${response.data.message}`);
          })
          .catch((error) => {
            if (error.response && error.response.status === 403) {
              showToast('warning', error.response.data);
              setIsFar(true);
            } else {
              const errorMessage = error.response?.data
                ? `Entrada no registrada: ${error.response.data}`
                : "Entrada no registrada: Error desconocido";
              showToast('warning', errorMessage);
              console.error('Error al añadir el evento:', error);
            }
          });

          setEvents([...events, {
            ...newEvent,
            type: 1,
            title: 'Entrada'
          }]);
          setIsFar(false);
          setNewEvent({ title: '', start: new Date(), end: new Date() });
          setIsLoading(false);
        },
        (error) => {
          showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
          setIsLoading(false);
          console.error('Error al obtener la ubicación:', error);
        }
      );
    } else {
      showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
      setIsLoading(false);
      console.error('Geolocalización no es soportada por este navegador.');
    }
  };
  const handleAddEntrace = async () => {
    setIsLoading(true);
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }

    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;
    const device_id = getDeviceId();
    const ip_address = await getIp();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          api.post('/user/event/addEntrace', {
            ...newEvent,
            latitude,
            longitude,
            type: 1,
            title: 'Entrada',
            orga: organization,
            uuid: uuid,
            device_id,
            ip_address
          })
          .then((response) => {
            getChecks();
            showToast('success', `${response.data.message}`);
          })
          .catch((error) => {
            if (error.response && error.response.status === 403) {
              showToast('warning', error.response.data);
              setIsFar(true);
            } else {
              const errorMessage = error.response?.data
                ? `Entrada no registrada: ${error.response.data}`
                : "Entrada no registrada: Error desconocido";
              showToast('warning', errorMessage);
              console.error('Error al añadir el evento:', error);
            }
          });

          setEvents([...events, {
            ...newEvent,
            type: 1,
            title: 'Entrada'
          }]);
          setShowModal(false);
          setNewEvent({ title: '', start: new Date(), end: new Date() });
          setIsLoading(false);
        },
        (error) => {
          showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
          setIsLoading(false);
          console.error('Error al obtener la ubicación:', error);
        }
      );
    } else {
      showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
      setIsLoading(false);
      console.error('Geolocalización no es soportada por este navegador.');
    }
  };

  const handleAddLeave = () => {
    setIsLoading(true)
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;

    if (navigator.geolocation) {
        // const options = {
        //     enableHighAccuracy: true, 
        //     timeout: 7000,           
        //     maximumAge: 0            
        // };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                api.post('/user/event/addLeave', { 
                  ...newEvent,
                  latitude,
                  longitude,
                  type: 1,       
                  title: 'Salida',
                  orga: organization, 
                  uuid: uuid  
                })
                .then((response) => {
                    getChecks();
                    showToast('success', "Salida registrada");
                })
                .catch((error) => {
                    const errorMessage = error.response && error.response.data && error.response.data.message
                        ? `Salida no registrada: ${error.response.data.message}`
                        : "Salida no registrada: Error desconocido";
                    showToast('warning', errorMessage);
                    console.error('Error al añadir el evento:', error);
                });
                setShowModal(false);
                setNewEvent({ title: '', start: new Date(), end: new Date() });
                setIsLoading(false)
            },
            (error) => {
                showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
                setIsLoading(false)
                console.error('Error al obtener la ubicación:', error);
            },
            //options 
        );
    } else {
        showToast('warning', 'Su organización necesita acceso a su ubicación, por favor, permita el acceso.');
        setIsLoading(false)
        console.error('Geolocalización no es soportada por este navegador.');
    }
  };

  const handleNavigation = () => {
        const path = '/dashboard/home/calendar';
    window.location.href = path;
  };

return (
  <>
  <div className='w-md:ml-[70px]'>
    <div className='text-black shadow-lg px-2 md:px-6 pt-5 pb-2 md:flex rounded-2xl mx-auto w-full max-w-[95%] md:max-w-[600px]'>
    <div className='flex md:block text-[12px] md:text-[30px] justify-between'>
      <strong>Checador</strong>
      <div className="text-[8px] md:text-[20px] ml-2 md:ml-0 text-[#777E90] text-center">
        {time}
      </div>
    </div>
    <div className='ml-4 mt-1'>
      <div>
        <button
          className={`px-2 py-1 pointer rounded-lg text-[8px] md:text-[13px] w-[86px] md:w-[110%] text-white mb-2 mr-2 flex items-center justify-center`}
          style={{
            backgroundColor: primary,
            opacity: isChecked ? 0.7 : 1,
            cursor: isChecked ? 'not-allowed' : 'pointer',
          }}
          onClick={!isChecked && !isLoading ? handleAddEntrace : undefined}
          disabled={isChecked || isLoading}
        >
          {isChecked
            ? 'Entrada registrada'
            : isLoading
            ? 'Registrando...'
            : 'Registrar entrada'}
        </button>
      </div>
      <div>
        <button
          className={`px-2 py-1 pointer rounded-lg text-[8px] md:text-[13px] w-[86px] md:w-[110%] text-white mb-2 mr-2 flex items-center justify-center`}
          style={{
            backgroundColor: primary,
            opacity: !isChecked ? 0.7 : 1, 
            cursor: !isChecked ? 'not-allowed' : 'pointer', 
          }}
          onClick={isChecked && !isLoading ? handleAddLeave : undefined} 
          disabled={!isChecked || isLoading} 
        >
          {!isChecked
            ? 'Sin entrada'
            : isLoading
            ? 'Registrando...'
            : 'Registrar salida'}
        </button>
      </div>
    </div>
  </div>

    <div className='hidden md:block mt-[70px] ml-[1%]py-2 h-[350px] p-2 rounded-lg shadow-xl text-[12px] text-black'>
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-[350px] h-[40%] relative">
                <h3 className="my-[20px] ">Añadir Evento</h3>
                <input
                  type="text"
                  placeholder="Título"
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <div className="text-black mb-4">
                  <div className="flex justify-between">
                    <label className="block mt-2">Del:</label>
                    <input
                      type="date"
                      className="mb-2 px-2 rounded"
                      value={newEvent.startDate || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    />
                    <div className="flex">
                      <label className="block mt-2">al:</label>
                      <input
                        type="date"
                        className="mb-2 p-2 rounded"
                        value={newEvent.endDate || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <label className="block">Horario:</label>
                    <input
                      type="time"
                      className="px-2 rounded"
                      value={newEvent.startTime || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                    <label className="block">hasta:</label>
                    <input
                      type="time"
                      className="px-2 rounded"
                      value={newEvent.endTime || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  className="rounded text-white mt-2 py-2 px-3 mb-2"
                  onClick={() => handleAddEvent(newEvent)}
                  style={{ backgroundColor: primary }}
                >
                  Añadir
                </button>
                <button
                  className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700"
                  onClick={() => setShowModal(false)}
                >
                  &times;
                </button>
              </div>
            </div>
          )}
    </div>
      {isFar && (
            <div className="fixed inset-0 mr-5 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[350px] h-[40%] relative items justify-center">
                <h3 className="my-[20px] ">¿Desea enviar un registro extraordinario utilizando la información de su geolocalización?</h3>
                <button
                  className="rounded text-white mt-2 py-2 px-3 mb-2"
                  onClick={() => handleAddEntraceExt(newEvent)}
                  style={{ backgroundColor: primary }}
                >
                  Aceptar
                </button>
                <button
                  className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700"
                  onClick={() => setIsFar(false)}
                >
                  &times;
                </button>
              </div>
            </div>
          )}
  </div>
  </>
);
};

export default CustomCalendar;
