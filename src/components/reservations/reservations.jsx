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


const Reservations = () => {
  const columnHelper = createColumnHelper();
  const api = useApi();
  const [locations, setLocations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [meetingRoomsByLocation, setMeetingRoomsByLocation] = useState({});
  const [refreshTable, setRefreshTable] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const effectMounted = useRef(false);
  const { primary, secondary } = useColors();
  const [permissions, setPermissions] = useState({});

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
      console.log(schedulesRes.data)
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
              <ReservationForm locations={locations} onClose={handleCloseForm} />
            </div>
          )}
        </div>
        <div className="mt-[10px] md:mr-[120px]">
          <button
            className="md:w-[180px] border-2 text-[13px] rounded-lg text-white px-2 py-1"
            onClick={handleMeetingClick}
            style={{ backgroundColor:  primary }}
          >
            Añadir sala de reuniones +
          </button>
          {showMeetingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <AddMeetingRoomForm locations={locations} onClose={handleMeetingCloseForm} />
            </div>
          )}
        </div>
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
                      <h3 className="text-md font-semibold text-black mb-1">{room.name}</h3>

                      {roomSchedules.length > 0 ? (
                        roomSchedules.map((schedule, idx) => {
                          const start = new Date(schedule.start);
                          const end = new Date(schedule.end);

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded shadow w-[80%] mb-2 text-sm text-black"
                              style={{ backgroundColor: secondary }}
                            >
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
    </div>
  );
};

export default Reservations;
