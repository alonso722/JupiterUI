import { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
interface Permissions {
    Type: number; 
}

export default function Sidebar() {
    const [permissions, setPermissions] = useState<Permissions | null>(null); 
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const storedPermissions = localStorage.getItem('permissions');
        if (storedPermissions) {
            try {
                const parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            } catch (error) {
                console.error('Error parsing permissions:', error);
                setPermissions(null); 
            }
        }
    }, []);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleCloseSidebar = () => {
        if (isExpanded) {
            setIsExpanded(false);
        }
    };

    const handleKanbanClick = () => {
        window.location.href = '/dashboard/home';
    };

    const handleTableClick = () => {
        window.location.href = '/dashboard/table'; 
    };

    const handleOrganizationsClick = () => {
        window.location.href = '/organizations'; 
    };

    const handleDepartmentsClick = () => {
        window.location.href = '/departments'; 
    };

    const handleUsersClick = () => {
        window.location.href = '/user'; 
    };

    if (permissions === null) {
        return <div>Error: No se pudieron cargar los permisos.</div>;
    }

    return (
        <div className="ml-[0px] mt-[109px] flex h-screen rounded" style={{ maxHeight: '823px' }}>
            <div onMouseLeave={handleCloseSidebar} className={`max-h-[823px] w-${isExpanded ? '200' : '20'} bg-[#f1cf2b] transition-all duration-300 mt-100 flex flex-col rounded p-2`}>
                <button type="button" onClick={handleToggleExpand} className="flex items-center ml-[0px] justify-center h-10 w-10 bg-purple hover:bg-purple-950 focus:outline-none rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                    </svg>
                </button>
                {!isExpanded && (
                    <div className="flex flex-col mt-2">
                        <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 hover:bg-purple-950 rounded" onClick={handleKanbanClick}>
                            <i className=" fa fa-columns ml-1"></i>
                        </button>
                        {permissions.Type !== 5 && (
                            <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded" onClick={handleTableClick}>
                                <i className=" fas fa-table ml-1"></i>
                            </button>
                        )}
                        {permissions.Type !== 5 && (
                            <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded" onClick={handleOrganizationsClick}>
                                <i className=" fa fa-address-book ml-1"></i>
                            </button>
                        )}
                        {permissions.Type !== 5 && (
                            <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded" onClick={handleDepartmentsClick}>
                                <i className=" fa fa-users ml-1"></i>
                            </button>
                        )}
                        {permissions.Type !== 5 && (
                            <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded" onClick={handleUsersClick}>
                                <i className="fa fa-user ml-1"></i>
                            </button>
                        )}
                    </div>
                )}
                {isExpanded && (
                    <div className="mt-[12px] ml-[10px] min-w-[200px] max-w-[200px]">
                        <div className='flex mt-[8px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleKanbanClick}>
                            <i className=" fa fa-columns ml-1"></i>
                            <p className="text-black-600 ml-[10px]">Dashboard-Kanban</p>
                        </div>
                        {permissions.Type !== 5 && (
                            <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleTableClick}>
                                <i className=" fas fa-table ml-1"></i>
                                <p className="text-black-600 ml-[10px]">Dashboard-Table</p>
                            </div>
                        )}
                        {permissions.Type !== 5 && (
                            <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleOrganizationsClick}>
                                <i className=" fa fa-address-book ml-1"></i>
                                <p className="text-black-600 ml-[10px]">Organizaciones</p>
                            </div>
                        )}
                        {permissions.Type !== 5 && (
                            <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleDepartmentsClick}>
                                <i className=" fa fa-users ml-1"></i>
                                <p className="text-black-600 ml-[10px]">Departamentos</p>
                            </div>
                        )}
                        {permissions.Type !== 5 && (
                            <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleUsersClick}>
                                <i className=" fa fa-users ml-1"></i>
                                <p className="text-black-600 ml-[10px]">Usuarios</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
