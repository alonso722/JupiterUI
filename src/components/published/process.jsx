import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Details from '../details/details';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';

export const Published = ({ departmentFilter, processFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [cards, setCards] = useState([]);
    const [workflows, setAccess] = useState([]);
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
                        description : item.description
                    }));
                    setCards(fetchedCards); 
                })
                .catch((error) => {
                    console.error("Error al consultar procesos:", error);
                });
            effectMounted.current = true;
        }
    }, []);

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
        <div className="mt-[30px] ml-[100px] mr-[250px] w-[90%] text-neutral-50 rounded ">
            <p className="text-black">Mis procesos:</p>
            <Board 
                onCardClick={handleCardClick} 
                cards={cards} 
                setCards={setCards} 
                permissions={permissions} 
                primary={primary} 
                secondary={secondary}
            />
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
        <div className="flex h-full w-full gap-3 pt-2 flex-wrap justify-center">
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

const Card = ({ name, department, date, id, description, onCardClick, permissions, primary, secondary }) => {
    return (
        <motion.div
            layout
            layoutId={id}
            onClick={() => onCardClick({ name, department, date, id })}
            className="mt-2 cursor-pointer rounded p-1 shadow-xl w-[300px] h-[300px]"
            style={{ backgroundColor: primary || '#F1CF2B' }}>
            <div className="bg-white rounded p-3 mb-3 justify-between">
                <p className="text-sm text-black text-[10px]" title={department}>
                    {typeof department === 'string' && (department.length > 40 ? department.substring(0, 40) + "..." : department)}
                </p>
                <p className="text-sm text-black text-center "title={name}>
                    {typeof name === 'string' && (name.length > 40 ? name.substring(0, 40) + "..." : name)}
                </p>
            </div>
            <div className="bg-white text-black rounded p-3 m-1 h-[70%] flex flex-col justify-between">
                <div>
                    <p>Descripción: </p>
                    <p>
                        {description ? (description.length > 150 ? `${description.slice(0, 150)}...` : description) : 'Descripción no disponible'}
                    </p>
                </div>
                <p className="text-sm text-black text-right text-[9px]">
                    Actualizado: {new Date(date).toLocaleDateString()}
                </p>
            </div>
        </motion.div>
    );
};

export default Published;
