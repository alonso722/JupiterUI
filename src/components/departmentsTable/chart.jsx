import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import ReactFlow, { MiniMap, Controls } from 'react-flow-renderer';

// Estilo para los nodos
const nodeStyles = {
    border: '1px solid #222',
    padding: '10px',
    borderRadius: '5px',
    background: '#F1CF2B',
};

// Dimensiones y espaciado
const NODE_WIDTH = 150;
const NODE_HEIGHT = 60;
const HORIZONTAL_SPACING = 300; // Espaciado horizontal entre nodos
const VERTICAL_SPACING = 120; // Espaciado vertical entre niveles (ajustado)

const DepartmentsChart = ({ onClose }) => {
    const api = useApi();
    const [data, setData] = useState([]);
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

    const getNodesAndEdges = (hierarchy) => {
        const nodes = [];
        const edges = [];
        let nodeIdCounter = 0;

        const createNodes = (node, parent = null, level = 0) => {
            const nodeId = `node-${nodeIdCounter++}`; // Crear un ID único
            const yPosition = level * VERTICAL_SPACING; // Espaciado vertical por nivel

            // Calcular la posición horizontal
            let xPosition;
            if (parent) {
                const siblings = parent.children.length;
                const index = parent.children.findIndex(child => child.department === node.department);
                xPosition = (index - (siblings - 1) / 2) * HORIZONTAL_SPACING; // Centrar en relación a su padre
            } else {
                xPosition = 0; // El nodo raíz en el centro
            }

            nodes.push({
                id: nodeId,
                data: { label: `${node.department}\nManager: ${node.manager || 'N/A'}` },
                position: { x: xPosition, y: yPosition },
                style: nodeStyles,
            });

            if (parent) {
                edges.push({ id: `${parent.id}-${nodeId}`, source: parent.id, target: nodeId, type: 'smoothstep' });
            }

            // Recorrer los hijos
            node.children.forEach((child) => {
                createNodes(child, { id: nodeId, children: node.children }, level + 1); // Pasar el nodo padre a los hijos
            });
        };

        // Crear nodos raíz
        hierarchy.forEach((root) => {
            createNodes(root); // Comenzar en nivel 0
        });

        return { nodes, edges };
    };

    const { nodes, edges } = getNodesAndEdges(data);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[70%] h-[70%] relative z-50">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold text-black hover:text-gray-700 z-50">
                    &times;
                </button>
                <div className='overflow-auto pb-6' style={{ height: '70vh' }}>
                    <ReactFlow nodes={nodes} edges={edges} fitView>
                        <MiniMap />
                        <Controls />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsChart;
