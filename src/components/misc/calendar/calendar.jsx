import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useColors } from '@/services/colorService';
import moment from 'moment';
import 'moment/locale/es';
import { getDistance, isPointWithinRadius } from 'geolib';
import useApi from '@/hooks/useApi';

moment.locale('es');

const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
  const { primary, secondary } = useColors();
  const api = useApi();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([
    { title: 'evento 1', start: new Date(2024, 9, 1), end: new Date(2024, 9, 1) },
    { title: 'evento 2', start: new Date(2024, 9, 2), end: new Date(2024, 9, 2) },
    { title: 'Evento de 8 a 8', start: new Date(2024, 9, 3, 8, 0), end: new Date(2024, 9, 3, 20, 0) },
    { title: 'Evento de 8 a 8', start: new Date(2024, 9, 3, 7, 0), end: new Date(2024, 9, 3, 19, 0) },
    { title: 'Evento de 8 a 8', start: new Date(2024, 9, 3, 5, 0), end: new Date(2024, 9, 3, 22, 0) } 
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: new Date(), end: new Date() });

  const handleAddEvent = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latDentroRango = 19.323918112397451;
          const lonDentroRango = -99.20059122730651;
          const distance = getDistance(
            { latitude, longitude }, 
            { latitude: latDentroRango, longitude: lonDentroRango }
          );
  
          console.log(`Latitud actual: ${latitude}, Longitud actual: ${longitude}`);
          console.log(`Distancia entre los dos puntos: ${distance} metros`);
  
          api.post('/user/event/add', { ...newEvent, distance })
            .then((response) => {
              console.log('Evento añadido exitosamente:', response.data);
            })
            .catch((error) => {
              console.error('Error al añadir el evento:', error);
            });
  
          setEvents([...events, { ...newEvent, distance }]);
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

  const handleAddEntrace = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latDentroRango = 19.323918112397451;
          const lonDentroRango = -99.20059122730651;
  
          const distance = getDistance(
            { latitude, longitude }, 
            { latitude: latDentroRango, longitude: lonDentroRango }
          );
  
          console.log(`Latitud actual: ${latitude}, Longitud actual: ${longitude}`);
          console.log(`Distancia entre los dos puntos: ${distance} metros`);
          api.post('/user/event/add', { 
            ...newEvent, 
            distance, 
            type: 1,       
            title: 'Entrada'   
          })
            .then((response) => {
              console.log('Evento añadido exitosamente:', response.data);
            })
            .catch((error) => {
              console.error('Error al añadir el evento:', error);
            });
  
          setEvents([...events, { 
            ...newEvent, 
            distance, 
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
                <CustomToolbar label={props.label} onNavigate={props.onNavigate} onView={setView} view={view} />
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
            <div className='mt-2 text-black flex'>
              <button className='px-2 py-1 pointer rounded text-white mr-2' style={{ backgroundColor: primary }} onClick={handleAddEntrace}>
                Entrada
              </button>
              <button className='px-2 py-1 pointer rounded text-white mr-2' style={{ backgroundColor: primary }} onClick={handleAddEvent}>
                Salida
              </button>
            </div>
      </div>
    </>
  );
};

export default CustomCalendar;
