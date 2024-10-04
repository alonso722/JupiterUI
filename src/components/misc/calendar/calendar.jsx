import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useColors } from '@/services/colorService';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
  const { primary, secondary } = useColors();
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
  };

  const handleAddEvent = () => {
    setEvents([...events, newEvent]);
    setShowModal(false);
    setNewEvent({ title: '', start: new Date(), end: new Date() }); 
  };

  const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    return (
      <div className='mb-2' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          style={{
            backgroundColor: secondary,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('PREV')}>
          &lt;
        </button>
        <span>{label}</span>
        <button
          style={{
            backgroundColor: secondary,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('NEXT')}>
          &gt;
        </button>
        <button
        className='pointer px-2 py-1 rounded text-white'
          style={{backgroundColor: secondary}}
          onClick={() => onNavigate('TODAY')}>
          Hoy
        </button>
        <select
        className='pointer p-1 rounded text-white'
          onChange={(e) => onView(e.target.value)}
          style={{backgroundColor: secondary}}
          value={view}>
          <option value="month">Mes</option>
          <option value="week">Semana</option>
          <option value="day">Día</option>
        </select>
        <button className='px-2 py-1 pointer rounded text-white'
          style={{backgroundColor: primary}}
          onClick={() => setShowModal(true)} >
          +
        </button>
      </div>
    );
  };

  return (
    <>
    <div
      className='mt-[70px] ml-[1%] mr-[3%] py-2'
      style={{
        width: '37%',
        height: '410px',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        border: `3px solid ${primary}`,
      }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
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
            <CustomToolbar
              label={props.label}
              onNavigate={handleNavigate}
              onView={setView}
              view={view}/>
          ),
        }}/>
      {showModal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          zIndex: '1000'
        }}>
          <h3 className='mt-2'>Añadir Evento</h3>
          <input
            type="text"
            placeholder="Título"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            style={{ marginBottom: '10px', width: '100%' }}/>
          <input
            type="datetime-local"
            value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
            style={{ marginBottom: '10px', width: '100%' }}/>
          <input
            type="datetime-local"
            value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
            style={{ marginBottom: '10px', width: '100%' }}/>
          <button className='rounded text-white p-1' onClick={handleAddEvent} style={{backgroundColor: primary, marginRight: '5px' }}>Añadir</button>
          <button className='bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700' onClick={() => setShowModal(false)}>&times;</button>
        </div>
      )}
        <div className='mt-2 text-black flex'>
            <button className='px-2 py-1 pointer rounded text-white mr-5'
                style={{backgroundColor: primary}} >
                Entrada
            </button>
            <button className='px-2 py-1 pointer rounded text-white'
                style={{backgroundColor: primary}} >
                Salida
            </button>
        </div>
    </div>
    </>
  );
};

export default CustomCalendar;
