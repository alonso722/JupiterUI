import { createContext, useState, useRef, useContext, useEffect } from 'react';
import useApi from '@/hooks/useApi'; 

const ColorService = createContext({
  primary: '#F1CF2B', 
  secondary: '#442E69' 
});

export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState({
    primary: '#F1CF2B', 
    secondary: '#442E69' 
  });
  const [permissions, setPermissions] = useState([]);
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (effectMounted.current === false) {
      const fetchColors = async () => {
        let response; // Declarar la variable aquí
        try {
          let parsedPermissions;
          const storedPermissions = localStorage.getItem('permissions');

          if (storedPermissions) {
            parsedPermissions = JSON.parse(storedPermissions);
            console.log(parsedPermissions);
            setPermissions(parsedPermissions);
          }

          // Verificar si hay permisos y si se debe realizar la consulta
          if (parsedPermissions && parsedPermissions.Organization) {
            response = await api.post('/user/organization/getSets', parsedPermissions); 
            console.log(response);
          }

          // Asignar colores según el resultado de la consulta
          if (response) {
            let newColors = {
              primary: response.data.data.t01_primary_color || '#F1CF2B',   
              secondary: response.data.data.t01_secondary_color || '#442E69' 
            };
            console.log(response.data.data);
            console.log(newColors);
            setColors(newColors);
          } else {
            // Asignar valores predeterminados si no hay respuesta o no se realizó la consulta
            setColors({
              primary: '#F1CF2B',
              secondary: '#442E69'
            });
          }

        } catch (error) {
          console.error('Error fetching colors:', error);
          // Asignar valores predeterminados en caso de error
          setColors({
            primary: '#F1CF2B',
            secondary: '#442E69'
          });
        }
      };

      fetchColors();
      effectMounted.current = true;
    }
  }, [api]);

  return (
    <ColorService.Provider value={colors}>
      {children}
    </ColorService.Provider>
  );
};

export const useColors = () => useContext(ColorService);
