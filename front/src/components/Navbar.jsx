import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Verificar el estado de autenticación cada vez que cambie la ubicación
  useEffect(() => {
    // Check if user is logged in
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]); // Se ejecutará cada vez que cambie la ruta

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    handleClose();
    navigate('/');
  };

  const handleEditProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'white', 
          color: 'black',
          boxShadow: '0 1px 12px rgba(0, 0, 0, 0.08)',
          py: 0.5,
          width: '100%',
          zIndex: 1100
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: '#FF385C', 
                fontWeight: 'bold',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              AirBnB Madrid Analyzer
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <>
                  <Button 
                    component={Link} 
                    to="/saved-searches"
                    startIcon={<BookmarkIcon />}
                    sx={{ 
                      mr: 2, 
                      color: '#222222',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    Guardados
                  </Button>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      border: '1px solid #DDDDDD',
                      borderRadius: '21px',
                      padding: '5px 5px 5px 12px',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.18)' }
                    }}
                    onClick={handleClick}
                  >
                    <Avatar 
                      sx={{ 
                        width: 30, 
                        height: 30, 
                        bgcolor: '#FF385C',
                        ml: 1
                      }}
                    >
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </Box>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: 200,
                      }
                    }}
                  >
                    <MenuItem onClick={handleEditProfile} sx={{ py: 1.5 }}>Editar Perfil</MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>Cerrar Sesión</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    component={Link} 
                    to="/register" 
                    sx={{ 
                      mr: 1, 
                      color: '#222222',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    Crear Cuenta
                  </Button>
                  <Button 
                    component={Link} 
                    to="/login"
                    sx={{ 
                      color: '#222222',
                      border: '1px solid #DDDDDD',
                      borderRadius: '21px',
                      padding: '5px 12px',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.18)' }
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};

export default Navbar;