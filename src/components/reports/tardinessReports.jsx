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

const period = [
  { id: 0, column: 'Sin definir' },
  { id: 1, column: 'Día' },
  { id: 2, column: 'Mes' },
  { id: 3, column: 'Año' },
  { id: 4, column: 'Periodo a indicar' },
];

export const TardinessReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(period[0]);
  const [permissions, setPermissions] = useState([]);
  const [selectedButton, setSelectedButton] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [data, setData] = useState(null);
  const { primary, secondary } = useColors();
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const effectMounted = useRef(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
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
          console.log(fetchedData)
          setDepartments(fetchedData);
        })
        .catch((error) => {
          console.error("Error al consultar departamentos:", error);
        });

      effectMounted.current = true;
    }
  }, [api]);

  const fetchCollaborators = (value) =>{
    console.log(value)
    api.get(`/user/users/getUsersByDept/${value}`)
    .then((response) => {
      console.log(response.data)
      const users = response.data;

      console.log(users)
      setUsers(users);
    })
    .catch((error) => {
      console.error("Error al consultar departamentos:", error);
    });

  }

  const handleSelectionDepartment = (value) => {
    setSelectedUser([]);
    setData(null);
    if (value === null) {
      setSelectedDepartment([]);
    } else {
      setSelectedDepartment([value]);
      fetchCollaborators(value.id)
    }
  };

  const handleSelectionUser = (value) => {
    setData(null);
    if (value === null) {
      setSelectedUser([]);
    } else {
      setSelectedUser([value]);
      //fetchCollaborators(value.id)
    }
  };

  const fetchData = async (index) => {
    let reque = {};
    const storedPermissions = localStorage.getItem("permissions");
    const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : null;
    const orga = parsedPermissions?.Organization;

    console.log(selectedDepartment, selectedUser)
  
    if (!orga) return;
  
    reque.orga = orga;
  
    if (selectedPeriod.id !== 0) {
      reque.period = selectedPeriod.id;
    
      switch (selectedPeriod.id) {
        case 1:
          if (!endDate) {
            console.error("Falta la fecha para el periodo 1");
            return alert("Selecciona una fecha válida.");
          }
          reque.periodFilter = endDate;
          break;
    
        case 2:
          if (!endDate) {
            console.error("Falta el mes para el periodo 2");
            return alert("Selecciona un mes válido.");
          }
          reque.periodFilter = endDate;
          break;
    
        case 3:
          if (!year) {
            console.error("Falta el año para el periodo 3");
            return alert("Selecciona un año válido.");
          }
          reque.periodFilter = year;
          break;
    
        case 4:
          if (!startDate || !endDate) {
            console.error("Faltan fechas para el periodo 4");
            return alert("Selecciona la fecha de inicio y de fin.");
          }
          reque.periodFilter = { start: startDate, end: endDate };
          break;
    
        default:
          console.warn("Periodo no reconocido");
          break;
      }
    }    
  
    if (selectedDepartment.length > 0) {
      reque.department = selectedDepartment[0]?.id;
    }
  
    if (selectedUser.length > 0) {
      reque.user = selectedUser;
    }
  
    console.log("concentrado de filtros", reque);
  
    try {
      const response = await api.post("/user/reports/getTardiness", reque);
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error(`Error al consultar retardos:`, error);
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
    
    doc.text(`\nReporte generado el ${formattedDate}`, 14, 20);
        
      let reportTitle = "";

      switch (selectedPeriod.id) {
        case 0:
          reportTitle = "Reporte de asistencia general";
          break;
        case 1:
          reportTitle = `Asistencia del día ${endDate}`;
          break;
        case 2:
          reportTitle = `Asistencia del mes ${endDate}`;
          break;
        case 3:
          reportTitle = `Asistencia del año ${year}`;
          break;
        case 4:
          reportTitle = `Asistencia del periodo de ${startDate} a ${endDate}`;
          break;
      }

      if (selectedUser?.length > 0) {
        reportTitle += `\ndel usuario ${selectedUser[0].userName} ${selectedUser[0].userLast}`;
      } else if (selectedDepartment?.length > 0) {
        reportTitle += `\ndel departamento ${selectedDepartment[0].department}`;
      }

      doc.text(`\n${reportTitle}\n\n`, 14, 30);
    
      const columns = [
        { header: "Colaborador", dataKey: "colaborator" },
        { header: "Entrada", dataKey: "entrace" },
        { header: "Salida", dataKey: "leave" },
        { header: "Corp. Entrada", dataKey: "entraceLoc" },
        { header: "Corp. Salida", dataKey: "entraceLeave" },
      ];
    
      const formattedData = data.map(row => {
        const adjustDateTime = (date) => {
          if (!date) return ""; 
          const adjustedDate = new Date(date);
          adjustedDate.setHours(adjustedDate.getHours() + 6); 
          return adjustedDate.toLocaleString();
        };
    
        return {
          colaborator: `${row.name} ${row.last}`,
          entrace: adjustDateTime(row.entrance),
          leave: adjustDateTime(row.leave),
          entraceLoc: row.locationEntName || "",
          entraceLeave: row.locationLeaveName || "",
        };
      });
    
      doc.autoTable({
        head: [columns.map(col => col.header)],
        body: formattedData.map(row => Object.values(row)),
        startY: 50, 
      });

      console.log()
    
      doc.save(`Asistencia - ${formattedDate}.pdf`);
    
  };

  const DateInput = ({ label, value, onChange }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-black"
      />
    </div>
  );
  

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    setData(null);
    console.log('Periodo seleccionado:', value, selectedPeriod);
  };
  
  return (
    <div className="mt-[80px] md:ml-[110px] px-5 md:px-0 mr-[0px] text-neutral-50 rounded overflow-hidden">
      <p className="text-[25px] text-black my-4">
        <b>Reportes de retardos</b>
      </p>
      <div className="flex items-end gap-4">
        <div className="w-60 text-black">
          <Listbox value={selectedPeriod} onChange={handlePeriodChange}>
            <div className="relative mt-1">
              <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                Periodo actual
              </Listbox.Label>
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 max-w-[150px]">
                <span className="block truncate">{selectedPeriod.column}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </span>
              </Listbox.Button>

              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {period.map((item) => (
                  <Listbox.Option
                    key={item.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                    value={item}
                  >
                    {({ selected }) => (
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {item.column}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
        {(selectedPeriod.id === 4) && (
          <DateInput label="Fecha inicio" value={startDate} onChange={setStartDate} />
        )}
        {(selectedPeriod.id === 1 || selectedPeriod.id === 4) && (
          <DateInput
            label={selectedPeriod.id === 1 ? "Fecha" : "Fecha fin"}
            value={endDate}
            onChange={setEndDate}
          />
        )}
        {selectedPeriod.id === 2 && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Mes</label>
            <input
              type="month"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-black"
            />
          </div>
        )}
        {selectedPeriod.id === 3 && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-black w-[120px]"
            />
          </div>
        )}
      </div>
    <div className="flex mt-5">
      <div className="mr-5">
        <Listbox
          value={selectedDepartment}
          onChange={(value) => handleSelectionDepartment(value)}
          className="min-w-[300px] mb-4"
        >
          {({ open }) => (
            <>
              <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                Departamento
              </Listbox.Label>
              <div className="relative mt-2">
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 min-w-[300px]">
                  <span className="flex items-center">
                    <span className="ml-0 block truncate">
                      {selectedDepartment.length > 0
                        ? selectedDepartment[0].department
                        : "Sin departamento"}
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
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Listbox.Option
                      key="none"
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`
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
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
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
      </div>
      <div>
        <Listbox
          value={selectedUser}
          onChange={(value) => handleSelectionUser(value)}
          className="min-w-[300px] mb-4"
        >
          {({ open }) => (
            <>
              <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                Usuario
              </Listbox.Label>
              <div className="relative mt-2">
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 min-w-[250px]">
                  <span className="flex items-center">
                    <span className="ml-0 block truncate">
                      {selectedUser.length > 0
                        ? selectedUser[0].userName + " " + selectedUser[0].userLast
                        : "Sin usuario"}
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
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Listbox.Option
                      key="none"
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`
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
                              Sin usuario
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
                    {users.map((user) => (
                      <Listbox.Option
                        key={user.uuid}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                        value={user}
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
                                {user.userName} {user.userLast}
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
      </div>
      
    </div>
    <p className="text-black mt-7">Verificar registro de:</p>
        <div className="flex flex-col items-center justify-center mr-5">
          <button
            onClick={() => handleButtonClick(1)}
            className="text-white p-5 rounded border-black border-[1px] mx-5"
            style={{
              backgroundColor: primary,
              color:  primary,
            }}
          >
          <p className="text-black">Verificar Registros</p>
          </button>
        </div>
      <div className="mt-5 p-4 bg-gray-100 rounded">
        {data ? (
          <>
            <p className="text-black">Se encontraron {data.length} registros a reportar.</p>
            <button
              onClick={downloadPdf}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
              style={{
                backgroundColor: secondary,
              }}
            >
            Generar Reporte
            </button>
          </>
        ) : (
          <p className="text-black">Selecciona un reporte para ver los datos</p>
        )}
      </div>
    </div>
  );
};

export default TardinessReports;
