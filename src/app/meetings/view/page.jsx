'use client';
import MeetingRoomPlanner from '@/components/reservations/planner';
import { useEffect, useState, useRef } from 'react';
import useApi from '@/hooks/useApi';

export default function MeetingsPage() {
  const api = useApi();
  const [locations, setRooms] = useState(null);
  const [schedules, setSchedules] = useState(null);
  const [loading, setLoading] = useState(true);
  const effectMounted = useRef(false);

  useEffect(() => {
    if (!effectMounted.current) {
      const fetchData = async () => {
        const storedPermissions = localStorage.getItem('permissions');
        if (!storedPermissions) return;

        const parsedPermissions = JSON.parse(storedPermissions);
        const organization = parsedPermissions?.Organization;

        if (!organization) return;

        try {
          const [locationsRes, schedulesRes] = await Promise.all([
            api.post('/user/location/fetch', { organization }),
            api.get(`/user/schedules/fetch/${organization}`)
          ]);
          setRooms(locationsRes.data);
          setSchedules(schedulesRes.data);
        } catch (error) {
          console.error('Error al obtener salas u horarios:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
      effectMounted.current = true;
    }
  }, [api]);

  const isReady = Array.isArray(locations) && locations.length > 0 && Array.isArray(schedules) && schedules.length > 0;

  return (
    <div className="p-4">
      {!loading && isReady ? (
        <MeetingRoomPlanner locations={locations} schedules={schedules} />
      ) : (
        <p className="text-gray-500">Cargando datos de salas...</p>
      )}
    </div>
  );
}
