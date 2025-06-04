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
import AddOrganizationForm from "@/components/forms/addOrganization"; 
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { useColors } from '@/services/colorService';


const PermissionsTable = () => {
    const columnHelper = createColumnHelper();
    const api = useApi();

    const handleActionClick = (id, status) => {

    };

    const { primary, secondary } = useColors();

    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const effectMounted = useRef(false);

    const fetchPermissions = () => {

        const storedPermissions = localStorage.getItem("permissions");
        const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : null;
        const organization = parsedPermissions?.Organization;
        api.get(`/user/checks/getPermissions/${organization}`)
            .then((response) => {
                const permissions = response.data.map(item => {
                    
                    return {
                        checkId: item.checkId,
                        uuid: item.user,
                        name: item.name,
                        last: item.last,
                        entrance: formatDate(item.entrance),
                        entranceName: item.locationEName,
                        leave: formatDate(item.leave),
                        leaveName: item.locationLName, 
                        distanceEnt: item.distanceEnt,
                        distanceLeave: item.distanceLeave,
                    };
                });
                setData(permissions);
            })
            .catch((error) => {
                console.error("Error al consultar departamentos:", error);
            });
    } 

    useEffect(() => {
        if (!effectMounted.current) {
            fetchPermissions();
            effectMounted.current = true;
        }
    }, []);

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
        columnHelper.accessor("entrance", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Hora de entrada",
        }),     
        columnHelper.accessor("leave", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Hora de salida",
        }),     
        columnHelper.accessor("distanceEnt", {
            cell: (info) => {
                const value = info?.getValue();
                return <span>{Number(value).toLocaleString()} mts.</span>;
            },
            header: "Distancia a corporativo en entrada",
        }),

        columnHelper.accessor("distanceLeave", {
        cell: (info) => {
            const value = info?.getValue();
            return (
            <span>
                {value != null ? `${Number(value).toLocaleString()} mts.` : ""}
            </span>
            );
        },
        header: "Distancia a corporativo en salida",
        }),
        columnHelper.accessor("entranceName", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Corporativo de entrada",
        }),
        columnHelper.accessor("leaveName", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Corporativo de salida",
        }),
        columnHelper.accessor("checkId", {
            cell: (info) => (
                <button
                    className="rounded-lg px-3 py-1 border-2"
                    onClick={() => handleButtonClick(info.getValue())}
                >
                    Aprobar
                </button>
            ),
            header: "",
            enableSorting: false,
        }),
    ]; 

    const formatDate = (dateString) => {
        if(dateString){
        const date = new Date(dateString.replace('Z', ''));

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

        return `${formattedDay}/${formattedMonth}/${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else{
        return;
    }
    
    };

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

    const handleButtonClick = (id) => {
        api.put(`/user/checks/apprPermission/${id}`)
        .then((response) => {
            fetchPermissions();
        })
        .catch((error) => {
            console.error("Error al consultar departamentos:", error);
        });
        fetchPermissions();
    };

    if (refreshTable) {
        return <PermissionsTable />;
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
            </div>
            <div className="w-full overflow-y-auto pb-7">
            <table className="md:w-[1150px] text-left text-black rounded-lg mt-[10px] md:ml-[30px] md:mr-[120px]">
                <thead style={{ backgroundColor: primary || '#F1CF2B' }} className="text-black rounded">
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
                                                header.getContext())}
                                            {{ asc: <i className="fas fa-angle-up ml-1"></i>,
                                                desc: <i className="fas fa-angle-down ml-1"></i>,
                                            }[header.column.getIsSorted()] ?? (
                                                header.column.getCanSort() && <i className="fas fa-angle-down ml-1"></i>
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row, i) => (
                            <tr
                                key={row.id}
                                className={`
                                    ${i % 2 === 0 ? "" : ""}
                                    `}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-3.5 py-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr className="text-center h-32 text-black">
                            <td colSpan={12}>Sin resultados...</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
            {table.getPageCount() > 0 && (
                    <div className="pb-9 flex items-center justify-end mt-2 gap-2 text-black md:mr-[200px]">
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

export default PermissionsTable;
