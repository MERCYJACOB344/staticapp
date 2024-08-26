import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
  projects: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};



// Create the slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject(state, action) {
      state.projects.push(action.payload);
    },
    removeProject(state, action) {
      state.projects = state.projects.filter(project => project.id !== action.payload);
    },
    updateProject(state, action) {
      const index = state.projects.findIndex(project => project.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    setProjects(state, action) {
      state.projects = action.payload;
    },
    updateProjectStatus(state, action) {
      const { wo_id, status } = action.payload;
      const index = state.projects.findIndex(project => project.wo_id === wo_id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], status};
      }
    },
    
  }

});

// Export actions
export const { addProject, removeProject, updateProject, setProjects, updateProjectStatus} = projectsSlice.actions;

// Export reducer
const projectsReducer = projectsSlice.reducer;
export default projectsReducer;