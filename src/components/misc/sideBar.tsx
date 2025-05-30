import { useState, useEffect } from 'react';
import { MdOutlineHome, MdOutlineInventory2, MdOutlineComputer } from "react-icons/md";
import { ImOffice } from "react-icons/im";
import { FaUsers, FaBuilding, FaBars } from "react-icons/fa";
import { BiCloudUpload } from "react-icons/bi";
import { FaListCheck } from "react-icons/fa6";
import { useColors } from '@/services/colorService';
import { RiFolderUserLine, RiArchiveDrawerLine } from "react-icons/ri";
import { IoLocationOutline } from "react-icons/io5";
import { AiOutlineFileText } from 'react-icons/ai';


interface Permissions {
    Type: number;
    isRh: number;
}
interface Workflows {
    coordinator: number;
}

export default function Sidebar() {
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [workflows, setWorkflows] = useState<Workflows | null>(null);
    const [hasRooms, setHasRooms] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);
    const [showInventorySubmenu, setShowInventorySubmenu] = useState(false);
    const [showLocationSubmenu, setShowLocationSubmenu] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

    const storedRooms = localStorage.getItem('rooms');
    if (storedRooms) {
        try {
            const parsedRooms = JSON.parse(storedRooms);
            const hasValidRooms = Array.isArray(parsedRooms) && parsedRooms.length > 0;
            setHasRooms(hasValidRooms);
        } catch (error) {
            console.error('Error parsing rooms:', error);
            setHasRooms(false);
        }
    } else {
        setHasRooms(false);
    }

        setCurrentPath(window.location.pathname);
    }, []);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
        setShowReportsSubmenu(false);
    };

    const handleNavigation = (path: string) => {
        if (path === '/dashboard/kanban' && permissions?.Type === 5) {
            path = '/dashboard/home';
        }
        window.location.href = path;
    };

    const navItems = [
        { path: '/dashboard/home', icon: MdOutlineHome, label: 'Inicio', condition: true },
        { path: '/dashboard/kanban', icon: BiCloudUpload, label: 'Procesos', condition: true },
        { path: '/dashboard/table', icon: FaListCheck, label: 'Tabla de procesos', condition: permissions?.Type === 1 || permissions?.Type === 6 || workflows?.coordinator !== 0 },
        { path: '/organizations', icon: FaBuilding, label: 'Organizaciones', condition: permissions?.Type === 6 },
        { path: '/departments', icon: ImOffice, label: 'Departamentos', condition: permissions?.Type === 1 || permissions?.Type === 6 },
        { path: '/HHRR', icon: RiFolderUserLine, label: 'Capital Humano', condition: permissions?.Type === 1 || permissions?.Type === 6 || permissions?.isRh === 1 },
        { path: '/reports', icon: RiArchiveDrawerLine, label: 'Reportes', condition: permissions?.Type === 1 || permissions?.Type === 6 || permissions?.isRh === 1, isReport: true },
        { path: '/locations', icon: IoLocationOutline, label: 'Ubicaciones',  condition: permissions?.Type === 1 || permissions?.Type === 6 || permissions?.isRh === 1 || hasRooms === true, isLocation: true },
        { path: '/inventory', icon: MdOutlineInventory2, label: 'Inventario', condition: permissions?.Type === 1 || permissions?.Type === 6, isInventory: true },
        { path: '/permissions', icon: AiOutlineFileText, label: 'Permisos', condition: permissions?.Type === 1 || permissions?.Type === 6 || permissions?.isRh === 1 },
        { path: '/user', icon: FaUsers, label: 'Usuarios', condition: true }
    ];

    if (permissions === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ml-[0px] md:mt-[68px] flex h-full rounded fixed z-[100] md:max-h-[91%] bg-transparent md:bg-white">
            <div
                onMouseLeave={() => {
                    if (isExpanded) setShowReportsSubmenu(false);
                    setIsExpanded(false);
                }}
                className={`transition-all duration-300 flex flex-col md:border-r-4 md:border-b-4 ${isExpanded ? 'text-white w-200' : 'w-20'}`}
                style={{ backgroundColor: isExpanded ? secondary : 'transparent' }}
            >
                <button type="button" onClick={handleToggleExpand} className="flex ml-[15px] md:ml-[25px] mt-[28px] md:mt-[35px] focus:outline-none rounded">
                    <FaBars size={15} color={primary} />
                </button>

                {!isExpanded && (
                    <div className="flex flex-col mt-[18px] w-[0px] md:w-20">
                        {navItems.map((item, index) => {
                            if (!item.condition) return null;
                            return (
                                <button
                                    key={index}
                                    title={item.label}
                                    type="button"
                                    className="flex py-[15px] items-center justify-center hover:bg-opacity-75"
                                    style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }}
                                    onClick={() => {
                                        if (item.isReport) {
                                            setShowReportsSubmenu(!showReportsSubmenu);
                                            setShowLocationSubmenu(false);
                                            setShowInventorySubmenu(false);
                                        } else if (item.isInventory) {
                                            setShowInventorySubmenu(!showInventorySubmenu);
                                            setShowLocationSubmenu(false);
                                            setShowReportsSubmenu(false);
                                        } else if (item.isLocation) {
                                            setShowLocationSubmenu(!showLocationSubmenu);
                                            setShowReportsSubmenu(false);
                                            setShowInventorySubmenu(false);
                                        } else {
                                            handleNavigation(item.path);
                                        }
                                    }}
                                >
                                    <item.icon size={24} />
                                </button>
                            );
                        })}
                        {showReportsSubmenu && (
                            <div
                                className="absolute left-full ml-2 mt-[290px] bg-white shadow-lg border rounded-lg p-2 z-50"
                                style={{ backgroundColor: secondary }}
                            >
                                {[
                                    { label: 'Asistencia', path: '/reports' },
                                    { label: 'Retardos', path: '/tardinessReports' },
                                    { label: 'Ausencias', path: '/absenceReports' }
                                ].map((sub, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        style={{
                                            backgroundColor: hoveredIndex === idx ? primary : 'transparent',
                                            color: hoveredIndex === idx ? 'white' : 'inherit'
                                        }}
                                        className="block text-sm text-gray-800 px-2 py-1 text-left w-full rounded"
                                        onClick={() => {
                                            setShowReportsSubmenu(false);
                                            handleNavigation(sub.path);
                                        }}
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showLocationSubmenu && (
                            <div
                                className="absolute left-full ml-2 mt-[320px] bg-white shadow-lg border rounded-lg p-2 z-50"
                                style={{ backgroundColor: secondary }}
                            >
                                {[
                                    { label: 'Corporativos', path: '/locations', condition: permissions?.Type === 1 || permissions?.Type === 6 || permissions?.isRh === 1, },
                                    { label: 'Reservación de salas', path: '/reservations', condition: hasRooms === true, }
                                ].map((sub, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        style={{
                                            backgroundColor: hoveredIndex === idx ? primary : 'transparent',
                                            color: hoveredIndex === idx ? 'white' : 'inherit'
                                        }}
                                        className="block text-sm text-gray-800 px-2 py-1 text-left w-full rounded"
                                        onClick={() => {
                                            setShowLocationSubmenu(false);
                                            handleNavigation(sub.path);
                                        }}
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showInventorySubmenu && (
                            <div
                                className="absolute left-full ml-2 mt-[360px] bg-white shadow-lg border rounded-lg p-2 z-50"
                                style={{ backgroundColor: secondary }}
                            >
                                {[
                                    { label: 'Inventario', path: '/inventory' },
                                    { label: 'Equipo Asignado', path: '/inventory/assigned' }
                                ].map((sub, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        style={{
                                            backgroundColor: hoveredIndex === idx ? primary : 'transparent',
                                            color: hoveredIndex === idx ? 'white' : 'inherit'
                                        }}
                                        className="block text-sm text-gray-800 px-2 py-1 text-left w-full rounded"
                                        onClick={() => {
                                            setShowInventorySubmenu(false);
                                            handleNavigation(sub.path);
                                        }}
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {isExpanded && (
                    <div className="ml-[0px] min-w-[200px] max-w-[200px]">
                        {navItems.map((item, index) => {
                            if (!item.condition) return null;

                            if (item.isReport) {
                                return (
                                    <div key={index} className="relative">
                                        <div
                                            className={`relative flex items-center pl-[30px] mt-[27px] hover:bg-opacity-75 cursor-pointer`}
                                            onClick={() => {
                                                setShowReportsSubmenu(!showReportsSubmenu)
                                                setShowLocationSubmenu(false);
                                                setShowInventorySubmenu(false);}}
                                            style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }}
                                        >
                                            <item.icon size={24} />
                                            <p className={`ml-[10px] ${currentPath === item.path ? 'text-white' : ''}`}>{item.label}</p>
                                        </div>
                                        {showReportsSubmenu && (
                                            <div className="ml-[60px] mt-2 flex flex-col gap-2">
                                                {[
                                                    { label: 'Asistencia', path: '/reports' },
                                                    { label: 'Retardos', path: '/tardinessReports' },
                                                    { label: 'Ausencias', path: '/absenceReports' }
                                                ].map((sub, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="text-sm text-left hover:underline text-gray-700"
                                                        onClick={() => handleNavigation(sub.path)}
                                                    >
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (item.isLocation) {
                                return (
                                    <div key={index} className="relative">
                                        <div
                                            className={`relative flex items-center pl-[30px] mt-[27px] hover:bg-opacity-75 cursor-pointer`}
                                            onClick={() => {
                                                setShowLocationSubmenu(!showLocationSubmenu)
                                                setShowReportsSubmenu(false);
                                                setShowInventorySubmenu(false);
                                            }}
                                            style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }}
                                        >
                                            <item.icon size={24} />
                                            <p className={`ml-[10px] ${currentPath === item.path ? 'text-white' : ''}`}>{item.label}</p>
                                        </div>
                                        {showLocationSubmenu && (
                                            <div className="ml-[60px] mt-2 flex flex-col gap-2">
                                                {[
                                                    { label: 'Corporativos', path: '/locations' },
                                                    { label: 'Reservacion de salas', path: '/reservations' }
                                                ].map((sub, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="text-sm text-left hover:underline text-gray-700"
                                                        onClick={() => handleNavigation(sub.path)}
                                                    >
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            
                            if (item.isInventory) {
                                return (
                                    <div key={index} className="relative">
                                        <div
                                            className={`relative flex items-center pl-[30px] mt-[27px] hover:bg-opacity-75 cursor-pointer`}
                                            onClick={() => {
                                                setShowInventorySubmenu(!showInventorySubmenu)
                                                setShowLocationSubmenu(false);
                                                setShowReportsSubmenu(false);}}
                                            style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }}
                                        >
                                            <item.icon size={24} />
                                            <p className={`ml-[10px] ${currentPath === item.path ? 'text-white' : ''}`}>{item.label}</p>
                                        </div>
                                        {showInventorySubmenu && (
                                            <div className="ml-[60px] mt-2 flex flex-col gap-2">
                                                {[
                                                    { label: 'Inventario', path: '/inventory' },
                                                    { label: 'Equipo Asignado', path: '/inventory/assigned' }
                                                ].map((sub, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="text-sm text-left hover:underline text-gray-700"
                                                        onClick={() => handleNavigation(sub.path)}
                                                    >
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={index}
                                    className={`relative flex items-center pl-[30px] mt-[27px] hover:bg-opacity-75 cursor-pointer`}
                                    onClick={() => handleNavigation(item.path)}
                                    style={{ backgroundColor: currentPath === item.path ? primary : 'transparent', color: currentPath === item.path ? secondary : primary }}
                                >
                                    <item.icon size={24} />
                                    <p className={`ml-[10px] ${currentPath === item.path ? 'text-white' : ''}`}>{item.label}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                    V 3.19.21
                </div>
            </div>
        </div>
    );
}
