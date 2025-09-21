import api from "./api";
const token = localStorage.getItem("token");

export const getSelfCurrentUserPresence = () => {
  return api.get("/presences/current/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSelfCurrentUserPresences = (month, year, page) => {
  return api.get("/presences/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      month: month,
      year: year,
      page: page,
    },
  });
};

export const arrivalPresence = (id) => {
  return api.patch(
    `/presences/arrival/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const departurePresence = (id) => {
  return api.patch(
    `/presences/departure/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updatePresence = (payload, id) => {
  return api.patch(`/presences/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLocationPresenceSummaries = () => {
  return api.get(`/presences/locations/summaries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserPresences = (userId, month, year, page = 1) => {
  return api.get(`/presences/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { month, month, year: year, page: page },
  });
};

export const getUserPresencePending = ({
  roleId,
  placeId,
  presenceStatus,
  submissionPresence = "Menunggu",
  locationType,
}) => {
  return api.get(`/presences/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      roleId,
      placeId,
      presenceStatus,
      submissionPresence,
      locationType,
    },
  });
};

export const approveUserPresence = (payload) => {
  return api.post(`/presences/approval`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
