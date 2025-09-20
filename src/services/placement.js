import api from "./api";
const token = localStorage.getItem("token");

//store
export const createStorePlacement = (payload) => {
  return api.post("/placements/stores", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUserStorePlacement = () => {
  return api.get("/placements/stores/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteStorePlacementById = (storeId, userId) => {
  return api.delete(`/placements/stores/${storeId}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//warehouse
export const createWarehousePlacement = (payload) => {
  return api.post("/placements/warehouses", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteWarehousePlacementById = (warehouseId, userId) => {
  return api.delete(`/placements/warehouses/${warehouseId}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUserWarehousePlacement = () => {
  return api.get("/placements/warehouses/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//cage
export const createCagePlacement = (payload) => {
  return api.post("/placements/cages", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUserCagePlacement = () => {
  return api.get("/placements/cages/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
