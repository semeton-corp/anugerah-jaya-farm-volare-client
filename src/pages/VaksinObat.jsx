import React, { useRef } from "react";
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
import { getChickenCage } from "../services/cages";
import { getLocations } from "../services/location";
import { useSelector } from "react-redux";

const data = [
  { date: "29 Mar", produksi: 25, penjualan: 30 },
  { date: "30 Mar", produksi: 14, penjualan: 40 },
  { date: "31 Mar", produksi: 30, penjualan: 33 },
  { date: "01 Apr", produksi: 22, penjualan: 40 },
  { date: "02 Apr", produksi: 16, penjualan: 8 },
  { date: "03 Apr", produksi: 25, penjualan: 20 },
  { date: "04 Apr", produksi: 43, penjualan: 32 },
];

const VaksinObat = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const location = useLocation();
  const navigate = useNavigate();

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId"),
  );



  const [detailAyamData, setDetailAyamState] = useState([]);

  const detailPages = ["detail-vaksin-&-obat", "input-vaksin-&-obat"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment),
  );

  async function editDataHandle(dataId) {
    const currectPath = location.pathname;
    navigate(`${currectPath}/detail-vaksin-&-obat/${dataId}`);
  }

  const fetchDataAyam = async () => {
    try {
      // console.log("selectedSite: ", selectedSite);
      const response = await getChickenCage(selectedSite);

      if (response.status === 200) {
        console.log("response.data.data: ", response.data.data);
        setDetailAyamState(response.data.data);
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
  }, [selectedSite]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Vaksin & Obat</h1>
        <div className="flex gap-4">
          {userRole == "Owner" && (
            <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
              <MdStore size={18} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="ml-2 bg-transparent text-base font-medium outline-none"
              >
                <option value="">Semua Site</option>+
                {siteOptions.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-5 border rounded-lg w-full border-black-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-center">
                <th className="py-2 px-4">ID Batch</th>
                <th className="py-2 px-4">Kategori</th>
                <th className="py-2 px-4">Usia (minggu)</th>
                <th className="py-2 px-4">Kandang</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {detailAyamData.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-4">{row.batchId}</td>
                  <td className="py-2 px-4">{row.chickenCategory}</td>
                  <td className="py-2 px-4">{row.chickenAge}</td>
                  <td className="py-2 px-4">{row.cage.name}</td>
                  <td className="py-2 px-4">
                    {row.isNeedRoutineVaccine ? (
                      <span className="px-3 py-1 bg-kritis-box-surface-color text-kritis-text-color rounded shadow-sm">
                        Perlu Vaksin
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-aman-box-surface-color text-aman-text-color font-semibold rounded shadow-sm">
                        Tidak Perlu Vaksin
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-4">
                    <div className="flex gap-2 justify-center">
                      <span
                        onClick={() => {
                          editDataHandle(row.id);
                        }}
                        className="px-3 py-1 bg-green-700 hover:bg-green-900 text-white cursor-pointer rounded"
                      >
                        Detail & input
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VaksinObat;
