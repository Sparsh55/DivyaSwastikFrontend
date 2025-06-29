import { createSlice } from '@reduxjs/toolkit';

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    currentProject: null,
  },
  reducers: {
    setProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearProject: (state) => {
      state.currentProject = null;
    },
  },
});

export const { setProject, clearProject } = projectSlice.actions;
export default projectSlice.reducer;
