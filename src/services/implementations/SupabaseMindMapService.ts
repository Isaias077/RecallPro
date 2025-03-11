import { any } from 'zod';
import { supabase } from '../../lib/supabase';
import { IMindMapService, MindMap, Node, Edge, Folder } from '../interfaces/IMindMapService';

/**
 * Supabase implementation of the MindMap Service
 * Following the Single Responsibility Principle (SRP) by handling only mind map operations
 */
export class SupabaseMindMapService implements IMindMapService {
  /**
   * Get all mind maps for the current user
   */
  async getMindMaps(): Promise<{
    data: MindMap[] | null;
    error: Error | null;
  }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('mind_maps')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    return { data: data as MindMap[] || null, error: error };
  }

  /**
   * Get a mind map by ID
   * @param id Mind map ID
   */
  async getMindMapById(id: string): Promise<{
    data: MindMap | null;
    error: Error | null;
  }> {
    const { data, error } = await supabase
      .from('mind_maps')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as MindMap || null, error: error };
  }

  /**
   * Create a new mind map
   * @param name Mind map name
   * @param description Mind map description
   * @param folderId Optional folder ID
   */
  async createMindMap(name: string, description: string, folderId?: string): Promise<{
    data: MindMap | null;
    error: Error | null;
  }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Create a default central node
    const defaultNode: Node = {
      id: 'node-1',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { label: name }
    };

    const { data, error } = await supabase
      .from('mind_maps')
      .insert([
        {
          name,
          description,
          user_id: session.session.user.id,
          folder_id: folderId || null,
          nodes: [defaultNode],
          edges: [],
          tags: [],
        },
      ])
      .select()
      .single();

    return { data: data as MindMap || null, error: error };
  }

  /**
   * Update an existing mind map
   * @param id Mind map ID
   * @param name Mind map name
   * @param description Mind map description
   * @param nodes Mind map nodes
   * @param edges Mind map edges
   * @param tags Optional tags
   */
  async updateMindMap(
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    tags?: string[]
  ): Promise<{
    data: MindMap | null;
    error: Error | null;
  }> {
    const { data, error } = await supabase
      .from('mind_maps')
      .update({
        name,
        description,
        nodes,
        edges,
        tags: tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return { data: data as MindMap || null, error: error };
  }

  /**
   * Delete a mind map
   * @param id Mind map ID
   */
  async deleteMindMap(id: string): Promise<{
    error: Error | null;
  }> {
    const { error } = await supabase.from('mind_maps').delete().eq('id', id);
    return { error };
  }

  /**
   * Get all folders for the current user
   */
  async getFolders(): Promise<{
    data: Folder[] | null;
    error: Error | null;
  }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('mind_map_folders')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    return { data: data as Folder[] || null, error: error };
  }

  /**
   * Create a new folder
   * @param name Folder name
   * @param description Optional folder description
   */
  async createFolder(name: string, description?: string): Promise<{
    data: Folder | null;
    error: Error | null;
  }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('mind_map_folders')
      .insert([
        {
          name,
          description: description || '',
          user_id: session.session.user.id,
        },
      ])
      .select()
      .single();

    return { data: data as Folder || null, error: error };
  }

  /**
   * Update an existing folder
   * @param id Folder ID
   * @param name Folder name
   * @param description Optional folder description
   */
  async updateFolder(id: string, name: string, description?: string): Promise<{
    data: Folder | null;
    error: Error | null;
  }> {
    const { data, error } = await supabase
      .from('mind_map_folders')
      .update({
        name,
        description: description || '',
      })
      .eq('id', id)
      .select()
      .single();

    return { data: data as Folder || null, error: error };
  }

  /**
   * Delete a folder
   * @param id Folder ID
   */
  async deleteFolder(id: string): Promise<{
    error: Error | null;
  }> {
    // First update all mind maps in this folder to have no folder
    await supabase
      .from('mind_maps')
      .update({ folder_id: null })
      .eq('folder_id', id);

    // Then delete the folder
    const { error } = await supabase.from('mind_map_folders').delete().eq('id', id);
    return { error };
  }

  /**
   * Get mind maps by folder ID
   * @param folderId Folder ID
   */
  async getMindMapsByFolderId(folderId: string): Promise<{
    data: MindMap[] | null;
    error: Error | null;
  }> {
    const { data, error } = await supabase
      .from('mind_maps')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    return { data: data as MindMap[] || null, error: error };
  }

  /**
   * Add a tag to a mind map
   * @param mindMapId Mind map ID
   * @param tag Tag to add
   */
  async addTagToMindMap(mindMapId: string, tag: string): Promise<{
    error: Error | null;
  }> {
    // First get the current mind map
    const { data: mindMap, error: fetchError } = await supabase
      .from('mind_maps')
      .select('tags')
      .eq('id', mindMapId)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    // Add the tag if it doesn't exist
    const currentTags = mindMap?.tags || [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      
      const { error } = await supabase
        .from('mind_maps')
        .update({ tags: newTags })
        .eq('id', mindMapId);

      return { error };
    }

    return { error: null };
  }

  /**
   * Remove a tag from a mind map
   * @param mindMapId Mind map ID
   * @param tag Tag to remove
   */
  async removeTagFromMindMap(mindMapId: string, tag: string): Promise<{
    error: Error | null;
  }> {
    // First get the current mind map
    const { data: mindMap, error: fetchError } = await supabase
      .from('mind_maps')
      .select('tags')
      .eq('id', mindMapId)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    // Remove the tag if it exists
    const currentTags = mindMap?.tags || [];
    const newTags = currentTags.filter((t: any) => t !== tag);
    
    const { error } = await supabase
      .from('mind_maps')
      .update({ tags: newTags })
      .eq('id', mindMapId);

    return { error };
  }

  /**
   * Search mind maps by tag
   * @param tag Tag to search for
   */
  async searchMindMapsByTag(tag: string): Promise<{
    data: MindMap[] | null;
    error: Error | null;
  }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get all mind maps for the user
    const { data, error } = await supabase
      .from('mind_maps')
      .select('*')
      .eq('user_id', session.session.user.id);

    if (error) {
      return { data: null, error };
    }

    // Filter by tag (this has to be done client-side since Supabase doesn't support array contains)
    const filteredData = data.filter(mindMap => 
      mindMap.tags && Array.isArray(mindMap.tags) && mindMap.tags.includes(tag)
    );

    return { data: filteredData as MindMap[] || null, error: null };
  }
}