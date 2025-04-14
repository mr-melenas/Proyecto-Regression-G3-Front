import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/users/login', {
        username: formData.username,
        password: formData.password
      });
      
      toast.success('Inicio de sesión exitoso');
      
      // Guardar token y datos de usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: formData.username,
        // Otros datos del usuario que vengan en la respuesta
        ...response.data.user
      }));
      
      // Redireccionar a la página principal
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <Paper 
        elevation={6} 
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LoginIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
            Iniciar Sesión
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                bgcolor: '#1a237e', 
                '&:hover': { bgcolor: '#0d1b60' },
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold' }}>
                  Regístrate
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;