import React from "react";
import { FiCheck } from "react-icons/fi";
import {
  getAdditionalWorks,
  getAdditionalWorkUserByUserId,
  getDailyWorkUser,
  getDailyWorkUserByUserId,
  takeAdditionalWorks,
  updateAdditionalWorkStaff,
  updateDailyWorkStaff,
} from "../services/dailyWorks";
import { useState, useEffect } from "react";
import {
  getTodayDateInBahasa,
  translateDateToBahasa,
} from "../utils/dateFormat";
import { getSelfCurrentUserPresence } from "../services/presence";
import { PiCalendarBlank } from "react-icons/pi";
import { useParams } from "react-router-dom";
import MonthYearSelector from "../components/MonthYearSelector";

const DetailPenyelesaianPekerjaan = () => {
  const { userId } = useParams();

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date())
  );

  const [tugasTambahanData, setTugasTambahanData] = useState([]);

  const [pageAdditional, setPageAdditional] = useState(1);
  const [pageDaily, setPageDaily] = useState(1);

  const [maxPageAdditional, setMaxPageAdditional] = useState(1);
  const [maxPageDaily, setMaxPageDaily] = useState(1);

  const [dailyWorks, setDailyWorks] = useState([]);
  const [additionalWorks, setAdditionalWorks] = useState([]);

  const onPrevAdditional = () => setPageAdditional((p) => Math.max(1, p - 1));
  const onNextAdditional = () =>
    setPageAdditional((p) => Math.min(maxPageAdditional, p + 1));

  const onPrevDaily = () => setPageDaily((p) => Math.max(1, p - 1));
  const onNextDaily = () => setPageDaily((p) => Math.min(maxPageDaily, p + 1));

  const fetchTugasTambahanData = async () => {
    const params = {
      page: pageAdditional,
      month: monthName,
      year,
      withDeleted: true,
    };
    try {
      const response = await getAdditionalWorkUserByUserId(userId, params);
      console.log("additional work response: ", response);
      if (response.status === 200) {
        const data = response?.data?.data?.additionalWorkUsers;
        setAdditionalWorks(data);
        setMaxPageAdditional(Number(data.totalPage || data.totalPages || 1));
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat tugas tambahan");
      console.log("Error: ", error);
    }
  };

  const fetchAllTugas = async () => {
    const params = {
      page: pageDaily,
      month: monthName,
      year: year,
      withDeleted: true,
    };
    try {
      const response = await getDailyWorkUserByUserId(userId, params);
      console.log("response.data.data.dailyWorks: ", response);
      if (response.status == 200) {
        setDailyWorks(response.data.data.dailyWorkUsers);
        setAdditionalWorks(response.data.data.additionalWorks);
        setMaxPageDaily(response.data.data.totalPage);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat tugas rutin");
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    fetchAllTugas();
  }, [monthName, year, pageDaily]);

  useEffect(() => {
    fetchTugasTambahanData();
  }, [monthName, year, pageAdditional]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Belum Diproses":
        return "bg-[#FF5E5E] text-[#640404]";
      case "Sedang Diproses":
        return "bg-orange-200 text-krisis-text-color";
      case "Selesai":
        return "bg-[#87FF8B] text-[#066000]";
      default:
        return "";
    }
  };

  return (
    <div className="p-4">
      {/* header */}
      <div className="flex justify-between mb-3">
        <div className="text-3xl font-bold mb-4">
          Detail Penyelesaian Pekerjaan
        </div>
        <MonthYearSelector
          month={month}
          year={year}
          setMonth={setMonth}
          setMonthName={setMonthName}
          setYear={setYear}
        />
      </div>

      {/* tugas tambahan  */}
      <div className="border p-4 border-black-6 rounded-lg bg-white mb-3">
        <h2 className="text-xl font-semibold mb-4">Pekerjaan Tambahan</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-700 text-white text-left">
              <th className="py-2 px-4">Waktu</th>
              <th className="py-2 px-4">Nama Pekerjaan</th>
              <th className="py-2 px-4">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {!additionalWorks || additionalWorks.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  Belum terdapat data pekerjaan tambahan
                </td>
              </tr>
            ) : (
              additionalWorks.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{item.additionalWork.time}</td>
                  <td className="py-2 px-4">{item.additionalWork.name}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        item.isDone
                          ? "bg-aman-box-surface-color text-aman-text-color"
                          : "bg-kritis-box-surface-color text-kritis-text-color"
                      }`}
                    >
                      {item.isDone ? "Selesai" : "Dalam Proses"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between mt-16 px-6">
          <p className="text-sm text-[#CCCCCC]">
            Menampilkan {additionalWorks?.length} data dari {maxPageAdditional}{" "}
            Halaman Riwayat
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={pageAdditional === 1}
              onClick={pageAdditional > 1 ? onPrevAdditional : undefined}
              className={`rounded-[4px] py-2 px-6 text-base font-medium
                  ${
                    pageAdditional === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-100 hover:bg-green-200 text-black cursor-pointer"
                  }`}
            >
              Previous
            </button>

            <button
              type="button"
              disabled={pageAdditional === maxPageAdditional}
              onClick={
                pageAdditional < maxPageAdditional
                  ? onNextAdditional
                  : undefined
              }
              className={`rounded-[4px] py-2 px-6 text-base font-medium
                  ${
                    pageAdditional === maxPageAdditional
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-900 text-white cursor-pointer"
                  }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Tugas hari ini */}
      <div className="border p-4 border-black-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Pekerjaan Rutin</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-700 text-white text-left">
              <th className="py-2 px-4">Waktu</th>
              <th className="py-2 px-4">Nama Pekerjaan</th>
              <th className="py-2 px-4">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {!dailyWorks || dailyWorks.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  Belum ada pekerjaan harian
                </td>
              </tr>
            ) : (
              dailyWorks.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{item.dailyWork.endTime}</td>
                  <td className="py-2 px-4">{item.dailyWork.description}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        item.isDone
                          ? "bg-aman-box-surface-color text-aman-text-color"
                          : "bg-kritis-box-surface-color text-kritis-text-color"
                      }`}
                    >
                      {item.isDone ? "Selesai" : "Tidak Selesai"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-between mt-16 px-6">
          <p className="text-sm text-[#CCCCCC]">
            Menampilkan {dailyWorks.length} data dari {maxPageDaily} Halaman
            Riwayat{" "}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={pageDaily === 1}
              onClick={pageDaily > 1 ? onPrevDaily : undefined}
              className={`rounded-[4px] py-2 px-6 text-base font-medium
                ${
                  pageDaily === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-100 hover:bg-green-200 text-black cursor-pointer"
                }`}
            >
              Previous
            </button>

            <button
              type="button"
              disabled={pageDaily === maxPageDaily}
              onClick={pageDaily < maxPageDaily ? onNextDaily : undefined}
              className={`rounded-[4px] py-2 px-6 text-base font-medium
                ${
                  pageDaily === maxPageDaily
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900 text-white cursor-pointer"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          console.log("tugasTambahanData: ", tugasTambahanData);
          console.log("additionalWorks: ", additionalWorks);
          console.log("maxPageDaily: ", maxPageDaily);
          console.log("pageDaily: ", pageDaily);
        }}
      >
        check
      </button>
    </div>
  );
};

export default DetailPenyelesaianPekerjaan;
