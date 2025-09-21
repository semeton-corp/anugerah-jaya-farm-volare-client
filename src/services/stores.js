import api from "./api";
const token = localStorage.getItem("token");

export const getStores = (locationId) => {
  return api.get("/stores", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { locationId: locationId },
  });
};

export const getStoreDetail = (id) => {
  return api.get(`/stores/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createStore = (payload) => {
  return api.post("/stores", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStore = (payload, id) => {
  return api.put(`/stores/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteStore = (id) => {
  return api.delete(`/stores/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStoreOverview = (
  month,
  year,
  storeId,
  itemId,
  overviewGraphTime
) => {
  return api.get(`/stores/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      month: month,
      year: year,
      storeId: storeId,
      itemId: itemId,
      overviewGraphTime: overviewGraphTime,
    },
  });
};

export const getStoreCashflows = (month, year, category, page, storeId) => {
  return api.get(`/stores/cashflows`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      month: month,
      year: year,
      category: category,
      page: page,
      storeId: storeId,
    },
  });
};

export const getListStoreSale = (date, paymentStatus, page, storeId) => {
  return api.get("/stores/sales", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      date: date,
      paymentStatus: paymentStatus,
      page: page,
      storeId,
    },
  });
};

export const getStoreSaleById = (id) => {
  return api.get(`/stores/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteStoreSale = (id) => {
  return api.delete(`/stores/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteStoreSalePayment = (storeSaleId, paymentId) => {
  return api.delete(`/stores/sales/${storeSaleId}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createStoreRequestItem = (payload) => {
  return api.post("/stores/request/items", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStoreRequestItems = (date, page, warehouseId, storeId) => {
  return api.get("/stores/request/items", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      date: date,
      page: page,
      warehouseId: warehouseId,
      storeId: storeId,
    },
  });
};

export const updateStoreRequestItem = (payload, id) => {
  return api.put(`/stores/request/items/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const warehouseConfirmationStoreRequestItem = (payload, id) => {
  return api.put(
    `/stores/request/items/${id}/warehouse-confirmations`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const storeConfirmationStoreRequestItem = (payload, id) => {
  return api.put(`/stores/request/items/${id}/store-confirmations`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createStoreSale = (payload) => {
  return api.post("/stores/sales", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStoreSale = (storeSaleId, payload) => {
  return api.put(`/stores/sales/${storeSaleId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createStoreSalePayment = (payload, id) => {
  return api.post(`/stores/sales/${id}/payments`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStoreSalePayment = (storeSaleId, id, payload) => {
  return api.put(`/stores/sales/${storeSaleId}/payments/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStoreItemsHistories = (date, page) => {
  return api.get("/stores/items/histories", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      date: date,
      page: page,
    },
  });
};

export const getStoreItemsHistoryById = (id) => {
  return api.get(`/stores/items/histories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStoreItemStocks = (id) => {
  return api.get(`/stores/overview/stocks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStoreItem = (storeId, itemId) => {
  return api.get(`/stores/${storeId}/items/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStoreItem = (storeId, itemId, payload) => {
  return api.put(`/stores/${storeId}/items/${itemId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getEggStoreItemSummary = (storeId) => {
  return api.get(`/stores/items/eggs/summary/${storeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const sendStoreSale = (id) => {
  return api.patch(`/stores/sales/${id}/send`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createStoreSaleQueue = (payload) => {
  return api.post(`/stores/queues`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStoreSaleQueues = (storeId) => {
  return api.get(`/stores/queues`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { storeId: storeId },
  });
};

export const deleteStoreSaleQueue = (id) => {
  return api.delete(`/stores/queues/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const allocateStoreSaleQueue = (payload, id) => {
  return api.post(`/stores/queues/${id}/allocates`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
