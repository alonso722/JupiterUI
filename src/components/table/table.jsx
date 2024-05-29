import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import useApi from '@/hooks/useApi';
import AddButton from "./addButton";
import Search from "./search";

const TanStackTable = () => {
    const columnHelper = createColumnHelper();
    const api= useApi();
    const columns = [
        columnHelper.accessor("id", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "P.No.",
        }),
        columnHelper.accessor("process", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Proceso",
        }),
        columnHelper.accessor("department", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Departamento",
        }),
        columnHelper.accessor("editor", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Editor",
        }),
        columnHelper.accessor("revisor", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Revisor",
        }),
        columnHelper.accessor("aprobator", {
            cell: (info) => <span>{info.getValue()}</span>,
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
    ];

    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");

    useEffect(() => {
        api.post('/user/process/fetchTab')
            .then((response) => {
                console.log("response en front", response.data.data);
                const fetchedData = response.data.data.map(item => ({
                    id: item.id,
                    process: item.process, 
                    department: item.departmentName,
                    editor: item.editor,
                    revisor: item.revisor,
                    aprobator: item.aprobator,
                    status: item.status,
                    created: formatDate(item.created),
                    updated: formatDate(item.updated),
                }));
                setData(fetchedData);
            })
            .catch((error) => {
                console.error("Error al consultar procesos:", error);
            });
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;

        return `${formattedDay}/${formattedMonth}/${year}`;
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
    });

    return (
        <div className="mt-[100px] ml-[50px] w-full py-5 px-10 text-white fill-gray-400">
            <div className="flex justify-between mb-2">
                <div className="w-full flex items-center gap-1">
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
                <AddButton />
            </div>
            <table className="border border-gray-700 w-full text-left">
                <thead className="bg-[#FDD500] text-black">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="capitalize px-3.5 py-2">
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
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
                                    ${i % 2 === 0 ? "bg-purple-950" : "bg-purple-900"}
                                    `}
                            >
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
                    className="p-1 border border-purple-950 px-2 disabled:opacity-30 rounded">
                    {"<"}
                </button>
                <button
                    onClick={() => {
                        table.nextPage();
                    }}
                    disabled={!table.getCanNextPage()}
                    className="p-1 border border-purple-950 px-2 disabled:opacity-30 rounded">
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

export default TanStackTable;
