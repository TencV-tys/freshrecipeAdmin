import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Divider,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const AdminSidebar = ({ activeTab, setActiveTab, drawerOpen, onDrawerToggle }) => {
  const { logout } = useAuth();
  
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'users':
        return 'Users';
      case 'recipes':
        return 'Recipes';
      default:
        return 'Dashboard';
    }
  };
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'users', label: 'Users', icon: <PeopleIcon /> },
    { id: 'recipes', label: 'Recipes', icon: <RestaurantMenuIcon /> },
  ];

  const handleMenuClick = (itemId) => {
    if (itemId === 'logout') {
      logout();
    } else {
      setActiveTab(itemId);
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Admin Dashboard
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeTab === item.id}
              onClick={() => handleMenuClick(item.id)}
              sx={{ 
                '&.Mui-selected': { 
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.main' }
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick('logout')}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {getTitle()}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={onDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;