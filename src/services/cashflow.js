import api from "./api";
const token = localStorage.getItem("token");

export const createExpense = (payload) => {
  return api.post(`/cashflows/expenses`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getExpenseOverview = (category, month, year) => {
  return api.get(`/cashflows/expenses/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      category: category,
      month: month,
      year,
    },
  });
};

export const getExpense = (category, id) => {
  return api.get(`/cashflows/expenses/${category}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getIncomeOverview = (category, month, year) => {
  return api.get(`/cashflows/incomes/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      category: category,
      month: month,
      year,
    },
  });
};

export const getIncome = (category, id) => {
  return api.get(`/cashflows/incomes/${category}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getReceivablesOverview = (category, month, year) => {
  return api.get(`/cashflows/receivables/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      category: category,
      month: month,
      year,
    },
  });
};

export const getUserCashAdvanceByUserId = (userId) => {
  return api.get(`/cashflows/cash-advances/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const createUserCashAdvance = (payload) => {
  return api.post(`/cashflows/cash-advances`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const createUserCashAdvancePayment = (payload, id) => {
  return api.post(`/cashflows/cash-advances/${id}/payments`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const deleteUserCashAdvancePayment = (userCashAdvanceId, id) => {
  return api.delete(
    `/cashflows/cash-advances/${userCashAdvanceId}/payments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
};

export const getReceivables = (category, id) => {
  return api.get(`/cashflows/receivables/${category}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getDebtOverview = (category, month, year) => {
  return api.get(`/cashflows/debts/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      category: category,
      month: month,
      year,
    },
  });
};

export const getDebt = (category, id) => {
  return api.get(`/cashflows/debts/${category}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getUserSalaries = (params) => {
  return api.get(`/cashflows/salaries`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: params,
  });
};

export const getUserSalaryDetail = (id) => {
  return api.get(`/cashflows/salaries/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getUserSalarySummary = (month, year) => {
  return api.get(`/cashflows/salaries/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      month: month,
      year: year,
    },
  });
};

export const payUserSalary = (payload, id) => {
  return api.post(`/cashflows/salaries/${id}/pay`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const getCashflowSaleOverview = (locationId, month, year, itemId) => {
  return api.get(`/cashflows/sales/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      locationId: locationId,
      month: month,
      year: year,
      itemId: itemId,
    },
  });
};

export const downloadReport = (month, year) => {
  return api.get(`/cashflows/sales/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      month: month,
      year: year,
    },
    responseType: "blob",
  });
};

export const getCashflowOverview = (year) => {
  return api.get(`/cashflows/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: {
      year: year,
    },
  });
};
