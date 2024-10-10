import React, { useState, useEffect } from 'react';
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
  const { primary, secondary } = useColors();
  const api = useApi();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalPer, setShowModalPer] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });
  const [type, setType] = useState('');
  
  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };
  
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
  
  useEffect(() => {
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

  const handleAddPerm = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const uuid = parsedPermissions.uuid;
    let nType;
    switch(type) {
      case 'Permiso':
          nType = 3;
          break;
      case 'Vacaciones':
          nType = 4;
          break;
      case 'Incapacidad':
          nType = 5;
          break;
      default:
          nType = 3; 
  }
    console.log(newEvent)
    if (!nType){
      showToast('error',"Por favor, seleccione una opción...");
      return;
    }
    try {
      await api.post('/user/event/add', {
        ...newEvent,
        type: nType,
        uuid: uuid
      });
      showToast('success',"Evento registrado");
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

  const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    return (
      <div className='mb-2' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className='text-white rounded py-1 px-2 pointer' 
          style={{backgroundColor: secondary}}
          onClick={() => onNavigate('PREV')}>
          &lt;
        </button>
        <span>{label}</span>
        <button 
          className='text-white rounded py-1 px-2 pointer' 
          style={{backgroundColor: secondary}}
          onClick={() => onNavigate('NEXT')}>
          &gt;
        </button>
        <button
          className='pointer px-2 py-1 rounded text-white'
          style={{ backgroundColor: secondary }}
          onClick={() => onNavigate('TODAY')}>
          Hoy
        </button>
        <select
          className='pointer p-1 rounded text-white'
          onChange={(e) => onView(e.target.value)}
          style={{ backgroundColor: secondary }}
          value={view}>
          <option value='month'>Mes</option>
          <option value='week'>Semana</option>
          <option value='day'>Día</option>
        </select>
        <button className='px-2 py-1 pointer rounded text-white' style={{ backgroundColor: primary }} onClick={() => setShowModal(true)}>
          +
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className='mt-[70px] ml-[1%] mr-[50px] py-2 w-[35%] h-[410px] p-2 rounded text-[12px]'
        style={{
          border: `3px solid ${primary}`,
        }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor='start'
            endAccessor='end'
            style={{ height: '90%', fontSize: '10px' }}
            views={['month', 'week', 'day']}
            view={view}
            onView={setView}
            date={date}
            onSelectEvent={(event) => alert(event.title)}
            messages={{
              today: 'Hoy',
              previous: '<',
              next: '>',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              allDay: 'Todo el día',
              showMore: (total) => <span className='underline' style={{ color: secondary }}>({total}) más ... </span>,
            }}
            eventPropGetter={(event, start, end, isSelected) => {
              const index = events.indexOf(event);
              const backgroundColor = index % 2 === 0 ? primary : secondary;

              return {
                style: {
                  backgroundColor: backgroundColor,
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  padding: '5px',
                  margin: '2px',
                },
              };
            }}
            components={{
              toolbar: (props) => (
                <CustomToolbar label={props.label} onNavigate={handleNavigate} onView={setView} view={view} />
              ),
            }}/>
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] h-[32%] relative">
                  <h3 className='mt-2'>Añadir Evento</h3>
                  <input
                    type='text'
                    placeholder='Título'
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}/>
                  <div>
                    <input
                      type='datetime-local'
                      value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}/>
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
            {showModalPer && (
              <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] h-[32%] relative">
                  <h3 className='mt-2'>Indique las fechas a solicitar</h3>
                  <input
                    type='text'
                    placeholder='Título'
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                  <select
                    value={type}  
                    onChange={(e) => setType(e.target.value)} 
                    className="mt-2 mb-4 w-full p-2 border rounded"
                  >
                    <option value="" disabled>Seleccionar tipo de solicitud</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="incapacidad">Incapacidad</option>
                    <option value="permiso">Permiso</option>
                  </select>
                  <div>
                    <input
                      type='datetime-local'
                      value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                    />
                    <input
                      type='datetime-local'
                      value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                    />
                  </div>
                  <button className='rounded text-white p-1' onClick={handleAddPerm} style={{ backgroundColor: primary }}>
                    Añadir
                  </button>
                  <button className='bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700' onClick={() => setShowModalPer(false)}>
                    &times;
                  </button>
                </div>
              </div>
            )}
            <div className='mt-2 text-black flex justify-between'>
              <div>
                <button className='px-2 py-1 pointer rounded text-white mr-2' style={{ backgroundColor: primary }} onClick={handleAddEntrace}>
                  Entrada
                </button>
                <button className='px-2 py-1 pointer rounded text-white mr-2' style={{ backgroundColor: primary }} onClick={handleAddLeave}>
                  Salida
                </button>
              </div>
              <button className='px-2 py-1 pointer rounded text-white align-end' style={{ backgroundColor: primary }} onClick={() => setShowModalPer(true)}>
                + Permisos
              </button>
            </div>
      </div>
    </>
  );
};

export default CustomCalendar;
