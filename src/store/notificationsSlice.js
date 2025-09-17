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
        notif.id === action.payload ? { ...notif, done: true } : notif
      );
    },
  },
});

export const { setNotifications, markNotificationDone } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
