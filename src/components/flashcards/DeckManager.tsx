import { useState } from 'react';
import { useFlashcards } from '../../contexts/FlashcardContext';
import StreakDisplay from './StreakDisplay';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    CircularProgress,
    Container,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    Casino as CasinoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type DeckFormData = {
    name: string;
    description: string;
};

export default function DeckManager() {
    const { decks, loadingDecks, createDeck, updateDeck, deleteDeck, setCurrentDeckId } = useFlashcards();
    const navigate = useNavigate();

    // State for managing the create/edit deck dialog
    const [openDeckDialog, setOpenDeckDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDeckId, setCurrentDeckIdLocal] = useState<string | null>(null);
    const [formData, setFormData] = useState<DeckFormData>({
        name: '',
        description: '',
    });

    // State for managing the delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

    // Handle opening the create deck dialog
    const handleOpenCreateDialog = () => {
        setIsEditing(false);
        setFormData({ name: '', description: '' });
        setOpenDeckDialog(true);
    };

    // Handle opening the edit deck dialog
    const handleOpenEditDialog = (deckId: string, name: string, description: string) => {
        setIsEditing(true);
        setCurrentDeckIdLocal(deckId);
        setFormData({ name, description });
        setOpenDeckDialog(true);
    };

    // Handle closing the deck dialog
    const handleCloseDialog = () => {
        setOpenDeckDialog(false);
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (isEditing && currentDeckId) {
            await updateDeck(currentDeckId, formData.name, formData.description);
        } else {
            await createDeck(formData.name, formData.description);
        }
        handleCloseDialog();
    };

    // Handle opening the delete confirmation dialog
    const handleOpenDeleteDialog = (deckId: string) => {
        setDeckToDelete(deckId);
        setOpenDeleteDialog(true);
    };

    // Handle closing the delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeckToDelete(null);
    };

    // Handle deck deletion
    const handleDeleteDeck = async () => {
        if (deckToDelete) {
            await deleteDeck(deckToDelete);
            handleCloseDeleteDialog();
        }
    };

    // Handle navigating to a deck's flashcards
    const handleViewDeck = (deckId: string) => {
        setCurrentDeckId(deckId);
        navigate(`/decks/${deckId}`);
    };

    // Handle navigating to study a deck
    const handleStudyDeck = (deckId: string) => {
        setCurrentDeckId(deckId);
        navigate(`/study/${deckId}`);
    };

    if (loadingDecks) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (<div style={{
        backgroundColor: '#e6e6e6', width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto' // Added overflow property to allow scrolling
    }}><Container maxWidth="md">
            <Box><br/>
                {/* Display streak information */}
                <StreakDisplay />
                <Box sx={{ margin: '0 auto', padding: '16px 24px' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography
                            sx={{
                                fontSize: '28px',
                                fontWeight: 500,
                                color: '#333'
                            }}
                        >
                            Mazos
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/arcade')}
                                startIcon={<CasinoIcon />}
                                sx={{
                                    color: '#9c27b0',
                                    borderColor: '#9c27b0',
                                    '&:hover': {
                                        borderColor: '#7b1fa2',
                                        backgroundColor: 'rgba(156, 39, 176, 0.04)'
                                    }
                                }}
                            >
                                Modo Arcade
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleOpenCreateDialog}
                                sx={{
                                    backgroundColor: "#09ABEF",
                                    color: "#ffffff",
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    padding: '8px 20px',
                                    borderRadius: '50px',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: "#08A0E0",
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                Crear nuevo mazo
                            </Button>
                        </Box>
                    </Box>

                    {decks.length > 0 ? (
                        <Grid container spacing={3}>
                            {decks.map((deck) => (
                                <Grid item xs={12} sm={6} md={4} key={deck.id}>
                                    <Card 
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                                                cursor: 'pointer'
                                            },
                                            color: 'white'
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Typography 
                                                variant="h5" 
                                                component="h2" 
                                                gutterBottom
                                                sx={{ 
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.5rem'
                                                }}
                                            >
                                                {deck.name}
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ p: 2, mt: 'auto' }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'white',
                                                    opacity: 0.9,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Tarjetas: {(deck as any).cards?.length || 0}
                                            </Typography>
                                        </Box>
                                        <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                                            <Button
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDeck(deck.id);
                                                }}
                                                sx={{
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                                                }}
                                            >
                                                Ver tarjetas
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStudyDeck(deck.id);
                                                }}
                                                startIcon={<SchoolIcon />}
                                                sx={{
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                                                }}
                                            >
                                                Estudiar
                                            </Button>
                                            <Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEditDialog(deck.id, deck.name, deck.description);
                                                    }}
                                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDeleteDialog(deck.id);
                                                    }}
                                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box
                            className="create-deck-container"
                            sx={{
                                borderRadius: 4,
                                p: 8,
                                textAlign: 'center',
                                backgroundColor: '#fff',
                                minHeight: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Box
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <AddIcon
                                    sx={{
                                        fontSize: 30,
                                        color: '#333',
                                        mr: 1
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: '20px',
                                        fontWeight: 500,
                                        color: '#333'
                                    }}
                                >
                                    Crear nuevo <span style={{ color: '#9e9e9e' }}>mazo</span>
                                </Typography>
                            </Box>

                            <Typography
                                sx={{
                                    fontSize: '20px',
                                    fontWeight: 400,
                                    color: '#9e9e9e',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                o agregar desde
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        ml: 1
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'inline-flex',
                                            mr: 1
                                        }}
                                    >
                                        LocalLibraryIcon
                                    </Box>
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#333',
                                            fontWeight: 500,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Biblioteca
                                    </Box>
                                </Box>
                            </Typography>
                        </Box>)
                    }
                    {/* Create/Edit Deck Dialog */}
                    <Dialog
                        open={openDeckDialog}
                        onClose={handleCloseDialog}
                        sx={{
                            '& .MuiDialog-paper': {
                                borderRadius: '24px',
                                maxWidth: '450px',
                                width: '100%',
                                overflow: 'visible'
                            }
                        }}
                        hideBackdrop={false}
                    >
                        <Box sx={{ position: 'relative', p: 3 }}>
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseDialog}
                                sx={{
                                    position: 'absolute',
                                    right: 12,
                                    top: 12,
                                    color: 'grey.500',
                                }}
                            >
                                X
                            </IconButton>

                            <DialogTitle sx={{
                                textAlign: 'center',
                                fontSize: '22px',
                                fontWeight: 500,
                                p: 0,
                                mb: 1
                            }}>
                                Nuevo mazo
                            </DialogTitle>

                            <Typography sx={{
                                fontSize: "16px",
                                textAlign: 'center',
                                mb: 3,
                                color: "grey.500"
                            }}>
                                Crea tu propio mazo. Logras los mejores resultados con las tarjetas que creas por ti mismo.
                            </Typography>

                            <TextField
                                autoFocus
                                name="name"
                                placeholder="Nombre del mazo"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '10px',
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '16px',
                                    },
                                }}
                                InputLabelProps={{ shrink: false }}
                                InputProps={{ notched: false }}
                            />

                            <Button
                                sx={{
                                    width: "100%",
                                    padding: "15px 0",
                                    borderRadius: '8px',
                                    backgroundColor: "#09ABEF",
                                    color: "#ffffff",
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: "#08A0E0",
                                        boxShadow: 'none',
                                    },
                                    "&:disabled": {
                                        backgroundColor: "#BDE6F5",
                                        color: "#ffffff",
                                    },
                                }}
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={!formData.name}
                            >
                                Crear nuevo mazo
                            </Button>
                        </Box>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                        <DialogTitle>Eliminar Mazo</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                ¿Estás seguro de que quieres eliminar este mazo? Esta acción no se puede deshacer, y todas las tarjetas en este mazo se eliminarán permanentemente.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
                            <Button onClick={handleDeleteDeck} color="error" variant="contained">
                                Eliminar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Container></div>);
}