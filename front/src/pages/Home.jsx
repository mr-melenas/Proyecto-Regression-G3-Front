import { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

const Home = () => {
  const [neighborhood, setNeighborhood] = useState('');
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedBeds, setSelectedBeds] = useState('');
  const [bathrooms, setBathrooms] = useState([]);
  const [selectedBathrooms, setSelectedBathrooms] = useState('');
  const [accommodates, setAccommodates] = useState([]);
  const [selectedAccommodates, setSelectedAccommodates] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch neighborhoods
        const neighborhoodsResponse = await fetch('http://localhost:8000/api/neighborhoods');
        if (!neighborhoodsResponse.ok) {
          throw new Error('Error al cargar los barrios');
        }
        const neighborhoodsData = await neighborhoodsResponse.json();
        const sortedNeighborhoods = neighborhoodsData.sort((a, b) => 
          a.neighbourhood_cleansed.localeCompare(b.neighbourhood_cleansed)
        );
        setNeighborhoods(sortedNeighborhoods);
        
        // Fetch beds
        try {
          const bedsResponse = await fetch('http://localhost:8000/api/beds');
          if (bedsResponse.ok) {
            const bedsData = await bedsResponse.json();
            setBeds(bedsData);
          }
        } catch (err) {
          console.error('Error fetching beds:', err);
        }
        
        // Fetch bathrooms
        try {
          const bathroomsResponse = await fetch('http://localhost:8000/api/bathrooms');
          if (bathroomsResponse.ok) {
            const bathroomsData = await bathroomsResponse.json();
            setBathrooms(bathroomsData);
          }
        } catch (err) {
          console.error('Error fetching bathrooms:', err);
        }
        
        // Fetch accommodates
        try {
          const accommodatesResponse = await fetch('http://localhost:8000/api/accommodates');
          if (accommodatesResponse.ok) {
            const accommodatesData = await accommodatesResponse.json();
            setAccommodates(accommodatesData);
          }
        } catch (err) {
          console.error('Error fetching accommodates:', err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNeighborhoodChange = (event) => {
    setNeighborhood(event.target.value);
  };

  const handleBedsChange = (event) => {
    setSelectedBeds(event.target.value);
  };

  const handleBathroomsChange = (event) => {
    setSelectedBathrooms(event.target.value);
  };

  const handleAccommodatesChange = (event) => {
    setSelectedAccommodates(event.target.value);
  };

  const handleSearch = () => {
    if (neighborhood) {
      // Puedes añadir los demás filtros a la navegación si es necesario
      navigate(`/analysis/${neighborhood}`);
    }
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: 4,
        backgroundColor: '#f8f9fa'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 800 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#222222' }}>
          Análisis Predictivo de AirBnB Madrid
        </Typography>
        <Typography variant="h5" sx={{ color: '#424242', mb: 2 }}>
          Descubre datos y predicciones sobre alojamientos en Madrid
        </Typography>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 700,
          borderRadius: 3,
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 4, color: '#222222', textAlign: 'center' }}>
          Selecciona los criterios para tu búsqueda
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
            Barrio
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}. Usando lista predeterminada.
            </Typography>
          ) : (
            <Select
              fullWidth
              displayEmpty
              value={neighborhood}
              onChange={handleNeighborhoodChange}
              sx={{ 
                height: 56, 
                fontSize: '1rem',
                '& .MuiSelect-select': { 
                  display: 'flex', 
                  alignItems: 'center' 
                }
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#757575' }}>Selecciona un barrio</span>;
                }
                return selected;
              }}
            >
              {neighborhoods.map((item) => (
                <MenuItem key={item.neighbourhood_encoded} value={item.neighbourhood_cleansed}>
                  {item.neighbourhood_cleansed}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
        
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Camas.
            </Typography>
            <Select
              fullWidth
              displayEmpty
              value={selectedBeds}
              onChange={handleBedsChange}
              sx={{ 
                height: 56, 
                fontSize: '1rem',
                '& .MuiSelect-select': { 
                  display: 'flex', 
                  alignItems: 'center' 
                }
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#757575' }}>H.</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="">Cualquiera</MenuItem>
              {beds.length > 0 ? (
                beds.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              ) : (
                [1, 2, 3, 4, 5].map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              )}
            </Select>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Baños.
            </Typography>
            <Select
              fullWidth
              displayEmpty
              value={selectedBathrooms}
              onChange={handleBathroomsChange}
              sx={{ 
                height: 56, 
                fontSize: '1rem',
                '& .MuiSelect-select': { 
                  display: 'flex', 
                  alignItems: 'center' 
                }
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#757575' }}>B.</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="">Cualquiera</MenuItem>
              {bathrooms.length > 0 ? (
                bathrooms.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              ) : (
                [1, 1.5, 2, 2.5, 3].map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              )}
            </Select>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Viajeros.
            </Typography>
            <Select
              fullWidth
              displayEmpty
              value={selectedAccommodates}
              onChange={handleAccommodatesChange}
              sx={{ 
                height: 56, 
                fontSize: '1rem',
                '& .MuiSelect-select': { 
                  display: 'flex', 
                  alignItems: 'center' 
                }
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#757575' }}>V.</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="">Cualquiera</MenuItem>
              {accommodates.length > 0 ? (
                accommodates.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              ) : (
                [1, 2, 3, 4, 5, 6].map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              )}
            </Select>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSearch}
            disabled={!neighborhood || loading}
            startIcon={<SearchIcon />}
            sx={{ 
              bgcolor: '#FF385C', 
              '&:hover': { bgcolor: '#E31C5F' },
              py: 1.5,
              px: 4,
              borderRadius: 8,
              textTransform: 'none',
              fontSize: '1.1rem',
              minWidth: 180
            }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;