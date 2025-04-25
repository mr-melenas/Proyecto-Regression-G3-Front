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
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HotelIcon from '@mui/icons-material/Hotel';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Divider from '@mui/material/Divider';
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
  
  // Obtener los valores de los filtros de la URL
  const searchParams = new URLSearchParams(location.search);
  const [selectedBeds, setSelectedBeds] = useState(searchParams.get('beds') || '');
  const [selectedBathrooms, setSelectedBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [selectedAccommodates, setSelectedAccommodates] = useState(searchParams.get('accommodates') || '');
  const [selectedRoomType, setSelectedRoomType] = useState(searchParams.get('roomType') || '');
  
  // Mapeo de valores de tipo de habitación a etiquetas
  const roomTypeLabels = {
    'entire_home': 'Casa/Apartamento',
    'hotel_room': 'Habitación hotel',
    'private_room': 'Habitación privada',
    'shared_room': 'Habitación compartida'
  };

  useEffect(() => {
    // Verificar si el usuario está logueado
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
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
        setAnalysisData(response.data);
        
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
  }, [neighborhood, selectedBeds, selectedBathrooms, selectedAccommodates, selectedRoomType]);

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
        // Nota: Aquí asumimos que hay un endpoint para obtener el ID de la búsqueda guardada
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
    predictedPrice: 92,
    totalListings: 243,
    averageRating: 4.7,
    priceRange: { min: 45, max: 250 },
    popularAmenities: ['WiFi', 'Cocina', 'Calefacción', 'Aire acondicionado', 'Lavadora'],
    occupancyRate: 78,
    seasonalTrends: [
      { season: 'Primavera', trend: 'Estable' },
      { season: 'Verano', trend: 'Alta' },
      { season: 'Otoño', trend: 'Media' },
      { season: 'Invierno', trend: 'Baja' }
    ],
    priceFactors: [
      { factor: 'Ubicación', impact: 'Alto' },
      { factor: 'Tamaño', impact: 'Medio' },
      { factor: 'Amenidades', impact: 'Medio' },
      { factor: 'Temporada', impact: 'Alto' }
    ]
  };

  // Ensure displayData has all required properties
  const ensureDataStructure = (data) => {
    return {
      averagePrice: data?.averagePrice || 0,
      predictedPrice: data?.predictedPrice || 0,
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
      {/* Barra de filtros seleccionados */}
      <Box 
        sx={{ 
          width: '100%', 
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          py: 2
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
              p: 2,
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
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <ToastContainer position="top-center" autoClose={3000} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Análisis: {neighborhood}
              </Typography>
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
            </Box>

            <Grid container spacing={3}>
              {/* Tarjetas de información principal */}
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                    color: 'white'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AttachMoneyIcon sx={{ fontSize: 28, mr: 1 }} />
                      <Typography variant="h6">Precio Medio</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatPrice(displayData.averagePrice)}
                    </Typography>
                    <Typography variant="body2">
                      Rango: {formatPrice(displayData.priceRange?.min || 0)} - {formatPrice(displayData.priceRange?.max || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
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
                    <Typography variant="body2">
                      {displayData.predictedPrice > displayData.averagePrice ? '↑' : '↓'} 
                      {Math.abs(((displayData.predictedPrice - displayData.averagePrice) / displayData.averagePrice) * 100).toFixed(1)}% 
                      respecto al actual
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00695c 0%, #00897b 100%)',
                    color: 'white'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HomeIcon sx={{ fontSize: 28, mr: 1 }} />
                      <Typography variant="h6">Alojamientos</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {displayData.totalListings}
                    </Typography>
                    <Typography variant="body2">
                      Tasa de ocupación: {displayData.occupancyRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #c62828 0%, #d32f2f 100%)',
                    color: 'white'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StarIcon sx={{ fontSize: 28, mr: 1 }} />
                      <Typography variant="h6">Valoración Media</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {displayData.averageRating}
                    </Typography>
                    <Typography variant="body2">
                      De 5 estrellas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sección de análisis detallado */}
              <Grid item xs={12}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 3, 
                    mt: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
                    Análisis Predictivo
                  </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                        Factores que Influyen en el Precio
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        {displayData.priceFactors.map((factor, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body1">{factor.factor}</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{factor.impact}</Typography>
                            </Box>
                            <Divider />
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                        Tendencias Estacionales
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        {displayData.seasonalTrends.map((season, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body1">{season.season}</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: season.trend === 'Alta' ? '#2e7d32' : 
                                         season.trend === 'Media' ? '#f57c00' : 
                                         season.trend === 'Baja' ? '#c62828' : '#1565c0'
                                }}
                              >
                                {season.trend}
                              </Typography>
                            </Box>
                            <Divider />
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" sx={{ mt: 2, mb: 2, color: '#1a237e' }}>
                    Amenidades Populares
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {displayData.popularAmenities.map((amenity, index) => (
                      <Chip 
                        key={index} 
                        label={amenity} 
                        sx={{ 
                          bgcolor: '#e8eaf6', 
                          color: '#1a237e',
                          fontWeight: 'medium'
                        }} 
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default Analysis;