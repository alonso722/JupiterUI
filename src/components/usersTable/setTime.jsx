import { useState, useEffect, useRef } from 'react';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SetTime = ({ onActionClick, rowData, onClose }) => {
    const [entrance, setEntrance] = useState('');
    const [leave, setLeave] = useState('');
    const [customDays, setCustomDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState('');
    const [useWeekdays, setUseWeekdays] = useState(false);
    const [isCustomRole, setIsCustomRole] = useState(true);
    const effectMounted = useRef(false);
    const { primary, secondary } = useColors();
    const api = useApi();

    const daysMap = {
        Monday: 'Lunes',
        Tuesday: 'Martes',
        Wednesday: 'Miércoles',
        Thursday: 'Jueves',
        Friday: 'Viernes',
        Saturday: 'Sábado',
        Sunday: 'Domingo'
    };

    const showToast = (type, message) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    const generateWeekdays = (entrance, leave) => {
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
            day,
            entrance: entrance.slice(0, 5),
            leave: leave.slice(0, 5)
        }));
    };

    const handleSwitchToCustom = () => {
        const generated = generateWeekdays(entrance, leave);
        setCustomDays(generated);
        setUseWeekdays(false);
        setIsCustomRole(true);
    };

    const handleSwitchToWeekdays = () => {
        const first = customDays.find(d =>
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(d.day)
        );
        if (first) {
            setEntrance(first.entrance);
            setLeave(first.leave);
        }
        setUseWeekdays(true);
        setIsCustomRole(false);
    };

    useEffect(() => {
        if (!effectMounted.current && rowData) {
            const allDays = rowData.days || [];

            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const weekdayEntries = allDays.filter(d => weekdays.includes(d.day));

            const hasAllWeekdays = weekdays.every(day => weekdayEntries.some(d => d.day === day));

            const allSameSchedule = weekdayEntries.every(
                d =>
                    d.entrance === weekdayEntries[0]?.entrance &&
                    d.leave === weekdayEntries[0]?.leave
            );

            if (hasAllWeekdays && allSameSchedule) {
                setUseWeekdays(true);
                setIsCustomRole(false);
                setEntrance(weekdayEntries[0].entrance.slice(0, 5));
                setLeave(weekdayEntries[0].leave.slice(0, 5));
            } else {
                setIsCustomRole(true);
                const custom = allDays.map(d => ({
                    day: d.day,
                    entrance: d.entrance.slice(0, 5),
                    leave: d.leave.slice(0, 5)
                }));
                setCustomDays(custom);
            }

            effectMounted.current = true;
        }
    }, [rowData]);

    const handleCustomDayChange = (day, type, value) => {
        setCustomDays(prev =>
            prev.map(d => d.day === day ? { ...d, [type]: value } : d)
        );
    };

    const handleAddCustomDay = () => {
        if (!selectedDay) return;
        if (customDays.find(d => d.day === selectedDay)) return;
        setCustomDays(prev => [...prev, { day: selectedDay, entrance: '08:00', leave: '17:00' }]);
        setSelectedDay('');
    };

    const handleRemoveCustomDay = (day) => {
        setCustomDays(prev => prev.filter(d => d.day !== day));
    };

    const handleConfirmTime = () => {
        if (!isCustomRole && (!entrance || !leave)) {
            showToast('error', 'Debe establecer la hora base de entrada y salida.');
            return;
        }

        const cleanTime = (timeStr) => {
            const [rawHour, rawMinute] = (timeStr || '').split(':');
            const isValidNumber = (val) => /^\d{1,2}$/.test(val);

            const hour = isValidNumber(rawHour) ? rawHour.padStart(2, '0') : '00';
            const minute = isValidNumber(rawMinute) ? rawMinute.padStart(2, '0') : '00';

            return `${hour}:${minute}`;
        };

        const time = isCustomRole
            ? customDays.map(d => ({
                day: d.day,
                entrance: cleanTime(d.entrance),
                leave: cleanTime(d.leave)
            }))
            : generateWeekdays(entrance, leave).map(d => ({
                day: d.day,
                entrance: cleanTime(d.entrance),
                leave: cleanTime(d.leave)
            }));

        const payload = {
            uuid: rowData.uuid,
            time
        };
        api.post('/user/time/setTime', payload)
            .then((response) => {
                if (response.status === 200) {
                    showToast('success', 'Se actualizó el horario laboral.');
                    onClose();
                }
            })
            .catch((error) => {
                console.error("Error al actualizar horario laboral:", error);
            });
    };

    const timeSelect = (time, onChange) => (
        <>
            <select
                className="p-2 border rounded mr-2"
                value={time.split(':')[0]}
                onChange={(e) => onChange(`${e.target.value}:${time.split(':')[1]}`)}
            >
                {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                ))}
            </select>
            <select
                className="p-2 border rounded"
                value={time.split(':')[1]}
                onChange={(e) => onChange(`${time.split(':')[0]}:${e.target.value}`)}
            >
                {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                ))}
            </select>
        </>
    );

    const orderedDays = [...customDays].sort((a, b) => {
        const weekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day);
        });


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50 px-5 md:px-0">
            <div className="w-full bg-white p-6 rounded-lg shadow-lg md:w-[500px] h-[90vh] relative overflow-y-auto">
                <h1 className="mb-4 text-black"><b>Configuración de Horario</b></h1>

                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isCustomRole}
                            onChange={() => {
                                if (!isCustomRole) {
                                    handleSwitchToCustom();
                                } else {
                                    handleSwitchToWeekdays();
                                }
                            }}
                            className="mr-2"
                        />
                        Rol distinto (establecer horario por día manualmente)
                    </label>
                </div>

                {!isCustomRole && (
                    <>
                        <h2 className="text-black text-center mb-2">Horario base (Lunes a Viernes)</h2>
                        <div className="mb-4 flex justify-center items-center w-full">
                            <span className="mr-2 text-black">Entrada:</span>
                            {timeSelect(entrance, setEntrance)}
                        </div>
                        <div className="mb-4 flex justify-center items-center w-full">
                            <span className="mr-2 text-black">Salida:</span>
                            {timeSelect(leave, setLeave)}
                        </div>
                    </>
                )}

                {isCustomRole && (
                    <>
                        <hr className="my-4" />
                        <h2 className="text-center text-black mb-2">Agregar horario por día específico</h2>

                        <div className="flex items-center mb-4">
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="p-2 border rounded flex-grow mr-2"
                            >
                                <option value="">Seleccione un día</option>
                                {daysOfWeek
                                    .filter(day => !customDays.find(d => d.day === day))
                                    .map(day => (
                                        <option key={day} value={day}>{daysMap[day]}</option>
                                    ))}
                            </select>
                            <button
                                onClick={handleAddCustomDay}
                                className="text-white px-4 py-2 rounded"
                                style={{ backgroundColor: primary || '#F1CF2B' }}
                            >
                                Agregar
                            </button>
                        </div>
                        <div className='max-h-[300px] overflow-y-auto'>
                        {orderedDays.map((d, idx) => (
                            <div key={idx} className="mb-4 border p-3 rounded bg-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <strong className="text-black">{daysMap[d.day]}</strong>
                                <button
                                onClick={() => handleRemoveCustomDay(d.day)}
                                className="bg-red-600 text-white text-sm rounded-lg border-2 py-2 px-3"
                                >
                                Quitar
                                </button>
                            </div>
                            <div className="flex items-center mb-2">
                                <span className="mr-2 text-black">Entrada:</span>
                                {timeSelect(d.entrance, (val) => handleCustomDayChange(d.day, 'entrance', val))}
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2 text-black">Salida:</span>
                                {timeSelect(d.leave, (val) => handleCustomDayChange(d.day, 'leave', val))}
                            </div>
                            </div>
                        ))}   
                        </div>
                    </>
                )}

                <div className="flex justify-between w-full px-8 mt-6">
                    <button
                        className="text-white p-3 rounded-lg flex-grow mx-4"
                        onClick={handleConfirmTime}
                        style={{ backgroundColor: secondary }}
                    >
                        Confirmar
                    </button>
                    <button
                        className="bg-[#E6E8EC] text-[#2C1C47] p-3 rounded-lg flex-grow mx-4"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetTime;
