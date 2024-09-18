import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { SketchPicker } from 'react-color';
import useApi from '@/hooks/useApi';

export const Settings = ({ initialColor = "#007bff" }) => { 
    const [permissions, setPermissions] = useState([]);
    const [info, setInfo] = useState({});
    const [color, setColor] = useState(initialColor); 
    const effectMounted = useRef(false);
    const api = useApi();

    const showToast = (type, message) => {
        toast[type](message, {
          position: 'top-center',
          autoClose: 2000,
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                let parsedPermissions;
                const storedPermissions = localStorage.getItem('permissions');
                if (storedPermissions) {
                    parsedPermissions = JSON.parse(storedPermissions);
                    console.log(parsedPermissions)
                    setPermissions(parsedPermissions);
                }
                const profileResponse = await api.post('/user/organization/getSets', parsedPermissions);
                console.log(profileResponse.data.data);
                setInfo(profileResponse.data, parsedPermissions);
            } catch (error) {
                console.error("Error al consultar los perfiles:", error);
            }
        };
        fetchData();
    }, []);
    

    const handleColorChange = (newColor) => {
        setColor(newColor.hex); 
        showToast('info', `Color seleccionado: ${newColor.hex}`);
    };

    return (
        <div className="mt-[60px] ml-[100px] mr-[250px] w-[100%] text-neutral-50 rounded ">
            <div className="mt-8 text-black">
                <div className="mb-5">
                    <h1 className="text-black text-xl mb-5">
                        <strong>Personalización</strong>
                    </h1>
                </div>
                <div className="mb-5">
                    <h2 className="text-lg mb-3">Selecciona un color:</h2>
                    <SketchPicker 
                        color={color} 
                        onChangeComplete={handleColorChange} 
                    />
                </div>
                <div className="mt-5">
                    <p>Color seleccionado: <span className="font-bold">{color}</span></p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
