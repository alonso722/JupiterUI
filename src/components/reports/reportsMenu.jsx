import React, { useState, useEffect, useRef, Fragment } from "react";
import { FaUserCheck, FaCalendarCheck } from "react-icons/fa6";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import useApi from "@/hooks/useApi";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useColors } from "@/services/colorService";
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";

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

export const ReportsMenu = () => {
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
  const [year, setYear] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const api = useApi();

    const showToast = (type, message) => {
      toast[type](message, {
        position: 'top-center',
        autoClose: 2000,
      });
    };

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
        const orga = parsedPermissions.Organization;
          api.post('/user/organization/getLogo', {orga})
            .then(async (response) => {
                const imageData = response.data.data[0].buffer;
                    if (imageData) {
                        const url = `${process.env.NEXT_PUBLIC_MS_FILES}/api/v1/file?f=${imageData}`;
                        try {
                            const response = await fetch(url);
                            if (!response.ok) throw new Error("No se pudo cargar la imagen");

                            const blob = await response.blob();
                            const objectUrl = URL.createObjectURL(blob);
                            setLogoUrl(objectUrl);
                        } catch (error) {
                            console.error("Error al cargar la imagen:", error);
                            setLogoUrl(null);
                        }
                    }   
              })
              .catch((error) => {
                console.error("Error al consultar nombre:", error);
              });

      effectMounted.current = true;
    }
  }, [api]);

  const fetchCollaborators = (value) =>{
    api.get(`/user/users/getUsersByDept/${value}`)
    .then((response) => {
      const users = response.data;
      setUsers(users);
    })
    .catch((error) => {
      console.error("Error al consultar departamentos:", error);
    });

  }

  const handleSelectionDepartment = (value) => {
    setSelectedUser([]);
    setUsers([]);
    setData(null);
    if (value === null) {
      setSelectedDepartment([]);
    } else {
      setSelectedDepartment([value]);
      fetchCollaborators(value.id);
      setSelectedButton("");
    }
  };

  const handleSelectionUser = (value) => {
    setData(null);
    if (value === null) {
      setSelectedUser([]);
    } else {
      setSelectedUser([value]);
      setSelectedButton("");
      //fetchCollaborators(value.id)
    }
  };

  const fetchData = async (index) => {
    let reque = {};
    const storedPermissions = localStorage.getItem("permissions");
    const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : null;
    const orga = parsedPermissions?.Organization;
    if (!orga) return;
  
    reque.orga = orga;
  
    if (selectedPeriod.id !== 0) {
      reque.period = selectedPeriod.id;
    
      switch (selectedPeriod.id) {
        case 1:
          if (!endDate) {
            showToast('error', "Selecciona una fecha válida.");
            return;
          }
          reque.periodFilter = endDate;
          break;
    
        case 2:
          if (!endDate) {
            showToast('error', "Selecciona un mes válido.");
            return;
          }
          reque.periodFilter = endDate;
          break;
    
        case 3:
          if (!year) {
            showToast('error', "Selecciona un año válido.");
            return;
          }
          reque.periodFilter = year;
          break;
    
        case 4:
          if (!startDate || !endDate) {
            showToast('error', "Selecciona un periodo fechas válido.");
            return;
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
    const endpoints = ["/user/reports/getDaily", "/user/reports/getAttendance", "/user/reports/getVacations"];
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

  const getBase64FromUrl = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

    const formatDateTime = (date) => {
      if (!date) return "";
      const adjustedDate = new Date(date);
      adjustedDate.setHours(adjustedDate.getHours() + 6);
      return adjustedDate.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

  const downloadPdf = async () => {
    if (!data || !data.length) {
      alert("No hay datos para exportar a PDF");
      return;
    }

    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = today.toLocaleDateString();

    const topY = 15;
    const middleY = 25;
    const bottomY = 30;

    const pageWidth = doc.internal.pageSize.getWidth();

  if (selectedButton === 0) {

    const reporteGenerado = `Reporte generado el ${formattedDate}`;
    const reporteAsistencia = `Reporte de asistencia del día ${new Date(Date.now() - 86400000).toLocaleDateString()}`;
    const textWidth = doc.getTextWidth(reporteGenerado);
    const centerX = (pageWidth - (textWidth / 4)) / 2;

    doc.setDrawColor(primary);
    doc.setLineWidth(1);       
    doc.line(14, topY - 6, pageWidth - 14, topY - 6); 

    doc.setFontSize(14);
    doc.text("\nReporte de asistencia", 14, topY); 

    if (logoUrl) {
      try {
        const base64Logo = await getBase64FromUrl(logoUrl);
        const imageWidth = 40;
        const imageHeight = 12;
        const rightX = pageWidth - imageWidth - 14; 
        doc.addImage(base64Logo, 'PNG', rightX, topY - 0, imageWidth, imageHeight); 
      } catch (error) {
        console.error("Error al insertar logo en PDF:", error);
      }
    }

    doc.setFontSize(6);
    doc.text(reporteGenerado, centerX, middleY); 
    doc.text(reporteAsistencia, 14, bottomY);

    const columns = [
      { header: "Colaborador", dataKey: "colaborator" },
      { header: "Entrada", dataKey: "entrace" },
      { header: "Salida", dataKey: "leave" },
      { header: "Entrada (mts)", dataKey: "distanceEnt" },
      { header: "Salida (mts)", dataKey: "distanceLeave" },
      { header: "Corp. Entrada", dataKey: "entraceLoc" },
      { header: "Corp. Salida", dataKey: "entraceLeave" },
    ];

    const formattedData = data.map(row => ({
      colaborator: `${row.name} ${row.last}`,
      entrace: formatDateTime(row.entrance),
      leave: formatDateTime(row.leave),
      distanceEnt: row.distanceEnt || "",
      distanceLeave: row.distanceLeave || "",
      entraceLoc: row.locationEntName || "",
      entraceLeave: row.locationLeaveName || "",
    }));

    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: formattedData.map(row => Object.values(row)),
      startY: bottomY + 10,
      headStyles: {
        fillColor: primary,
        textColor: '#FFFFFF', 
        halign: 'center',
        fontSize: 7,
      },
      styles: {
        fontSize: 6,
      }
    });

    doc.save(`Asistencia - ${formattedDate}.pdf`);
  } else if (selectedButton === 1) {
    const reporteGenerado = `Reporte generado el ${formattedDate}`;

    const textWidth = doc.getTextWidth(reporteGenerado);
    const centerX = (pageWidth - (textWidth / 4)) / 2;

    doc.setDrawColor(primary);
    doc.setLineWidth(1);       
    doc.line(14, topY - 6, pageWidth - 14, topY - 6);

    doc.setFontSize(14);
    doc.text("\nReporte de asistencia", 14, topY); 
    let reportTitle = "";

    if (logoUrl) {
      try {
        const base64Logo = await getBase64FromUrl(logoUrl);
        const imageWidth = 40;
        const imageHeight = 12;
        const rightX = pageWidth - imageWidth - 14; 
        doc.addImage(base64Logo, 'PNG', rightX, topY - 0, imageWidth, imageHeight); 
      } catch (error) {
        console.error("Error al insertar logo en PDF:", error);
      }
    }

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

      doc.setFontSize(6);
      doc.text(reporteGenerado, centerX, middleY); 
      doc.text(reportTitle, 14, bottomY);

      const columns = [
        { header: "Colaborador", dataKey: "colaborator" },
        { header: "Entrada", dataKey: "entrace" },
        { header: "Salida", dataKey: "leave" },
        { header: "Corp. Entrada", dataKey: "entraceLoc" },
        { header: "Corp. Salida", dataKey: "entraceLeave" },
      ];

      const formattedData = data.map(row => ({
        colaborator: `${row.name} ${row.last}`,
        entrace: formatDateTime(row.entrance),
        leave: formatDateTime(row.leave),
        entraceLoc: row.locationEntName || "",
        entraceLeave: row.locationLeaveName || "",
      }));

      doc.autoTable({
        head: [columns.map(col => col.header)],
        body: formattedData.map(row => Object.values(row)),
        startY: bottomY + 10,
        headStyles: {
          fillColor: primary,
          textColor: '#FFFFFF', 
          halign: 'center',
          fontSize: 7,
        },
        styles: {
          fontSize: 6,
        }
      });

      doc.save(`Asistencia - ${formattedDate}.pdf`);

    } 
    // else {
    //   const columns = [
    //     { header: "Colaborador", dataKey: "colaborator" },
    //     { header: "Aprobador", dataKey: "aprobator" },
    //     { header: "Inicio", dataKey: "start" },
    //     { header: "Fin", dataKey: "end" },
    //     { header: "Estatus", dataKey: "status" },
    //   ];

    //   const formattedData = data.map(row => ({
    //     colaborator: `${row.name} ${row.last}`,
    //     aprobator: row.aprobatorName || "N/A",
    //     start: row.start ? new Date(row.start).toLocaleDateString("es-MX") : "N/A",
    //     end: row.end ? new Date(row.end).toLocaleDateString("es-MX") : "N/A",
    //     status: row.status === 0
    //       ? "Rechazado"
    //       : row.status === 1
    //       ? "En revisión"
    //       : row.status === 2
    //       ? "Aprobado"
    //       : "Desconocido",
    //   }));

    //   doc.autoTable({
    //     head: [columns.map(col => col.header)],
    //     body: formattedData.map(row => Object.values(row)),
    //     startY: 50,
    //   });

    //   doc.save(`Vacaciones generadas ${formattedDate}.pdf`);
    // }
  };

  const downloadCSV = () => {
    if (!data || !data.length) {
      alert("No hay datos para exportar a CSV");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("es-MX");

    const formatDateTime = (date) => {
      if (!date) return "";
      const adjustedDate = new Date(date);
      adjustedDate.setHours(adjustedDate.getHours() + 6);
      return adjustedDate.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    let columns = [];
    let formattedData = [];

    if (selectedButton === 0) {
      columns = [
        "Colaborador", "Entrada", "Salida", "Entrada (mts)", "Salida (mts)", "Corp. Entrada", "Corp. Salida"
      ];

      formattedData = data.map(row => [
        `${row.name} ${row.last}`,
        formatDateTime(row.entrance),
        formatDateTime(row.leave),
        row.distanceEnt || "",
        row.distanceLeave || "",
        row.locationEntName || "",
        row.locationLeaveName || ""
      ]);

    } else if (selectedButton === 1) {
      columns = [
        "Colaborador", "Entrada", "Salida", "Corp. Entrada", "Corp. Salida"
      ];

      formattedData = data.map(row => [
        `${row.name} ${row.last}`,
        formatDateTime(row.entrance),
        formatDateTime(row.leave),
        row.locationEntName || "",
        row.locationLeaveName || ""
      ]);

    } else {
      columns = [
        "Colaborador", "Aprobador", "Inicio", "Fin", "Estatus"
      ];

      formattedData = data.map(row => [
        `${row.name} ${row.last}`,
        row.aprobatorName || "N/A",
        row.start ? new Date(row.start).toLocaleDateString("es-MX") : "N/A",
        row.end ? new Date(row.end).toLocaleDateString("es-MX") : "N/A",
        row.status === 0
          ? "Rechazado"
          : row.status === 1
          ? "En revisión"
          : row.status === 2
          ? "Aprobado"
          : "Desconocido"
      ]);
    }

    const csvContent = [
      columns.join(","),
      ...formattedData.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte - ${formattedDate}.csv`;
    link.click();
  };

  const downloadXLSX = () => {
    if (!data || !data.length) {
      alert("No hay datos para exportar a Excel");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("es-MX");

    const formatDateTime = (date) => {
      if (!date) return "";
      const adjustedDate = new Date(date);
      adjustedDate.setHours(adjustedDate.getHours() + 6);
      return adjustedDate.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    let rows = [];

    if (selectedButton === 0) {
      rows = data.map(row => ({
        Colaborador: `${row.name} ${row.last}`,
        Entrada: formatDateTime(row.entrance),
        Salida: formatDateTime(row.leave),
        "Entrada (mts)": row.distanceEnt || "",
        "Salida (mts)": row.distanceLeave || "",
        "Corp. Entrada": row.locationEntName || "",
        "Corp. Salida": row.locationLeaveName || ""
      }));
    } else if (selectedButton === 1) {
      rows = data.map(row => ({
        Colaborador: `${row.name} ${row.last}`,
        Entrada: formatDateTime(row.entrance),
        Salida: formatDateTime(row.leave),
        "Corp. Entrada": row.locationEntName || "",
        "Corp. Salida": row.locationLeaveName || ""
      }));
    } else {
      rows = data.map(row => ({
        Colaborador: `${row.name} ${row.last}`,
        Aprobador: row.aprobatorName || "N/A",
        Inicio: row.start ? new Date(row.start).toLocaleDateString("es-MX") : "N/A",
        Fin: row.end ? new Date(row.end).toLocaleDateString("es-MX") : "N/A",
        Estatus:
          row.status === 0
            ? "Rechazado"
            : row.status === 1
            ? "En revisión"
            : row.status === 2
            ? "Aprobado"
            : "Desconocido"
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    XLSX.writeFile(workbook, `Reporte - ${formattedDate}.xlsx`);
  };

  const DateInput = ({ label, value, onChange }) => {
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
      if (value !== inputValue) {
        setInputValue(value || "");
      }
    }, [value]);

    const handleChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleBlur = () => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
        onChange(inputValue);
      }
    };

    return (
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type="date"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="rounded border border-gray-300 px-2 py-1 text-black"
        />
      </div>
    );
  };

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    setData(null);
    setSelectedButton("");
  };
  
  return (
    <div className="mt-[80px] md:ml-[110px] px-5 md:px-0 mr-[0px] text-neutral-50 rounded overflow-hidden">
      <p className="text-[25px] text-black my-4">
        <b>Reportes</b>
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
    <div className="flex w-full pl-5 mt-9">
      <div className="flex flex-col">
        <select
          className="border border-black rounded p-2 text-black"
          value={selectedButton}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) handleButtonClick(value);
          }}
        >
          <option value="">Selecciona un reporte para verificar los datos</option>
          {selectedPeriod.id == 0 && (
            <option value={0}>Reporte de ayer</option>
          )}
          <option value={1}>Asistencia</option>
          {/* <option value={2}>Vacaciones</option> */}
        </select>
      </div>
    </div>
      <div className="mt-5 p-4 bg-gray-100 rounded">
        {data ? (
          <>
            <p className="text-black">Se encontraron {data.length} registros a reportar.</p>
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={downloadPdf}
                className={`px-4 py-2 rounded text-white ${
                  data.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                style={{
                  backgroundColor: secondary,
                }}
                disabled={data.length === 0}
              >
                Generar Reporte PDF
              </button>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 rounded text-white bg-[#2ca089] hover:bg-blue-700"
                disabled={data.length === 0}
              >
                Exportar CSV
              </button>
              <button
                onClick={downloadXLSX}
                className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                disabled={data.length === 0}
              >
                Exportar XLSX
              </button>
            </div>
          </>
        ) : (
          <p className="text-black">Verifica los registros para poder generar un reporte</p>
        )}
      </div>
    </div>
  );
};

export default ReportsMenu;
