import React, { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} custom-next-arrow`}
            style={{ ...style, display: "block", right: "0px", zIndex: 1 }}
            onClick={onClick}
        />
    );
};

const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} custom-prev-arrow`}
            style={{ ...style, display: "block", left: "0px", zIndex: 1 }}
            onClick={onClick}
        />
    );
};

export const ECarousel = ({ }) => {
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
    
            const valuesArray = JSON.parse(data.values);
    
            const fetchedCards = [
                { id: 1, title: "Historia", description: data.history },
                { id: 2, title: "Misión", description: data.mision },
                { id: 3, title: "Visión", description: data.vision },
                {
                    id: 4,
                    title: "Valores",
                    description: (
                        <span className="p-4">
                            {Array.isArray(valuesArray) && valuesArray.length > 0 ? (
                                valuesArray.map((value, index) => (
                                    <span key={`value-${index}`} className="mr-4">
                                        {index > 0 && <span> • </span>}
                                        {value}
                                    </span>
                                ))
                            ) : (
                                <span>No hay valores disponibles</span>
                            )}
                        </span>
                    )
                }                                                         
            ];
            setCards(fetchedCards);
        })
        .catch((error) => {
            console.error("Error al consultar información:", error);
        });
    
    }, []);

    const settings = {
        dots: true,
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
        <div className="mt-[90px] ml-[100px] mr-[250px] w-[90%] text-neutral-50 rounded ">
            <Slider {...settings} className="w-full">
                {cards && cards.length > 0 ? (
                    cards.map((card) => (
                        <div key={card.id} className="text-black">
                            <div
                                className="rounded-lg shadow-lg p-6 text-black"
                                style={{ backgroundColor: primary }}
                            >
                                <h3 className="text-lg font-bold black">{card.title}</h3>
                                <p className="text-sm mt-2 text-gray-black">{card.description}</p>
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
