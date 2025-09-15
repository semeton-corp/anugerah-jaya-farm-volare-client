import { createContext, useContext, useState } from "react";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedCage, setSelectedCage] = useState(null);

  const [notificationContexts, setNotificationContexts] = useState([]);

  return (
    <StoreContext.Provider
      value={{
        userId,
        setUserId,
        selectedStore,
        setSelectedStore,
        selectedWarehouse,
        setSelectedWarehouse,
        selectedCage,
        setSelectedCage,
        notificationContexts,
        setNotificationContexts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => useContext(StoreContext);
