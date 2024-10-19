import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import { Tree } from 'react-d3-tree';

const nodeStyles = {
    border: '1px solid #222',
    padding: '10px',
    borderRadius: '5px',
    background: '#FFFFFF',
};

const NODE_WIDTH = 150;
const NODE_HEIGHT = 60;

const DepartmentsChart = ({ onClose }) => {
    const api = useApi();
    const [data, setData] = useState(null); 
    const [refreshTable, setRefreshTable] = useState(false);
    const effectMounted = useRef(false);

    const buildHierarchy = (departments) => {
        const map = {};
        const roots = [];

        departments.forEach((item) => {
            map[item.department] = { ...item, children: [] };
        });

        departments.forEach((item) => {
            if (item.parent) {
                if (map[item.parent]) {
                    map[item.parent].children.push(map[item.department]);
                }
            } else {
                roots.push(map[item.department]);
            }
        });

        return roots;
    };

    const fetchData = async () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
        }
        const organization = parsedPermissions?.Organization;

        try {
            const response = await api.post('/user/departments/fetch', { organization });
            const fetchedData = response.data.data;
            const hierarchy = buildHierarchy(fetchedData);
            setData(hierarchy); 
        } catch (error) {
            console.error("Error al consultar departamentos:", error);
        }
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

    if (!data) {
        return <div>Cargando...</div>; 
    }

    // Función para renderizar nodos personalizados
    const renderCustomNode = ({ node }) => (
        <div style={nodeStyles}>
            <strong style={{ color: 'red' }}>{node.department}</strong>
            {node.manager && <div style={{ color: 'red' }}>Manager: {node.manager}</div>}
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[70%] h-[70%] relative z-50">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-2xl font-bold text-red-600 hover:text-gray-700 z-50"
                >
                    &times;
                </button>
                <div className='overflow-auto pb-6' style={{ height: '70vh' }}>
                    {/* Registro de los datos mapeados */}
                    {console.log("Datos mapeados para el árbol:", JSON.stringify(data, null, 2))}
                    <Tree 
                        data={data} 
                        nodeSvgShape={{ shape: 'circle', shapeProps: { r: 10, fill: '#F1CF2B' } }} 
                        orientation="vertical"
                        renderCustomNode={renderCustomNode} // Usar la función de nodo personalizado
                    />
                </div>
            </div>
        </div>
    );
};

export default DepartmentsChart;
