'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import Image from 'next/image';
import { useColors } from '@/services/colorService';
import useApi from '@/hooks/useApi';

moment.locale('es');

export default function MeetingRoomPlanner({ locations, schedules }) {
  const currentWeek = useMemo(() => {
    const startOfWeek = moment().startOf('isoWeek');
    return Array.from({ length: 7 }, (_, i) => moment(startOfWeek).clone().add(i, 'days'));
  }, []);
  const [permissions, setPermissions] = useState([]);
  const api = useApi();
  const [logoUrl, setLogoUrl] = useState('');
  const effectMounted = useRef(false);
  const { primary, secondary } = useColors();
  const hoursRange = Array.from({ length: 11 }, (_, i) => i + 8);
  const roomCombinations = useMemo(() => {
    const map = new Map();
    schedules.forEach(sch => {
      const key = `${sch.location}-${sch.room}`;
      if (!map.has(key)) {
        map.set(key, {
          location: sch.location,
          room: sch.room,
          meetingRoomName: sch.meetingRoomName,
          locationName: locations.find(loc => loc.id === sch.location)?.name || 'Ubicación desconocida',
        });
      }
    });
    return Array.from(map.values());
  }, [schedules, locations]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!effectMounted.current) {
      const storedPermissions = localStorage.getItem('permissions');
      if (storedPermissions) {
        const parsedPermissions = JSON.parse(storedPermissions);
        setPermissions(parsedPermissions);

        const uuid = parsedPermissions.uuid;
        const orga = parsedPermissions.Organization;

        api.post('/user/organization/getLogo', { orga })
          .then(async (response) => {
            const imageData = response.data.data[0].buffer;
            if (imageData) {
              const url = `${process.env.NEXT_PUBLIC_MS_FILES}/api/v1/file?f=${imageData}`;
              try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("No se pudo cargar la imagen");
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setLogoUrl(objectUrl);
              } catch (error) {
                console.error("Error al cargar la imagen:", error);
                setLogoUrl(null);
              }
            }
          })
          .catch((error) => {
            console.error("Error al consultar logo:", error);
          });
      }
      effectMounted.current = true;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % roomCombinations.length);
    }, 60000); 

    return () => clearInterval(interval);
  }, [roomCombinations.length]);
  const currentRoom = roomCombinations[currentIndex];
  const filteredEvents = useMemo(() => {
    if (!currentRoom) return [];
    return schedules
      .filter(sch => sch.location === currentRoom.location && sch.room === currentRoom.room)
      .map(e => ({
        ...e,
        start: moment(e.start),
        end: moment(e.end),
      }));
  }, [currentRoom, schedules]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between pr-9">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agenda de Salas</h1>
          {currentRoom && (
            <div className="text-lg font-semibold text-gray-700">
              {currentRoom.locationName} &mdash; {currentRoom.meetingRoomName}
            </div>
          )}  
        </div>
        <div className="flex items-center pb-2 pt-5 ml-5">
          <div className="relative w-[100px] md:w-[200px] h-[40px]">
            <Image
              src={logoUrl || '/logos/Lg_JIso.svg'}
              alt="Logo"
              fill
              className="object-contain ml-[20px]"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <div className="grid grid-cols-[80px_repeat(7,minmax(150px,1fr))]">
          <div style={{ backgroundColor: secondary }} className="border-r border-b p-2 text-sm font-medium text-center">
            Hora
          </div>
          {currentWeek.map(day => (
            <div
              key={day.format('YYYY-MM-DD')}
              style={{ backgroundColor: secondary }}
              className="border-r border-b p-2 text-sm font-medium text-center"
            >
              {day.format('ddd DD/MM')}
            </div>
          ))}
          {hoursRange.map((hour, rowIndex) => {
            const hasEventAtHour = currentWeek.some(day =>
              filteredEvents.some(ev =>
                ev.start.isSame(day, 'day') && ev.start.hour() === hour
              )
            );
            const cellHeightClass = hasEventAtHour ? 'h-16' : 'h-6';
            return (
              <React.Fragment key={hour}>
                <div className={`border-r border-b text-sm text-center p-1 ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'} ${cellHeightClass}`}>
                  {hour}:00
                </div>
                {currentWeek.map(day => {
                  const event = filteredEvents.find(ev =>
                    ev.start.isSame(day, 'day') && ev.start.hour() === hour
                  );
                  return (
                    <div
                      key={`${day.format('YYYY-MM-DD')}-${hour}`}
                      className={`relative border-r border-b p-1 transition-all duration-200 ease-in-out hover:bg-blue-100 ${cellHeightClass} ${
                        event ? 'text-white rounded shadow-md' : (rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                      }`}
                      style={{ backgroundColor: event ? primary : 'white' }}
                      title={event ? `${event.subject || 'Sin asunto'} - ${event.reserver?.name || ''} ${event.reserver?.last || ''}`.trim() : ''}
                    >
                      {event ? (
                        <>
                          <div className="truncate text-xs font-semibold">{event.subject || 'Sin asunto'}</div>
                          <div className="truncate text-xs">{`${event.reserver?.name || ''} ${event.reserver?.last || ''}`.trim()}</div>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
