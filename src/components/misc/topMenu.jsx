'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useState, useRef, useEffect } from 'react';
import { Menu, Transition, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast } from 'react-toastify';
import { useRecoilState } from 'recoil';
import { authState } from '@/state/auth';
import useApi from '@/hooks/useApi';
import { useColors } from '@/services/colorService';

export default function TopNewMenuClientDashboard() {
    const [permissions, setPermissions] = useState([]);
    const [name, setName] = useState('');
    const [last, setLast] = useState('');
    const searchParams = useSearchParams();
    const effectMounted = useRef(false);
    const [authStateValue, setAuth] = useRecoilState(authState);
    const router = useRouter();
    const department = searchParams.get('department');
    const [logoUrl, setLogoUrl] = useState('');
    const api = useApi();
    const { primary, secondary } = useColors();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [files, setFile] = useState([]);

    const showToast = (type, message) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    const [notifications, setNotifications] = useState([ ]);

      const getNotificationMessage = (type, process) => {
        switch (type) {
          case 1:
            return `Se te asignó un rol en el proceso: ${process}`;
          case 2:
            return `Se actualizó el estado del proceso: ${process}`;
          case 3:
            return `Se realizó un comentario en el proceso: ${process}`;
          default:
            return `Notificación relacionada con el ${process}`;
        }
      };

    useEffect(() => {
        let parsedPermissions;
        
        if (effectMounted.current === false) {
            if (!authStateValue.loggedIn) {
                showToast('error', 'Sin autenticación');
                router.push('/auth/login');
            }
            const storedToken = localStorage.getItem('token');
            const storedPermissions = localStorage.getItem('permissions'); 
            if (storedPermissions) {
                parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            }
            const uuid = parsedPermissions.uuid;
            const orga = parsedPermissions.Organization;
            const name = api.post('/user/users/getNameById', {uuid})
            .then((response) => {
                const uName = response.data.name;
                const uLast = response.data.last;
                setName(uName);
                setLast(uLast);
            })
            .catch((error) => {
              console.error("Error al consultar nombre:", error);
            });
            if (!authStateValue.loggedIn) {
                showToast('error', 'Sin autenticación');
                router.push('/auth/login');
            }
            api.post('/user/organization/getLogo', {orga})
            .then((response) => {
                const buffer = response.data.data[0];
                const imageData = response.data.data[0];
                if(imageData?.buffer?.data){
                    const arrayBuffer = imageData.buffer.data;
                    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: imageData.type });
                    const url = URL.createObjectURL(blob);
                    setLogoUrl(url);
                }
              })
              .catch((error) => {
                console.error("Error al consultar nombre:", error);
              });
              api.post('/user/notifications/fetch', {uuid})
              .then((response) => {
                const nots = response.data
                setNotifications(nots)

              })
              .catch((error) => {
                console.error("Error al consultar notificaciones", error);
              });
              fetchLogo();
              getTime();
            effectMounted.current = true;
        }
    }, [authStateValue.loggedIn, router, setAuth, searchParams, department]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && !['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
          showToast('error', 'Solo se permiten archivos de imagen (JPEG, PNG, GIF).');
          setFile(null); 
        } else {
          setFile(selectedFile);
        }
    };

    const getTime = async () => {
        let parsedPermissions = {};
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
        }
        const uuid = parsedPermissions.uuid;
        try {
            const response = await api.post('/user/time/getTime', {uuid});
            const time = response.data;
            if(time.code == 1 ){
                showToast('warning', 'Hora límite de registro de entrada!');
            }
            if(time.code == 2 ){
                showToast('warning', 'No olvides registrar tu salida...');
            }
        } catch (error) {
            console.error("Error al consultar nombre:", error);
        }
    };

    const fetchLogo = async () => {
        const storedPermissions = localStorage.getItem('permissions'); 
        if (storedPermissions) {
            const parsedPermissions = JSON.parse(storedPermissions);
            const orga = parsedPermissions.Organization;
            try {
                const response = await api.post('/user/organization/getLogo', { orga });
                const imageData = response.data.data[0];
                if(imageData?.buffer?.data){
                    const arrayBuffer = imageData.buffer.data;
                    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: imageData.type });
                    const url = URL.createObjectURL(blob);
                    setLogoUrl(url);
                }
            } catch (error) {
                console.error("Error al consultar nombre:", error);
            }
        }
    };
      
    const handleSubmit = async () => {
        if (!files) {
            showToast('error', 'Por favor, seleccione un archivo para cargar.');
            return;
        }
        const file = Array.isArray(files) ? files[0] : files;
        if (!file.type.startsWith('image/')) {
            showToast('error', 'El archivo seleccionado no es una imagen.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const orga = permissions.Organization || '';
        formData.append('orga', orga);
    
        try {
            const response = await api.post('/user/organization/updateLogo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'orgaId':orga
                },
            });
    
            if (response.status === 200) {
                showToast('success', 'Imagen cargada exitosamente.');
                closeModal();
            } else {
                showToast('error', 'Error al cargar la imagen.');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            showToast('error', 'Error en la solicitud.');
        }
    };

    const unreadCount = notifications.filter((n) => n.read === 0).length;

    const deleteNotification = (id, path) => {
        setNotifications(notifications.filter((notification) => notification.id !== id));
        let read = {}
        read.id = id
        read.uuid = permissions.uuid;
        api.post('/user/notifications/del', {read})
      };

      const handleNavigation = (notification) => {
        let read = {};
        let process = {};
        read.id = notification.id;
        read.uuid = permissions.uuid;
        process.name = notification.processName;
        process.id = notification.process;
        
        api.post('/user/notifications/read', { read });
    
        let path = '';
        if (notification.type === 1 || notification.type === 2|| notification.type === 3) {
            path = `/dashboard/kanban?processId=${process.id}&processName=${encodeURIComponent(process.name)}`;
        }
        if (path) {
            window.location.href = path;
        }
    };    

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div className="flex items-center justify-between fixed bg-white w-full border-b-4 z-50">
                <div className="flex items-center pb-2 pt-5 ml-5">
                    <div className="relative w-[200px] h-[40px] overflow-hidden">
                        <Image
                        src={logoUrl || '/logos/Lg_JIso.svg'}
                        alt="Logo"
                        fill
                        className="object-contain"
                        />
                    </div>
                </div>
                <div className="flex-1 flex justify-center">
                    <p className="text-black text-center "><b>{name} {last}</b></p>
                </div>
                <div className="flex h-11 w-[346px] items-center justify-end pr-8">
                    {/* <div className="mr-[47px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="19"
                            viewBox="0 0 18 19"
                            fill="none">
                            <path
                                d="M6.5 0.598633C8.22391 0.598633 9.87721 1.28345 11.0962 2.50244C12.3152 3.72143 13 5.37473 13 7.09863C13 8.70863 12.41 10.1886 11.44 11.3286L11.71 11.5986H12.5L17.5 16.5986L16 18.0986L11 13.0986V12.3086L10.73 12.0386C9.59 13.0086 8.11 13.5986 6.5 13.5986C4.77609 13.5986 3.12279 12.9138 1.90381 11.6948C0.684819 10.4758 0 8.82254 0 7.09863C0 5.37473 0.684819 3.72143 1.90381 2.50244C3.12279 1.28345 4.77609 0.598633 6.5 0.598633ZM6.5 2.59863C4 2.59863 2 4.59863 2 7.09863C2 9.59863 4 11.5986 6.5 11.5986C9 11.5986 11 9.59863 11 7.09863C11 4.59863 9 2.59863 6.5 2.59863Z"
                                fill="#2C1C47"/>
                        </svg>
                    </div> */}
                    <Link
                        href={permissions?.Type === 5 ? "/dashboard/consultor" : "/dashboard/home"}
                        className="mr-[38px] text-base font-bold leading-4"
                        style={{ color: primary || "" }} >
                        Inicio
                    </Link>
                    <div className="mr-[36px] text-black">
                        <Menu as="div" className="relative inline-block text-left">
                            <div className="relative">
                                <Menu.Button className="inline-flex justify-center rounded-full px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200">
                                    <i className="fas fa-bell"></i>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full text-xs text-white"
                                            style={{ backgroundColor: primary }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </Menu.Button>
                            </div>
                            <Transition as={Fragment}>
                                <Menu.Items className="cursor-pointer absolute right-0 mt-2 w-64 origin-top-right bg-white max-h-[400px] overflow-y-auto divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1 px-3 border-b-4">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <Menu.Item key={notification.id}>
                                                    {({ active }) => (
                                                        <div
                                                            onClick={() => handleNavigation(notification)} 
                                                            className={`flex justify-between rounded my-2 items-center px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${notification.read ? 'font-normal' : 'font-bold'}`}
                                                            style={{ backgroundColor: notification.read ? '#ffffff' : `#EDF2F7` }}>
                                                            <div className="flex items-center">
                                                                {!notification.read && (
                                                                    <span className="min-h-[10px] min-w-[10px] rounded-full mr-2" style={{ backgroundColor: primary }}></span>
                                                                )}
                                                                <div>
                                                                   <span>{getNotificationMessage(notification.type, notification.processName)}</span>
                                                                <p className='text-[9px] text-black'>{new Date(notification.date).toLocaleString()}</p> 
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(event) => {
                                                                    event.stopPropagation(); 
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="ml-4 text-black text-xs px-2 py-1 rounded">
                                                                x
                                                            </button>
                                                        </div>
                                                    )}
                                                </Menu.Item>
                                            ))
                                        ) : (
                                            <div className="block px-4 py-2 text-sm text-gray-700">No tienes notificaciones</div>
                                        )}
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                    <div className="font-semibold text-[14px] text-darkJupiter">
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="inline-flex justify-center rounded-full bg-white text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">
                                    <i className="text-black fa fa-user-circle ml-1" style={{ fontSize: '20px', width: '20px', height: '20px' }}></i>
                                </Menu.Button>
                            </div>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-[224px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                    <form method="POST" action="#">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link href="/profile" passHref >
                                                        <button
                                                            type='button'
                                                            className={`flex rounded mx-2 justify-center items-center mt-[13px] mb-[10px] w-[90%] min-h-[30px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-200`}>
                                                            <Image
                                                            className='mr-[10px]'
                                                            src="/svg/icons/accountSett.svg"
                                                            alt="Perfil"
                                                            width={17}
                                                            height={18}/>
                                                        <span>Mi cuenta</span>
                                                        </button>
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        </form>
                                        {(permissions.Type === 1 || permissions.Type === 6) && (
                                            <form method="POST" action="#">
                                                <Menu.Item>
                                                {({ active }) => (
                                                    <Link href="/settings" passHref>
                                                    <button
                                                        type="button"
                                                        className={`flex rounded mx-2 justify-center items-center mt-[13px] mb-[10px] w-[90%] min-h-[30px] ${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                        } hover:bg-gray-200`}
                                                    >
                                                        <Image
                                                        className="mr-[10px]"
                                                        src="/svg/icons/settings.svg"
                                                        alt="Ajustes"
                                                        width={17}
                                                        height={18}
                                                        />
                                                        <span>Configuración</span>
                                                    </button>
                                                    </Link>
                                                )}
                                                </Menu.Item>
                                            </form>
                                        )}
                                        {/* <Menu.Item>
                                            {({ active }) => (
                                                <a href="/user/help" className={`flex rounded mx-2 justify-center items-center my-[13px] w-[90%] min-h-[30px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-200`}>
                                                    <Image
                                                        className='mr-[10px]'
                                                        src="/svg/icons/help.svg"
                                                        alt="Ayuda"
                                                        width={17}
                                                        height={17}
                                                    />
                                                    Ayuda
                                                </a>
                                            )}
                                        </Menu.Item> */}
                                        <form method="POST" action="#">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link href="/dashboard/logout" passHref>
                                                        <button 
                                                            type="button" 
                                                            className={`flex rounded mx-2 justify-center items-center mt-[13px] mb-[10px] w-[90%] min-h-[30px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-200`}>
                                                            <Image
                                                            className='mr-[10px]'
                                                            src="/svg/icons/logOut.svg"
                                                            alt="Salir"
                                                            width={15}
                                                            height={17}/>
                                                            <span>Salir</span>
                                                        </button>
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        </form>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
            <hr className="dark:bg-camposDark h-1 rounded" />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#2C1C47] bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
                    <button onClick={closeModal} className="bg-transparent rounded absolute top-2 pb-1 w-[35px] right-2 text-2xl font-bold text-black hover:text-gray-700">
                        &times;
                    </button>
                    <h2 className="text-2xl mb-4 text-black">Cargar nuevo logo</h2>
                    <input type="file" onChange={handleFileChange} className="mb-4" />
                        <div>                    
                            <button
                                onClick={handleSubmit}
                                className={`p-2 rounded text-white ${!files ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2C1C47] hover:bg-[#1B1130] cursor-pointer'}`}
                                disabled={!files} >
                                Cargar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
