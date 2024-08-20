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
import Search from "./search";
import Actions from "./actions";
import { Button } from '../form/button';
import { colors } from '../types/enums/colors';
import AddProcessForm from "../forms/addProcess";
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 

const TanStackTable = () => {
    const columnHelper = createColumnHelper();
    const api = useApi();

    const handleActionClick = (id, status) => {

    };

    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [workflows, setAccess] = useState([]);
    const effectMounted = useRef(false);

    const fetchData = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }
        const userType = parsedPermissions;
        
        let parsedAccess;
        const storedAccess = localStorage.getItem('workflows');
        if (storedAccess) {
            parsedAccess = JSON.parse(storedAccess);
            setAccess(parsedAccess);
        }
        let cooWorkflows = [
            ...parsedAccess.revisorOf,
            ...parsedAccess.aprobatorOf,
            ...parsedAccess.editorOf,
            ...parsedAccess.consultorOf
        ];
        
        const orga = parsedPermissions.Organization;
        api.post('/user/process/fetchTab', {orga, userType, cooWorkflows})
            .then((response) => {
                const fetchedData = response.data.data.map(item => ({
                    id: item.id,
                    process: item.process,
                    department: item.departmentName,
                    editor: item.editor,
                    revisor: item.revisor,
                    aprobator: item.aprobator,
                    status: convertStatusToColumn(item.status),
                    created: formatDate(item.created),
                    updated: formatDate(item.updated),
                }));
                setData(fetchedData.reverse());
                setRefreshTable(false);
            })
            .catch((error) => {
                console.error("Error al consultar procesos:", error);
            });
    };

    useEffect(() => {
        if (!effectMounted.current) {
            fetchData();
            effectMounted.current = true;
        }
    }, []);

    useEffect(() => {
        if (refreshTable) {
            fetchData();
        }
    }, [refreshTable]);

    const convertStatusToColumn = (status) => {
        switch (status) {
            case '1':
                return 'Edición';
            case '2':
                return 'Revisión';
            case '3':
                return 'Aprobación';
            case '4':
                return 'Aprobado';
            default:
                return 'Edición';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;

        return `${formattedDay}/${formattedMonth}/${year}`;
    };

    const router = useRouter();
    const columns = [
        // columnHelper.accessor("id", {
        //     cell: (info) => <span>{info?.getValue()}</span>,
        //     header: "P.No.",
        // }),
        columnHelper.accessor("icon", {
            cell: () => (
                <div style={{ width: "10px", height: "10px" }}>
                    <Image 
                        src="/icons/icon.svg" 
                        alt="Icono"
                        width={10} 
                        height={10} 
                        className="h-full w-full"
                    />
                </div>
            ),
            header: "", 
            enableSorting: false, 
        }),
        columnHelper.accessor("process", {
            cell: (info) => (
                <a
                    className="underline cursor-pointer"
                    onClick={() => router.push(`/dashboard/home?process=${info.getValue()}`)}>
                    {info.getValue()}
                </a>
            ),
            header: "Proceso",
        }),
        columnHelper.accessor("department", {
            cell: (info) => (
                <a
                    className="underline cursor-pointer"
                    onClick={() => router.push(`/dashboard/home?department=${info.getValue()}`)}>
                    {info.getValue()}
                </a>
            ),
            header: "Departamento",
        }),
        columnHelper.accessor("editor", {
            cell: (info) => {
                const editor = info.getValue();
                return (
                    <span>
                        {editor ? `${editor.userName} ${editor.last}` : 'No Editor'}
                    </span>
                );
            },
            header: "Editor",
        }),
        columnHelper.accessor("revisor", {
            cell: (info) => {
                const revisors = info.getValue();
                return (
                    <ul className="list-disc pl-5">
                    {revisors && revisors.length > 0 ? revisors.map((revisor, index) => (
                        <li key={index}>
                        {`${revisor.userName} ${revisor.last}`}
                        </li>
                    )) : <li>No Revisor</li>}
                    </ul>
                );
            },
            header: "Revisor",
        }),
        columnHelper.accessor("aprobator", {
            cell: (info) => {
                const aprobators = info.getValue();
                return (
                    <ul className="list-disc pl-5">
                    {aprobators && aprobators.length > 0 ? aprobators.map((aprobator, index) => (
                        <li key={index}>
                        {`${aprobator.userName} ${aprobator.last}`}
                        </li>
                    )) : <li>No Aprobador</li>}
                    </ul>
                );
            },
            header: "Aprobador",
        }),        
        columnHelper.accessor("status", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Estado",
        }),
        columnHelper.accessor("created", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Creación",
        }),
        columnHelper.accessor("updated", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Actualización",
        }),
        columnHelper.accessor("actions", {
            cell: (info) => (
                <Actions
                    onActionClick={(id, status) => handleActionClick(id, status)}
                    rowData={info.row.original} 
                    onClose={() => {
                        setRefreshTable(true);
                    }} />
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
        return <TanStackTable />;
    }

    return (
        <div className="mt-[100px] ml-[50px] w-full py-5 px-10 text-white fill-gray-400">
            <div className="flex justify-between mb-2">
                <div className="w-full flex items-center gap-1 ml-[30px]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                    </svg>
                    <Search
                        value={globalFilter ?? ""}
                        onChange={(value) => setGlobalFilter(String(value))}
                        className="p-2 bg-transparent outline-none border-b-2 w-1/5 focus:w-1/3 duration-300 border-purple-950 text-black"
                        placeholder="Buscar"
                    />
                </div>
                <div className="mt-[10px] mb-[10px]">
                    {permissions.Type === 1 || permissions.Type === 6 ? (
                        <Button
                            className="w-[126px] mr-[130px]"
                            color={colors.DARK_JUPITER_OUTLINE}
                            onClick={handleButtonClick}>
                            Añadir +
                        </Button>
                    ) : null}
                    {showForm && <AddProcessForm onClose={handleCloseForm} />}
                </div>
            </div>
            <table className="w-[1150px] text-left text-black rounded-lg mt-[10px] mr-[130px] ml-[30px]">
                <thead className="bg-[#f1cf2b] text-black rounded">
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
            {/* paginacion */}
            <div className="flex items-center justify-end mt-2 mr-[180px] gap-2 text-black">
                <button
                    onClick={() => {
                        table.previousPage();
                    }}
                    disabled={!table.getCanPreviousPage()}
                    className="p-1 border border-purple-950 px-2 rounded">
                    {"<"}
                </button>
                <button
                    onClick={() => {
                        table.nextPage();
                    }}
                    disabled={!table.getCanNextPage()}
                    className="p-1 border border-purple-950 px-2 rounded">
                    {">"}
                </button>

                <span className="flex items-center gap-1">
                    <div>Página</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} de{" "}
                        {table.getPageCount()}
                    </strong>
                </span>
                <span className="flex items-center gap-1">
                    | Ir a página:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            table.setPageIndex(page);
                        }}
                        className="border p-1 rounded w-16 bg-transparent" />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                    }}
                    className="p-2 bg-transparent">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Mostrar {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TanStackTable;
