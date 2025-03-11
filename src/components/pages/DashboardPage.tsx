import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import Typography from '../atoms/Typography';
import { useAuth } from '../../contexts/AuthContext';

/**
 * DashboardPage component
 * 
 * A page component that serves as the main landing page after login.
 * Displays an overview of the user's flashcards, study progress, and quick access to features.
 * This page is mapped to the /dashboard route.
 */
const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bienvenido, {user?.email || 'Student'}!
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Quick Stats */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Study Stats</Typography>
                            <Typography variant="body1">
                                Track your learning progress and study habits here.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Recent Decks */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Recent Decks</Typography>
                            <Typography variant="body1">
                                Continue where you left off with your recent flashcard decks.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Study Recommendations */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Recommended</Typography>
                            <Typography variant="body1">
                                Cards due for review based on your spaced repetition schedule.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Quick Access Tools */}
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Quick Tools</Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' }
                                        }}
                                    >
                                        <Typography variant="body1">Flashcard Manager</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' }
                                        }}
                                    >
                                        <Typography variant="body1">Study Session</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' }
                                        }}
                                    >
                                        <Typography variant="body1">Pomodoro Timer</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' }
                                        }}
                                    >
                                        <Typography variant="body1">Mind Maps</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        
    );
};

export default DashboardPage;