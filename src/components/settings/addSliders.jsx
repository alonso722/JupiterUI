import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaImages } from "react-icons/fa";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useApi from "@/hooks/useApi";
import { da } from "date-fns/locale";

function SortableImage({ id, url, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div className="flex flex-col items-center gap-2" style={style} ref={setNodeRef}>
            <div
                {...attributes}
                {...listeners}
                className="w-[150px] h-[150px] border rounded cursor-move hover:shadow-lg transition-shadow flex items-center justify-center bg-white"
            >
                <img src={url} alt="preview" className="object-contain w-full h-full" />
            </div>
            <button
                onClick={() => onRemove(id)}
                className="bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center shadow hover:bg-red-600"
                title="Eliminar imagen"
            >
                ×
            </button>
        </div>
    );
}

export const AddSliders = () => {
    const [images, setImages] = useState([]); 
    const [permissions, setPermissions] = useState([]);
    const api = useApi();
    const effectMounted = useRef(false);

    const fetchImg = async () =>{
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
        const parsedPermissions = JSON.parse(storedPermissions);
        setPermissions(parsedPermissions);

        const response = await api.get(`/user/media/getSliders/${parsedPermissions.Organization}`);
        if (response && response.data) {
            const fetchedImages = response.data.map(item => ({
                id: crypto.randomUUID(),
                url: `${process.env.NEXT_PUBLIC_MS_FILES}/api/v1/file?f=${item.link}`,
            }));

            setImages(fetchedImages);
        } else {
            toast.error("Error al obtener imágenes del carrusel.");
        }
    }
    };

    useEffect(() => {
        if (!effectMounted.current) {
            const storedPermissions = localStorage.getItem("permissions");
            if (storedPermissions) {
                setPermissions(JSON.parse(storedPermissions));
            }
            fetchImg();
            effectMounted.current = true;
        }
    }, []);

    const handleImgsChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleRemove = (id) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over?.id);
            setImages((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

const saveThumbnail = async () => {
    if (!images.length) {
        toast.warn("No has seleccionado imágenes.");
        return;
    }
    try {
        const imgIds = [];

        for (const img of images) {
            if (img.file) {
                const formData = new FormData();
                formData.append("file", img.file);

                const response = await api.post("/user/file/store", formData);

                if (response?.data?.path) {
                    imgIds.push(response.data.path);
                } else {
                    toast.error("Error al subir una imagen.");
                    return;
                }
            } else if (img.url) {
                const url = new URL(img.url);
                const path = url.searchParams.get("f");
                if (path) imgIds.push(path);
                else {
                    toast.error("Error con la URL de una imagen existente.");
                    return;
                }
            }
        }

        const data = {
            imgId: imgIds,
            orga: permissions.Organization,
            type: "slider"
        };
        await api.post("/user/media/addSlider", { data });

        toast.success("Imágenes del carrusel guardadas correctamente.");
        
    } catch (error) {
        console.error("Error al guardar las imágenes:", error);
        toast.error("Error al guardar las miniaturas.");
    }
};


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    return (
        <div className="w-full mt-6 px-4">
            <label className="block mb-2 font-semibold">Subir imágenes del carrusel</label>
            <input type="file" multiple onChange={handleImgsChange} className="mb-6" />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={images.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
                    <div className="flex gap-4 min-h-[150px] border p-4 rounded-md overflow-x-auto">
                        {images.map((img) => (
                            <SortableImage
                                key={img.id}
                                id={img.id}
                                url={img.url}
                                onRemove={() => handleRemove(img.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={saveThumbnail}
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
            >
                Guardar Carrusel
                <FaImages />
            </button>
        </div>
    );
};

export default AddSliders;
