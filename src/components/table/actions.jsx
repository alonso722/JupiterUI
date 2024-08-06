import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import Details from '../details/details';
import useApi from '@/hooks/useApi';

const Actions = ({ onActionClick, rowData, onClose }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const api = useApi();
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            const parsedPermissions = JSON.parse(storedPermissions);
            console.log(parsedPermissions)
            setPermissions(parsedPermissions);
        }
    }, []); 

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleEditClick = () => {
        onActionClick(rowData.id, rowData.status, rowData.process);
        handleCardClick({ name: rowData.process, id: rowData.id, column: rowData.status });
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        api.post('/user/process/delete', { process: rowData.id })
            .then((response) => {
                onClose(); 
            })
            .catch((error) => {
                console.error("Error borrando proceso:", error);
            });
           
        setIsDeleteModalOpen(false); 
        onClose();
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
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
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute right-0 z-10 mt-1 w-[154px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                {permissions.Type === 1 || permissions.Type === 2 || permissions.Type === 6 ? (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className={`flex pl-[20px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                <Image
                                                    className="mr-[30px]"
                                                    src="/icons/pencil.svg"
                                                    alt="Logo de Paypal"
                                                    width={17}
                                                    height={18} />
                                                <button
                                                    type="submit"
                                                    className="bg-transparent"
                                                    onClick={handleEditClick}>
                                                    Editar
                                                </button>
                                            </div>
                                        )}
                                    </Menu.Item>
                                ) : null}
                                {permissions.Type === 1 || permissions.Type === 2 || permissions.Type === 6 ? (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className={`flex pl-[20px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                <Image
                                                    className="mr-[30px]"
                                                    src="/icons/trash.svg"
                                                    alt="Logo de Paypal"
                                                    width={17}
                                                    height={18} />
                                                <button
                                                    type="submit"
                                                    className="bg-transparent"
                                                    onClick={handleDeleteClick}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </Menu.Item>
                                ) : null}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
            {isModalOpen && selectedCard && (
                <Details card={selectedCard} onClose={handleCloseModal} />
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] h-[150px] relative flex flex-col justify-center items-center">
                        <h1 className="mb-[20px] text-center text-black">¿Estás seguro de que deseas eliminar este proceso?</h1>
                        <div className="flex justify-between w-full px-8">
                        <button className="bg-[#2C1C47] text-white p-3 rounded-lg flex-grow mx-4" onClick={handleConfirmDelete}>Confirmar</button>
                        <button className="bg-[#E6E8EC]  text-[#2C1C47] p-3 rounded-lg flex-grow mx-4" onClick={handleCancelDelete}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Actions;
