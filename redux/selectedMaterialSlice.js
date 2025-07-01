import { createSlice } from "@reduxjs/toolkit";


const selectedMaterialSlice = createSlice({
    name: "selectedMaterial",
    initialState: {
        matCode: "",
        matName: "",
        documents: [],
    },
    reducers: {
        setSelectedMaterial: (state, action) => {
            state.matCode = action.payload.matCode;
            state.matName = action.payload.matName;
            state.documents = action.payload.documents;
        },
        clearSelectedMaterial: (state) => {
            state.matCode = "";
            state.matName = "";
            state.documents = [];
        },
    },
});

export const { setSelectedMaterial, clearSelectedMaterial } = selectedMaterialSlice.actions;
export default selectedMaterialSlice.reducer;
