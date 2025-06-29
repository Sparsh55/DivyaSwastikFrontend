// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './projectSlice';
import userReducer from './userSlice';
import selectedMaterialReducer from "./selectedMaterialSlice";

export const store = configureStore({
  reducer: {
    project: projectReducer,
    user: userReducer,
    selectedMaterial: selectedMaterialReducer,

  },
});
