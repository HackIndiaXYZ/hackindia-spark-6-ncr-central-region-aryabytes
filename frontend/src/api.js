import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Upload a file for processing
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Process raw text
  processText: async (text) => {
    const response = await axios.post(`${API_BASE}/process-text`, { text });
    return response.data;
  },

  // Get all tasks
  getTasks: async (category = 'All', sort = 'deadline') => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (sort) params.append('sort', sort);
    const response = await axios.get(`${API_BASE}/tasks?${params}`);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id) => {
    const response = await axios.delete(`${API_BASE}/tasks/${id}`);
    return response.data;
  },

  // Load demo tasks
  loadDemo: async () => {
    const response = await axios.post(`${API_BASE}/demo`);
    return response.data;
  },

  // Clear all tasks
  clearTasks: async () => {
    const response = await axios.delete(`${API_BASE}/tasks`);
    return response.data;
  }
};
