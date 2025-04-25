import axios from 'axios';

// Crear una instancia de axios con la URL base del servidor API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Configurar interceptores para manejar tokens de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe un token, añadirlo a los headers de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Limpiar localStorage y redirigir a login si es necesario
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // La redirección se maneja en los componentes
    }
    
    return Promise.reject(error);
  }
);

// Función para realizar predicciones
api.predict = async (predictionData) => {
  try {
    const response = await api.post('/api/predict', predictionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;