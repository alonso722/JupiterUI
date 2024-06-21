import { useState, useEffect } from 'react';

interface Permissions {
    Type: number; // Ajusta el tipo de acuerdo a la estructura real de tus permisos
    // Otros campos si los tienes
}

export default function Sidebar() {
    const [permissions, setPermissions] = useState<Permissions | null>(null); // Usa el tipo de Permissions aquí
    const [isExpanded, setIsExpanded] = useState(false);
    const storedPermissions = localStorage.getItem('permissions');
    
    useEffect(() => {
        if (storedPermissions) {
            try {
                const parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            } catch (error) {
                console.error('Error parsing permissions:', error);
                setPermissions(null); 
            }
        }
    }, [storedPermissions]);

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

    const handleDepartmentsClick = () => {
        window.location.href = '/departments'; 
    };

    if (permissions === null) {
        // Manejar el caso donde permissions no pudo ser parseado correctamente
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        </button>
                        {permissions.Type !== 5 && (
                            <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded" onClick={handleTableClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                        {permissions.Type !== 5 && (
                            <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded" onClick={handleDepartmentsClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                {isExpanded && (
                    <div className="mt-2 ml-2 min-w-[200px] max-w-[200px]">
                        <div className='flex mt-[8px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleKanbanClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            <p className="text-black-600 ml-[10px]">Dashboard-Kanban</p>
                        </div>
                        {permissions.Type !== 5 && (
                            <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleTableClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                <p className="text-black-600 ml-[10px]">Dashboard-Table</p>
                            </div>
                        )}
                        {permissions.Type !== 5 && (
                            <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleDepartmentsClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                <p className="text-black-600 ml-[10px]">Departamentos</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
