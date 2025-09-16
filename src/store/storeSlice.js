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
    setNotificationUserId: (state, action) => {
      state.userId = action.payload;
    },
    setNotificationSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    setNotificationSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
    },
    setNotificationSelectedCage: (state, action) => {
      state.selectedCage = action.payload;
    },
    setNotificationContexts: (state, action) => {
      state.notificationContexts = action.payload;
    },
  },
});

export const {
  setNotificationUserId,
  setNotificationSelectedStore,
  setNotificationSelectedWarehouse,
  setNotificationSelectedCage,
  setNotificationContexts,
} = storeSlice.actions;

export default storeSlice.reducer;
