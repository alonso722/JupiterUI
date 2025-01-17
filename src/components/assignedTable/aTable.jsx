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
import AddAssignedForm from "@/components/forms/addAssigned"; 
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { useColors } from '@/services/colorService';

const AssignedTable = () => {
    const columnHelper = createColumnHelper();
    const api = useApi();
    const [data, setData] = useState([]);
    const [departments, setAssigned] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const effectMounted = useRef(false);
    const { primary, secondary } = useColors();

    const handleActionClick = (id, status) => {

    };
    const fetchData = () => {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
        }
        const organization= parsedPermissions.Organization;
        api.post('/user/assignation/fetch',{organization})
            .then((response) => {
                const objects = response.data;
                setAssigned(objects)
                const fetchedData = response.data.map(item => ({
                    id: item.id,
                    object: item.object,
                    user: item.userName,
                    location: item.locationName,
                    locationId: item.location,
                    uuid: item.uuid,
                    chars:item.chars,
                    status:item.status    
                }));
                setData(fetchedData);
                setRefreshTable(false);
            })
            .catch((error) => {
                console.error("Error al consultar asignados:", error);
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
        columnHelper.accessor("object", {
            cell: (info) => <span>{info?.getValue()}</span>,
            header: "Equipo de resguardo",
        }),
        columnHelper.accessor("user", {
            cell: (info) => {
                const user = info.getValue();
                return (
                    <p className="overflow-y-auto max-h-[70px]">
                        {user?.name ?? ''} {user?.last ?? ''}
                    </p>
                );
            },
            header: "Colaborador",
        }),        
        columnHelper.accessor("location", {
            cell: (info) => <span>{info.getValue()}</span>,
            header: "Corporativo",
        }),
        columnHelper.accessor("status", {
            cell: (info) => {
              let label;
              switch (info.getValue()) {
                case 1:
                  label = "En resguardo";
                  break;
                case 2:
                  label = "Asignado";
                  break;
                case 3:
                  label = "Obsoleto/Dañado";
                  break;
                default:
                  label = "Estado desconocido";
              }
              return <span>{label}</span>;
            },
            header: "Estado",
          }),
        columnHelper.accessor("chars", {
            cell: (info) => (
                <ul className="list-disc overflow-y-auto pl-8 max-h-[60px]">
                    {info.getValue().map((char, index) => (
                        <li key={index} className="list-disc">{char.characteristics}: {char.charValue}</li>
                    ))}
                </ul>
            ),
            header: "Características",
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

    const handleButtonClick = () => {
        setShowForm(!showForm);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setRefreshTable(true);
    };

    if (refreshTable) {
        return <AssignedTable />;
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
                <div className="mt-[10px] mr-[120px]">
                    <Button
                    className="md:w-[126px] md:mr-[130px] text-[13px] px-2 py-1"
                        color={colors.DARK_JUPITER_OUTLINE}
                        onClick={handleButtonClick}>
                        Añadir +
                    </Button>
                    {showForm && <AddAssignedForm onClose={handleCloseForm} />}
                </div>
            </div>
            <div className="w-full overflow-y-auto">
            <table className="md:w-[1150px] text-left text-black rounded-lg mt-[10px] md:mr-[130px] md:ml-[30px]">
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

export default AssignedTable;
