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
import { contains } from "class-validator";

const UsersTable = () => {
    const columnHelper = createColumnHelper();
    const api = useApi();
    const [permissions, setPermissions] = useState([]);
    const handleActionClick = (id, status) => {

    };

    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const effectMounted = useRef(false);

    const fetchData = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(parsedPermissions);
        }
        const organization= parsedPermissions.Organization;
        api.post('/user/users/fetch', {organization})
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
                    case 6:
                        role = 'Administrador';
                        break;                    
                    default:
                        role = 'Desconocido';
                }
    
                return {
                    uuid: item.uuid,
                    name: item.name,
                    department: item.department_name,   
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
    }, []);

    useEffect(() => {
        if (refreshTable) {
            fetchData();
        }
    }, [refreshTable]);

    const router = useRouter();
    const columns = [
        columnHelper.accessor("name", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Usuario",
        }),
        columnHelper.accessor("department", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Departamento",
        }),
        columnHelper.accessor("role", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Rol",
        }),
        columnHelper.accessor("actions", {
            cell: (info) => (
                <Actions
                    onActionClick={(id) => handleActionClick(id)}
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
        return <UsersTable />;
    }

    return (
        <div className="mt-[100px] ml-[50px] w-[1700px] py-5 px-10 text-white fill-gray-400">
            <div className="flex justify-between mb-2">
                <div className="w-full flex items-center gap-1 text-black">
                <i className="fa fa-search ml-1"></i>
                    <Search
                        value={globalFilter ?? ""}
                        onChange={(value) => setGlobalFilter(String(value))}
                        className="p-2 bg-transparent outline-none border-b-2 w-1/5 focus:w-1/3 duration-300 border-purple-950 text-black"
                        placeholder="Buscar"/>
                </div>
                <div className="grid grid-rows-1 mt-[10px]">
                    <Button
                        rounded
                        color={colors.ALTERNATIVE}
                        onClick={handleButtonClick}>
                        Añadir
                    </Button>
                    {showForm && <AddUserForm onClose={handleCloseForm} />}
                </div>
            </div>
            <table className="w-full text-left rounded-lg">
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
                                    ${i % 2 === 0 ? "bg-[#2b0c43]" : "bg-[#3c0764]"}
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
            <div className="flex items-center justify-end mt-2 gap-2 text-black">
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
                    {[10, 20, 30, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Mostrar {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default UsersTable;
