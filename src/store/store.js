import { configureStore } from "@reduxjs/toolkit";
import storeReducer from "./storeSlice";
import notificationsReducer from "./notificationsSlice";

export const store = configureStore({
  reducer: {
    store: storeReducer,
    notifications: notificationsReducer,
  },
});
