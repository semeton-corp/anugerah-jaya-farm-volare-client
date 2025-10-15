import React, { useEffect, useRef } from "react";
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
import { getStoreItemsHistories } from "../services/stores";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const RiwayatStok = () => {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [storeItemHistories, setStoreItemHistories] = useState([]);

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const detailPages = ["detail-riwayat-stok"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const detailRiwayatHandle = (id) => {
    const currentPath = location.pathname;
    const detailPath = currentPath + `/detail-riwayat-stok/${id}`;

    navigate(detailPath);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    console.log("date: ", date);
    setSelectedDate(date);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call parent function with search input
  };

  const fetchHistoryData = async (page) => {
    try {
      const date = selectedDate
        ? formatDateToDDMMYYYY(selectedDate)
        : undefined;

      const historyResponse = await getStoreItemsHistories(date, page);

      console.log("historyResponse: ", historyResponse);

      if (historyResponse.status == 200) {
        setStoreItemHistories(historyResponse.data.data.storeItemHistories);
        setTotalData(historyResponse.data.data.totalData);
        setTotalPages(historyResponse.data.data.totalPage);
      }
    } catch (error) {
      console.error("Error fetching warehouse history:", error);
    }
  };

  useEffect(() => {
    fetchHistoryData(page);
  }, [selectedDate, page]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* header */}
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Riwayat Stok Toko</h1>

        <div
          className="flex items-center rounded-lg bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2"
          onClick={openDatePicker}
        >
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2"
          />
        </div>
      </div>

      {/* entire box */}
      <div className="rounded-[4px] border border-black-6">
        {/* scroll wrapper for table */}
        <div className="px-6 py-6 w-full overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-green-700 text-white text-center">
              <tr>
                <th className="py-2 px-4">Waktu</th>
                <th className="py-2 px-4">Nama barang</th>
                <th className="py-2 px-4">Kuantitas</th>
                <th className="py-2 px-4">Pembeli</th>
                <th className="py-2 px-4">Tempat pemesanan</th>
                <th className="py-2 px-4">Keterangan</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>

            <tbody className="text-center">
              {storeItemHistories.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-black-6 hover:bg-gray-50"
                >
                  <td className="py-2 px-4">{item.time}</td>
                  <td className="py-2 px-4">{item.itemName}</td>
                  <td className="py-2 px-4">{item.quantity}</td>
                  <td className="py-2 px-4">{item.destination}</td>
                  <td className="py-2 px-4">{item.source ?? "-"}</td>
                  <td className="py-2 px-2 sm:px-4 text-center">
                    <span
                      className={`inline-block min-w-[100px] text-center py-1 px-3 sm:px-5 rounded text-xs sm:text-sm font-semibold ${
                        item.status === "Barang Masuk"
                          ? "bg-aman-box-surface-color text-aman-text-color"
                          : item.status === "Pending"
                          ? "bg-green-200 text-green-900"
                          : item.status === "Stok Diperbarui"
                          ? "bg-orange-200 text-orange-900"
                          : "bg-kritis-box-surface-color text-kritis-text-color"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-2 px-4">
                    <span
                      onClick={() => detailRiwayatHandle(item.id)}
                      className="underline hover:text-black-5 cursor-pointer"
                    >
                      Detail
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {storeItemHistories.length < 1 && (
            <p className="p-3 w-full flex justify-center italic text-gray-300">
              Belum ada riwayat stok toko
            </p>
          )}
        </div>

        {/* footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-10 px-6">
          {storeItemHistories?.length > 0 ? (
            <p className="text-sm text-[#CCCCCC] text-center sm:text-left">
              {`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat`}
            </p>
          ) : (
            <p></p>
          )}

          <div className="flex gap-3 mb-4">
            <div
              className={`rounded-[4px] py-2 px-6 ${
                page <= 1 || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-100 hover:bg-green-200 cursor-pointer"
              } flex items-center justify-center text-black text-base font-medium`}
              onClick={() => page > 1 && totalPages > 0 && setPage(page - 1)}
            >
              <p>Previous</p>
            </div>
            <div
              className={`rounded-[4px] py-2 px-6 ${
                page >= totalPages || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800 cursor-pointer"
              } flex items-center justify-center text-white text-base font-medium`}
              onClick={() =>
                page < totalPages && totalPages > 0 && setPage(page + 1)
              }
            >
              <p>Next</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatStok;
