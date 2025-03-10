import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMindMap } from '../../contexts/MindMapContext';
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
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Search as SearchIcon,
  Tag as TagIcon,
  Map as MapIcon,
} from '@mui/icons-material';

type FolderFormData = {
  name: string;
  description: string;
};

type MindMapFormData = {
  name: string;
  description: string;
  folderId: string | null;
};

export default function MindMapManager() {
  const { 
    mindMaps, 
    folders, 
    loadingMindMaps, 
    loadingFolders, 
    createMindMap, 
    updateMindMap, 
    deleteMindMap,
    createFolder,
    updateFolder,
    deleteFolder,
    setCurrentMindMapId,
  } = useMindMap();
  const navigate = useNavigate();

  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByTag, setSearchByTag] = useState(false);

  // State for managing the create/edit mind map dialog
  const [openMindMapDialog, setOpenMindMapDialog] = useState(false);
  const [isEditingMindMap, setIsEditingMindMap] = useState(false);
  const [currentMindMapId, setCurrentMindMapIdLocal] = useState<string | null>(null);
  const [mindMapFormData, setMindMapFormData] = useState<MindMapFormData>({
    name: '',
    description: '',
    folderId: null,
  });

  // State for managing the create/edit folder dialog
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderFormData, setFolderFormData] = useState<FolderFormData>({
    name: '',
    description: '',
  });

  // State for managing the delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'mindmap' | 'folder' } | null>(null);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Toggle search by tag
  const handleToggleSearchByTag = () => {
    setSearchByTag(!searchByTag);
  };

  // Filter mind maps based on search term and search type
  const filteredMindMaps = mindMaps.filter(mindMap => {
    if (!searchTerm) return true;
    
    if (searchByTag) {
      return mindMap.tags?.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return (
        mindMap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mindMap.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  // Filter folders based on search term
  const filteredFolders = folders.filter(folder => {
    if (!searchTerm) return true;
    return (
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Handle opening the create mind map dialog
  const handleOpenCreateMindMapDialog = () => {
    setIsEditingMindMap(false);
    setMindMapFormData({ name: '', description: '', folderId: null });
    setOpenMindMapDialog(true);
  };

  // Handle opening the edit mind map dialog
  const handleOpenEditMindMapDialog = (mindMap: any) => {
    setIsEditingMindMap(true);
    setCurrentMindMapIdLocal(mindMap.id);
    setMindMapFormData({ 
      name: mindMap.name, 
      description: mindMap.description,
      folderId: mindMap.folder_id,
    });
    setOpenMindMapDialog(true);
  };

  // Handle closing the mind map dialog
  const handleCloseMindMapDialog = () => {
    setOpenMindMapDialog(false);
  };

  // Handle opening the create folder dialog
  const handleOpenCreateFolderDialog = () => {
    setIsEditingFolder(false);
    setFolderFormData({ name: '', description: '' });
    setOpenFolderDialog(true);
  };

  // Handle opening the edit folder dialog
  const handleOpenEditFolderDialog = (folder: any) => {
    setIsEditingFolder(true);
    setCurrentFolderId(folder.id);
    setFolderFormData({ 
      name: folder.name, 
      description: folder.description || '',
    });
    setOpenFolderDialog(true);
  };

  // Handle closing the folder dialog
  const handleCloseFolderDialog = () => {
    setOpenFolderDialog(false);
  };

  // Handle mind map form input changes
  const handleMindMapInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMindMapFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle folder form input changes
  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFolderFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle mind map form submission
  const handleMindMapSubmit = async () => {
    if (isEditingMindMap && currentMindMapId) {
      const mindMap = mindMaps.find(m => m.id === currentMindMapId);
      if (mindMap) {
        await updateMindMap(
          currentMindMapId, 
          mindMapFormData.name, 
          mindMapFormData.description,
          mindMap.nodes,
          mindMap.edges,
          mindMap.tags
        );
      }
    } else {
      await createMindMap(
        mindMapFormData.name, 
        mindMapFormData.description,
        mindMapFormData.folderId || undefined
      );
    }
    handleCloseMindMapDialog();
  };

  // Handle folder form submission
  const handleFolderSubmit = async () => {
    if (isEditingFolder && currentFolderId) {
      await updateFolder(currentFolderId, folderFormData.name, folderFormData.description);
    } else {
      await createFolder(folderFormData.name, folderFormData.description);
    }
    handleCloseFolderDialog();
  };

  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (id: string, type: 'mindmap' | 'folder') => {
    setItemToDelete({ id, type });
    setOpenDeleteDialog(true);
  };

  // Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
  };

  // Handle item deletion
  const handleDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'mindmap') {
        await deleteMindMap(itemToDelete.id);
      } else {
        await deleteFolder(itemToDelete.id);
      }
      handleCloseDeleteDialog();
    }
  };

  // Handle navigating to a mind map editor
  const handleEditMindMap = (mindMapId: string) => {
    setCurrentMindMapId(mindMapId);
    navigate(`/mindmap/${mindMapId}`);
  };

  // Handle creating a new mind map and navigating to the editor
  const handleCreateAndEditMindMap = async () => {
    const newMindMap = await createMindMap('New Mind Map', 'Click to edit this mind map');
    if (newMindMap) {
      setCurrentMindMapId(newMindMap.id);
      navigate(`/mindmap/${newMindMap.id}`);
    }
  };

  if (loadingMindMaps || loadingFolders) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{
      backgroundColor: '#e6e6e6', 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      <Container maxWidth="md">
        <Box sx={{ margin: '0 auto', padding: '16px 24px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography
              sx={{
                fontSize: '28px',
                fontWeight: 500,
                color: '#333'
              }}
            >
              Mapas Mentales
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                onClick={handleOpenCreateFolderDialog}
                startIcon={<FolderIcon />}
                sx={{
                  color: '#4caf50',
                  borderColor: '#4caf50',
                  '&:hover': {
                    borderColor: '#388e3c',
                    backgroundColor: 'rgba(76, 175, 80, 0.04)'
                  }
                }}
              >
                Nueva Carpeta
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateAndEditMindMap}
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
                Crear nuevo mapa
              </Button>
            </Box>
          </Box>

          {/* Search bar */}
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder={searchByTag ? "Buscar por etiqueta..." : "Buscar mapas mentales..."}
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleSearchByTag} color={searchByTag ? "primary" : "default"}>
                      <TagIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                },
              }}
            />
          </Box>

          {/* Tabs for All/Folders */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="mind map tabs">
              <Tab label="Todos los mapas" />
              <Tab label="Carpetas" />
            </Tabs>
          </Box>

          {/* Tab content */}
          <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && (
              <>
                {filteredMindMaps.length > 0 ? (
                  <Grid container spacing={3}>
                    {filteredMindMaps.map((mindMap) => (
                      <Grid item xs={12} sm={6} md={4} key={mindMap.id}>
                        <Card 
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h2" gutterBottom>
                              {mindMap.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {mindMap.description}
                            </Typography>
                            {mindMap.tags && mindMap.tags.length > 0 && (
                              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                                {mindMap.tags.map((tag, index) => (
                                  <Chip 
                                    key={index} 
                                    label={tag} 
                                    size="small" 
                                    icon={<TagIcon />}
                                    sx={{ backgroundColor: '#e0f7fa' }}
                                  />
                                ))}
                              </Box>
                            )}
                          </CardContent>
                          <Divider />
                          <CardActions>
                            <Button 
                              size="small" 
                              onClick={() => handleEditMindMap(mindMap.id)}
                              startIcon={<MapIcon />}
                            >
                              Editar
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenEditMindMapDialog(mindMap)}
                              aria-label="edit details"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDeleteDialog(mindMap.id, 'mindmap')}
                              aria-label="delete"
                              sx={{ marginLeft: 'auto' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No hay mapas mentales. ¡Crea uno nuevo!
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleCreateAndEditMindMap}
                      sx={{ mt: 2 }}
                    >
                      Crear mapa mental
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && (
              <>
                {filteredFolders.length > 0 ? (
                  <Grid container spacing={3}>
                    {filteredFolders.map((folder) => (
                      <Grid item xs={12} sm={6} md={4} key={folder.id}>
                        <Card 
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <FolderOpenIcon sx={{ mr: 1, color: '#4caf50' }} />
                              <Typography variant="h6" component="h2">
                                {folder.name}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {folder.description}
                            </Typography>
                          </CardContent>
                          <Divider />
                          <CardActions>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenEditFolderDialog(folder)}
                              aria-label="edit folder"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDeleteDialog(folder.id, 'folder')}
                              aria-label="delete folder"
                              sx={{ marginLeft: 'auto' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No hay carpetas. ¡Crea una nueva!
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleOpenCreateFolderDialog}
                      sx={{ mt: 2 }}
                    >
                      Crear carpeta
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* Mind Map Dialog */}
      <Dialog open={openMindMapDialog} onClose={handleCloseMindMapDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditingMindMap ? 'Editar Mapa Mental' : 'Crear Mapa Mental'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={mindMapFormData.name}
            onChange={handleMindMapInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            variant="outlined"
            value={mindMapFormData.description}
            onChange={handleMindMapInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMindMapDialog}>Cancelar</Button>
          <Button onClick={handleMindMapSubmit} variant="contained">
            {isEditingMindMap ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Folder Dialog */}
      <Dialog open={openFolderDialog} onClose={handleCloseFolderDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditingFolder ? 'Editar Carpeta' : 'Crear Carpeta'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={folderFormData.name}
            onChange={handleFolderInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            variant="outlined"
            value={folderFormData.description}
            onChange={handleFolderInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFolderDialog}>Cancelar</Button>
          <Button onClick={handleFolderSubmit} variant="contained">
            {isEditingFolder ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {itemToDelete?.type === 'mindmap' 
              ? '¿Estás seguro de que deseas eliminar este mapa mental? Esta acción no se puede deshacer.'
              : '¿Estás seguro de que deseas eliminar esta carpeta? Los mapas mentales dentro de esta carpeta no se eliminarán, pero ya no estarán organizados en esta carpeta.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}