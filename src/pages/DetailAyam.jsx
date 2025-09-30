import React from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete, MdStore } from "react-icons/md";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getChickenMonitoring } from "../services/chickenMonitorings";
import { deleteChickenData } from "../services/chickenMonitorings";
import {
  formatDate,
  formatDateToDDMMYYYY,
  getTodayDateInBahasa,
} from "../utils/dateFormat";
import { AlertTriangle } from "lucide-react";
import { getLocations } from "../services/location";
import { useRef } from "react";
import { useSelector } from "react-redux";
import PageNotificationsCard from "../components/PageNotificationsCard";
import PageNotificationsSection from "../components/PageNotificationsSection";

const DetailAyam = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const location = useLocation();
  const navigate = useNavigate();

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Monitoring Ayam")
  );

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const isSelectedDateToday = (selectedDate) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStr = `${yyyy}-${mm}-${dd}`;
    return selectedDate === todayStr;
  };

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const [detailAyamData, setDetailAyamState] = useState([]);

  const detailPages = ["input-ayam", "detail-vaksin-obat"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const inputAyamHandle = () => {
    navigate(`${location.pathname}/input-ayam`);
  };

  const detailVaksinObatHandle = () => {
    navigate(`${location.pathname}/detail-vaksin-obat`);
  };

  const fetchDataAyam = async () => {
    try {
      const date = formatDateToDDMMYYYY(selectedDate);
      const response = await getChickenMonitoring(selectedSite, date);
      if (response.status === 200) {
        setDetailAyamState(response.data.data);
        console.log("response.data.data: ", response.data.data);

        // console.log("DetailAyamData: ", response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data ayam:", error);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await getLocations();
      if (res.status === 200) {
        setSiteOptions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

  async function deleteDataHandle(dataId) {
    try {
      const response = await deleteChickenData(dataId);
      console.log("response.status", response.status);

      if (response.status === 204) {
        alert("✅ Data berhasil dihapus!");
        await fetchDataAyam();
      } else {
        alert("⚠️ Gagal menghapus data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal menghapus data ayam:", error);
      alert("❌ Terjadi kesalahan saat menghapus data.");
    }
  }

  async function editDataHandle(dataId) {
    const currectPath = location.pathname;
    navigate(`${currectPath}/input-ayam/${dataId}`);
  }

  useEffect(() => {
    fetchDataAyam();
    fetchSites();

    if (location.state?.refetch) {
      fetchDataAyam();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchDataAyam();
  }, [selectedSite, selectedDate]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-4">
        <h1 className="text-lg sm:text-2xl font-bold">
          {userRole === "Pekerja Kandang" ? "Data Ayam" : "Detail Ayam"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {userRole === "Owner" && (
            <div className="flex items-center rounded px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
              <MdStore size={18} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none"
              >
                <option value="">Semua Site</option>
                {siteOptions.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className="flex items-center rounded px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
            onClick={openDatePicker}
          >
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-transparent text-sm sm:text-base font-medium outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <PageNotificationsSection pageNotifications={pageNotifications} />

      {/* Table Section */}
      <div className="bg-white p-3 sm:p-4 border rounded-lg w-full border-black-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="text-base sm:text-lg font-semibold">
            {userRole === "Pekerja Kandang" || userRole === "Kepala Kandang"
              ? "Data harian ayam"
              : ""}
          </h2>

          <button
            onClick={inputAyamHandle}
            className="w-full sm:w-auto flex justify-center items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 text-sm sm:text-base font-medium"
          >
            + Input Data Harian
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-center">
                <th className="py-2 px-2 sm:px-4">Kandang</th>
                <th className="py-2 px-2 sm:px-4">ID Ayam</th>
                <th className="py-2 px-2 sm:px-4">Kategori</th>
                <th className="py-2 px-2 sm:px-4">Usia</th>
                <th className="py-2 px-2 sm:px-4">Hidup</th>
                <th className="py-2 px-2 sm:px-4">Sakit</th>
                <th className="py-2 px-2 sm:px-4">Mati</th>
                <th className="py-2 px-2 sm:px-4">Pakan</th>
                <th className="py-2 px-2 sm:px-4">Mortalitas</th>
                {isSelectedDateToday(selectedDate) && (
                  <th className="py-2 px-2 sm:px-4">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {detailAyamData.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-2 sm:px-4">
                    {row.chickenCage.cage.name}
                  </td>
                  <td className="py-2 px-2 sm:px-4">
                    {row.chickenCage.batchId}
                  </td>
                  <td className="py-2 px-2 sm:px-4">
                    {row.chickenCage.cage.chickenCategory}
                  </td>
                  <td className="py-2 px-2 sm:px-4">
                    {row.chickenCage.chickenAge}
                  </td>
                  <td className="py-2 px-2 sm:px-4">{row.totalLiveChicken}</td>
                  <td className="py-2 px-2 sm:px-4">{row.totalSickChicken}</td>
                  <td className="py-2 px-2 sm:px-4">{row.totalDeathChicken}</td>
                  <td className="py-2 px-2 sm:px-4">{row.totalFeed}</td>
                  <td className="py-2 px-2 sm:px-4">
                    {Number(row.mortalityRate).toFixed(2)}%
                  </td>
                  {isSelectedDateToday(selectedDate) &&
                    (row.chickenCage.chickenPic === userName ||
                      userRole === "Owner" ||
                      userRole === "Kepala Kandang") && (
                      <td className="py-2 px-2 sm:px-4">
                        <button
                          onClick={() => editDataHandle(row.id)}
                          className="py-1 px-2 sm:px-4 rounded bg-green-700 hover:bg-green-900 text-white text-xs sm:text-sm"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailAyam;
