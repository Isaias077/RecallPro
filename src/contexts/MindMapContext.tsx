import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Define types for mind map data
type Node = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { 
    label: string;
    color?: string;
    icon?: string;
  };
};

type Edge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: object;
};

type MindMap = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  nodes: Node[];
  edges: Edge[];
  tags?: string[];
  folder_id?: string | null;
};

type Folder = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

type MindMapContextType = {
  mindMaps: MindMap[];
  folders: Folder[];
  loadingMindMaps: boolean;
  loadingFolders: boolean;
  currentMindMapId: string | null;
  setCurrentMindMapId: (id: string | null) => void;
  createMindMap: (name: string, description: string, folderId?: string) => Promise<MindMap | null>;
  updateMindMap: (id: string, name: string, description: string, nodes: Node[], edges: Edge[], tags?: string[]) => Promise<boolean>;
  deleteMindMap: (id: string) => Promise<boolean>;
  createFolder: (name: string, description?: string) => Promise<Folder | null>;
  updateFolder: (id: string, name: string, description?: string) => Promise<boolean>;
  deleteFolder: (id: string) => Promise<boolean>;
  getMindMapById: (id: string) => MindMap | undefined;
  getMindMapsByFolderId: (folderId: string) => MindMap[];
  addTagToMindMap: (mindMapId: string, tag: string) => Promise<boolean>;
  removeTagFromMindMap: (mindMapId: string, tag: string) => Promise<boolean>;
  searchMindMapsByTag: (tag: string) => MindMap[];
};

// Create the context
const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

// Provider component
export function MindMapProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingMindMaps, setLoadingMindMaps] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [currentMindMapId, setCurrentMindMapId] = useState<string | null>(null);

  // Fetch mind maps when user changes
  useEffect(() => {
    if (user) {
      fetchMindMaps();
      fetchFolders();
    } else {
      setMindMaps([]);
      setFolders([]);
      setLoadingMindMaps(false);
      setLoadingFolders(false);
    }
  }, [user]);

  // Fetch mind maps from Supabase
  const fetchMindMaps = async () => {
    try {
      setLoadingMindMaps(true);
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setMindMaps(data || []);
    } catch (error) {
      console.error('Error fetching mind maps:', error);
    } finally {
      setLoadingMindMaps(false);
    }
  };

  // Fetch folders from Supabase
  const fetchFolders = async () => {
    try {
      setLoadingFolders(true);
      const { data, error } = await supabase
        .from('mind_map_folders')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  };

  // Create a new mind map
  const createMindMap = async (name: string, description: string, folderId?: string) => {
    try {
      const newMindMap = {
        user_id: user?.id,
        name,
        description,
        folder_id: folderId || null,
        nodes: [],
        edges: [],
        tags: [],
      };

      const { data, error } = await supabase
        .from('mind_maps')
        .insert([newMindMap])
        .select()
        .single();

      if (error) throw error;

      setMindMaps([...mindMaps, data]);
      return data;
    } catch (error) {
      console.error('Error creating mind map:', error);
      return null;
    }
  };

  // Update a mind map
  const updateMindMap = async (
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    tags?: string[]
  ) => {
    try {
      const { error } = await supabase
        .from('mind_maps')
        .update({
          name,
          description,
          nodes,
          edges,
          tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setMindMaps(
        mindMaps.map((map) =>
          map.id === id
            ? {
                ...map,
                name,
                description,
                nodes,
                edges,
                tags: tags || map.tags,
                updated_at: new Date().toISOString(),
              }
            : map
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating mind map:', error);
      return false;
    }
  };

  // Delete a mind map
  const deleteMindMap = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mind_maps')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setMindMaps(mindMaps.filter((map) => map.id !== id));

      return true;
    } catch (error) {
      console.error('Error deleting mind map:', error);
      return false;
    }
  };

  // Create a new folder
  const createFolder = async (name: string, description?: string) => {
    try {
      const newFolder = {
        user_id: user?.id,
        name,
        description: description || '',
      };

      const { data, error } = await supabase
        .from('mind_map_folders')
        .insert([newFolder])
        .select()
        .single();

      if (error) throw error;

      setFolders([...folders, data]);
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  };

  // Update a folder
  const updateFolder = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('mind_map_folders')
        .update({
          name,
          description: description || '',
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setFolders(
        folders.map((folder) =>
          folder.id === id
            ? {
                ...folder,
                name,
                description: description || '',
              }
            : folder
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating folder:', error);
      return false;
    }
  };

  // Delete a folder
  const deleteFolder = async (id: string) => {
    try {
      // First update all mind maps in this folder to have no folder
      const { error: updateError } = await supabase
        .from('mind_maps')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error } = await supabase
        .from('mind_map_folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setFolders(folders.filter((folder) => folder.id !== id));
      setMindMaps(
        mindMaps.map((map) =>
          map.folder_id === id ? { ...map, folder_id: null } : map
        )
      );

      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  };

  // Get a mind map by ID
  const getMindMapById = (id: string) => {
    return mindMaps.find((map) => map.id === id);
  };

  // Get mind maps by folder ID
  const getMindMapsByFolderId = (folderId: string) => {
    return mindMaps.filter((map) => map.folder_id === folderId);
  };

  // Add a tag to a mind map
  const addTagToMindMap = async (mindMapId: string, tag: string) => {
    const mindMap = getMindMapById(mindMapId);
    if (!mindMap) return false;

    const updatedTags = [...(mindMap.tags || []), tag];
    return await updateMindMap(
      mindMapId,
      mindMap.name,
      mindMap.description,
      mindMap.nodes,
      mindMap.edges,
      updatedTags
    );
  };

  // Remove a tag from a mind map
  const removeTagFromMindMap = async (mindMapId: string, tag: string) => {
    const mindMap = getMindMapById(mindMapId);
    if (!mindMap || !mindMap.tags) return false;

    const updatedTags = mindMap.tags.filter((t) => t !== tag);
    return await updateMindMap(
      mindMapId,
      mindMap.name,
      mindMap.description,
      mindMap.nodes,
      mindMap.edges,
      updatedTags
    );
  };

  // Search mind maps by tag
  const searchMindMapsByTag = (tag: string) => {
    return mindMaps.filter((map) => map.tags?.includes(tag));
  };

  const value = {
    mindMaps,
    folders,
    loadingMindMaps,
    loadingFolders,
    currentMindMapId,
    setCurrentMindMapId,
    createMindMap,
    updateMindMap,
    deleteMindMap,
    createFolder,
    updateFolder,
    deleteFolder,
    getMindMapById,
    getMindMapsByFolderId,
    addTagToMindMap,
    removeTagFromMindMap,
    searchMindMapsByTag,
  };

  return <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>;
}

// Custom hook to use the mind map context
export function useMindMap() {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
}