import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import AddUserForm from '../forms/addUser';
import useApi from '@/hooks/useApi';
import { toast } from 'react-toastify';

const Actions = ({ onActionClick, rowData, onClose }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecoveryOpen, setModalRecovery] = useState(false);
    const [newPass, passRecovery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const api = useApi();

    const showToast = (type, message) => {
        toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
        });
      };

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
        setSelectedCard(user);
        setModalRecovery(true);
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

    const handleCardClick = (user) => {
        setSelectedCard(user);
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
                                                        alt="Logo de Paypal"
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
                                                        alt="Logo de Paypal"
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
                                                onClick={handleDeleteClick}>
                                                <div className={`flex pl-[20px] pr-[56px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                    <Image
                                                        className="mr-[30px]"
                                                        src="/icons/trash.svg"
                                                        alt="Logo de Paypal"
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
                        <button className="bg-[#2C1C47] text-white p-3 rounded-lg flex-grow mx-4" onClick={handleConfirmDelete}>Confirmar</button>
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
                                className="bg-[#2C1C47] text-white p-3 rounded-lg flex-grow mx-4"
                                onClick={() => handleConfirmRecovery(newPass)}>
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
        </div>
    );
};

export default Actions;
