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
import VacationsForm from "@/components/forms/setVacations"; 
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { useColors } from '@/services/colorService';

const RhTable = () => {
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
        api.post('/user/users/fetchRH', { organization })
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
                        countRecord: item.countRecord,
                        countDocs: item.countDocs,   
                        assigned: item.assigned
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
            cell: (info) => (
                <span
                    className="underline cursor-pointer"
                    onClick={() => router.push(`/profile?user=${info.row.original.uuid}`)}
                >
                    {info.getValue()}
                </span>
            ),
            header: "Usuario",
        }),       
        // columnHelper.accessor("countRecord", {
        //     cell: (info) => {
        //         const count = info.getValue();
        //         if (count === 8) {
        //             return <span>Sin archivos cargados</span>;
        //         } else if (count === 0) {
        //             return <span>Todos los archivos cargados</span>;
        //         } else {
        //             return <span>Faltan por cargar {count} archivos</span>;
        //         }
        //     },
        //     header: "Documentos profesionales",
        // }),
        columnHelper.accessor("countDocs", {
            cell: (info) => {
                const count = info.getValue();
                if (count === 11) {
                    return <span>Sin archivos cargados</span>;
                } else if (count === 0) {
                    return <span>Todos los archivos cargados</span>;
                } else {
                    return <span>Faltan por cargar {count} archivos</span>;
                }
            },
            header: "Documentos ",
        }),
        columnHelper.accessor("assigned", {
            cell: (info) => {
                const count = info.getValue();
                if (count === 1) {
                    return <span>Colaborador con un equipo asignado</span>;
                } else if (count === 0) {
                    return <span>Sin equipo asignado</span>;
                } else {
                    return <span>Colaborador con {count} equipos asignados</span>;
                }
            },
            header: "Equipo asignado",
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
        return <RhTable />;
    }

    return (
        <div className="mt-[100px] ml-[80px] w-[1590px] py-5 px-10 text-white fill-gray-400">
            <div className="flex justify-between mb-2">
                <div className="flex items-center gap-1 text-black">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                    </svg>
                    <Search
                        value={globalFilter ?? ""}
                        onChange={(value) => setGlobalFilter(String(value))}
                        className="p-2 bg-transparent outline-none border-b-2 w-[200px] focus:w-1/3 duration-300 border-purple-950 text-black"
                        placeholder="Buscar"/>
                </div>
                {/* <div className="mt-[10px] mr-[120px]">
                        <button className="w-[126px] text-black border-2 rounded-lg py-2"
                            onClick={handleButtonClick}>
                            Reportes
                        </button>
                        {showForm && <VacationsForm onClose={handleCloseForm} isOpen={showForm}/>}
                    </div> */}
                {permissions.Type === 1 && (
                    <div className="mt-[10px] mr-[120px]">
                        <button className="w-[126px] text-black border-2 rounded-lg py-2"
                            onClick={handleButtonClick}>
                            Vacaciones
                        </button>
                        {showForm && <VacationsForm onClose={handleCloseForm} isOpen={showForm}/>}
                    </div>
                )}
            </div>
            <table className="w-[1150px] text-black text-left mt-[10px] rounded-lg mr-[120px]">
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
            {/* paginacion */}
            {table.getPageCount() > 0 && (
                    <div className="flex items-center justify-end mt-2 gap-2 text-black mr-[200px]">
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

export default RhTable;
