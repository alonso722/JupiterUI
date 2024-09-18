import { createContext, useState, useRef, useContext, useEffect } from 'react';
import useApi from '@/hooks/useApi'; 
import { color } from 'framer-motion';

const ColorService = createContext({
  primary: '#007bff', 
  secondary: '#442E69' 
});

export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState({
    primary: '#007bff', 
    secondary: '#442E69' 
  });
  const [permissions, setPermissions] = useState([]);
  const effectMounted = useRef(false);
  const api = useApi();

  useEffect(() => {
    if (effectMounted.current === false) {
    const fetchColors = async () => {
      try {
        let parsedPermissions;
        const storedPermissions = localStorage.getItem('permissions');
        
        if (storedPermissions) {
          parsedPermissions = JSON.parse(storedPermissions);
          console.log(parsedPermissions);
          setPermissions(parsedPermissions);
        }
  
        const response = await api.post('/user/organization/getSets', parsedPermissions); 
  
        if (response) {
          let colors = {
            primary: response.data.data.t01_primary_color || '#007bff',   
            secondary: response.data.data.t01_secondary_color || '#442E69' 
          };
          console.log(response.data.data);
          console.log(colors);
          setColors(colors);
        } else {
          setColors({
            primary: '#007bff',
            secondary: '#442E69'
          });
        }
  
      } catch (error) {
        console.error('Error fetching colors:', error);
        setColors({
          primary: '#007bff',
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
