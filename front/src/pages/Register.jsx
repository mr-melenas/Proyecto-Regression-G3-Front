import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos un número';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

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
      // Usar la instancia api configurada con la URL correcta
      const response = await api.post('/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Usuario creado con éxito');
      
      // Guardar token y datos de usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        email: response.data.email
      }));
      
      // Redireccionar después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error al registrar:', error);
      // Mostrar mensaje de error específico si está disponible
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Error en el registro: Verifica tus datos');
      } else {
        toast.error('Error al crear la cuenta. Intenta más tarde.');
      }
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
          <PersonAddIcon sx={{ fontSize: 40, color: '#1a237e', mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
            Crear Cuenta
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
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
              {loading ? <CircularProgress size={24} /> : 'Registrarse'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold' }}>
                  Inicia Sesión
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;