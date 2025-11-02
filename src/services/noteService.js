import api from './api';

export const noteService = {
  // Get all notes
  getNotes: async (params = {}) => {
    try {
      // Build query string only if params exist
      let url = '/api/notes';
      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url = `${url}?${queryString}`;
      }
      const response = await api.get(url);
      // Ensure we return the data in expected format
      return response.data;
    } catch (error) {
      console.error('Error in getNotes service:', error);
      throw error; // Re-throw to let the component handle it
    }
  },

  // Get a single note
  getNote: async (id) => {
    const response = await api.get(`/api/notes/${id}`);
    return response.data;
  },

  // Create a new note
  createNote: async (noteData) => {
    const response = await api.post('/api/notes', noteData);
    return response.data;
  },

  // Update a note
  updateNote: async (id, noteData) => {
    const response = await api.put(`/api/notes/${id}`, noteData);
    return response.data;
  },

  // Delete a note
  deleteNote: async (id) => {
    const response = await api.delete(`/api/notes/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/notes/categories');
      return response.data;
    } catch (error) {
      console.error('Error in getCategories service:', error);
      throw error; // Re-throw to let the component handle it
    }
  },

  // Get all tags
  getTags: async () => {
    try {
      const response = await api.get('/api/notes/tags');
      return response.data;
    } catch (error) {
      console.error('Error in getTags service:', error);
      throw error; // Re-throw to let the component handle it
    }
  },

  // Get conversation
  getConversation: async (conversationId) => {
    const response = await api.get(`/api/notes/conversation/${conversationId}`);
    return response.data;
  },

  // Export notes
  exportNotes: async (format = 'txt', conversationId = null) => {
    const params = new URLSearchParams({ format });
    if (conversationId) params.append('conversationId', conversationId);
    
    const response = await api.get(`/api/notes/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `notes-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Share a note
  shareNote: async (id, shareData) => {
    const response = await api.post(`/api/notes/${id}/share`, shareData);
    return response.data;
  },

  // Revoke sharing for a note
  revokeShare: async (id) => {
    const response = await api.delete(`/api/notes/${id}/share`);
    return response.data;
  },

  // Update share settings
  updateShareSettings: async (id, shareData) => {
    const response = await api.put(`/api/notes/${id}/share`, shareData);
    return response.data;
  },

  // Get shared note by token (public)
  getSharedNote: async (token) => {
    const response = await api.get(`/api/notes/shared/${token}`);
    return response.data;
  },

  // Get notes shared with current user
  getSharedNotes: async () => {
    const response = await api.get('/api/notes/shared');
    return response.data;
  }
};

