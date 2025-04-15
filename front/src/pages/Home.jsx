import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import Container from '@mui/material/Container';

// Lista de barrios de Madrid (ejemplo)
const neighborhoods = [
  'Centro',
  'Salamanca',
  'Chamberí',
  'Retiro',
  'Chamartín',
  'Tetuán',
  'Arganzuela',
  'Moncloa-Aravaca',
  'Latina',
  'Carabanchel',
  'Usera',
  'Puente de Vallecas',
  'Moratalaz',
  'Ciudad Lineal',
  'Hortaleza',
  'Villaverde',
  'Villa de Vallecas',
  'Vicálvaro',
  'San Blas-Canillejas',
  'Barajas'
];

const Home = () => {
  const [neighborhood, setNeighborhood] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setNeighborhood(event.target.value);
  };

  const handleSearch = () => {
    if (neighborhood) {
      navigate(`/analysis/${neighborhood}`);
    }
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        minHeight: '50px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center'
         // Añadido padding-top para compensar el navbar fijo
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4, maxWidth: 800 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#222222' }}>
          Análisis Predictivo de AirBnB Madrid
        </Typography>
        <Typography variant="h5" sx={{ color: '#424242', mb: 2 }}>
          Descubre datos y predicciones sobre alojamientos en Madrid
        </Typography>
      </Box>
      
      <Paper 
        elevation={6} 
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#222222' }}>
          Selecciona un barrio para comenzar
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="neighborhood-select-label">Barrio</InputLabel>
          <Select
            labelId="neighborhood-select-label"
            id="neighborhood-select"
            value={neighborhood}
            label="Barrio"
            onChange={handleChange}
          >
            {neighborhoods.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={handleSearch}
          disabled={!neighborhood}
          startIcon={<SearchIcon />}
          sx={{ 
            bgcolor: '#FF385C', 
            '&:hover': { bgcolor: '#E31C5F' },
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Buscar
        </Button>
      </Paper>
    </Container>
  );
};

export default Home;