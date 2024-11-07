import { Fragment, useState, useEffect, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import AddUserForm from '../forms/addUser';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useColors } from '@/services/colorService';

const Actions = ({ onActionClick, rowData, onClose }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedCard, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecoveryOpen, setModalRecovery] = useState(false);
    const [isTimeOpen, setModalTime] = useState(false);
    const [newPass, passRecovery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entrance, setEntrance] = useState('');
    const [leave, setLeave] = useState('');
    const effectMounted = useRef(false);
    const { primary, secondary } = useColors();
    const api = useApi();

    const showToast = (type, message) => {
        toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
        });
      };

      useEffect(() => {
        if (!effectMounted.current) {
            if (rowData && rowData.time) {
                if (rowData.time.entrance) {
                    setEntrance(rowData.time.entrance.slice(0, 5)); 
                }
                if (rowData.time.leave) {
                    setLeave(rowData.time.leave.slice(0, 5)); 
                }
            }
            effectMounted.current = true;
        }
    }, [rowData]);

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleEditClick = () => {
        onActionClick(rowData);
        handleCardClick({rowData});
    };

    const handlePassClick = () => {
        passRecovery()
        onActionClick(rowData);
        handlePassModal({rowData});
    };
    
    const handlePassModal = (user) => {
        setSelectedUser(user);
        setModalRecovery(true);
    };

    const handleTimeClick = () => {
        passRecovery()
        onActionClick(rowData);
        handleTimeModal({rowData});
    };

    const handleTimeModal = (user) => {
        setSelectedUser(user);
        setModalTime(true);
    };

    const generateTimestamp = (time) => {
        const currentDate = new Date().toISOString().split('T')[0];
        return `${currentDate} ${time}:00`;
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmRecovery = (newPass) => {
        let user ={};
        user.uuid = rowData.uuid;
        user.pass = newPass;
        api.post('/user/users/recovery', user )
            .then((response) => {
                if (response.status == 200){
                    showToast('success','Se actualizó la contraseña.');
                onClose(); 
            }
            })
            .catch((error) => {
                console.error("Error al actualizar contraseña:", error);
            });
    };

    const handleConfirmTime = (newPass) => {
        if(!entrance){
            showToast('error','Establezca la hora de entrada.');
        }
        if(!leave){
            showToast('error','Establezca la hora de salida.');
        }
        let time ={};
        time.uuid = rowData.uuid;
        time.entrance = entrance;
        time.leave = leave;
        api.post('/user/time/setTime', time )
            .then((response) => {
                if (response.status == 200){
                    showToast('success','Se actualizó el horario laboral.');
                onClose(); 
                }
            })
            .catch((error) => {
                console.error("Error al actualizar horario laboral:", error);
            });
    };

    const handleConfirmDelete = () => {
        api.post('/user/users/del', { uuid: rowData.uuid })
            .then((response) => {
                onClose(); 
            })
            .catch((error) => {
                console.error("Error al borrar departamento:", error);
            });
           
        setIsDeleteModalOpen(false); 
        onClose();
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
    };

    const handleCancelRecovery = () => {
        setModalRecovery(false);
    };

    const handleCancelTime = () => {
        setModalTime(false);
    };

    const handleCardClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        onClose();
        setIsModalOpen(false);
    };

    return (
        <div className="flex h-11 w-[20px] flex-row items-center">
            <div className="font-semibold text-[14px] text-darkJupiter">
                <div>
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="w-[20px] max-w-[20px] flex justify-center" onClick={handleMenuClick}>
                                <svg
                                    width="20"
                                    height="24"
                                    fill="none"
                                    stroke="currentColor"
                                    className="feather feather-more-vertical">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95">
                            <Menu.Items className="absolute right-0 z-10 mt-1 w-[154px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                type="submit"
                                                className="bg-transparent"
                                                onClick={handleEditClick}>
                                                <div className={`flex pl-[20px] pr-[56px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                    <Image
                                                        className="mr-[30px]"
                                                        src="/icons/pencil.svg"
                                                        alt="image"
                                                        width={17}
                                                        height={18} />                                                    
                                                        Editar                                                    
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                type="submit"
                                                className="bg-transparent"
                                                onClick={handlePassClick}>
                                                <div className={`flex pl-[20px] pr-[45px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                    <Image
                                                        className="mr-[20px]"
                                                        src="/icons/pencil.svg"
                                                        alt="image"
                                                        width={17}
                                                        height={18} />                                                    
                                                        Cambiar contraseña                                                    
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                type="submit"
                                                className="bg-transparent"
                                                onClick={handleTimeClick}>
                                                <div className={`flex pl-[20px] pr-[45px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                    <Image
                                                        className="mr-[20px]"
                                                        src="/icons/pencil.svg"
                                                        alt="image"
                                                        width={17}
                                                        height={18} />                                                    
                                                        Establecer horario                                                   
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                type="submit"
                                                className="bg-transparent"
                                                onClick={handleDeleteClick}>
                                                <div className={`flex pl-[20px] pr-[56px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                    <Image
                                                        className="mr-[30px]"
                                                        src="/icons/trash.svg"
                                                        alt="image"
                                                        width={17}
                                                        height={18} />                                                                                                        Eliminar                                                
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
            {isModalOpen && selectedCard && (
                <AddUserForm user={selectedCard} onClose={handleCloseModal} rowData={rowData} /> 
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[150px] relative flex flex-col justify-center items-center">
                        <h1 className="mb-[20px] text-center text-black">¿Estás seguro de que deseas eliminar el usuario?</h1>
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
            {isRecoveryOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[200px] relative flex flex-col justify-center items-center">
                        <h1 className="mb-[20px] text-center text-black">Introduza la nueva contraseña</h1>
                        <input
                            
                            placeholder="Nueva contraseña"
                            className="mb-4 p-2 border rounded w-[80%]"
                            value={newPass || ''}
                            onChange={(e) => passRecovery(e.target.value)}/>
                        <div className="flex justify-between w-full px-8">
                            <button
                                className="text-white p-3 rounded-lg flex-grow mx-4"
                                onClick={() => handleConfirmRecovery(newPass)}
                                style={{ backgroundColor: secondary }}>
                                Confirmar
                            </button>
                            <button
                                className="bg-[#E6E8EC]  text-[#2C1C47] p-3 rounded-lg flex-grow mx-4"
                                onClick={handleCancelRecovery}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isTimeOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[300px] relative flex flex-col justify-center items-center">
                    <h1 className="mb-4 text-center text-black">Seleccione las horas de entrada y salida</h1>
                    <div className="mb-4 flex justify-center items-center w-[80%]">
                        <span className="mr-2 text-black">Entrada:</span>
                        <select
                            className="p-2 border rounded mr-2"
                            value={entrance.split(':')[0] || ''}
                            onChange={(e) => setEntrance(`${e.target.value}:${entrance.split(':')[1] || '00'}`)}
                        >
                            <option value="" disabled>Hora</option>
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                        <select
                            className="p-2 border rounded ml-2"
                            value={entrance.split(':')[1] || ''}
                            onChange={(e) => setEntrance(`${entrance.split(':')[0] || '00'}:${e.target.value}`)}
                        >
                            <option value="" disabled>Minuto</option>
                            {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4 flex justify-center items-center w-[80%]">
                        <span className="mr-2 text-black">Salida:</span>
                        <select
                            className="p-2 border rounded mr-2"
                            value={leave.split(':')[0] || ''}
                            onChange={(e) => setLeave(`${e.target.value}:${leave.split(':')[1] || '00'}`)}
                        >
                            <option value="" disabled>Hora</option>
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                        <select
                            className="p-2 border rounded ml-2"
                            value={leave.split(':')[1] || ''}
                            onChange={(e) => setLeave(`${leave.split(':')[0] || '00'}:${e.target.value}`)}>
                            <option value="" disabled>Minuto</option>
                            {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between w-full px-8">
                        <button
                            className="text-white p-3 rounded-lg flex-grow mx-4"
                            onClick={() => handleConfirmTime({
                                entranceTimestamp: generateTimestamp(entrance),
                                leaveTimestamp: generateTimestamp(leave)
                            })}
                            style={{ backgroundColor: secondary }}>
                            Confirmar
                        </button>
                        <button
                            className="bg-[#E6E8EC] text-[#2C1C47] p-3 rounded-lg flex-grow mx-4"
                            onClick={handleCancelTime}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default Actions;
