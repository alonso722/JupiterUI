import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Details from '../details/details';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';
import ECarousel from '@/components/misc/carousel/carousel.jsx';

import Calendar from '@/components/misc/calendar/calendar';
import SimpleCalendar from '@/components/misc/calendar/simple';
import { version } from "os";

export const Published = ({ departmentFilter, processFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [cards, setCards] = useState([]);
    const [workflows, setAccess] = useState([]);
    const [name, setName] = useState('');
    const [last, setLast] = useState('');
    const { primary, secondary } = useColors();
    const effectMounted = useRef(false);
    const api = useApi();

    useEffect(() => {
        if (effectMounted.current === false) { 
            let parsedPermissions;
            const storedPermissions = localStorage.getItem('permissions');
            const token = localStorage.getItem('token');
            if (storedPermissions) {
                parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            }
            const uuid = parsedPermissions.uuid;
            api.post('/user/users/getNameById', {uuid})
                .then((response) => {
                    const uName = response.data.name;
                    const uLast = response.data.last;
                    setName(uName);
                    setLast(uLast);
                })
                .catch((error) => {
                  console.error("Error al consultar nombre:", error);
                });

            const userType = parsedPermissions;
        
            let parsedAccess;
            const storedAccess = localStorage.getItem('workflows');
            if (storedAccess) {
                parsedAccess = JSON.parse(storedAccess);
                setAccess(parsedAccess);
            }
            let cooWorkflows = [
                ...parsedAccess.revisorOf,
                ...parsedAccess.aprobatorOf,
                ...parsedAccess.editorOf,
                ...parsedAccess.consultorOf
            ];

            const orga = parsedPermissions.Organization;
            userType.token = token;
            api.post('/user/process/fetchTab', {orga, userType, departmentFilter, processFilter, cooWorkflows})
                .then((response) => {
                    localStorage.setItem('uuid', JSON.stringify(response.data.userUUID));
                    const fetchedCards = response.data.data.map(item => ({
                        id: item.id.toString(),
                        name: item.process,
                        column: convertStatusToColumn(item.status),
                        department: item.departmentName,
                        date: item.updated,
                        description: item.description,
                        version: item.version
                    }));
                    setCards(fetchedCards); 
                })
                .catch((error) => {
                    console.error("Error al consultar procesos:", error);
                });
            effectMounted.current = true;
        }
    }, [api]);

    const convertStatusToColumn = (status) => {
        switch(status) {
            case '1':
                return 'Edición';
            case '2':
                return 'Revisión';
            case '3':
                return 'Aprobación';
            case '4':
                return 'Aprobado';
            default:
                return 'Edición';
        }
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCard(null);
    };

    return (
        <div className="md:flex text-black mt-[50px] w-full px-5 md:px-0">
            <div>
                <div className="flex text-black align-start text-[22px] md:text-[20px] md:mt-2 pt-5">
                    <p className="mt-5 md:ml-[100px]"><b>¡Bienvenido de vuelta, {name}!</b></p>
                    <div className="md:hidden  md:mt-0 ml-5">
                        <Calendar className="md:absolute " /> 
                    </div>
                </div>
                <div className="flex-1 md:mr-5 mt-3 md:ml-[100px] md:mt-0 md:absolute  left-0 right-0 md:max-w-[70%]"> 
                    <ECarousel />
                </div>
                <div className="md:ml-[150px]">
                    <Board
                        onCardClick={handleCardClick} 
                        cards={cards} 
                        setCards={setCards} 
                        permissions={permissions} 
                        primary={primary} 
                        secondary={secondary}/>
                </div>
            </div>
            <div className='mt-[30px] ml-[6%] hidden md:block'>
                <Calendar/>
            </div>
            
            {isModalOpen && selectedCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Details card={selectedCard} onClose={handleCloseModal} />
                </div>
            )}
        </div>
    );      
};

const Board = ({ onCardClick, cards, setCards, permissions, primary, secondary }) => {
    const approvedCards = cards.filter(card => card.column === 'Aprobado');

    return (
        <div className="flex w-[100%] border-t-4 md:mt-[220px] pt-2 flex-wrap justify-center">
            {approvedCards.map((card) => (
                <Card
                    key={card.id}
                    {...card}
                    onCardClick={onCardClick}
                    permissions={permissions}
                    primary={primary} 
                    secondary={secondary}
                />
            ))}
        </div>
    );
};

const Card = ({ name, department, date, id, description, onCardClick, version }) => {
    return (
        <motion.div
            layout
            layoutId={id}
            onClick={() => onCardClick({ name, department, date, id })}
            className="my-2 mx-2 cursor-pointer rounded-lg p-1 shadow-xl w-[300px] h-[300px]">
            <div className="flex bg-white border-b-2 p-3 mx-3 justify-between">
                <p className="text-[10px] text-black max-w-[27%]" title={department}>
                    {typeof department === 'string' && (department.length > 25 ? department.substring(0, 25) + "..." : department)}
                </p>
                <p className="text-[12px] text-black text-center" title={name}>
                    {typeof name === 'string' && (name.length > 25 ? name.substring(0, 25) + "..." : name)}
                </p>
            </div>
            <div className="bg-white text-black rounded p-3 m-1 h-[70%] flex flex-col justify-between ">
                <div>
                    <p>Descripción: </p>
                    <p>
                        {description ? (description.length > 150 ? description.slice(0, 150) + "..." : description) : 'Descripción no disponible'}
                    </p>
                </div>
                <div className="flex justify-between">
                    <p className="text-gray text-[11px]">v.{version}</p>
                    <p className="text-sm text-black text-right text-[9px] justify-between">
                        Actualizado: {new Date(date).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </motion.div>
    );      
};

export default Published;
