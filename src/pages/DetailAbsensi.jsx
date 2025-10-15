import React, { useEffect, useState } from "react";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { PiCalendarBlank } from "react-icons/pi";
import {
  getSelfCurrentUserPresence,
  arrivalPresence,
  departurePresence,
  getSelfCurrentUserPresences,
  getUserPresences,
} from "../services/presence";
import MonthYearSelector from "../components/MonthYearSelector";
import { useParams } from "react-router-dom";

const DetailAbsensi = ({ mode }) => {
  const { userId } = useParams();

  const [presenceId, setPresenceId] = useState(0);
  const [isPresence, setIsPresence] = useState(false);
  const [isGoHome, setIsGoHome] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date())
  );

  const [page, setPage] = useState(1);
  const [historyData, setHistoryData] = useState([]);

  const [totalData, setTotaldata] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const monthNamesBahasa = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const getSelfAttandanceData = async () => {
    try {
      const allPresenceResponse = await getUserPresences(
        userId,
        monthName,
        year,
        page
      );
      console.log("allPresenceResponse: ", allPresenceResponse);
      if (allPresenceResponse.status == 200) {
        setAttendanceData(allPresenceResponse.data.data.presences);
        setTotaldata(allPresenceResponse.data.data.totalData);
        setTotalPages(allPresenceResponse.data.data.totalPage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const getAttandanceData = async () => {
    try {
      const allPresenceResponse = await getUserPresences(
        id,
        monthName,
        year,
        page
      );
      console.log("allPresenceResponse: ", allPresenceResponse);
      if (allPresenceResponse.status == 200) {
        setAttendanceData(allPresenceResponse.data.data.presences);
        setTotaldata(allPresenceResponse.data.data.totalData);
        setTotalPages(allPresenceResponse.data.data.totalPage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    if (mode == "StaffDetail") {
      getAttandanceData();
    } else {
      getSelfAttandanceData();
    }
  }, [monthName, year, page]);

  useEffect(() => {
    setPage(1);
  }, [monthName, year]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Detail Absensi</h1>
        <MonthYearSelector
          month={month}
          year={year}
          setMonth={setMonth}
          setMonthName={setMonthName}
          setYear={setYear}
        />
      </div>

      {/* Table container */}
      <div className="bg-white rounded border border-black-6 p-4">
        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full border-collapse text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-2 text-left whitespace-nowrap">Tanggal</th>
                <th className="p-2 text-left whitespace-nowrap">Jam masuk</th>
                <th className="p-2 text-left whitespace-nowrap">Jam pulang</th>
                <th className="p-2 text-left whitespace-nowrap">
                  Jumlah Lembur
                </th>
                <th className="p-2 text-left whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Belum ada data absensi
                  </td>
                </tr>
              ) : (
                attendanceData.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 whitespace-nowrap">{row.date}</td>
                    <td className="p-2 whitespace-nowrap">{row.startTime}</td>
                    <td className="p-2 whitespace-nowrap">{row.endTime}</td>
                    <td className="p-2 whitespace-nowrap">{row.overTime}</td>
                    <td className="p-2 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded ${
                          row.startTime !== ""
                            ? "bg-aman-box-surface-color text-aman-text-color"
                            : "bg-kritis-box-surface-color text-kritis-text-color"
                        }`}
                      >
                        {row.startTime !== "" ? "Hadir" : "Tidak hadir"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col md:flex-row justify-between mt-4 gap-2 md:gap-0 px-2 md:px-6">
          {attendanceData?.length > 0 && (
            <p className="text-sm text-[#CCCCCC]">
              Menampilkan halaman {page} dari {totalPages} halaman. Total{" "}
              {totalData} data riwayat
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={page <= 1 || totalPages <= 0}
              onClick={() => page > 1 && totalPages > 0 && setPage(page - 1)}
              className={`rounded-[4px] py-2 px-6 text-base font-medium ${
                page <= 1 || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed text-black"
                  : "bg-green-100 hover:bg-green-200 cursor-pointer text-black"
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || totalPages <= 0}
              onClick={() =>
                page < totalPages && totalPages > 0 && setPage(page + 1)
              }
              className={`rounded-[4px] py-2 px-6 text-base font-medium ${
                page >= totalPages || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed text-black"
                  : "bg-green-700 hover:bg-green-800 cursor-pointer text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailAbsensi;
