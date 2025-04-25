import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Chip from '@mui/material/Chip';
import Navbar from '../components/Navbar';

const Analysis = () => {
  const { neighborhood } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [predictions, setPredictions] = useState(null);
  
  // Obtener los valores de los filtros de la URL
  const searchParams = new URLSearchParams(location.search);
  const [selectedBeds, setSelectedBeds] = useState(searchParams.get('beds') || '');
  const [selectedBathrooms, setSelectedBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [selectedAccommodates, setSelectedAccommodates] = useState(searchParams.get('accommodates') || '');
  const [selectedRoomType, setSelectedRoomType] = useState(searchParams.get('roomType') || '');
  const [neighborhoodEncoded, setNeighborhoodEncoded] = useState(searchParams.get('neighbourhood_encoded') || '0');
  
  // Mapeo de valores de tipo de habitación a etiquetas
  const roomTypeLabels = {
    'entire_home': 'Casa/Apartamento',
    'hotel_room': 'Habitación hotel',
    'private_room': 'Habitación privada',
    'shared_room': 'Habitación compartida'
  };

  // Mapeo de valores de tipo de habitación para la API
  const roomTypeApiMapping = {
    'entire_home': 'Entire home/apt',
    'hotel_room': 'Hotel room',
    'private_room': 'Private room',
    'shared_room': 'Shared room'
  };

  // Función para realizar la predicción de precio
  const predictPrice = async () => {
    try {
      // Preparar los datos para la predicción
      const predictionData = {
        accommodates: selectedAccommodates ? parseInt(selectedAccommodates) : 2,
        bathrooms: selectedBathrooms ? parseFloat(selectedBathrooms) : 1,
        beds: selectedBeds ? parseInt(selectedBeds) : 1,
        room_type: selectedRoomType ? roomTypeApiMapping[selectedRoomType] : 'Entire home/apt',
        neighbourhood_val: neighborhoodEncoded ? parseFloat(neighborhoodEncoded) : 0
      };
      
      // Llamar a la API para obtener la predicción
      const response = await axios.post('http://localhost:8000/api/predict', predictionData);
      
      // Guardar las predicciones
      setPredictions(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error al realizar la predicción:', error);
      // Si hay un error, devolver predicciones simuladas
      const mockPredictions = {
        random_forest: 85,
        xgboost: 95,
        average: 90
      };
      setPredictions(mockPredictions);
      return mockPredictions;
    }
  };

  useEffect(() => {
    // Verificar si el usuario está logueado
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        
        // Realizar la predicción de precio
        const pricePredictions = await predictPrice();
        
        // Construir la URL con todos los parámetros para la API
        let apiUrl = `/api/analysis/${neighborhood}`;
        const apiParams = new URLSearchParams();
        
        if (selectedBeds) apiParams.append('beds', selectedBeds);
        if (selectedBathrooms) apiParams.append('bathrooms', selectedBathrooms);
        if (selectedAccommodates) apiParams.append('accommodates', selectedAccommodates);
        if (selectedRoomType) apiParams.append('roomType', selectedRoomType);
        
        const apiQueryString = apiParams.toString();
        if (apiQueryString) {
          apiUrl += `?${apiQueryString}`;
        }
        
        // Obtener datos de análisis del barrio con los filtros
        const response = await axios.get(apiUrl);
        
        // Combinar los datos de análisis con las predicciones
        const combinedData = {
          ...response.data,
          predictions: pricePredictions,
          predictedPrice: pricePredictions.average
        };
        
        setAnalysisData(combinedData);
        
        // Verificar si esta búsqueda está guardada (solo para usuarios logueados)
        if (user) {
          const userData = JSON.parse(user);
          const token = localStorage.getItem('token');
          
          try {
            const savedSearchesResponse = await axios.get(`/api/users/${userData.username}/searches`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Comprobar si este barrio está en las búsquedas guardadas
            const isNeighborhoodSaved = savedSearchesResponse.data.some(
              search => search.neighborhood === neighborhood
            );
            
            setIsSaved(isNeighborhoodSaved);
          } catch (error) {
            console.error('Error al verificar búsquedas guardadas:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos de análisis:', error);
        setError('No se pudieron cargar los datos de análisis para este barrio');
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [neighborhood, selectedBeds, selectedBathrooms, selectedAccommodates, selectedRoomType, neighborhoodEncoded]);

  const handleSaveSearch = async () => {
    if (!isLoggedIn) {
      toast.info('Debes iniciar sesión para guardar búsquedas');
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      if (isSaved) {
        // Eliminar de guardados
        const savedSearchesResponse = await axios.get(`/api/users/${userData.username}/searches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const savedSearch = savedSearchesResponse.data.find(
          search => search.neighborhood === neighborhood
        );
        
        if (savedSearch) {
          await axios.delete(`/api/users/${userData.username}/searches/${savedSearch.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setIsSaved(false);
          toast.success('Búsqueda eliminada de guardados');
        }
      } else {
        // Guardar búsqueda
        await axios.post(`/api/users/${userData.username}/searches`, {
          neighborhood: neighborhood
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsSaved(true);
        toast.success('Búsqueda guardada con éxito');
      }
    } catch (error) {
      console.error('Error al guardar/eliminar búsqueda:', error);
      toast.error('Error al procesar la operación');
    }
  };

  // Función para formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Datos de ejemplo para mostrar mientras se implementa la API real
  const mockData = {
    averagePrice: 85,
    predictedPrice: 90,
    predictions: {
      random_forest: 85,
      xgboost: 95,
      average: 90
    }
  };

  // Ensure displayData has all required properties
  const ensureDataStructure = (data) => {
    return {
      averagePrice: data?.averagePrice || 0,
      predictedPrice: data?.predictedPrice || 0,
      predictions: data?.predictions || {},
      totalListings: data?.totalListings || 0,
      averageRating: data?.averageRating || 0,
      priceRange: {
        min: data?.priceRange?.min || 0,
        max: data?.priceRange?.max || 0
      },
      popularAmenities: data?.popularAmenities || [],
      occupancyRate: data?.occupancyRate || 0,
      seasonalTrends: data?.seasonalTrends || [],
      priceFactors: data?.priceFactors || []
    };
  };

  // Usar datos reales si están disponibles, de lo contrario usar datos de ejemplo
  const displayData = ensureDataStructure(analysisData || mockData);

  return (
    <>
      <Navbar />
      {/* Barra de filtros seleccionados - Reducido el padding vertical */}
      <Box 
        sx={{ 
          width: '100%', 
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          py: 1 // Reducido de 2 a 1
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#333',
              color: 'white',
              p: 1.5, // Reducido de 2 a 1.5
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Analizando:
            </Typography>
            
            <Chip 
              label={`Barrio: ${neighborhood}`}
              sx={{ 
                mr: 1, 
                backgroundColor: '#FF385C',
                color: 'white'
              }} 
            />
            
            <Chip 
              label={`Camas: ${selectedBeds || 'Cualquiera'}`} 
              sx={{ 
                mr: 1, 
                backgroundColor: '#5bc0de',
                color: 'white'
              }} 
            />
            
            <Chip 
              label={`Baños: ${selectedBathrooms || 'Cualquiera'}`} 
              sx={{ 
                mr: 1, 
                backgroundColor: '#6c757d',
                color: 'white'
              }} 
            />
            
            <Chip 
              label={`Tipo: ${selectedRoomType ? (roomTypeLabels[selectedRoomType] || selectedRoomType) : 'Cualquiera'}`} 
              sx={{ 
                mr: 1, 
                backgroundColor: '#5bc0de',
                color: 'white'
              }} 
            />
            
            <Chip 
              label={`Viajeros: ${selectedAccommodates || 'Cualquiera'}`} 
              sx={{ 
                backgroundColor: '#6c757d',
                color: 'white'
              }} 
            />
          </Box>
        </Container>
      </Box>
      
      {/* Contenedor principal - Reducido el margen superior */}
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}> {/* Reducido mt de 4 a 2 */}
        <ToastContainer position="top-center" autoClose={3000} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}> {/* Reducido mt de 8 a 4 */}
            <CircularProgress size={60} sx={{ color: '#1a237e' }} />
          </Box>
        ) : error ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#ffebee'
            }}
          >
            <Typography color="error">{error}</Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mt: 2, bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
            >
              Volver al inicio
            </Button>
          </Paper>
        ) : (
          <>
            {/* Título y botón de guardar - Reducido el margen inferior */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}> {/* Reducido mb de 4 a 2 */}
              <Typography variant="h4" component="h1" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Análisis: {neighborhood}
              </Typography>
              
              {isLoggedIn && (
                <Button
                  variant="outlined"
                  startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  onClick={handleSaveSearch}
                  sx={{ 
                    borderColor: '#1a237e', 
                    color: '#1a237e',
                    '&:hover': { borderColor: '#0d1b60', bgcolor: 'rgba(26, 35, 126, 0.1)' }
                  }}
                >
                  {isSaved ? 'Guardado' : 'Guardar'}
                </Button>
              )}
            </Box>

            {/* Tarjeta de Precio Predicho centrada */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Card 
                elevation={4} 
                sx={{ 
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                  color: 'white'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 28, mr: 1 }} />
                    <Typography variant="h6">Precio Predicho</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatPrice(displayData.predictedPrice)}
                  </Typography>
                  
                  {/* Mostrar predicciones individuales de cada modelo */}
                  {displayData.predictions && Object.keys(displayData.predictions).length > 0 && (
                    <Box sx={{ mt: 2, mb: 2, p: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Predicciones por modelo:
                      </Typography>
                      {Object.entries(displayData.predictions).map(([model, price]) => (
                        model !== 'average' && (
                          <Typography key={model} variant="body2" sx={{ mb: 0.5 }}>
                            {model === 'random_forest' ? 'Random Forest' : model === 'xgboost' ? 'XGBoost' : model}: {formatPrice(price)}
                          </Typography>
                        )
                      ))}
                    </Box>
                  )}
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {displayData.predictedPrice > displayData.averagePrice ? '↑' : '↓'} 
                    {Math.abs(((displayData.predictedPrice - displayData.averagePrice) / displayData.averagePrice) * 100).toFixed(1)}% 
                    respecto al actual
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default Analysis;