import {
  setNotificationContexts,
  setNotificationSelectedCage,
  setNotificationSelectedStore,
  setNotificationSelectedWarehouse,
} from "../store/storeSlice";

export const setNotificationState = (
  dispatch,
  selectedStore = null,
  selectedWarehouse = null,
  selectedCage = null,
  notificationContexts = []
) => {
  dispatch(setNotificationSelectedStore(selectedStore));
  dispatch(setNotificationSelectedWarehouse(selectedWarehouse));
  dispatch(setNotificationSelectedCage(selectedCage));
  dispatch(setNotificationContexts(notificationContexts));
};
