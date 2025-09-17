import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    setNotifications: (state, action) => {
      return action.payload;
    },
    markNotificationDone: (state, action) => {
      return state.map((notif) =>
        notif.id === action.payload ? { ...notif, isMarked: true } : notif
      );
    },
    removeNotification: (state, action) => {
      return state.filter((notif) => notif.id !== action.payload);
    },
    markAllNotificationsDone: (state) => {
      return state.map((notif) => ({ ...notif, isMarked: true }));
    },
    clearAllNotifications: () => {
      return [];
    },
  },
});

export const {
  setNotifications,
  markNotificationDone,
  removeNotification,
  markAllNotificationsDone,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
