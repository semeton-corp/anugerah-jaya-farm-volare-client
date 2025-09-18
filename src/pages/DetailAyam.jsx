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

const DetailAyam = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const location = useLocation();
  const navigate = useNavigate();

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts.includes("Monitoring Ayam")
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
      <div className="flex justify-between items-center mb-2 flex-wrap gap-6">
        <h1 className="text-3xl font-bold">
          {userRole === "Pekerja Kandang" ? "Data Ayam" : "Detail Ayam"}
        </h1>

        <div className="flex gap-4">
          {userRole == "Owner" && (
            <div className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
              <MdStore size={18} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="ml-2 bg-transparent text-base font-medium outline-none"
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
      </div>

      <div className="max-h-72 overflow-y-auto flex flex-col gap-3">
        {pageNotifications &&
          pageNotifications.map((item, index) => (
            <PageNotificationsCard key={index} description={item.description} />
          ))}
      </div>

      {/* Table Section */}
      <div className="bg-white p-4 border rounded-lg w-full border-black-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {userRole === "Pekerja Kandang" || "Kepala Kandang"
              ? "Data harian ayam"
              : ""}
          </h2>

          <div
            onClick={inputAyamHandle}
            className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
          >
            <div className="text-base font-medium ms-2 text-black">
              + Input Data Harian
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-center">
                <th className="py-2 px-4">Kandang</th>
                <th className="py-2 px-4">ID Ayam</th>
                <th className="py-2 px-4">Kategori</th>
                <th className="py-2 px-4">Usia (minggu)</th>
                <th className="py-2 px-4">Hidup</th>
                <th className="py-2 px-4">Sakit</th>
                <th className="py-2 px-4">Mati</th>
                <th className="py-2 px-4">Pakan (Kg)</th>
                <th className="py-2 px-4">Mortalitas</th>
                {isSelectedDateToday(selectedDate) && (
                  <th className="py-2 px-4">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {detailAyamData.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-4">{row.chickenCage.cage.name}</td>
                  <td className="py-2 px-4">{row.chickenCage.batchId}</td>
                  <td className="py-2 px-4">
                    {row.chickenCage.cage.chickenCategory}
                  </td>
                  <td className="py-2 px-4">{row.chickenCage.chickenAge}</td>
                  <td className="py-2 px-4">{row.totalLiveChicken}</td>
                  <td className="py-2 px-4">{row.totalSickChicken}</td>
                  <td className="py-2 px-4">{row.totalDeathChicken}</td>
                  <td className="py-2 px-4">{row.totalFeed}</td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2 justify-center">
                      <p>{row.mortalityRate}</p>
                      <p>%</p>
                    </div>
                  </td>
                  {isSelectedDateToday(selectedDate) &&
                    (row.chickenCage.chickenPic === userName ||
                      userRole === "Owner" ||
                      userRole === "Kepala Kandang") && (
                      <td className="py-2 px-4 flex justify-center gap-4">
                        <span
                          onClick={() => {
                            editDataHandle(row.id);
                          }}
                          className="py-1 px-4 rounded bg-green-700 hover:bg-green-900  text-white cursor-pointer"
                        >
                          Lihat Detail
                        </span>
                      </td>
                    )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button
        onClick={() => {
          console.log("selectedSite: ", selectedSite);
          console.log("selectedDate: ", selectedDate);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default DetailAyam;
