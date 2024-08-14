import React, { useState, useEffect, useRef } from "react";
import { FaFire } from "react-icons/fa";
import { FiTrash, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import Details from '../details/details';
import useApi from '@/hooks/useApi';
import { permission } from "process";

export const Kanban = ({ departmentFilter, processFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [workflows, setAccess] = useState([]);
    const [cards, setCards] = useState([]);
    const effectMounted = useRef(false);
    const api= useApi();

    useEffect(() => {
        if (effectMounted.current === false) { 
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
            api.post('/user/process/fetchTab', {orga, userType, departmentFilter, processFilter, cooWorkflows})
                .then((response) => {
                    localStorage.setItem('uuid', JSON.stringify(response.data.userUUID));
                    const fetchedCards = response.data.data.map(item => ({
                        id: item.id.toString(),
                        name: item.process,
                        column: convertStatusToColumn(item.status),
                        department: item.departmentName
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
        <div 
        className="mt-[110px] ml-[100px] mr-[250px]  w-[100%] text-neutral-50 rounded ">
            <Board onCardClick={handleCardClick} cards={cards} setCards={setCards} permissions={permissions} />
            {isModalOpen && selectedCard && (
                <Details  card={selectedCard} onClose={handleCloseModal} />
            )}
        </div>
    );
};

const Board = ({ onCardClick, cards, setCards, permissions }) => {
    return (
        <div style={{  zIndex: -1, }}
        className="flex h-full w-full gap-3 pt-12 justify-between">
            <Column
                name="Edición"
                column="Edición"
                headingColor="text-[#2C1C47]"
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
            />
            <Column
                name="Revisión"
                column="Revisión"
                headingColor="text-[#2C1C47]"
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
            />
            <Column
                name="Aprobación"
                column="Aprobación"
                headingColor="text-[#2C1C47]"
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
            />
            <Column
                name="Aprobado"
                column="Aprobado"
                headingColor="text-[#2C1C47]"
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
            />
            {/* <DelBarrel setCards={setCards} /> */}
        </div>
    );
};

const Column = ({ name, headingColor, column, cards, setCards, onCardClick, permissions }) => {
    const [active, setActive] = useState(false);
    const api = useApi(); 

    const handleDragStart = (e, card) => {
        e.dataTransfer.setData("cardId", card.id);
    };

    const handleDragEnd = (e) => {
        const cardId = e.dataTransfer.getData("cardId");

        setActive(false);
        clearHighlights();

        const indicators = getIndicators();
        const { element } = getNearestIndicator(e, indicators);
        const before = element.dataset.before || "-1";
        //const uuid = localStorage.getItem('uuid');
        const uuid = permissions.uuid;

        if (before !== cardId) {
            let copy = [...cards];
            let cardToTransfer = copy.find((c) => c.id === cardId);
            if (!cardToTransfer) return;
            const oldColumn = cardToTransfer.column; 
            cardToTransfer = { ...cardToTransfer, column };

            copy = copy.filter((c) => c.id !== cardId);

            const moveToBack = before === "-1";

            if (moveToBack) {
                copy.push(cardToTransfer);
            } else {
                const insertAtIndex = copy.findIndex((el) => el.id === before);
                if (insertAtIndex === undefined) return;
                copy.splice(insertAtIndex, 0, cardToTransfer);
            }

            setCards(copy);
            let log = {};
            log.id = cardId;
            log.uuid = uuid;
            log.type = 23;
            api.post('/user/process/update', {
                id: cardId,
                newColumn: column,
                oldColumn: oldColumn,
            })
            .then( async (response) => {
                try {
                    await api.post('/user/log/setLog', log);
                  } catch (error) {
                    console.error("Error al hacer el registro:", error);
                  }
            })
            .catch((error) => {
                console.error("Error al actualizar la columna en backend:", error);
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        highlightIndicator(e);

        setActive(true);
    };

    const clearHighlights = (els) => {
        const indicators = els || getIndicators();

        indicators.forEach((i) => {
            i.style.opacity = "0";
        });
    };

    const highlightIndicator = (e) => {
        const indicators = getIndicators();

        clearHighlights(indicators);

        const el = getNearestIndicator(e, indicators);

        el.element.style.opacity = "1";
    };

    const getNearestIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50;

        const el = indicators.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();

                const offset = e.clientY - (box.top + DISTANCE_OFFSET);

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: indicators[indicators.length - 1],
            }
        );

        return el;
    };

    const getIndicators = () => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
    };

    const handleDragLeave = () => {
        clearHighlights();
        setActive(false);
    };

    const filteredCards = cards.filter((c) => c.column === column);


    return (
        <div className="w-[200px] shrink-0">
            <div style={{ position: 'sticky', zIndex: -1, }}>
                <div className="mb-3 flex items-center justify-between border-b-4">
                    <h3 className={`font-medium ${headingColor}`}>{name}</h3>
                    <span className="rounded text-sm text-[#2C1C47]">
                        {filteredCards.length}
                    </span>
                </div>
            </div>
            <div
                onDrop={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`h-[670px] overflow-auto scrollbar-hide transition-colors ${
                    active ? "bg-neutral-800/50" : "bg-neutral-800/0"
                }`}>
                {filteredCards.map((c) => {
                    return <Card key={c.id} {...c} handleDragStart={handleDragStart} onCardClick={onCardClick} permissions={permissions} />;
                })}
                <DropIndicator beforeId="-1" column={column} />
            </div>
        </div>
    );
};


const Card = ({ name, id, column, handleDragStart, onCardClick, permissions }) => {
    const canDrag = permissions.Type !== 5;
    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <motion.div
                layout
                layoutId={id}
                draggable={canDrag}
                onDragStart={(e) => handleDragStart(e, { name, id, column })}
                onClick={() => onCardClick({ name, id, column })}
                style={{ zIndex: 1 }}
                className="mt-2 cursor-grab rounded bg-[#F1CF2B] p-3 active:cursor-grabbing shadow-xl flex items-center justify-between">
                <p className="text-sm text-black truncate">
                    {name}
                </p>
                <p className="text-sm text-black">
                    ...
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