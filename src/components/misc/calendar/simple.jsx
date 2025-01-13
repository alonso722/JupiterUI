import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useColors } from '@/services/colorService';
import moment from 'moment';
import 'moment/locale/es';
import { getDistance, isPointWithinRadius } from 'geolib';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';

moment.locale('es');

const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
  const effectMounted = useRef(false);
  const [permissions, setPermissions] = useState({});
  const { primary, secondary } = useColors();
  const api = useApi();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [isChecked, setIsChecked] = useState(false);
  const [events, setEvents] = useState([]);
  const [requests, setReqs] = useState([]);
  const [owns, setOwns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalPer, setShowModalPer] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });
  const [type, setType] = useState('');
  const [time, setTime] = useState('');
  const [days, setDays] = useState('');
  const [manager, setManager] = useState('');
  
  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  useEffect(() => {
    let parsedPermissions;
    if (effectMounted.current === false) {

      const storedToken = localStorage.getItem('token');
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
          parsedPermissions = JSON.parse(storedPermissions);
          setPermissions(parsedPermissions);
      }
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
      effectMounted.current = true;
    }
}, []);

  const handleNavigate = (action) => {
    let newDate = new Date(date);
    switch (action) {
      case 'PREV':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
        case 'TODAY':
          newDate = new Date();
          break;
        default:
          break;
    }
    setDate(newDate);
  }

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
      const formattedEvents = events.map(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        start.setHours(start.getHours() + 6);
        end.setHours(end.getHours() + 6);
    
        if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
          end.setDate(end.getDate() + 1); 
        }
  
        return {
          title: event.title,
          start: start,
          end: end,
        };
      });
    
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

  const getReqs = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    try {
      const response = await api.post('/user/vacations/getReqs', { uuid });
      const events = response.data;
      setReqs(events);
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };

  const getOwns = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    try {
      const response = await api.post('/user/vacations/getOwns', { uuid });
      const events = response.data;
      setOwns(events);
    } catch (error) {
      console.error("Error al consultar eventos:", error);
    }
  };
  
  useEffect(() => {
    getChecks();
    fetchEvents();
    getReqs();
    getOwns();
  }, []);
  
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
      showToast('success', "Evento registrado");
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error al añadir el evento:', error);
    }
  };
  

  const handleAddPerm = async () => {
    if (newEvent?.start && newEvent?.end && new Date(newEvent.end) < new Date(newEvent.start)) {
      showToast('warning', "Revise las fechas de inicio y fin");
      return;
    }
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    newEvent.start = new Date(newEvent.start).toISOString(); 
    newEvent.end = new Date(newEvent.end).toISOString(); 
    let nType;

    switch (type) {
        case 'permiso':
            newEvent.title = 'Permiso';
            nType = 3;
            break;
        case 'vacaciones':
            newEvent.title = 'Vacaciones';
            nType = 4;
            break;
        case 'incapacidad':
            newEvent.title = 'Incapacidad';
            nType = 5;
            break;
        default:
            nType = 3;
    }

    if (!nType) {
        showToast('error', "Por favor, seleccione una opción...");
        return;
    }
    if (type === 'vacaciones') {
        const eventStart = new Date(newEvent.start);
        const eventEnd = new Date(newEvent.end);
        const eventDuration = Math.ceil(
            (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
        if (eventDuration > days) {
          if (days === 0) {
            showToast('error', 'No puedes solicitar vacaciones porque no tienes días disponibles.');
          } else {
            showToast('error', `No puedes solicitar ${eventDuration} días de vacaciones. Solo tienes ${days} disponibles.`);
          }          
            return;
        }
    }
    if (type !== 'permiso') {
      if (newEvent?.start && newEvent?.end) {
        const today = new Date();
        const startDate = new Date(newEvent.start);
        const endDate = new Date(newEvent.end);
    
        today.setHours(0, 0, 0, 0);
        if (endDate < startDate) {
            showToast('warning', "Revise las fechas de inicio y fin");
            return;
        }
        if (startDate.toDateString() === today.toDateString() || endDate.toDateString() === today.toDateString()) {
            showToast('warning', "No se puede registrar un evento para el día de hoy");
            return;
        }
    }
    
  }
    try {
        const id = await api.post('/user/event/add', {
          ...newEvent,
          type: nType,
          uuid: uuid,
      });
      console.log("datos vacciones:", newEvent,"managerrrrrrr:",manager)
      const verify =  await api.post('/user/vacations/add', {
        ...newEvent,
        type: nType,
        uuid: uuid,
        manager: manager,
        eventId: id.data
      });
      if(verify.data?.message){
        showToast('error', 'Fechas empalmadas');
        return;
      }

      const noti = await api.post('/user/notifications/addByVacations', {
        uuid: uuid,
        manager: manager
      });
        showToast('success', "Evento registrado");
        setShowModalPer(false);

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
            uuid: uuid  
          })
            .then((response) => {
              showToast('success',"Entrada registrada");
            })
            .catch((error) => {
              console.error('Error al añadir el evento:', error);
            });
  
          setEvents([...events, { 
            ...newEvent,
            type: 1,       
            title: 'Entrada'  
          }]);
          setShowModal(false);
          setNewEvent({ title: '', start: new Date(), end: new Date() });
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
        }
      );
    } else {
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          api.post('/user/event/addLeave', { 
            ...newEvent,
            latitude,
            longitude,
            type: 1,       
            title: 'Entrada',
            orga: organization, 
            uuid: uuid  
          })
            .then((response) => {
              showToast('success',"Salida registrada");
            })
            .catch((error) => {
              console.error('Error al añadir el evento:', error);
            });
          setShowModal(false);
          setNewEvent({ title: '', start: new Date(), end: new Date() });
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
        }
      );
    } else {
      console.error('Geolocalización no es soportada por este navegador.');
    }
  };

  const handleApprove = async (request) => {
    const startDate = new Date(request.start);
    const endDate = new Date(request.end);

    const normalizedStart = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const normalizedEnd = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

    const differenceInDays = (normalizedEnd - normalizedStart) / (1000 * 60 * 60 * 24) + 1;

    let update = {};
    update.id = request.id;
    update.status = 2;
    update.days = differenceInDays;
    const requester = await api.post('/user/vacations/updateReq', update);
    const uuid = requester.data.uuid;
    const response = await api.post('/user/notifications/addByVacationsStatus', {uuid});
    if(response.status == 200){
      showToast('success', "Respuesta enviada");
    }
    getReqs();
    getOwns();
};

  const handleReject = async (request) => {
    let update = {};
    update.id = request.id;
    update.eventId = request.eventId;
    update.status = 0;
    update.uuid = request.requester;
    const requester = await api.post('/user/vacations/updateReq', update);
    const uuid = requester.data.uuid;
    const response = await api.post('/user/notifications/addByVacationsStatus', {uuid});
    if(response.status == 200){
      showToast('success', "Respuesta enviada");
    }
    fetchEvents();
    getReqs();
    getOwns();
  };
  
  const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    return (
      <div className='mb-1'>
        <div className='px-5 mt-3' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className='flex'>
          <img src="/icons/calendar.png" alt="Icono" className="h-3 w-3 mt-1" />
          <select
            className='pointer p-1 rounded text-black'
            onChange={(e) => onView(e.target.value)}
            value={view}>
            <option value='month'>Mes</option>
            <option value='week'>Semana</option>
            <option value='day'>Día</option>
          </select>
          </div>
          <div className='flex text-[#777E90] justify-between px-11'>
            <button
                className='text-[#777E90] rounded text-[20px] py-1 px-2 pointer' 
                onClick={() => onNavigate('PREV')}>
                &lt;
            </button>
            <span className='mt-2 text-[15px] text-black'><b>{label}</b></span> 
            <button 
            className='text-[#777E90] text-[20px] rounded px-2 pointer' 
            onClick={() => onNavigate('NEXT')}>
            &gt;
            </button>
        </div>
          <button
            className='pointer color-black px-2 py-1 rounded-lg text-white'
            onClick={() => onNavigate('TODAY')}
            style={{ backgroundColor: primary }}>
            Hoy
          </button>
        </div>
      </div>
    );
  };

  const getAvailableVacationDays = () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;
    api.post('/user/vacations/getVacations', {uuid})
      .then((response) => {
        setManager(response.data.manager)
        if(response.status === 207){
          showToast('warning', `Tienes  ${response.data} días resantes del año pasado`); 
          setShowModalPer(false)
          return;  
        }
        if(response.data === 203){
          showToast('error', `Sin encargado para aprobar las vacaciones, pongase en contacto con algún responsable`); 
          setShowModalPer(false)
          return;  
        }
        setDays(response.data.days);
        if (response.data.days === 0) {
          showToast('warning', 'No tienes vacaciones disponibles.');
        } else {
          showToast('warning', `Tienes ${response.data.days} días de vacaciones disponibles.`);
        }               
      })
      .catch((error) => {
        console.error('Error al añadir el evento:', error);
      });
  };

  const CustomEvent = ({ event }) => {
    const startTime = event.start.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  
    return (
      <span>
        {startTime} - 
        {event.title}
      </span>
    );
  };

  return (
    <>
    <div className='w-full mt-[70px] pl-[70px]'>
        <div className='flex mt-[40px]'>
            <div className="ml-[1%] border-white-2 w-[20%] h-[500px] rounded-lg  text-[12px] text-black">
            <p className='text-black ml-9 text-[20px] mt-[50px] mb-[40px] '><strong>Calendario</strong></p>
            <button className='px-2 py-1 text-[14px] pointer rounded-lg text-white flex ml-9' style={{ backgroundColor: primary }} onClick={() => setShowModal(true)}>
              <p className='text-[15px] mr-1'><strong>+</strong></p>
            Agendar
          </button>
            <Calendar
            className='ml-9 mt-4'
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view="day"
                date={new Date()}
                style={{
                    height: '450px',
                    fontSize: '10px',
                    border: '2px solid white',
                    boxShadow: 'none',
                    backgroundColor: 'white !important',
                }}
                toolbar={false}
                messages={{
                    today: 'Hoy',
                    previous: '<',
                    next: '>',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    allDay: 'Todo el día',
                    showMore: (total) => (
                    <span className="underline" style={{ color: secondary }}>
                        ({total}) más ...
                    </span>
                    ),
                }}
                eventPropGetter={(event, start, end, isSelected) => {
                  const backgroundColor = '#ffffff';

                  return {
                  style: {
                      backgroundColor: backgroundColor,
                      color: 'black',
                  },
                  };
              }}
                />
            </div>
        <div className='mt-[110px] ml-[1%] py-2 w-[55%] h-[500px] p-2 rounded-lg shadow-xl text-[12px] text-black'>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: '90%',
              fontSize: '10px',
              border: '2px solid white',
              boxShadow: 'none',
            }}
            views={['month', 'week', 'day']}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={(event) => alert(event.title)}
            popup 
            messages={{
              today: 'Hoy',
              previous: '<',
              next: '>',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              allDay: 'Todo el día',
              showMore: (total) => (
                <span className="underline" style={{ color: secondary || '#007bff' }}>
                  ({total}) más...
                </span>
              ),
            }}
            eventPropGetter={(event) => {
              const index = events.indexOf(event);
              const backgroundColor = index % 2 === 0 ? primary || '#4caf50' : secondary || '#007bff';

              return {
                style: {
                  backgroundColor,
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '5px',
                  margin: '2px',
                },
              };
            }}
            components={{
              event: (props) => (
                <div title={props.event.title} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {props.event.title}
                </div>
              ),
              toolbar: (props) => (
                <CustomToolbar
                    label={props.label}
                    onNavigate={handleNavigate}
                    onView={setView}
                    view={view}
                />
                ),
            }}
          />
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
                  <div className='flex justify-between'> 
                    <label className="block mt-2">Del:</label>
                    <input
                      type="date"
                      className="mb-2 px-2 rounded"
                      value={
                        newEvent.start instanceof Date
                          ? newEvent.start.toISOString().split('T')[0] 
                          : new Date(newEvent.start).toISOString().split('T')[0]
                      }
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        const updatedDate = new Date(newEvent.start || new Date());
                        updatedDate.setFullYear(year);
                        updatedDate.setMonth(month - 1);
                        updatedDate.setDate(day);
                        setNewEvent({ ...newEvent, start: updatedDate });
                      }}
                    />
                    <div className='flex'>
                      <label className="block mt-2">al:</label>
                      <input
                        type="date"
                        className="mb-2 p-2 rounded"
                        value={
                          newEvent.end instanceof Date
                          ? newEvent.end.toISOString().split('T')[0] 
                          : new Date(newEvent.end).toISOString().split('T')[0]
                        }
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split("-");
                          const updatedDate = new Date(newEvent.end || new Date());
                          updatedDate.setFullYear(year);
                          updatedDate.setMonth(month - 1);
                          updatedDate.setDate(day);
                          setNewEvent({ ...newEvent, end: updatedDate });
                        }}
                      />
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <label className="block">Horario:</label>
                    <input
                      type="time"
                      className="px-2 rounded"
                      value={moment(newEvent.start).format('HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(newEvent.start);
                        newDate.setHours(hours);
                        newDate.setMinutes(minutes);
                        setNewEvent({ ...newEvent, start: newDate });
                      }}
                    /> 
                    <label className="block ">hasta:</label>
                    <input
                      type="time"
                      className="px-2  rounded"
                      value={moment(newEvent.end).format('HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(newEvent.end);
                        newDate.setHours(hours);
                        newDate.setMinutes(minutes);
                        setNewEvent({ ...newEvent, end: newDate });
                      }}
                    />
                  </div>

                </div>
                <button
                  className="rounded text-white mt-2 py-2 px-3 mb-2"
                  onClick={handleAddEvent}
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
          {showModalPer && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[350px] h-auto relative">
                <h3 className="mt-2">Indique las fechas a solicitar</h3>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === "vacaciones") {
                      getAvailableVacationDays();
                    }
                  }}
                  className="mt-2 mb-4 w-full p-2 border rounded"
                >
                  <option value="" disabled>
                    Selecciona tipo de solicitud
                  </option>
                  <option value="vacaciones">Vacaciones</option>
                  {/* <option value="incapacidad">Incapacidad</option>
                  <option value="permiso">Permiso</option> */}
                </select>
                <div className="text-black mb-4">
                  <div className="flex justify-between">
                    <label className="block mt-2">Del:</label>
                    <input
                      type="date"
                      className="mb-2 px-2 rounded"
                      value={
                        newEvent.start && !isNaN(new Date(newEvent.start))
                          ? new Date(newEvent.start).toISOString().split('T')[0] 
                          : '' 
                      }
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        const updatedDate = new Date();
                        updatedDate.setFullYear(year);
                        updatedDate.setMonth(month - 1);
                        updatedDate.setDate(day);
                        setNewEvent({ ...newEvent, start: updatedDate });
                      }}
                    />
                    <div className="flex">
                      <label className="block mt-2">al:</label>
                      <input
                        type="date"
                        className="mb-2 p-2 rounded"
                        value={
                          newEvent.end instanceof Date
                          ? newEvent.end.toISOString().split('T')[0] 
                          : new Date(newEvent.end).toISOString().split('T')[0]
                        }
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split("-");
                          const updatedDate = new Date(newEvent.end || new Date());
                          updatedDate.setFullYear(year);
                          updatedDate.setMonth(month - 1);
                          updatedDate.setDate(day);
                          setNewEvent({ ...newEvent, end: updatedDate });
                        }}
                      />
                    </div>
                  </div>
                  {type === "permiso" && (
                    <div className="flex justify-between mt-4">
                      <label className="block">Horario:</label>
                      <input
                        type="time"
                        className="px-2 rounded"
                        value={moment(newEvent.start).format("HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(newEvent.start);
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          setNewEvent({ ...newEvent, start: newDate });
                        }}
                      />
                      <label className="block">hasta:</label>
                      <input
                        type="time"
                        className="px-2 rounded"
                        value={moment(newEvent.end).format("HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(newEvent.end);
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          setNewEvent({ ...newEvent, end: newDate });
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  className="rounded text-white p-1"
                  onClick={handleAddPerm}
                  style={{ backgroundColor: primary }}
                >
                  Añadir
                </button>
                <button
                  className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700"
                  onClick={() => setShowModalPer(false)}
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className='text-black ml-5 max-w-[90%] shadow-lg px-6 pt-5 pb-2 flex rounded-2xl'>
            <div>
              <div>
                <strong>Checador</strong>
              </div>
              <div className='mr-3 text-[30px] text-[#777E90]'>
                {time}
              </div>
            </div>
            <div className='ml-4'>
              <div>
                <button
                  className={`px-2 py-1 pointer rounded-lg text-[15px] w-[110%] text-white mb-2 mr-2 flex items-center justify-center`}
                  style={{
                    backgroundColor: primary,
                    opacity: isChecked ? 0.7 : 1, 
                    cursor: isChecked ? 'not-allowed' : 'pointer', 
                   }}
                  onClick={!isChecked ? handleAddEntrace : undefined} 
                  disabled={isChecked} 
                >
                  {isChecked ? (
                    <span className="text-[13px] font-semibold text-center">Entrada registrada</span>
                  ) : (
                    'Registrar entrada'
                  )}
                </button>
              </div>
              <div>
                <button
                  className={`px-2 py-1 pointer rounded-lg text-[13px] w-[110%] text-white mb-2 mr-2 flex items-center justify-center`}
                  style={{
                    backgroundColor: primary,
                    opacity: !isChecked ? 0.7 : 1, 
                    cursor: !isChecked ? 'not-allowed' : 'pointer', 
                   }}
                  onClick={isChecked ? handleAddLeave : undefined} 
                  disabled={!isChecked} 
                >
                  {!isChecked ? (
                    <span className="text-[13px] font-semibold text-center">Sin entrada</span>
                  ) : (
                    'Registrar salida'
                  )}
                </button>
              </div>
            </div>
          </div>
          <div
            className={`text-black ml-5 mt-6 max-w-[90%] max-h-[485px] shadow-lg px-6 pt-5 pb-2 flex flex-col ${
              permissions.isManager === 1 ? 'divide-y divide-gray-300' : ''
            }`}
          >
            {permissions.isManager === 1 && (
              <div className="flex-1 flex flex-col ">
                <div className='flex min-w-[260px]'>
                  <h3 className="text-[13px] mb-2 mt-2"><b>Solicitud de vacaciones</b></h3>      
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  <ul>
                    {requests.map((request, index) => (
                      <li key={index} className="mb-4 border-b pb-2 rounded p-2 text-[13px]"
                      style={{ backgroundColor: request.status === 1 ? '#EDF2F7' : `#ffffff` }}>
                        <div>
                          <strong>Solicitante:</strong> {request.reqName}
                        </div>
                        <div>
                          <strong>Inicio:</strong> {new Date(request.start).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Final:</strong> {new Date(request.end).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Estatus:</strong>{' '}
                          {request.status === 0 ? (
                            <span style={{ color: 'red' }}>Rechazadas</span>
                          ) : request.status === 2 ? (
                            <span style={{ color: 'green' }}>Aprobadas</span>
                          ) : request.status === 1 ? (
                            'Pendiente'
                          ) : (
                            'Desconocido'
                          )}
                        </div>
                        {request.status === 1 && (
                          <div className='flex justify-between'>                          
                            <button
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                            onClick={() => handleApprove(request)}>
                            Aprobar
                            </button>
                            <button
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                            onClick={() => handleReject(request)}>
                            Rechazar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className={`flex-1 ${permissions.isManager === 1 ? 'mt-4' : ''} flex flex-col`}>
            <div className='flex min-w-[260px]'>
                  <h3 className="text-[13px] mb-2 mt-2"><b>Mis vacaciones</b></h3> 
                  <div>                  
                    <button className='px-2 py-1 mt-1 text-[13px] ml-3 pointer rounded text-white' style={{ backgroundColor: primary }} onClick={() => setShowModalPer(true)}>
                      + Permisos
                    </button>
                  </div>            
                </div>
              <div className="max-h-[167px] overflow-y-auto">
                  <ul>
                    {owns.map((request, index) => (
                      <li key={index} className="mb-4 border-b p-2 text-[13px]">
                        <div>
                          <strong>Inicio:</strong> {new Date(request.start).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Final:</strong> {new Date(request.end).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Estatus:</strong>{' '}
                          {request.status === 0 ? (
                            <span style={{ color: 'red' }}>Rechazadas</span>
                          ) : request.status === 2 ? (
                            <span style={{ color: 'green' }}>Aprobadas</span>
                          ) : request.status === 1 ? (
                            'Pendiente'
                          ) : (
                            'Desconocido'
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CustomCalendar;
