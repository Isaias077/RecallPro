import React from 'react';
import { Box, Paper } from '@mui/material';
import SignupForm from '../organisms/SignupForm';
import Typography from '../atoms/Typography';

/**
 * SignupPage component
 * 
 * A page component that displays the signup form and handles user registration.
 * This page uses the SignupForm organism and is mapped to the /signup route.
 */
const SignupPage: React.FC = () => {
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
          Create an Account
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Sign up to start creating flashcards and improve your learning experience.
        </Typography>
        <SignupForm />
      </Paper>
    </Box>
  );
};

export default SignupPage;