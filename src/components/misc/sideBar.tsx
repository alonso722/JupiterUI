import { useState, useEffect } from 'react';
import { IoMdHome } from "react-icons/io";
import { FaColumns, FaTable, FaUsers, FaBuilding, FaSitemap, FaBars } from "react-icons/fa";
import { BsFillGrid3X2GapFill } from "react-icons/bs"; 
import { FaTableCells, FaMapLocationDot, FaListCheck } from "react-icons/fa6";
import { MdOutlineInventory } from "react-icons/md";
import { useColors } from '@/services/colorService';

interface Permissions {
    Type: number;
}
interface Workflows {
    coordinator: number;
}

export default function Sidebar() {
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [workflows, setWorkflows] = useState<Workflows | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const { primary, secondary } = useColors(); 

    useEffect(() => {
        const storedPermissions = localStorage.getItem('permissions');
        if (storedPermissions) {
            try {
                const parsedPermissions: Permissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            } catch (error) {
                console.error('Error parsing permissions:', error);
                setPermissions(null);
            }
        }

        const storedWorkflows = localStorage.getItem('workflows');
        if (storedWorkflows) {
            setWorkflows(JSON.parse(storedWorkflows));
        }

        setCurrentPath(window.location.pathname);
    }, []);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleNavigation = (path: string) => {
        if (path === '/dashboard/kanban' && permissions?.Type === 5) {
            path = '/dashboard/home';
        }
        window.location.href = path;
    };

    const navItems = [
        { path: '/dashboard/home', icon: IoMdHome, label: 'Inicio', condition: true },
        { path: '/dashboard/kanban', icon: BsFillGrid3X2GapFill, label: 'Procesos', condition: true },
        { path: '/dashboard/table', icon: FaTableCells, label: 'Tabla de procesos',  condition: permissions?.Type === 1 || permissions?.Type === 6 || workflows?.coordinator !== 0 },
        { path: '/organizations', icon: FaBuilding, label: 'Organizacioness', condition: permissions?.Type === 6 },
        { path: '/departments', icon: FaSitemap, label: 'Departmentos', condition: permissions?.Type === 1 || permissions?.Type === 6 },
        { path: '/locations', icon: FaMapLocationDot, label: 'Ubicaciones', condition: permissions?.Type === 1 || permissions?.Type === 6 },
        { path: '/inventory', icon: MdOutlineInventory, label: 'Inventario', condition: permissions?.Type === 1 || permissions?.Type === 6 },
        { path: '/inventory/assigned', icon:  FaListCheck, label: 'Equipo asignado', condition: permissions?.Type === 1 || permissions?.Type === 6 },
        { path: '/user', icon: FaUsers, label: 'Users', condition: true }
    ];

    if (permissions === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ml-[0px] mt-[68px] flex h-full rounded fixed z-[100]" style={{ maxHeight: '91%', backgroundColor: '#FFFFFF' }}>
            <div 
                onMouseLeave={() => isExpanded && setIsExpanded(false)}
                className={`transition-all duration-300 flex flex-col border-r-4 border-b-4 ${isExpanded ? 'text-white w-200' : 'w-20'}`}
                style={{ backgroundColor: isExpanded ? secondary : '#FFFFFF' }}>
                <button type="button" onClick={handleToggleExpand} className="flex ml-[25px] mt-[35px] focus:outline-none rounded">
                    <FaBars size={23} color={primary} />
                </button>
                {!isExpanded && (
                    <div className="flex flex-col mt-[18px]">
                        {navItems.map((item, index) => (
                            item.condition && (
                                <button key={index} title={item.label} type="button" className="flex py-[15px] items-center justify-center hover:bg-opacity-75" style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }} onClick={() => handleNavigation(item.path)}>
                                    <item.icon size={24} />
                                </button>
                            )
                        ))}
                    </div>
                )}
                {isExpanded && (
                    <div className="ml-[0px] min-w-[200px] max-w-[200px]">
                        {navItems.map((item, index) => (
                            item.condition && (
                                <div
                                    key={index}
                                    className={`relative flex items-center pl-[30px] mt-[27px] hover:bg-opacity-75 focus:outline-none  ${currentPath === item.path ? 'bg-[#442E69] py-[10px]' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                    style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }}
                                >
                                    <item.icon size={24} />
                                    <p className={`ml-[10px] ${currentPath === item.path ? 'text-white' : ''}`}>{item.label}</p>
                                </div>
                            )
                        ))}
                    </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                    V 2.0.0
                </div>
            </div>
        </div>
    );    
}
