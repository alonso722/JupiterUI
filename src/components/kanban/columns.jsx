import React, { useState, useEffect, useRef } from "react";
import { FaFire } from "react-icons/fa";
import { FiTrash, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import Details from '../details/details';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';
import { permission } from "process";

export const Kanban = ({ departmentFilter, processFilter, processIdNot }) => {
    const effectMounted = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [workflows, setAccess] = useState([]);
    const [cards, setCards] = useState([]);
    const api = useApi();
    const { primary, secondary } = useColors();

    const fetchData = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions');
        const token = localStorage.getItem('token');
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }

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
        const userType = parsedPermissions;
        const orga = parsedPermissions.Organization;
        userType.token = token;
        api.post('/user/process/fetchTab', { orga, userType, departmentFilter, processFilter, cooWorkflows })
            .then((response) => {
                localStorage.setItem('uuid', JSON.stringify(response.data.userUUID));
                const fetchedCards = response.data.data.map(item => ({
                    id: item.id.toString(),
                    name: item.process,
                    column: convertStatusToColumn(item.status),
                    department: item.departmentName,
                    version: item.version
                }));
                setCards(fetchedCards); 
            })
            .catch((error) => {
                console.error("Error al consultar procesos:", error);
            });
    };

    useEffect(() => {
        if (!effectMounted.current) {
            fetchData(); 
            if(processIdNot?.id){
                handleCardClick(processIdNot)
            }
            effectMounted.current = true;
        }
    }, [departmentFilter, processFilter]); 

    const convertStatusToColumn = (status) => {
        switch (status) {
            case '1':
                return 'Edición';
            case '2':
                return 'Revisión';
            case '3':
                return 'Aprobación';
            case '4':
                return 'Aprobado';
            case '5':
                return 'Historico';
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
        fetchData(); 
    };

    return (
        <div className="mt-[110px] md:ml-[150px] px-5 md:px-0 md:mr-[250px] text-neutral-50 rounded overflow-x-auto">
            <Board 
                onCardClick={handleCardClick} 
                cards={cards} 
                setCards={setCards} 
                permissions={permissions} 
                primary={primary} 
                secondary={secondary}
            />
            {isModalOpen && selectedCard && (
                <Details card={selectedCard} onClose={handleCloseModal} />
            )}
        </div>
    );
};

const Board = ({ onCardClick, cards, setCards, permissions, primary, secondary }) => {
    return (
        <div style={{  zIndex: -1, }}
        className="flex h-full gap-3 pt-12 justify-between overflow-x-auto">
            <Column
                name="Edición"
                column="Edición"
                headingColor={secondary}
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
                primary={primary} 
                secondary={secondary}
            />
            <Column
                name="Revisión"
                column="Revisión"
                headingColor={secondary}
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
                primary={primary} 
                secondary={secondary}
            />
            <Column
                name="Aprobación"
                column="Aprobación"
                headingColor={secondary}
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
                primary={primary} 
                secondary={secondary}
            />
            <Column
                name="Aprobado"
                column="Aprobado"
                headingColor={secondary}
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
                primary={primary} 
                secondary={secondary}
            />
            {(permissions.Type === 1 || permissions.Type === 6) && (
                <Column
                    name="Historico"
                    column="Historico"
                    headingColor={secondary}
                    cards={cards}
                    setCards={setCards}
                    onCardClick={onCardClick}
                    permissions={permissions}
                    primary={primary}
                    secondary={secondary}
                />
            )}
        </div>
    );
};

const Column = ({ name, headingColor, column, cards, setCards, onCardClick, permissions, primary, secondary }) => {
    const [active, setActive] = useState(false);
    const api = useApi(); 

    const clearHighlights = (els) => {
        const indicators = els || getIndicators();

        indicators.forEach((i) => {
            i.style.opacity = "0";
        });
    };

    const getIndicators = () => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
    };

    const filteredCards = cards.filter((c) => c.column === column);

    return (
        <div className="w-[200px] shrink-0">
            <div style={{ position: 'sticky', zIndex: -1, }}>
                <div className="mb-3 flex items-center justify-between border-b-4">
                <h3 className="font-medium" style={{ color: headingColor || '#2C1C47' }}>{name}</h3>
                    <span className="rounded text-sm text-[#2C1C47]">
                        {filteredCards.length}
                    </span>
                </div>
            </div>
            <div
                className={`h-[670px] overflow-auto scrollbar-hide transition-colors ${
                    active ? "bg-neutral-800/50" : "bg-neutral-800/0"
                }`}>
                {filteredCards.map((c) => {
                    return <Card key={c.id} {...c} 
                    onCardClick={onCardClick} 
                    permissions={permissions}
                    primary={primary} 
                    secondary={secondary} />;
                })}
                <DropIndicator beforeId="-1" column={column} />
            </div>
        </div>
    );
};

const Card = ({ name, id, column, version, handleDragStart, onCardClick, permissions, primary, secondary }) => {
    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <motion.div
                layout
                layoutId={id}
                onClick={() => onCardClick({ name, id, column })}
                style={{ 
                    backgroundColor: primary,
                    position: 'relative',
                }}
                className="mt-2 cursor-pointer rounded py-4 px-3 pb-3 shadow-xl items-center justify-between"
            >
            {version && (
                <span className="px-1 text-[9px] font-semibold text-white rounded-full"
                style={{ 
                    backgroundColor: secondary,
                    position: 'absolute',
                    top: '5px',
                    right: '5px'
                }}>
                    v{version}
                </span>
            )}
            <p className="text-sm text-black truncate">
                {name}
            </p>
            </motion.div>
        </>
    );
};


const DropIndicator = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0 ">
        </div>
    );
};

export default Kanban;