import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/logoRecall.png';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryBooksIcon,
  Timer as TimerIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const pages = [
  { title: 'Panel', path: '/dashboard', icon: <DashboardIcon />, requireAuth: true },
  { title: 'Mis Mazos', path: '/decks', icon: <LibraryBooksIcon />, requireAuth: true },
  { title: 'Estudiar', path: '/study', icon: <SchoolIcon />, requireAuth: true },
  { title: 'Pomodoro', path: '/pomodoro', icon: <TimerIcon />, requireAuth: true },
  // { title: 'Mapas Mentales', path: '/mindmap', icon: <MapIcon />, requireAuth: true },
];

const authPages = [
  { title: 'Iniciar Sesión', path: '/login', icon: <LoginIcon />, requireAuth: false },
  { title: 'Registrarse', path: '/signup', icon: <PersonAddIcon />, requireAuth: false },
];

/**
 * Navigation template component that provides the overall navigation structure for the application.
 * This component defines the layout for the top navigation bar and side drawer.
 */
export default function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    handleCloseUserMenu();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <img src={Logo} alt="RecallPro Logo" />
      <Divider />
      <List>
        {user
          ? pages.map((page) => (
              <ListItem key={page.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={page.path}
                  selected={location.pathname === page.path}
                >
                  <ListItemIcon sx={{ color: '#1D1C1A' }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.title} sx={{ color: '#1D1C1A' }} />
                </ListItemButton>
              </ListItem>
            ))
          : authPages.map((page) => (
              <ListItem key={page.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={page.path}
                  selected={location.pathname === page.path}
                >
                  <ListItemIcon sx={{ color: '#1D1C1A' }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.title} sx={{ color: '#1D1C1A' }} />
                </ListItemButton>
              </ListItem>
            ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: '#1D1C1A',
                textDecoration: 'none',
              }}
            >
              <img src={Logo} width={"180px"} alt="RecallPro Logo" />
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
                sx={{ color: '#1D1C1A' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: '#1D1C1A',
                textDecoration: 'none',
              }}
            >
              <img src={Logo} width={"120px"} alt="RecallPro Logo" />
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {user &&
                pages.map((page) => (
                  <Button
                    key={page.path}
                    component={RouterLink}
                    to={page.path}
                    sx={{
                      my: 2,
                      color: '#1D1C1A',
                      display: 'flex',
                      alignItems: 'center',
                      textTransform: 'none',
                      fontWeight: location.pathname === page.path ? 700 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    startIcon={page.icon}
                  >
                    {page.title}
                  </Button>
                ))}

              {!user &&
                authPages.map((page) => (
                  <Button
                    key={page.path}
                    component={RouterLink}
                    to={page.path}
                    sx={{
                      my: 2,
                      color: '#1D1C1A',
                      display: 'flex',
                      alignItems: 'center',
                      textTransform: 'none',
                      fontWeight: location.pathname === page.path ? 700 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    startIcon={page.icon}
                  >
                    {page.title}
                  </Button>
                ))}
            </Box>

            {user && (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Abrir opciones">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.email || 'Usuario'} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Cerrar Sesión</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}