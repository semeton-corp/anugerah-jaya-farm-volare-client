import api from "./api";
const token = localStorage.getItem("token");

export const getListUser = (roleId, locationId, page, keyword) => {
  return api.get("/users/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      roleId: roleId,
      locationId: locationId,
      page: page,
      keyword: keyword,
    },
  });
};

export const getUserById = (id) => {
  return api.get(`users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getOverviewUser = (id, year, month) => {
  return api.get(`users/overview/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      year: year,
      month: month,
    },
  });
};

export const getUserOverviewList = (page, keyword, roleId, locationId) => {
  return api.get(`users/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: page,
      keyword: keyword,
      roleId: roleId,
      locationId: locationId,
    },
  });
};

export const getUserPerformanceOverview = (params) => {
  return api.get("/users/performances/overview", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: params,
  });
};

export const updateUser = (payload, id) => {
  return api.put(`/users/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
