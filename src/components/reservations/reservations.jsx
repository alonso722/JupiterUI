import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import Search from "@/components/table/search";
import { Button } from "@/components/form/button";
import { colors } from "@/components/types/enums/colors";
import ReservationForm from "@/components/forms/addReservation";
import AddMeetingRoomForm from "@/components/forms/addMeetingRoom";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useColors } from '@/services/colorService';

import { CiEdit, CiSaveDown2 } from "react-icons/ci";
import { FaRegTrashAlt } from "react-icons/fa";


const Reservations = () => {
  const columnHelper = createColumnHelper();
  const api = useApi();
  const [locations, setLocations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [meetingRoomsByLocation, setMeetingRoomsByLocation] = useState({});
  const [refreshTable, setRefreshTable] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [roomData, setRoomData] = useState("");
  const [scheduleData, setScheduleData] = useState("");
  const [deletingRoom, setDeletingRoom] = useState("");
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const effectMounted = useRef(false);
  const { primary, secondary } = useColors();
  const [permissions, setPermissions] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchData = async () => {
    let parsedPermissions;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      parsedPermissions = JSON.parse(storedPermissions);
      setPermissions(parsedPermissions);
    }
    const organization = parsedPermissions.Organization;
    const uuid = parsedPermissions.uuid;

    try {
      const [locationsRes, schedulesRes] = await Promise.all([
        api.post('/user/location/fetch', { organization }),
        api.get(`/user/schedules/fetch/${organization}`)
      ]);

      const fetchedLocations = locationsRes.data.map(item => ({
        id: item.id,
        name: item.name,
        longitude: item.longitude,
        latitude: item.latitude,
        object: item.object
      }));
      setLocations(fetchedLocations);
      setSchedules(schedulesRes.data);
      setRefreshTable(false);

      const meetingRoomsData = {};
      await Promise.all(fetchedLocations.map(async (location) => {
        try {
          const res = await api.get(`/user/meetingRoom/getMeetingRooms/${location.id}/${uuid}`);
          meetingRoomsData[location.id] = res.data;
        } catch (error) {
          console.error(`Error al obtener salas para location ${location.id}`, error);
          meetingRoomsData[location.id] = [];
        }
      }));
      setMeetingRoomsByLocation(meetingRoomsData);

    } catch (error) {
      console.error("Error al consultar información:", error);
    }
  };

  useEffect(() => {
    if (!effectMounted.current) {
      fetchData();
      effectMounted.current = true;
    }
  }, [locations]);

  useEffect(() => {
    if (refreshTable) {
      fetchData();
    }
  }, [refreshTable]);

  const router = useRouter();

  const handleButtonClick = () => setShowForm(!showForm);
  const handleMeetingClick = () => setShowMeetingForm(!showMeetingForm);
  
  const handleCloseForm = () => {
    setShowForm(false);
    setRefreshTable(true);
  };
  const handleMeetingCloseForm = () => {
    setShowMeetingForm(false);
    setRefreshTable(true);
  };

  const handleEdit = (room) =>{
    setRoomData(room)
    setShowMeetingForm(true)
  }

  const handleEditSchedule = (schedule) =>{
    setScheduleData(schedule)
    setShowForm(true)
  }

  const handleDelete = (room) =>{
    setDeletingRoom(room)
    setIsDeleteModalOpen(true);
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    api.delete(`/user/meetingRoom/delete/${deletingRoom}`, )
      .then((response) => {
        setIsDeleteModalOpen(false);
      })
      .catch((error) => {
        console.error("Error borrando proceso:", error);
      });      
      setIsDeleteModalOpen(false); 
      fetchData();
  };

  if (refreshTable) {
    return <Reservations />;
  }

  return (
    <div className="md:w-full mt-[100px] md:ml-[80px] md:py-5 px-3 md:px-10 text-white fill-gray-400 overflow-x-auto">
      <div className="flex justify-between mb-5">
        <div className="mt-[10px] md:mr-[120px]">
          <button
            className="md:w-[126px] border-2 text-[13px] rounded-lg text-white px-2 py-1"
            onClick={handleButtonClick}
            style={{ backgroundColor:  primary }}
          >
            Reservar +
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <ReservationForm locations={locations} onClose={handleCloseForm} scheduleData={scheduleData}/>
            </div>
          )}
        </div>
        {permissions.Type === 1 && (
          <div className="mt-[10px] md:mr-[120px]">
            <button
              className="md:w-[180px] border-2 text-[13px] rounded-lg text-white px-2 py-1"
              onClick={handleMeetingClick}
              style={{ backgroundColor: primary }}
            >
              Añadir sala de reuniones +
            </button>
            {showMeetingForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <AddMeetingRoomForm
                  roomData={roomData}
                  locations={locations}
                  onClose={handleMeetingCloseForm}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-[60%] overflow-y-auto pb-7">
        {locations.map((location) => {
          const meetingRooms = meetingRoomsByLocation[location.id] || [];

          return (
            <div key={location.id} className="mb-8">
              <div className=" text-white px-4 py-2 rounded-md mb-2"
                style={{ backgroundColor:  primary }}>
                <h2 className="text-md font-bold">{location.name}</h2>
              </div>

              {meetingRooms.length === 0 ? (
                <p className="text-sm text-gray-400 ml-2">No hay salas registradas para esta ubicación.</p>
              ) : (
                meetingRooms.map((room) => {
                  const today = new Date().toDateString();
                  const roomSchedules = schedules.filter(
                    (s) =>
                      s.location === location.id &&
                      s.meetingRoomName === room.name &&
                      new Date(s.start).toDateString() === today
                  );

                  return (
                    <div key={room.id} className="mb-4 ml-4">
                      <div className="flex mb-1">
                        <h3 className="text-md font-semibold border-b-2 border-white text-black mb-1">{room.name}</h3>
                            <CiEdit
                              className=" text-black ml-2 mt-1 cursor-pointer"
                              onClick={() => handleEdit(room)} style={{  color: primary }}/>
                            <FaRegTrashAlt
                              className=" text-[#E52A3A] ml-2 mt-1 cursor-pointer"
                              onClick={() => handleDelete(room.id)} style={{  color: '#E52A3A' }}/>
                      </div>
                      {roomSchedules.length > 0 ? (
                        roomSchedules.map((schedule, idx) => {
                          const start = new Date(schedule.start);
                          const end = new Date(schedule.end);

                          return (
                            <div
                              key={idx}
                              className="relative p-3 rounded shadow w-[80%] mb-2 text-sm text-black"
                              style={{ backgroundColor: secondary }}
                            >
                              <CiEdit
                                className="absolute top-2 right-2 text-black cursor-pointer"
                                onClick={() => handleEditSchedule(schedule)}
                                style={{ color: primary }}
                              />
                              <p className="text-center font-bold mb-3">{schedule.subject}</p>
                              <p><strong>Reservado por:</strong> {schedule.reserver.name} {schedule.reserver.last}</p>
                              <p><strong>Área:</strong> {schedule.department}</p>
                              <div className="flex mt-3">
                                <p className="mr-5"><strong>Inicio:</strong> {start.toLocaleString()}</p>
                                <p><strong>Fin:</strong> {end.toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">Sin reservaciones para hoy</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[150px] relative flex flex-col justify-center items-center">
            <h1 className="mb-[20px] text-center text-black">¿Estás seguro de que deseas eliminar este proceso?</h1>
            <div className="flex justify-between w-full px-8">
              <button
                className="text-white p-3 rounded-lg flex-grow mx-4"
                onClick={handleConfirmDelete}
                style={{ backgroundColor: secondary }}>
                Confirmar
              </button>
              <button className="bg-[#E6E8EC]  text-[#2C1C47] p-3 rounded-lg flex-grow mx-4" onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
