import { useState } from 'react';

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);

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

    return (
        <div className="ml-[0px] mt-[100px] flex h-screen rounded" style={{ maxHeight: '823px' }}>
            <div onMouseLeave={handleCloseSidebar} className={`max-h-[823px] w-${isExpanded ? '200' : '20'} bg-[#FDD500] transition-all duration-300 mt-100 flex flex-col rounded p-2`}>
                <button type="button" onClick={handleToggleExpand} className="flex items-center ml-[0px] justify-center h-10 w-10 bg-purple hover:bg-purple-950 focus:outline-none rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                    </svg>
                </button>
                {!isExpanded && (
                    <div className="flex flex-col mt-2">
                        <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 hover:bg-purple-950 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        </button>
                        <button type="button" className="flex items-center ml-[0px] justify-center h-10 w-10 mt-2 hover:bg-purple-950 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
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
                        <div className='flex mt-[24px] hover:bg-purple-950 hover:text-white focus:outline-none mr-[10px] rounded' onClick={handleTableClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        <p className="text-black-600 ml-[10px]">Dashboard-Table</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
