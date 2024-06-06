import React, { useState, useEffect, useRef } from "react";
import { FaFire } from "react-icons/fa";
import { FiTrash, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import Details from '../details/details';
import useApi from '@/hooks/useApi';

export const Kanban = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [permissions, setPermissions] = useState([]);
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
            const userType = parsedPermissions;
            userType.token = token;
            api.post('/user/process/fetchTab', {userType})
                .then((response) => {
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
                return 'Edicion';
            case '2':
                return 'Revision';
            case '3':
                return 'Aprobacion';
            case '4':
                return 'Aprobado';
            default:
                return 'Edicion';
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
        <div className="mt-[100px] ml-[50px] h-[624px] w-[1600px] text-neutral-50 rounded shadow-2xl shadow-violet-950">
            <Board onCardClick={handleCardClick} cards={cards} setCards={setCards} permissions={permissions} />
            {isModalOpen && selectedCard && (
                <Details card={selectedCard} onClose={handleCloseModal} />
            )}
        </div>
    );
};

const Board = ({ onCardClick, cards, setCards, permissions }) => {
    return (
        <div className="flex h-full w-full gap-3 p-12 justify-between">
            <Column
                name="Edición"
                column="Edicion"
                headingColor="text-[#2C1C47]"
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
            />
            <Column
                name="Revisión"
                column="Revision"
                headingColor="text-[#2C1C47]"
                cards={cards}
                setCards={setCards}
                onCardClick={onCardClick}
                permissions={permissions}
            />
            <Column
                name="Aprobación"
                column="Aprobacion"
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

            api.post('/user/process/update', {
                id: cardId,
                newColumn: column,
                oldColumn: oldColumn,
            })
            .then((response) => {
                console.log("Columna actualizada en backend:", response.data);
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
        <div className="w-56 shrink-0 overflow-y-auto scrollbar-hide">
            <div className="mb-3 flex items-center justify-between">
                <h3 className={`font-medium ${headingColor}`}>{name}</h3>
                <span className="rounded text-sm text-[#2C1C47]">
                    {filteredCards.length}
                </span>
            </div>
            <div
                onDrop={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`h-full w-full transition-colors ${
                    active ? "bg-neutral-800/50" : "bg-neutral-800/0"
                }`}>
                {filteredCards.map((c) => {
                    return <Card key={c.id} {...c} handleDragStart={handleDragStart} onCardClick={onCardClick} />;
                })}
                <DropIndicator beforeId="-1" column={column} />
                {/* <AddCard column={column} setCards={setCards} permissions={permissions} /> */}
            </div>
        </div>
        
    );
};


const Card = ({ name, id, column, handleDragStart, onCardClick }) => {
    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <motion.div
                layout
                layoutId={id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, { name, id, column })}
                onClick={() => onCardClick({ name, id, column })}
                className="cursor-grab rounded border border-neutral-700 bg-[#2C1C47] p-3 active:cursor-grabbing">
                <p className="text-sm text-neutral-50">
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
            className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0">
        </div>
    );
};

const DelBarrel = ({ setCards }) => {
    const [active, setActive] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setActive(true);
    };

    const handleDragLeave = () => {
        setActive(false);
    };

    const handleDragEnd = (e) => {
        const cardId = e.dataTransfer.getData("cardId");

        setCards((pv) => pv.filter((c) => c.id !== cardId));

        setActive(false);
    };

    return (
        <div
            onDrop={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
                active
                    ? "border-red-800 bg-red-800/20 text-red-500"
                    : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
            }`}>
            {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
        </div>
    );
};

// const AddCard = ({ column, setCards, permissions }) => {
//     const [text, setText] = useState("");
//     const [adding, setAdding] = useState(false);
//     const api = useApi();

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         if (!text.trim().length) return;

//         const tempId = Date.now().toString();  

//         const newCard = {
//             column,
//             name: text.trim(),
//             id: tempId,  
//         };

//         setCards((prevCards) => [...prevCards, newCard]); 
        
//         api.post('/user/process/add', newCard)
//             .then((response) => {

//             })
//             .catch((error) => {
//                 console.error("Error al añadir:", error);
//             });

//         //setCards((pv) => [...pv, newCard]);

//         setAdding(false);
//     };

//     return (
//         <>
//             {permissions.Create === 1 && ( 
//                 <>
//                     {adding ? (
//                         <motion.form onSubmit={handleSubmit}>
//                             <input
//                                 onChange={(e) => setText(e.target.value)}
//                                 autoFocus
//                                 placeholder="Añadir proceso..."
//                                 className="w-full rounded border border-violet-400 bg-violet-800/10 p-3 text-sm text-[#2C1C47] placeholder-violet-300 focus:outline-0"/>
//                             <div className="mt-1 flex items=center justify-end gap-1.5">
//                                 <button
//                                     onClick={() => setAdding(false)}
//                                     className="px-3 py-1 text-xs text-[#2C1C47] transition-colors">
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="flex items-center gap-1.5 rounded bg-[#FDD500] px-3 py-1 text-xs text-[#2C1C47] transition-colors">
//                                     <span>Añadir</span>
//                                     <FiPlus />
//                                 </button>
//                             </div>
//                         </motion.form>
//                     ) : (
//                         <motion.button
//                             layout
//                             onClick={() => setAdding(true)}
//                             className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-[#2C1C47] transition-colors hover:text-[#2C1C47]">
//                             <span>Añadir proceso</span>
//                             <FiPlus />
//                         </motion.button>
//                     )}
//                 </>
//             )}
//         </>
//     );
// };

export default Kanban;
