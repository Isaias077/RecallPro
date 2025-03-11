import React from 'react';
import { Box, Paper } from '@mui/material';
import LoginForm from '../organisms/LoginForm';
import Typography from '../atoms/Typography';

/**
 * LoginPage component
 * 
 * A page component that displays the login form and handles authentication.
 * This page uses the LoginForm organism and is mapped to the /login route.
 */
const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login to RecallPro
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Enter your credentials to access your flashcards and study materials.
        </Typography>
        <LoginForm />
      </Paper>
    </Box>
  );
};

export default LoginPage;