import React, { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = ({ onClick }) => {
    return (
        <button
            className="hidden md:block custom-next-arrow bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
            onClick={onClick}
        >
            &gt;
        </button>
    );
};

const PrevArrow = ({ onClick }) => {
    return (
        <button
            className="hidden md:block custom-prev-arrow bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
            onClick={onClick}
        >
            &lt;
        </button>
    );
};

export const ECarousel = () => {
    const [cards, setCards] = useState([]);
    const { primary, secondary } = useColors();
    const api = useApi();
    const sliderRef = useRef(null); 

    useEffect(() => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions');
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
        }

        const orga = parsedPermissions?.Organization;

        api.post('/user/organization/fetchInfo', { orga })
            .then((response) => {
                const data = response.data;
                let valuesArray = [];
                if (data.values) {
                    valuesArray = JSON.parse(data.values);
                }
                const fetchedCards = [
                    { id: 1, title: "Historia", description: data.history },
                    { id: 2, title: "Misión", description: data.mision },
                    { id: 3, title: "Visión", description: data.vision },
                ];
                if (valuesArray.length > 0) {
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
        // nextArrow: <NextArrow onClick={() => sliderRef.current.slickNext()} />,
        // prevArrow: <PrevArrow onClick={() => sliderRef.current.slickPrev()} />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false, 
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true, 
                }
            }
        ]
    };

    return (
        <div className="mt-[30px] md:ml-[45px] md:pr-[45px] md:px-9 text-neutral-50 rounded mb-5">
            <Slider ref={sliderRef} {...settings}>
                {cards && cards.length > 0 ? (
                    cards.map((card) => (
                        <div key={card.id} className="text-black p-3 pb-7">
                            <div className="rounded-lg md:ml-[10px] border-2 overflow-y-auto max-h-[150px] p-6 text-black shadow-xl">
                                <p className="text-lg font-bold black">{card.title}</p>
                                <span className="text-sm my-2 text-gray-black whitespace-pre-wrap">{card.description}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay tarjetas disponibles</p>
                )}
            </Slider>
            {/* Flechas colocadas fuera del carrusel */}
            <NextArrow onClick={() => sliderRef.current.slickNext()} />
            <PrevArrow onClick={() => sliderRef.current.slickPrev()} />
        </div>
    );
};

export default ECarousel;
