import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMindMap } from '../../contexts/MindMapContext';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  Node,
  Edge,
  Connection,
  useReactFlow,
  useUpdateNodeInternals,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode, { NodeShape } from './CustomNode';
import CustomEdge from './CustomEdge';
import {
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Chip,
  InputAdornment,
  Divider,
  Drawer,
  FormControl,
  Select,
  Slider,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Tag as TagIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

// Custom node types
const nodeTypes = {
  custom: CustomNode,
};

// Custom edge types
const edgeTypes = {
  custom: CustomEdge,
};

// Node color options
const nodeColors = [
  '#f44336', // Red
  '#e91e63', // Pink
  '#9c27b0', // Purple
  '#673ab7', // Deep Purple
  '#3f51b5', // Indigo
  '#2196f3', // Blue
  '#03a9f4', // Light Blue
  '#00bcd4', // Cyan
  '#009688', // Teal
  '#4caf50', // Green
  '#8bc34a', // Light Green
  '#cddc39', // Lime
  '#ffeb3b', // Yellow
  '#ffc107', // Amber
  '#ff9800', // Orange
  '#ff5722', // Deep Orange
];

// Wrap the entire component with ReactFlowProvider
const MindMapEditorContent = () => {
  const { mindMapId } = useParams<{ mindMapId: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  const {
    // mindMaps, // Unused variable
    loadingMindMaps,
    updateMindMap,
    getMindMapById,
    addTagToMindMap,
    removeTagFromMindMap,
  } = useMindMap();

  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for the current mind map
  const [currentMindMap, setCurrentMindMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for node editing
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [nodeFormOpen, setNodeFormOpen] = useState(false);
  const [nodeForm, setNodeForm] = useState({
    label: '',
    color: '#2196f3',
    textColor: '#ffffff',
    fontSize: 14,
    shape: 'rounded' as NodeShape,
    width: 150,
    height: 50,
  });
  
  // State for edge editing
  const [edgeFormOpen, setEdgeFormOpen] = useState(false);
  const [edgeForm, setEdgeForm] = useState({
    label: '',
    color: '#888',
    animated: false,
    strokeWidth: 1.5,
  });
  
  // State for undo/redo functionality
  const [history, setHistory] = useState<{nodes: Node[][]; edges: Edge[][]; currentIndex: number}>({ 
    nodes: [], 
    edges: [], 
    currentIndex: -1 
  });
  
  // State for multi-select and grouping
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  // const [isGrouping, setIsGrouping] = useState(false); // Unused variables
  
  // Node update internals hook
  const updateNodeInternals = useUpdateNodeInternals();

  // State for tag management
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  // State for export options
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // State for settings drawer
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Save current state to history
  const saveToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory(prev => {
      // Remove any future states if we're not at the end of history
      const newNodesHistory = [...prev.nodes.slice(0, prev.currentIndex + 1), newNodes];
      const newEdgesHistory = [...prev.edges.slice(0, prev.currentIndex + 1), newEdges];
      
      return {
        nodes: newNodesHistory,
        edges: newEdgesHistory,
        currentIndex: prev.currentIndex + 1
      };
    });
  }, []);

  // Load mind map data when component mounts
  useEffect(() => {
    if (mindMapId && !loadingMindMaps) {
      const mindMap = getMindMapById(mindMapId);
      if (mindMap) {
        setCurrentMindMap(mindMap);
        
        // Convert existing nodes to use custom type if needed
        const updatedNodes = (mindMap.nodes || []).map(node => ({
          ...node,
          type: node.type || 'custom', // Use custom type for all nodes
          data: {
            ...node.data,
            shape: (node.data as any).shape || 'rounded',
            textColor: (node.data as any).textColor || '#ffffff',
            fontSize: (node.data as any).fontSize || 14,
            width: (node.data as any).width || 150,
            height: (node.data as any).height || 50,
          }
        }));
        
        // Convert existing edges to use custom type if needed
        const updatedEdges = (mindMap.edges || []).map(edge => ({
          ...edge,
          type: edge.type || 'custom', // Use custom type for all edges
          data: {
            ...(edge as any).data,
            color: (edge as any).data?.color || '#888',
            strokeWidth: (edge as any).data?.strokeWidth || 1.5,
            animated: (edge as any).data?.animated || false,
          }
        }));
        
        setNodes(updatedNodes);
        setEdges(updatedEdges);
        
        // Initialize history with current state
        setHistory({
          nodes: [updatedNodes],
          edges: [updatedEdges],
          currentIndex: 0
        });
      }
      setLoading(false);
    }
  }, [mindMapId, loadingMindMaps, getMindMapById]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // If there's no target, create a new node at the mouse position
      if (!params.target) {
        const sourceNode = nodes.find(node => node.id === params.source);
        if (!sourceNode) return;
        
        // Get the current pane position to place the new node
        const { x, y } = reactFlowInstance.project({
          x: reactFlowInstance.screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          }).x + 100,
          y: sourceNode.position.y,
        });
        
        // Create a new node
        const newNodeId = `node-${nodes.length + 1}`;
        const newNode = {
          id: newNodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: `Nodo ${nodes.length + 1}`,
            color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
            textColor: '#ffffff',
            fontSize: 14,
            shape: 'rounded' as NodeShape,
            width: 150,
            height: 50,
          },
        };
        
        // Add the new node
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        
        // Create a connection to the new node
        const newEdgeId = `edge-${params.source}-${newNodeId}`;
        const newEdge = {
          id: newEdgeId,
          source: params.source,
          target: newNodeId,
          type: 'custom',
          data: {
            animated: false,
            color: '#888',
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        };
        
        // Ensure source is not null before adding the edge
        if (newEdge.source) {
          const safeNewEdge = {
            ...newEdge,
            source: newEdge.source, // This ensures source is a string
          };
          const newEdges: any = addEdge(safeNewEdge as any, edges);
          setEdges(newEdges);
        }
        // setEdges(newEdges);
        // saveToHistory(newNodes, newEdge);
        
        return;
      }
      
      // Create a unique ID for the new edge
      const edgeId = `edge-${params.source}-${params.target}`;
      
      // Check if this edge already exists
      const edgeExists = edges.some(edge => 
        edge.source === params.source && edge.target === params.target
      );
      
      if (!edgeExists) {
        const newEdge = {
          ...params,
          id: edgeId,
          type: 'custom',
          data: {
            animated: false,
            color: '#888',
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        };
        
        // Ensure source is not null before adding the edge
        if (newEdge.source) {
          const safeNewEdge = {
            ...newEdge,
            source: newEdge.source, // This ensures source is a string
          };
          const newEdges = addEdge(safeNewEdge as any, edges);
          setEdges(newEdges);
        }
        setEdges(newEdge as any);
        saveToHistory(nodes, newEdge as any);
      }
    },
    [edges, setEdges, nodes, reactFlowInstance, saveToHistory]
  );

  // Handle saving the mind map
  const handleSave = async () => {
    if (!currentMindMap) return;
    
    setSaving(true);
    try {
      const success = await updateMindMap(
        currentMindMap.id,
        currentMindMap.name,
        currentMindMap.description,
        nodes as any,
        edges,
        currentMindMap.tags
      );
      
      if (success) {
        setSuccess('Mapa mental guardado correctamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Error al guardar el mapa mental');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Error al guardar el mapa mental');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Handle undo
  const handleUndo = useCallback(() => {
    if (history.currentIndex > 0) {
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1
      }));
      
      setNodes(history.nodes[history.currentIndex - 1]);
      setEdges(history.edges[history.currentIndex - 1]);
    }
  }, [history]);
  
  // Handle redo
  const handleRedo = useCallback(() => {
    if (history.currentIndex < history.nodes.length - 1) {
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));
      
      setNodes(history.nodes[history.currentIndex + 1]);
      setEdges(history.edges[history.currentIndex + 1]);
    }
  }, [history]);
  
  // Handle adding a new node
  const handleAddNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'custom',
      position: {
        x: Math.random() * 300,
        y: Math.random() * 300,
      },
      data: {
        label: `Nodo ${nodes.length + 1}`,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
        textColor: '#ffffff',
        fontSize: 14,
        shape: 'rounded' as NodeShape,
        width: 150,
        height: 50,
      },
    };
    
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
  };

  // Handle node selection
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    // Check if Shift key is pressed for multi-select
    if (event.shiftKey) {
      setSelectedNodes(prev => {
        if (prev.includes(node.id)) {
          return prev.filter(id => id !== node.id);
        } else {
          return [...prev, node.id];
        }
      });
    } else {
      // Single select
      setSelectedNode(node);
      setSelectedNodes([node.id]);
      setNodeForm({
        label: node.data.label,
        color: node.data.color || '#2196f3',
        textColor: node.data.textColor || '#ffffff',
        fontSize: node.data.fontSize || 14,
        shape: node.data.shape || 'rounded',
        width: node.data.width || 150,
        height: node.data.height || 50,
      });
      setNodeFormOpen(true);
    }
  };

  // Handle node form changes
  const handleNodeFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNodeForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle node color change
  const handleNodeColorChange = (color: string) => {
    setNodeForm((prev) => ({ ...prev, color }));
  };

  // Handle node form submission
  const handleNodeFormSubmit = () => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map((node) =>
      node.id === selectedNode.id
        ? {
            ...node,
            data: {
              ...node.data,
              label: nodeForm.label,
              color: nodeForm.color,
              textColor: nodeForm.textColor,
              fontSize: nodeForm.fontSize,
              shape: nodeForm.shape,
              width: nodeForm.width,
              height: nodeForm.height,
            },
          }
        : node
    );
    
    setNodes(updatedNodes);
    saveToHistory(updatedNodes, edges);
    updateNodeInternals(selectedNode.id);
    
    setNodeFormOpen(false);
    setSelectedNode(null);
  };

  // Handle node deletion
  const handleDeleteNode = () => {
    if (selectedNodes.length > 0) {
      // Delete multiple nodes
      const newNodes = nodes.filter(node => !selectedNodes.includes(node.id));
      const newEdges = edges.filter(
        edge => !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      );
      
      setNodes(newNodes);
      setEdges(newEdges);
      saveToHistory(newNodes, newEdges);
      
      setNodeFormOpen(false);
      setSelectedNode(null);
      setSelectedNodes([]);
    } else if (selectedNode) {
      // Delete single node
      const newNodes = nodes.filter(node => node.id !== selectedNode.id);
      const newEdges = edges.filter(
        edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      );
      
      setNodes(newNodes);
      setEdges(newEdges);
      saveToHistory(newNodes, newEdges);
      
      setNodeFormOpen(false);
      setSelectedNode(null);
    }
  };

  // Handle edge selection
  //  @ts-ignore
  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null); // Clear any selected node
    setSelectedNodes([]);
    
    // Open edge form with current edge data
    setEdgeForm({
      label: edge.data?.label || '',
      color: edge.data?.color || '#888',
      animated: edge.data?.animated || false,
      strokeWidth: edge.data?.strokeWidth || 1.5,
    });
    setEdgeFormOpen(true);
  };

  // Handle edge deletion
  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    
    const newEdges = edges.filter((edge) => edge.id !== selectedEdge.id);
    setEdges(newEdges);
    saveToHistory(nodes, newEdges);
    setSelectedEdge(null);
    setEdgeFormOpen(false);
  };
  
  // Handle edge form changes
  const handleEdgeFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setEdgeForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle edge form submission
  const handleEdgeFormSubmit = () => {
    if (!selectedEdge) return;
    
    const updatedEdges = edges.map((edge) =>
      edge.id === selectedEdge.id
        ? {
            ...edge,
            data: {
              ...edge.data,
              label: edgeForm.label,
              color: edgeForm.color,
              animated: edgeForm.animated,
              strokeWidth: edgeForm.strokeWidth,
            },
          }
        : edge
    );
    
    setEdges(updatedEdges);
    saveToHistory(nodes, updatedEdges);
    
    setEdgeFormOpen(false);
    setSelectedEdge(null);
  };
  
  // Handle node duplication
  const handleDuplicateNode = () => {
    if (!selectedNode) return;
    
    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      ...selectedNode,
      id: newNodeId,
      position: {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50,
      },
    };
    
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
  };
  
  // Handle group creation
  const handleGroupNodes = () => {
    if (selectedNodes.length < 2) return;
    
    // Find the bounding box of selected nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    selectedNodes.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + (node.data.width || 150));
        maxY = Math.max(maxY, node.position.y + (node.data.height || 50));
      }
    });
    
    // Create a parent node that contains all selected nodes
    const groupId = `group-${Date.now()}`;
    const groupNode = {
      id: groupId,
      type: 'custom',
      position: { x: minX - 20, y: minY - 20 },
      data: {
        label: 'Group',
        color: '#f5f5f5',
        textColor: '#333333',
        fontSize: 14,
        shape: 'rectangle' as NodeShape,
        width: maxX - minX + 40,
        height: maxY - minY + 40,
        isGroup: true,
      },
    };
    
    const newNodes = [...nodes, groupNode];
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
    setSelectedNodes([]);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Delete key (46) or Backspace key (8)
      if (event.keyCode === 46 || event.keyCode === 8) {
        if (selectedNode || selectedNodes.length > 0) {
          handleDeleteNode();
        } else if (selectedEdge) {
          handleDeleteEdge();
        }
      }
      
      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
      
      // Ctrl+Y for redo
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        handleRedo();
      }
      
      // Ctrl+D for duplicate
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        if (selectedNode) {
          handleDuplicateNode();
        }
      }
      
      // Ctrl+G for group
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        handleGroupNodes();
      }
    },
    [selectedNode, selectedEdge, selectedNodes, handleUndo, handleRedo]
  );

  // Add and remove keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle tag dialog open
  const handleOpenTagDialog = () => {
    setTagDialogOpen(true);
  };

  // Handle adding a new tag
  const handleAddTag = async () => {
    if (!newTag.trim() || !currentMindMap) return;
    
    try {
      const success = await addTagToMindMap(currentMindMap.id, newTag.trim());
      if (success) {
        setCurrentMindMap({
          ...currentMindMap,
          tags: [...(currentMindMap.tags || []), newTag.trim()],
        });
        setNewTag('');
        setSuccess('Etiqueta añadida correctamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Error al añadir la etiqueta');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Error al añadir la etiqueta');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = async (tag: string) => {
    if (!currentMindMap) return;
    
    try {
      const success = await removeTagFromMindMap(currentMindMap.id, tag);
      if (success) {
        setCurrentMindMap({
          ...currentMindMap,
          tags: currentMindMap.tags?.filter((t: string) => t !== tag) || [],
        });
        setSuccess('Etiqueta eliminada correctamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Error al eliminar la etiqueta');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Error al eliminar la etiqueta');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle export menu open
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  // Handle export menu close
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // Handle export as PNG
  const handleExportAsPng = () => {
    if (!reactFlowWrapper.current) return;
    
    handleExportMenuClose();
    
    toPng(reactFlowWrapper.current, {
      quality: 1,
      backgroundColor: '#ffffff',
    })
      .then((dataUrl) => {
        const fileName = `${currentMindMap?.name || 'mind-map'}.png`;
        saveAs(dataUrl, fileName);
        setSuccess('Mapa mental exportado como PNG');
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(() => {
        setError('Error al exportar el mapa mental');
        setTimeout(() => setError(null), 3000);
      });
  };

  // Handle export as JPEG
  const handleExportAsJpeg = () => {
    if (!reactFlowWrapper.current) return;
    
    handleExportMenuClose();
    
    toJpeg(reactFlowWrapper.current, {
      quality: 0.95,
      backgroundColor: '#ffffff',
    })
      .then((dataUrl) => {
        const fileName = `${currentMindMap?.name || 'mind-map'}.jpg`;
        saveAs(dataUrl, fileName);
        setSuccess('Mapa mental exportado como JPEG');
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(() => {
        setError('Error al exportar el mapa mental');
        setTimeout(() => setError(null), 3000);
      });
  };

  // Handle export as SVG
  const handleExportAsSvg = () => {
    if (!reactFlowWrapper.current) return;
    
    handleExportMenuClose();
    
    toSvg(reactFlowWrapper.current, {
      quality: 1,
      backgroundColor: '#ffffff',
    })
      .then((dataUrl) => {
        const fileName = `${currentMindMap?.name || 'mind-map'}.svg`;
        saveAs(dataUrl, fileName);
        setSuccess('Mapa mental exportado como SVG');
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(() => {
        setError('Error al exportar el mapa mental');
        setTimeout(() => setError(null), 3000);
      });
  };

  // Handle export as JSON
  const handleExportAsJson = () => {
    if (!currentMindMap) return;
    
    handleExportMenuClose();
    
    const jsonData = {
      name: currentMindMap.name,
      description: currentMindMap.description,
      nodes,
      edges,
      tags: currentMindMap.tags,
    };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `${currentMindMap.name || 'mind-map'}.json`;
    saveAs(blob, fileName);
    
    setSuccess('Mapa mental exportado como JSON');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle settings drawer toggle
  const toggleSettingsDrawer = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    reactFlowInstance.zoomIn();
  };

  // Handle zoom out
  const handleZoomOut = () => {
    reactFlowInstance.zoomOut();
  };

  // Handle fit view
  const handleFitView = () => {
    reactFlowInstance.fitView();
  };

  if (loading || loadingMindMaps) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentMindMap) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h6" gutterBottom>
          No se encontró el mapa mental
        </Typography>
        <Button variant="contained" onClick={() => navigate('/mindmap')}>
          Volver a mapas mentales
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/mindmap')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {currentMindMap.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            startIcon={<TagIcon />}
            onClick={handleOpenTagDialog}
            size="small"
          >
            Etiquetas
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportMenuOpen}
            size="small"
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            size="small"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <IconButton onClick={toggleSettingsDrawer}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <div style={{ width: '100%', height: '100%' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Controls showInteractive={false} />
            <MiniMap />
            <Background variant={"dots" as any} gap={12} size={1} />
            
            <Panel position="top-right" style={{ padding: '10px' }}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Tooltip title="Añadir nodo">
                  <IconButton
                    onClick={handleAddNode}
                    sx={{ backgroundColor: '#fff', boxShadow: 1 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Acercar">
                  <IconButton
                    onClick={handleZoomIn}
                    sx={{ backgroundColor: '#fff', boxShadow: 1 }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Alejar">
                  <IconButton
                    onClick={handleZoomOut}
                    sx={{ backgroundColor: '#fff', boxShadow: 1 }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Ajustar vista">
                  <IconButton
                    onClick={handleFitView}
                    sx={{ backgroundColor: '#fff', boxShadow: 1 }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>
          </ReactFlow>
        </div>
      </Box>

      {/* Node edit dialog */}
      <Dialog open={nodeFormOpen} onClose={() => setNodeFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Nodo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="label"
            label="Texto del nodo"
            type="text"
            fullWidth
            variant="outlined"
            value={nodeForm.label}
            onChange={handleNodeFormChange}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Color del nodo
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {nodeColors.map((color) => (
                  <Grid item key={color}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: nodeForm.color === color ? '2px solid #000' : 'none',
                      }}
                      onClick={() => handleNodeColorChange(color)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Color del texto
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {['#ffffff', '#000000', '#333333', '#555555', '#888888'].map((color) => (
                  <Grid item key={color}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: nodeForm.textColor === color ? '2px solid #000' : 'none',
                      }}
                      onClick={() => setNodeForm(prev => ({ ...prev, textColor: color }))}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle2" gutterBottom>
            Tamaño del texto
          </Typography>
          <Slider
            name="fontSize"
            value={nodeForm.fontSize}
            min={10}
            max={24}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChange={(_, value) => setNodeForm(prev => ({ ...prev, fontSize: value as number }))}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Forma del nodo
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              name="shape"
              value={nodeForm.shape}
              onChange={(e) => setNodeForm(prev => ({ ...prev, shape: e.target.value as NodeShape }))}
              size="small"
            >
              <MenuItem value="rectangle">Rectángulo</MenuItem>
              <MenuItem value="rounded">Redondeado</MenuItem>
              <MenuItem value="circle">Círculo</MenuItem>
              <MenuItem value="diamond">Diamante</MenuItem>
              <MenuItem value="hexagon">Hexágono</MenuItem>
            </Select>
          </FormControl>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Ancho
              </Typography>
              <Slider
                name="width"
                value={nodeForm.width}
                min={80}
                max={300}
                step={10}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setNodeForm(prev => ({ ...prev, width: value as number }))}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Alto
              </Typography>
              <Slider
                name="height"
                value={nodeForm.height}
                min={40}
                max={200}
                step={10}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setNodeForm(prev => ({ ...prev, height: value as number }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeFormOpen(false)}>Cancelar</Button>
          <Button onClick={handleDuplicateNode} color="info">
            Duplicar
          </Button>
          <Button onClick={handleDeleteNode} color="error">
            Eliminar
          </Button>
          <Button onClick={handleNodeFormSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edge edit dialog */}
      <Dialog open={edgeFormOpen} onClose={() => setEdgeFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Conexión</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="label"
            label="Etiqueta de la conexión"
            type="text"
            fullWidth
            variant="outlined"
            value={edgeForm.label}
            onChange={handleEdgeFormChange}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Color de la línea
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {nodeColors.map((color) => (
              <Grid item key={color}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: edgeForm.color === color ? '2px solid #000' : 'none',
                  }}
                  onClick={() => setEdgeForm(prev => ({ ...prev, color }))}
                />
              </Grid>
            ))}
          </Grid>
          
          <Typography variant="subtitle2" gutterBottom>
            Grosor de la línea
          </Typography>
          <Slider
            name="strokeWidth"
            value={edgeForm.strokeWidth}
            min={1}
            max={5}
            step={0.5}
            marks
            valueLabelDisplay="auto"
            onChange={(_, value) => setEdgeForm(prev => ({ ...prev, strokeWidth: value as number }))}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Animación
            </Typography>
            <Select
              name="animated"
              value={edgeForm.animated}
              onChange={(e) => setEdgeForm(prev => ({ ...prev, animated: e.target.value as boolean }))}
              size="small"
            >
              <MenuItem value="false">Sin animación</MenuItem>
              <MenuItem value="true">Con animación</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdgeFormOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteEdge} color="error">
            Eliminar
          </Button>
          <Button onClick={handleEdgeFormSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag dialog */}
      <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Gestionar Etiquetas</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nueva etiqueta"
              type="text"
              fullWidth
              variant="outlined"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleAddTag} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Etiquetas actuales
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1}>
            {currentMindMap.tags && currentMindMap.tags.length > 0 ? (
              currentMindMap.tags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ backgroundColor: '#e0f7fa' }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay etiquetas. Añade una nueva etiqueta arriba.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Export menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={handleExportAsPng}>Exportar como PNG</MenuItem>
        <MenuItem onClick={handleExportAsJpeg}>Exportar como JPEG</MenuItem>
        <MenuItem onClick={handleExportAsSvg}>Exportar como SVG</MenuItem>
        <MenuItem onClick={handleExportAsJson}>Exportar como JSON</MenuItem>
      </Menu>

      {/* Settings drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={toggleSettingsDrawer}
        sx={{ '& .MuiDrawer-paper': { width: 300 } }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Configuración</Typography>
            <IconButton onClick={toggleSettingsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Información del mapa
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Nombre:</strong> {currentMindMap.name}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Descripción:</strong> {currentMindMap.description}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Nodos:</strong> {nodes.length}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Conexiones:</strong> {edges.length}
          </Typography>
        </Box>
      </Drawer>

      {/* Snackbar for success/error messages */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default function MindMapEditor() {
  return (
    <ReactFlowProvider>
      <MindMapEditorContent />
    </ReactFlowProvider>
  );
}