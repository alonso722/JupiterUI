import { useState, useEffect, useRef } from "react";
import { useColors } from '@/services/colorService';
import Details from './details';
import useApi from '@/hooks/useApi';

const DepartmentsChart = ({ onClose }) => {
    const api = useApi();
    const [data, setData] = useState(null);
    const effectMounted = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedCard] = useState(null);
    const { primary, secondary } = useColors();

    const handleDepartmentClick = (department) => {
        setSelectedCard(department);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCard(null);
    };

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

    const formatChartData = (hierarchy) => {
        const data = [
            ['Department', 'Parent', 'Size', { role: 'tooltip', type: 'string', p: { html: true } }],
        ];

        const parseHierarchy = (nodes) => {
            nodes.forEach((node) => {
                const tooltip = node.manager ? `Manager: ${node.manager}` : '';
                const htmlContent = `
                    <div style="text-align: center;">
                        <div style="font-weight: bold;">${node.department}</div>
                        ${node.manager ? `<div style="font-size: 12px; color: #FFFFFF;">${node.manager}</div>` : ''}
                    </div>
                `;

                data.push([
                    { v: node.department, f: htmlContent },
                    node.parent || null,
                    1,
                    tooltip
                ]);

                if (node.children && node.children.length > 0) {
                    parseHierarchy(node.children);
                }
            });
        };

        parseHierarchy(hierarchy);
        return data;
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
            const formattedData = formatChartData(hierarchy);
            setData(formattedData);
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
        if (data) {
            const script = document.createElement('script');
            script.src = "https://www.gstatic.com/charts/loader.js";
            script.onload = () => {
                const google = window.google;
                google.charts.load('current', { packages: ['orgchart'] });
                google.charts.setOnLoadCallback(() => {
                    const chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
                    const dataTable = google.visualization.arrayToDataTable(data);

                    const options = {
                        allowHtml: true,
                        nodeClass: 'org-chart-node'
                    };

                    chart.draw(dataTable, options);

                    const nodes = document.querySelectorAll('.org-chart-node');
                    nodes.forEach(node => {
                        node.style.backgroundColor = primary;
                        node.style.borderRadius = '7px';
                        node.style.borderColor = "#FFFFFF";
                        node.style.padding = '5px';
                        node.style.cursor = 'pointer';
                        node.style.minWidth = '200px';  
                        node.style.Height = '200px';
                    });

                    const lines = document.querySelectorAll('tr > td > table > tbody > tr:first-child > td > div');
                    lines.forEach(line => {
                        line.style.borderTop = `2px solid ${secondary}`;
                    });

                    google.visualization.events.addListener(chart, 'select', () => {
                        const selection = chart.getSelection();
                        if (selection.length > 0) {
                            const selectedItem = selection[0];
                            const rowIndex = selectedItem.row;
                            const clickedNodeData = dataTable.getValue(rowIndex, 0);
                            handleDepartmentClick(clickedNodeData);
                            getSelection(null)
                        }
                    });
                });
            };
            document.body.appendChild(script);
        }
    }, [data, primary, secondary]);

    if (!data) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[70%] h-[70%] relative z-50 overflow-auto">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-2xl font-bold text-black hover:text-gray-700 z-50"
                >
                    &times;
                </button>
                <div
                    id="chart_div"
                    className="w-full h-full overflow-auto p-5"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                ></div>
            </div>
            {isModalOpen && selectedDepartment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Details department={selectedDepartment} onClose={handleCloseModal} />
                </div>
            )}
        </div>
    );
};

export default DepartmentsChart;
