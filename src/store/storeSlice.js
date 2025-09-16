import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
  selectedStore: null,
  selectedWarehouse: null,
  selectedCage: null,
  notificationContexts: [],
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    setSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
    },
    setSelectedCage: (state, action) => {
      state.selectedCage = action.payload;
    },
    setNotificationContexts: (state, action) => {
      state.notificationContexts = action.payload;
    },
  },
});

export const {
  setUserId,
  setSelectedStore,
  setSelectedWarehouse,
  setSelectedCage,
  setNotificationContexts,
} = storeSlice.actions;

export default storeSlice.reducer;
