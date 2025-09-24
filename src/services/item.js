import api from "./api";
const token = localStorage.getItem("token");

///Item
export const createItem = (payload) => {
  return api.post("/items", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getItems = (category, storeId) => {
  return api.get("/items", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      category: category,
      storeId: storeId,
    },
  });
};

export const getItemById = (id) => {
  return api.get(`/items/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const deleteItem = (id) => {
  return api.delete(`/items/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const updateItem = (payload, id) => {
  return api.put(`/items/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

///Price
export const createItemPrice = (payload) => {
  return api.post("/items/prices", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const deleteItemPrice = (id) => {
  return api.delete(`/items/prices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getItemPrices = () => {
  return api.get("/items/prices", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getItemPricesById = (id) => {
  return api.get(`/items/prices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const updateItemPrice = (payload, id) => {
  return api.put(`/items/prices/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

//Price Discount
export const createItemPriceDiscount = (payload) => {
  return api.post("/items/prices/discounts", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getItemPricesDiscount = () => {
  return api.get("/items/prices/discounts", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getItemPricesDiscountById = (id) => {
  return api.get(`/items/prices/discounts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const updateItemPricesDiscount = (payload, id) => {
  return api.put(`/items/prices/discounts/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};
