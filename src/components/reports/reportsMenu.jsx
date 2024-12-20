import React, { useState, useEffect, useRef } from "react";
import { FaUserCheck, FaCalendarCheck } from "react-icons/fa6";
import useApi from "@/hooks/useApi";
import { useColors } from "@/services/colorService";

export const ReportsMenu = ({  }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedButton, setSelectedButton] = useState(0);
    const { primary, secondary } = useColors();
    const effectMounted = useRef(false);
    const api = useApi();

    useEffect(() => {
        if (effectMounted.current === false) { 
            let parsedPermissions;
            const storedPermissions = localStorage.getItem("permissions");
            const token = localStorage.getItem("token");
            if (storedPermissions) {
                parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            }
            const uuid = parsedPermissions?.uuid;
            if (uuid) {
                api.post("/user/reports/getDaily", { uuid })
                    .then((response) => {
                        const uName = response.data.name;
                        const uLast = response.data.last;
                        setName(uName);
                        setLast(uLast);
                    })
                    .catch((error) => {
                        console.error("Error al consultar nombre:", error);
                    });
            }
            effectMounted.current = true;
        }
    }, []);

    const handleButtonClick = (index) => {
        setSelectedButton(index); 
    };

    return (
        <div className="mt-[80px] ml-[110px] mr-[0px] text-neutral-50 rounded overflow-hidden">
            <p className="text-[25px] text-black my-4"><b>Reportes</b></p>
            <div className="flex w-full pl-5 mt-9">
                <div className="flex flex-col items-center justify-center mr-5">
                    <button
                        onClick={() => handleButtonClick(0)}
                        className="text-white p-5 rounded border-black border-[1px] mx-5"
                        style={{
                            backgroundColor: selectedButton === 0 ? primary : secondary,
                            color: selectedButton === 0 ? secondary : primary,
                        }}
                    >
                        <FaUserCheck
                            style={{ color: selectedButton === 0 ? secondary : primary, width: "25px", height: "28px" }}
                        />
                    </button>
                    <p className="text-black">Registros de entrada</p>
                </div>
                <div className="flex flex-col items-center justify-center mx-5">
                    <button
                        onClick={() => handleButtonClick(1)}
                        className="text-white p-5 rounded border-black border-[1px] mx-5"
                        style={{
                            backgroundColor: selectedButton === 1 ? primary : secondary,
                            color: selectedButton === 1 ? secondary : primary,
                        }}
                    >
                        <FaCalendarCheck
                            style={{ color: selectedButton === 1 ? secondary : primary, width: "25px", height: "28px" }}
                        />
                    </button>
                    <p className="text-black">Vacaciones</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsMenu;
