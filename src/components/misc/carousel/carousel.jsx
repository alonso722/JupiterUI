import React, { useState, useEffect } from "react";
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = (props) => {
    const { onClick } = props;
    return (
        <button
            className="custom-next-arrow bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
            style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
            onClick={onClick}
        >
            &gt;
        </button>
    );
};

const PrevArrow = (props) => {
    const { onClick } = props;
    return (
        <button
            className="custom-prev-arrow bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
            style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
            onClick={onClick}
        >
            &lt;
        </button>
    );
};

export const ECarousel = () => {
    const [cards, setCards] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const { primary, secondary } = useColors();
    const api = useApi();

    useEffect(() => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions');
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }

        const orga = parsedPermissions.Organization;

        api.post('/user/organization/fetchInfo', { orga })
        .then((response) => {
            const data = response.data;
            let valuesArray = [];
            if(data.values){
                valuesArray = JSON.parse(data.values);
            }
            const fetchedCards = [
                { id: 1, title: "Historia", description: data.history },
                { id: 2, title: "Misión", description: data.mision },
                { id: 3, title: "Visión", description: data.vision },
            ];
            if(valuesArray.length > 0){
            valuesArray.forEach((valueObj, index) => {
                fetchedCards.push({
                    id: 4 + index,
                    title: valueObj.value, 
                    description: valueObj.description 
                });
            });   
            }                
            setCards(fetchedCards);
        })
        .catch((error) => {
            console.error("Error al consultar información:", error);
        });
    
    }, []);

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 20000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <div className="mt-[30px]  ml-[45px] text-neutral-50 rounded">
            <Slider {...settings} className="">
                {cards && cards.length > 0 ? (
                    cards.map((card) => (
                        <div key={card.id} className="text-black p-3">
                            <div className="rounded-lg ml-[10px] border-2 overflow-y-auto max-h-[150px] p-6 text-black shadow-xl">
                                <h3 className="text-lg font-bold black">{card.title}</h3>
                                <span className="text-sm my-2 text-gray-black whitespace-pre-wrap">{card.description}</span>      
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay tarjetas disponibles</p>
                )}
            </Slider>
        </div>
    );
};

export default ECarousel;
