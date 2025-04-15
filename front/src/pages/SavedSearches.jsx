import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

const SavedSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si el usuario está logueado
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSavedSearches = async () => {
      try {
        const userData = JSON.parse(user);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }

        const response = await api.get(`/api/users/${userData.username}/searches`);

        setSearches(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar búsquedas guardadas:', error);
        setError('No se pudieron cargar las búsquedas guardadas');
        setLoading(false);
        toast.error('Error al cargar las búsquedas guardadas');
      }
    };

    fetchSavedSearches();
  }, [navigate]);

  const handleDeleteSearch = async (searchId) => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      await api.delete(`/api/users/${userData.username}/searches/${searchId}`);

      // Actualizar la lista de búsquedas
      setSearches(searches.filter(search => search.id !== searchId));
      toast.success('Búsqueda eliminada con éxito');
    } catch (error) {
      console.error('Error al eliminar búsqueda:', error);
      toast.error('Error al eliminar la búsqueda');
    }
  };

  const handleViewSearch = (neighborhood) => {
    navigate(`/analysis/${neighborhood}`);
  };

  const renderSearchDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <BookmarkIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
        <Typography component="h1" variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
          Mis Búsquedas Guardadas
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1, color: '#424242' }}>
          Accede rápidamente a tus análisis de barrios guardados
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
        </Paper>
      ) : searches.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
            No tienes búsquedas guardadas
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            startIcon={<SearchIcon />}
            sx={{ 
              bgcolor: '#1a237e', 
              '&:hover': { bgcolor: '#0d1b60' },
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Realizar una búsqueda
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {searches.map((search) => (
            <Grid item xs={12} sm={6} md={4} key={search.id}>
              <Card 
                elevation={4} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ color: '#1a237e', fontWeight: 'bold', mb: 1 }}>
                    {search.neighborhood}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {renderSearchDate(search.created_at)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<SearchIcon />}
                      onClick={() => handleViewSearch(search.neighborhood)}
                      sx={{ 
                        color: '#1a237e',
                        '&:hover': { bgcolor: 'rgba(26, 35, 126, 0.1)' }
                      }}
                    >
                      Ver
                    </Button>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteSearch(search.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SavedSearches;