import api from "./api";
const token = localStorage.getItem("token");

export const getNotifications = (params) => {
  return api.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: params,
  });
};
