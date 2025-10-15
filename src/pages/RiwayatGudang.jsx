import React, { useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlank } from "react-icons/pi";
import { BiSolidEditAlt } from "react-icons/bi";
import {
  formatDate,
  formatDateToDDMMYYYY,
  getTodayDateInBahasa,
} from "../utils/dateFormat";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getWarehouseItemHistories } from "../services/warehouses";

const RiwayatGudang = () => {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [page, setPage] = useState(1);
  const [historyData, setHistoryData] = useState([]);

  const [totalData, setTotaldata] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const detailPages = ["detail-riwayat-gudang"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const detailRiwayatHandle = (id) => {
    const currentPath = location.pathname;
    const detailPath = currentPath + `/detail-riwayat-gudang/${id}`;

    navigate(detailPath);
  };

  const fetchHistoryData = async (page) => {
    try {
      const date = selectedDate
        ? formatDateToDDMMYYYY(selectedDate)
        : undefined;

      const historyResponse = await getWarehouseItemHistories(date, page);
      console.log("page: ", page);
      console.log("historyResponse: ", historyResponse);

      setTotaldata(historyResponse.data.data.totalData);
      setHistoryData(historyResponse.data.data.warehouseItemHistories);
      setTotalPages(historyResponse.data.data.totalPage);
    } catch (error) {
      console.error("Error fetching warehouse history:", error);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    console.log("date: ", date);
    setSelectedDate(date);
  };

  useEffect(() => {
    fetchHistoryData(page);
  }, [selectedDate, page]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Riwayat Gudang</h1>

        <div
          className="flex items-center justify-center sm:justify-start rounded-lg bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2 px-4 py-2 w-full sm:w-auto"
          onClick={openDatePicker}
        >
          {selectedDate ? (
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-transparent cursor-pointer w-full sm:w-auto text-center"
            />
          ) : (
            <>
              <span className="text-gray-700 text-center w-full sm:w-auto">
                Semua Hari
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      {/* Table container (scrollable on mobile) */}
      <div className="rounded-[4px] border border-black-6 overflow-x-auto">
        <div className="min-w-[700px] sm:min-w-0 px-4 sm:px-6 py-6">
          <table className="w-full text-sm sm:text-base">
            <thead className="bg-green-700 text-white text-center">
              <tr>
                <th className="py-2 px-4 whitespace-nowrap">Waktu</th>
                <th className="py-2 px-4 whitespace-nowrap">Nama Barang</th>
                <th className="py-2 px-4 whitespace-nowrap">Kuantitas</th>
                <th className="py-2 px-4 whitespace-nowrap">Asal Barang</th>
                <th className="py-2 px-4 whitespace-nowrap">Tujuan</th>
                <th className="py-2 px-4 whitespace-nowrap">Keterangan</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>

            <tbody className="text-center">
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-gray-500">
                    Tidak ada data riwayat.
                  </td>
                </tr>
              ) : (
                historyData.map((data, index) => (
                  <tr
                    key={index}
                    className="border-b border-black-6 hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">{data.time}</td>
                    <td className="py-2 px-4">{data.itemName ?? "-"}</td>
                    <td className="py-2 px-4">{data.quantity}</td>
                    <td className="py-2 px-4">{data.source}</td>
                    <td className="py-2 px-4">{data.destination}</td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <span
                        className={`inline-block py-1 px-3 sm:px-4 rounded text-[10px] sm:text-sm font-semibold whitespace-nowrap ${
                          data.status === "Barang Masuk"
                            ? "bg-aman-box-surface-color text-aman-text-color"
                            : data.status === "Pending"
                            ? "bg-green-200 text-green-900"
                            : data.status === "Stok Diperbarui"
                            ? "bg-orange-200 text-orange-900"
                            : "bg-kritis-box-surface-color text-kritis-text-color"
                        }`}
                      >
                        {data.status}
                      </span>
                    </td>

                    <td className="py-2 px-4">
                      <span
                        onClick={() => detailRiwayatHandle(data.id)}
                        className="underline hover:text-black-5 cursor-pointer"
                      >
                        Detail
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-10 sm:mt-16 gap-4 sm:gap-0 px-2 sm:px-6">
            {historyData?.length > 0 && (
              <p className="text-sm text-gray-500 text-center sm:text-left">
                {`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat.`}
              </p>
            )}

            <div className="flex justify-center sm:justify-end gap-3">
              <button
                disabled={page <= 1 || totalPages <= 0}
                onClick={() => page > 1 && totalPages > 0 && setPage(page - 1)}
                className={`rounded-[4px] py-2 px-6 ${
                  page <= 1 || totalPages <= 0
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-green-100 hover:bg-green-200"
                } text-black text-sm sm:text-base font-medium`}
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages || totalPages <= 0}
                onClick={() =>
                  page < totalPages && totalPages > 0 && setPage(page + 1)
                }
                className={`rounded-[4px] py-2 px-6 ${
                  page >= totalPages || totalPages <= 0
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                } text-white text-sm sm:text-base font-medium`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatGudang;
