import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 

const DepartmentsChart = ({ onClose }) => {
    const api = useApi();
    const [data, setData] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);
    const effectMounted = useRef(false);

    // Función para construir la jerarquía
    const buildHierarchy = (departments) => {
        const map = {};
        const roots = [];

        departments.forEach((item) => {
            map[item.department] = { ...item, children: [] };
        });

        departments.forEach((item) => {
            if (item.parent) {
                map[item.parent].children.push(map[item.department]);
            } else {
                roots.push(map[item.department]);
            }
        });

        return roots;
    };

    const fetchData = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
        }
        const organization = parsedPermissions.Organization;
        api.post('/user/departments/fetch', { organization })
            .then((response) => {
                const fetchedData = response.data.data;
                const hierarchy = buildHierarchy(fetchedData);
                setData(hierarchy);
                setRefreshTable(false);
            })
            .catch((error) => {
                console.error("Error al consultar departamentos:", error);
            });
    };

    useEffect(() => {
        if (!effectMounted.current) {
            fetchData();
            effectMounted.current = true;
        }
    }, []);

    useEffect(() => {
        if (refreshTable) {
            fetchData();
        }
    }, [refreshTable]);

    const renderTree = (node) => {
        return (
            <div key={node.id} className="flex flex-col items-center relative">
                <div className="bg-[#F1CF2B] text-black p-2 rounded text-center">
                    <p>{node.department}</p>
                    <p className="text-sm mt-3">Manager: {node.manager || 'N/A'}</p>
                </div>
                {node.children.length > 0 && (
                    <>
                        <div className="w-px h-5 bg-gray-400 mx-auto"></div>
                        <div className="flex justify-center relative">
                            <div className="absolute top-2 left-1 right-1 mx-[40px]  h-px bg-gray-400"></div>
                            {node.children.map((child) => (
                                <div key={child.id} className="flex flex-col items-center relative px-4">
                                    <div className="w-px h-5 pt-3 bg-gray-400 mx-auto mt-2"></div>
                                    {renderTree(child)}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };    

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[70%] h-[70%] relative  z-50">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold text-black hover:text-gray-700 z-50">
                    &times;
                </button>
                <div className='overflow-auto pb-6'>
                    <div className="text-black flex flex-col items-center mt-10">
                        {data.map((rootNode) => (
                            <div key={rootNode.id} className="flex justify-center">
                                {renderTree(rootNode)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsChart;
