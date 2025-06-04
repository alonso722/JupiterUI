import React, { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';
import UsersChecks from '../misc/checkbox/usersChecks';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
registerLocale("es", es);

const ReservationForm = ({ onClose, scheduleData, locations }) => {
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [excludedIntervals, setExcludedIntervals] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedMeetingRoom, setSelectedMeetingRoom] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const effectMounted = useRef(false);
  const api = useApi();
  const { secondary } = useColors();

  const showToast = (type, message) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  const handleAddMeeting = () => {
    if (!selectedLocationId) {
      showToast('error', 'Por favor, seleccione un corporativo');
      return;
    }

    if (!selectedMeetingRoom) {
      showToast('error', 'Por favor, seleccione una sala');
      return;
    }

    if (!startDateTime || !endDateTime) {
      showToast('error', 'Por favor, seleccione fecha y hora de inicio y fin');
      return;
    }
    if (startDateTime > endDateTime) {
      showToast('error', 'Verifique las horas de inicio y fin');
      return;
    }

    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions'); 
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
    }
    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;

    const locationObj = locations.find(loc => loc.id.toString() === selectedLocationId);
    const meetingRoomObj = meetingRooms.find(room => room.id.toString() === selectedMeetingRoom);

    const reservationDetails = {
      orgaId: organization,
      meetingRoomId: parseInt(selectedMeetingRoom),
      startDateTime,
      endDateTime,
      subject,
      selectedUsers: selectedUsers.map(user => user.uuid),
      locationName: locationObj ? locationObj.name : '',
      meetingRoomName: meetingRoomObj ? meetingRoomObj.name : ''
    };
    api.post(`/user/schedules/add/${uuid}`, reservationDetails)
      .then((response) => {
        if (response.status === 200) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al añadir sala:", error);
      });
  };

    const handleEditMeeting = () => {
    if (!selectedMeetingRoom) {
      showToast('error', 'Por favor, seleccione una sala');
      return;
    }

    if (!startDateTime || !endDateTime) {
      showToast('error', 'Por favor, seleccione fecha y hora de inicio y fin');
      return;
    }
    if (startDateTime > endDateTime) {
      showToast('error', 'Verifique las horas de inicio y fin');
      return;
    }
    const locationObj = locations.find(loc => loc.id === selectedLocationId);
    const reservationDetails = {
      id:scheduleData.id,
      meetingRoomName:scheduleData.meetingRoomName,
      reserver:scheduleData.reserver,
      meetingRoomId: parseInt(selectedMeetingRoom),
      startDateTime,
      endDateTime,
      subject,
      locationName: locationObj ? locationObj.name : '',
      selectedUsers: selectedUsers.map(user => user.uuid),
    };
    api.put(`/user/schedules/edit/${scheduleData.id}`, reservationDetails)
      .then((response) => {
        if (response.status === 200) {
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error al añadir sala:", error);
      });
  };

  const fetchMeetingRooms = (locationId) => {
    setMeetingRooms('');
    setStartDateTime('');
    setEndDateTime('');
    setSelectedMeetingRoom('');
          let parsedPermissions;
      const storedPermissions = localStorage.getItem('permissions'); 
      if (storedPermissions) {
        parsedPermissions = JSON.parse(storedPermissions);
      }
      const uuid= parsedPermissions.uuid;
    api.get(`/user/meetingRoom/getMeetingRooms/${locationId}/${uuid}`)
      .then((response) => {
        setMeetingRooms(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener salas:", error);
      });
  };

  const fetchSchedules = (meetingRoomId) => {
    setStartDateTime('');
    setEndDateTime('');
    if (meetingRoomId) {
      api.get(`/user/schedules/getSchedules/${meetingRoomId}`)
        .then((response) => {
          setSchedules(response.data);
          if (Array.isArray(response.data) && response.data.length > 0) {
            const intervals = response.data.map(schedule => ({
              start: new Date(schedule.start),
              end: new Date(schedule.end)
            }));
            setExcludedIntervals(intervals);
          } else {
            setExcludedIntervals([]);
          }
        })
        .catch((error) => {
          console.error("Error al obtener horarios:", error);
        });
    }
  };

    useEffect(() => {
    if (!effectMounted.current) {
      if(scheduleData){
        fetchMeetingRooms(scheduleData.location)
        setSelectedLocationId(scheduleData.location)
        setSubject(scheduleData.subject)
        setSelectedMeetingRoom(scheduleData.room)
        fetchSchedules(scheduleData.room)
        setSelectedUsers(scheduleData.users)
        setStartDateTime(scheduleData.start)
        setEndDateTime(scheduleData.end)
      }
      effectMounted.current = true;
    }
  }, [selectedMeetingRoom]);

  const isTimeAvailable = (time) => {
    return !excludedIntervals.some(interval =>
      time >= interval.start && time < interval.end
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50 px-5 md:px-0">
      <div className="bg-white p-6 rounded-lg shadow-lg md:w-[600px] h-[600px] relative overflow-x-auto w-full text-black">
        <button onClick={onClose} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
          &times;
        </button>

        <div className='text-lg mb-2'><b>Reservar una sala de reuniones</b></div>

        <div className=" mt-[20px] mb-4 text-black w-[40%]">
          <p className='mb-2'>Asunto:</p>
          <input
              type="text"
              placeholder="Asunto de la reservación"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-purple-500 outline-none"
          />
        </div>
        {!scheduleData && (
        <div>
          <div>Seleccione un corporativo</div>
            {Array.isArray(locations) && locations.length > 0 && (
              <select
                className="w-[70%] border rounded px-3 py-2 mt-2 mb-4"
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedLocationId(value);
                  fetchMeetingRooms(value);
                }}
              >
                <option value="">Selecciona una opción</option>
                {locations.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            )}
        </div>
         )}
        {Array.isArray(meetingRooms) && meetingRooms.length > 0 ? (
          <>
            <div>
              <p className='mb-2'>Seleccione una sala</p>
              <select
                className="w-[70%] border rounded px-3 py-2 mb-4"
                value={selectedMeetingRoom}
                onChange={(e) => {
                  setSelectedMeetingRoom(e.target.value);
                  fetchSchedules(e.target.value);
                }}
              >
                <option value="">Selecciona una opción</option>
                {meetingRooms.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {selectedMeetingRoom && (
              <>
                <div className="mb-4">
                  <p className='mb-1'>Inicio (fecha y hora)</p>
                  <DatePicker
                    selected={startDateTime ? new Date(startDateTime) : null}
                    onChange={(date) => setStartDateTime(date?.toISOString())}
                    showTimeSelect
                    timeIntervals={30}
                    dateFormat="Pp"
                    className="border rounded px-2 py-1"
                    placeholderText="Selecciona inicio"
                    filterTime={isTimeAvailable}
                    locale="es"
                    popperPlacement="right-start"
                    timeCaption="Hora"
                  />
                </div>

                <div className="mb-4">
                  <p className='mb-1'>Fin (fecha y hora)</p>
                  <DatePicker
                    selected={endDateTime ? new Date(endDateTime) : null}
                    onChange={(date) => setEndDateTime(date?.toISOString())}
                    showTimeSelect
                    timeIntervals={30}
                    dateFormat="Pp"
                    className="border rounded px-2 py-1"
                    placeholderText="Selecciona fin"
                    filterTime={isTimeAvailable}
                    locale="es"
                    popperPlacement="right-start"
                    timeCaption="Hora"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 mt-4">Sin salas en el corporativo</p>
        )}
        <div className='max-h-[300px] h-[200px] max-w-[200px] mr-3 ml-5 md:ml-0'>
          <p className="block text-sm font-medium leading-6 text-black">Colaboradores a invitar</p>
          <UsersChecks selectedOptions={selectedUsers} setSelectedOptions={setSelectedUsers}/>
        </div>
        {startDateTime && endDateTime && (
          <div className="mt-9 flex justify-end">

            {scheduleData ? (
              <button
                onClick={handleEditMeeting}
                className="px-4 py-2 rounded text-white mt-[10px]"
                style={{ backgroundColor: secondary }}
              >
                Editar reservación
              </button>
            ) : (
              <button
                onClick={handleAddMeeting}
                className="px-4 py-2 rounded text-white mt-[10px]"
                style={{ backgroundColor: secondary }}
              >
                Registrar reservación
              </button>
            )}
          </div>
          
        )}
      </div>
    </div>
  );
};

export default ReservationForm;
