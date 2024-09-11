import { useState, useEffect } from 'react';
import Image from 'next/image';

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
        let parsedWorkflows;
        const storedWorkflows = localStorage.getItem('workflows');
        if (storedWorkflows) {
          parsedWorkflows = JSON.parse(storedWorkflows);
          setWorkflows(parsedWorkflows);
        }

        setCurrentPath(window.location.pathname);
    }, []);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleCloseSidebar = () => {
        if (isExpanded) {
            setIsExpanded(false);
        }
    };

    const handleNavigation = (path: string) => {
        if (path === '/dashboard/home' && permissions?.Type === 5) {
            path = '/dashboard/consultor';
        }
        window.location.href = path;
    };

    const getIconSize = (icon: string) => {
        switch (icon) {
            case 'menu.svg':
            case 'menuB.svg':
                return { width: 23, height: 14 };
            case 'kanban.svg':
            case 'kanbanS.svg':
            case 'kanbanB.svg':
                return { width: 18, height: 16 }; 
            case 'table.svg':
            case 'tableS.svg':
            case 'tableB.svg':
                return { width: 17, height: 14 }; 
            case 'orgas.svg':
            case 'orgasS.svg':
            case 'orgasB.svg':
                return { width: 20, height: 20 }; 
            case 'departments.svg':
            case 'departmentsS.svg':
            case 'departmentsB.svg':
                return { width: 20, height: 18 }; 
            case 'users.svg':
            case 'usersS.svg':
            case 'usersB.svg':
                return { width: 24, height: 15 }; 
            default:
                return { width: 24, height: 24 }; 
        }
    };

    const navItems = [
        { path: '/dashboard/home', icon: 'kanban.svg', label: 'Kanban', condition: true },
        { path: '/dashboard/table', icon: 'table.svg', label: 'Table', condition: permissions?.Type !== 5 && workflows?.coordinator !== 0 },
        { path: '/organizations', icon: 'orgas.svg', label: 'Organizations', condition: permissions?.Type === 6 },
        { path: '/departments', icon: 'departments.svg', label: 'Departments', condition: permissions?.Type === 1 || permissions?.Type === 6 },
        { path: '/user', icon: 'users.svg', label: 'Users', condition: true }
    ];

    if (permissions === null) {
        return <div>ECargando...</div>;
    }

    return (
        <div className="ml-[0px] mt-[68px] flex h-screen rounded fixed z-50 bg-white bg-opacity-[100%]" style={{ maxHeight: '823px' }}>
            <div 
                onMouseLeave={handleCloseSidebar} 
                className={`max-h-[815px] transition-all duration-300 mt-100 flex flex-col border-r-4 border-b-4 ${isExpanded ? 'bg-[#2C1C47] text-white w-200' : 'w-20'}`}>
                <button type="button" onClick={handleToggleExpand} className="flex ml-[25px]  mt-[35px] bg-purple focus:outline-none rounded">
                    <Image src={`/icons/${isExpanded ? 'menuB.svg' : 'menu.svg'}`} alt="Menu" width={23} height={14} />
                </button>
                {!isExpanded && (
                    <div className="flex flex-col mt-[18px]">
                        {navItems.map((item, index) => (
                            item.condition && (
                                <button key={index} type="button" className="flex py-[15px] items-center ml-[0px] justify-center hover:bg-[#442E69]" onClick={() => handleNavigation(item.path)}>
                                    <Image src={`/icons/${currentPath === item.path ? item.icon.replace('.svg', 'S.svg') : item.icon}`} alt={item.label} width={getIconSize(currentPath === item.path ? item.icon.replace('.svg', 'S.svg') : item.icon).width} height={getIconSize(currentPath === item.path ? item.icon.replace('.svg', 'S.svg') : item.icon).height} />
                                </button>
                            )
                        ))}
                    </div>
                )}
                {isExpanded && (
                    <div className=" ml-[0px] min-w-[200px] max-w-[200px] ">
                        {navItems.map((item, index) => (
                            item.condition && (
                                <div 
                                    key={index} 
                                    className={`relative flex items-center pl-[30px] mt-[27px] hover:bg-purple-950 hover:text-white focus:outline-none rounded ${currentPath === item.path ? 'bg-[#442E69] py-[10px]' : ''}`}
                                    onClick={() => handleNavigation(item.path)}>
                                    <Image src={`/icons/${currentPath === item.path ? item.icon.replace('.svg', 'S.svg') : isExpanded ? item.icon.replace('.svg', 'B.svg') : item.icon}`} alt={item.label} width={getIconSize(currentPath === item.path ? item.icon.replace('.svg', 'S.svg') : isExpanded ? item.icon.replace('.svg', 'B.svg') : item.icon).width} height={getIconSize(currentPath === item.path ? item.icon.replace('.svg', 'S.svg') : isExpanded ? item.icon.replace('.svg', 'B.svg') : item.icon).height} />
                                    <p className={`ml-[10px] ${currentPath === item.path && isExpanded ? 'text-white' : ''}`}>{item.label}</p>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
