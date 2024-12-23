import React, { useState, useEffect, useRef, Fragment } from "react";
import { FaUserCheck, FaCalendarCheck } from "react-icons/fa6";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import useApi from "@/hooks/useApi";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useColors } from "@/services/colorService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const ReportsMenu = () => {
  const [permissions, setPermissions] = useState([]);
  const [selectedButton, setSelectedButton] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState(null);
  const { primary, secondary } = useColors();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (!effectMounted.current) {
      const storedPermissions = localStorage.getItem("permissions");
      const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : null;
      const organization = parsedPermissions?.Organization;

      api.post("/user/departments/fetch", { organization })
        .then((response) => {
          const departments = response.data.data;
          const filteredDepartments = departments.filter((dept) => dept.type !== 41);
          const fetchedData = filteredDepartments.map((item) => ({
            id: item.id,
            department: item.department,
          }));
          setDepartments(fetchedData);
        })
        .catch((error) => {
          console.error("Error al consultar departamentos:", error);
        });

      effectMounted.current = true;
    }
  }, []);

  const handleSelectionDepartment = (value) => {
    if (value === null) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments([value]);
    }
  };

  const fetchData = async (index) => {
    let reque = {};
    const storedPermissions = localStorage.getItem("permissions");
    const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : null;
    const orga = parsedPermissions?.Organization;

    reque.orga = orga;
    reque.department = selectedDepartments[0]?.id;
    if (!orga) return;

    const endpoints = ["/user/reports/getDaily", "/user/reports/getDaily"];
    const endpoint = endpoints[index];

    try {
      const response = await api.post(endpoint, reque);
      setData(response.data);
    } catch (error) {
      console.error(`Error al consultar ${endpoint}:`, error);
    }
  };

  const handleButtonClick = (index) => {
    setSelectedButton(index);
    fetchData(index);
  };

  const downloadPdf = () => {
    if (!data || !data.length) {
      alert("No hay datos para exportar a PDF");
      return;
    }
  
    const doc = new jsPDF();
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString(); 
  
    doc.text(`Registro de asistencia - ${formattedDate}`, 14, 10);
    
    const columns = [
      { header: "Colaborador", dataKey: "colaborador" },
      { header: "Entrada", dataKey: "entrada" },
      { header: "Salida", dataKey: "salida" },
      { header: "Entrada (mts)", dataKey: "distanciaEntrada" },
      { header: "Salida (mts)", dataKey: "distanciaSalida" },
      { header: "Corp. Entrada", dataKey: "corporativoEntrada" },
      { header: "Corp. Salida", dataKey: "corporativoSalida" },
    ];
    const formattedData = data.map(row => ({
      colaborador: `${row.name} ${row.last}`,
      entrada: row.entrance ? new Date(row.entrance).toLocaleTimeString() : "", 
      salida: row.leave ? new Date(row.leave).toLocaleTimeString() : "",
      distanciaEntrada: row.distanceEnt || "",
      distanciaSalida: row.distanceLeave || "",
      corporativoEntrada: row.locationEntName || "", 
      corporativoSalida: row.locationLeaveName || "", 
    }));
  
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: formattedData.map(row => Object.values(row)),
      startY: 20,
    });
    doc.save(`Asistencia - ${formattedDate}.pdf`);
  };
  
  return (
    <div className="mt-[80px] ml-[110px] mr-[0px] text-neutral-50 rounded overflow-hidden">
      <p className="text-[25px] text-black my-4">
        <b>Reportes</b>
      </p>
      <Listbox
        value={selectedDepartments}
        onChange={(value) => handleSelectionDepartment(value)}
        className="max-w-[100px] mb-4"
      >
        {({ open }) => (
          <>
            <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
              Departamento
            </Listbox.Label>
            <div className="relative mt-2">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                <span className="flex items-center">
                  <span className="ml-3 block truncate">
                    {selectedDepartments.length > 0
                      ? selectedDepartments[0].department
                      : "Seleccionar departamento"}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <Listbox.Option
                    key="none"
                    className={({ active }) =>
                      classNames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={null}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            Sin departamento
                          </span>
                        </div>
                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                  {departments.map((department) => (
                    <Listbox.Option
                      key={department.id}
                      className={({ active }) =>
                        classNames(
                          active ? "bg-indigo-600 text-white" : "text-gray-900",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      value={department}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "ml-3 block truncate"
                              )}
                            >
                              {department.department}
                            </span>
                          </div>
                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-indigo-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
      <div className="flex w-full pl-5 mt-9">
        <div className="flex flex-col items-center justify-center mr-5">
          <button
            onClick={() => handleButtonClick(0)}
            className="text-white p-5 rounded border-black border-[1px] mx-5"
            style={{
              backgroundColor: selectedButton === 0 ? primary : secondary,
              color: selectedButton === 0 ? secondary : primary,
            }}
          >
            <FaUserCheck
              style={{ color: selectedButton === 0 ? secondary : primary, width: "25px", height: "28px" }}
            />
          </button>
          <p className="text-black">Asistencia</p>
        </div>
        <div className="flex flex-col items-center justify-center mx-5">
          <button
            onClick={() => handleButtonClick(1)}
            className="text-white p-5 rounded border-black border-[1px] mx-5"
            style={{
              backgroundColor: selectedButton === 1 ? primary : secondary,
              color: selectedButton === 1 ? secondary : primary,
            }}
          >
            <FaCalendarCheck
              style={{ color: selectedButton === 1 ? secondary : primary, width: "25px", height: "28px" }}
            />
          </button>
          <p className="text-black">Vacaciones</p>
        </div>
      </div>
      <div className="mt-5 p-4 bg-gray-100 rounded">
        {data ? (
          <>
            <p className="text-black">Se encontraron {data.length} registros de asistencia de ayer.</p>
            <button
              onClick={downloadPdf}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-800"
            >
              Descargar PDF
            </button>
          </>
        ) : (
          <p className="text-black">Selecciona un reporte para ver los datos</p>
        )}
      </div>
    </div>
  );
};

export default ReportsMenu;
