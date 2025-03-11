/**
 * Interface for MindMap Service
 * Following the Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)
 */

// Define types for mind map data
export type Node = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { 
    label: string;
    color?: string;
    icon?: string;
  };
};

export type Edge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: object;
};

export type MindMap = {
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

export type Folder = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

export interface IMindMapService {
  /**
   * Get all mind maps for the current user
   */
  getMindMaps(): Promise<{
    data: MindMap[] | null;
    error: Error | null;
  }>;

  /**
   * Get a mind map by ID
   * @param id Mind map ID
   */
  getMindMapById(id: string): Promise<{
    data: MindMap | null;
    error: Error | null;
  }>;

  /**
   * Create a new mind map
   * @param name Mind map name
   * @param description Mind map description
   * @param folderId Optional folder ID
   */
  createMindMap(name: string, description: string, folderId?: string): Promise<{
    data: MindMap | null;
    error: Error | null;
  }>;

  /**
   * Update an existing mind map
   * @param id Mind map ID
   * @param name Mind map name
   * @param description Mind map description
   * @param nodes Mind map nodes
   * @param edges Mind map edges
   * @param tags Optional tags
   */
  updateMindMap(
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    tags?: string[]
  ): Promise<{
    data: MindMap | null;
    error: Error | null;
  }>;

  /**
   * Delete a mind map
   * @param id Mind map ID
   */
  deleteMindMap(id: string): Promise<{
    error: Error | null;
  }>;

  /**
   * Get all folders for the current user
   */
  getFolders(): Promise<{
    data: Folder[] | null;
    error: Error | null;
  }>;

  /**
   * Create a new folder
   * @param name Folder name
   * @param description Optional folder description
   */
  createFolder(name: string, description?: string): Promise<{
    data: Folder | null;
    error: Error | null;
  }>;

  /**
   * Update an existing folder
   * @param id Folder ID
   * @param name Folder name
   * @param description Optional folder description
   */
  updateFolder(id: string, name: string, description?: string): Promise<{
    data: Folder | null;
    error: Error | null;
  }>;

  /**
   * Delete a folder
   * @param id Folder ID
   */
  deleteFolder(id: string): Promise<{
    error: Error | null;
  }>;

  /**
   * Get mind maps by folder ID
   * @param folderId Folder ID
   */
  getMindMapsByFolderId(folderId: string): Promise<{
    data: MindMap[] | null;
    error: Error | null;
  }>;

  /**
   * Add a tag to a mind map
   * @param mindMapId Mind map ID
   * @param tag Tag to add
   */
  addTagToMindMap(mindMapId: string, tag: string): Promise<{
    error: Error | null;
  }>;

  /**
   * Remove a tag from a mind map
   * @param mindMapId Mind map ID
   * @param tag Tag to remove
   */
  removeTagFromMindMap(mindMapId: string, tag: string): Promise<{
    error: Error | null;
  }>;

  /**
   * Search mind maps by tag
   * @param tag Tag to search for
   */
  searchMindMapsByTag(tag: string): Promise<{
    data: MindMap[] | null;
    error: Error | null;
  }>;
}