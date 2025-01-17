import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    getSortedRowModel,
} from "@tanstack/react-table";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useEffect, useRef } from "react";
import useApi from '@/hooks/useApi';
import Search from "@/components/table/search";
import Actions from "./actions";
import { Button } from "@/components/form/button"; 
import { colors } from "@/components/types/enums/colors"; 
import AddUserForm from "@/components/forms/addUser"; 
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { useColors } from '@/services/colorService';

const UsersTable = () => {
    const columnHelper = createColumnHelper();
    const api = useApi();
    const [permissions, setPermissions] = useState([]);
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const effectMounted = useRef(false);
    const { primary, secondary } = useColors();
    const handleActionClick = (id, status) => {

    };
    const [toggleOn, setToggleOn] = useState(false); 

    const handleToggleChange = () => {
        const newToggleState = !toggleOn;
        setToggleOn(newToggleState);
        if (newToggleState) {
            fetchIns();  
        } else {
            fetchData(); 
        }
    };
    
    const fetchData = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }
        const organization = parsedPermissions.Organization;
        api.post('/user/users/fetch', { organization })
            .then((response) => {
                const fetchedData = response.data.data.map(item => {
                    let entrance = '';
                    let leave = '';
                    if (item.time) {
                        const entranceDate = new Date(item.time.entrance);
                        const leaveDate = new Date(item.time.leave);
                        entrance = entranceDate.getUTCHours().toString().padStart(2, '0') + ':' + entranceDate.getUTCMinutes().toString().padStart(2, '0');
                        leave = leaveDate.getUTCHours().toString().padStart(2, '0') + ':' + leaveDate.getUTCMinutes().toString().padStart(2, '0');
    
                        if (leaveDate < entranceDate) {
                            leaveDate.setDate(leaveDate.getDate() + 1); 
                            leave = leaveDate.getUTCHours().toString().padStart(2, '0') + ':' + leaveDate.getUTCMinutes().toString().padStart(2, '0');
                        }
                    }
                    return {
                        uuid: item.uuid,
                        name: item.name,
                        last: item.last,
                        department: item.department_name,   
                        mail: item.mail,
                        phone: item.phone,
                        time: {
                            entrance,
                            leave 
                        }
                    };
                });
                setData(fetchedData);
                setRefreshTable(false);
            })
            .catch((error) => {
                console.error("Error al consultar usuarios:", error);
            });
    };
    
    
    const fetchIns = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }
        const organization = parsedPermissions.Organization;
        api.post('/user/users/fetchIns', { organization })
            .then((response) => {
                const fetchedData = response.data.data.map(item => {
                    let role;
                    switch (item.role_id) {
                        case 2:
                            role = 'Editor';
                            break;
                        case 3:
                            role = 'Revisor';
                            break;
                        case 4:
                            role = 'Aprobador';
                            break;
                        case 5:
                            role = 'Consultor';
                            break;
                        case 1:
                            role = 'Administrador';
                            break;
                        default:
                            role = 'Desconocido';
                    }
    
                    return {
                        uuid: item.uuid,
                        name: item.name,
                        last: item.last,
                        department: item.department_name,   
                        mail: item.mail,
                        phone :item.phone,  
                        role: role,
                    };
                });
                setData(fetchedData);
                setRefreshTable(false);
            })
            .catch((error) => {
                console.error("Error al consultar usuarios:", error);
            });
    };
    
    useEffect(() => {
        if (!effectMounted.current) {
            fetchData();
            effectMounted.current = true;
        }
    }, [fetchData]);
    
    useEffect(() => {
        if (refreshTable) {
            if (toggleOn) {
                fetchIns(); 
            } else {
                fetchData(); 
            }
        }
    }, [refreshTable, toggleOn, fetchData]);
    
    const router = useRouter();
    const columns = [
        columnHelper.accessor("icon", {
            cell: () => (
                <div style={{ width: "10px", height: "10px" }}>
                    <Image 
                        src="/icons/icon.svg" 
                        alt="Icono"
                        width={10} 
                        height={10} 
                        className="h-full w-full"/>
                </div>
            ),
            header: "", 
            enableSorting: false, 
        }),
        columnHelper.accessor(row => `${row.name} ${row.last}`, {
            id: "fullName",
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Usuario",
        }),        
        columnHelper.accessor("department", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Departamento",
        }),
        columnHelper.accessor("mail", {
            cell: (info) => (
                <span style={{ textTransform: "none" }}>
                    {info.getValue()}
                </span>
            ),
            header: "Correo electrónico",
        }),        
        columnHelper.accessor("phone", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Teléfono",
        }),
        columnHelper.accessor("time", {
            cell: (info) => {
                const time = info.getValue();
                return(
                    <span>
                        {time ? `${time.entrance.slice(0, 5)} - ${time.leave.slice(0, 5)}` : 'Sin horario registrado'}
                    </span>
                )
            },
            header: "Horario",
        }),
        columnHelper.accessor("actions", {
            cell: (info) => (
                permissions.Type === 1 ? (
                    <Actions
                        onActionClick={(id) => handleActionClick(id)}
                        rowData={info.row.original} 
                        onClose={() => {
                            setRefreshTable(true);
                        }} 
                    />
                ) : null
            ),
            header: "", 
            enableSorting: false, 
        }),
    ];    

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const [showForm, setShowForm] = useState(false);

    const handleButtonClick = () => {
        setShowForm(!showForm);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setRefreshTable(true);
    };

    if (refreshTable) {
        return <UsersTable />;
    }

    return (
        <div className="md:w-full mt-[100px] md:ml-[80px] md:py-5 px-3 md:px-10 text-white fill-gray-400 overflow-x-auto">
            <div className="flex justify-between mb-2">
                <div className="md:w-full w-[40%] flex items-center gap-1 md:ml-[30px] text-black">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                    </svg>
                    <Search
                        value={globalFilter ?? ""}
                        onChange={(value) => setGlobalFilter(String(value))}
                        className="md:p-2  outline-none border-b-2 w-[80%] md:w-1/5 focus:md:w-1/3 duration-300 border-purple-950 text-black"
                        placeholder="Buscar"/>
                </div>
                {permissions.Type === 1 && (
                    <div className="flex items-center mt-[10px] md:mr-[120px]">
                        <label htmlFor="toggle" className="relative inline-flex items-center cursor-pointer">
                            <input 
                                id="toggle" 
                                type="checkbox" 
                                className="sr-only peer " 
                                checked={toggleOn} 
                                onChange={handleToggleChange} 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 transition-all peer-checked:before:translate-x-full peer-checked:before:bg-white before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:w-5 before:h-5 before:rounded-full before:transition-all" />
                        </label>
                        <span className="ml-2 text-gray-700">{toggleOn ? 'Inactivos' : 'Activos'}</span>
                    </div>
                )}
                {permissions.Type === 1 && (
                    <div className="mt-[10px] md:mr-[120px]">
                        <Button
                            className="md:w-[126px] text-[13px] px-2 py-1"
                            color={colors.DARK_JUPITER_OUTLINE}
                            onClick={handleButtonClick}>
                            Añadir +
                        </Button>
                        {showForm && <AddUserForm onClose={handleCloseForm} />}
                    </div>
                )}
            </div>
            <div className="w-full overflow-y-auto">
            <table className="md:w-[1150px] text-left text-black rounded-lg mt-[10px] md:ml-[30px] md:mr-[120px]">
                <thead className="text-black rounded" style={{ backgroundColor: primary || '#F1CF2B' }}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="capitalize px-3.5 py-2">
                                    {header.isPlaceholder ? null : (
                                        <div
                                            className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : ''}
                                            onClick={header.column.getToggleSortingHandler()}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: <i className="fas fa-angle-up ml-1"></i>,
                                                desc: <i className="fas fa-angle-down ml-1"></i>,
                                            }[header.column.getIsSorted()] ?? (
                                                header.column.getCanSort() && <i className="fas fa-angle-down ml-1 text-white/0"></i>
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="rounded">
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="even:bg-gray-100 hover:bg-gray-200">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="capitalize p-3">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            {/* paginacion */}
            {table.getPageCount() > 0 && (
                    <div className="pb-9 w flex items-center justify-end mt-2 gap-2 text-black md:mr-[200px]">
                        <button
                            onClick={() => {
                                table.previousPage();
                            }}
                            disabled={!table.getCanPreviousPage()}
                            className="p-1 border border-purple-950 px-2 rounded"
                        >
                            {"<"}
                        </button>
                        <button
                            onClick={() => {
                                table.nextPage();
                            }}
                            disabled={!table.getCanNextPage()}
                            className="p-1 border border-purple-950 px-2 rounded"
                        >
                            {">"}
                        </button>

                        <span className="flex items-center gap-1">
                            <div>Página</div>
                            <strong>
                                {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </strong>
                        </span>
                    </div>
                )}
        </div>
    );
};

export default UsersTable;
