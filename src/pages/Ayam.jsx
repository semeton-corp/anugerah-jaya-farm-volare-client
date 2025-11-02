import React, { useEffect, useState } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { PiMoneyWavyFill } from "react-icons/pi";
import { MdStore } from "react-icons/md";
import { TbEggCrackedFilled } from "react-icons/tb";
import { FiMaximize2 } from "react-icons/fi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

import {
  GiBirdCage,
  GiHealthDecrease,
  GiChicken,
  GiDeathSkull,
} from "react-icons/gi";
import { FaCalendarAlt, FaPercentage } from "react-icons/fa";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { getLocations } from "../services/location";
import { getChickenCage } from "../services/cages";
import { getChickenOverview } from "../services/chickenMonitorings";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import YearSelector from "../components/YearSelector";

const Ayam = () => {
  const location = useLocation();
  const userRole = localStorage.getItem("role");

  const [year, setYear] = useState(new Date().getFullYear());

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [chickenCageOptions, setChickenCageOptions] = useState([]);
  const [selectedChickenCage, setSelectedChickenCage] = useState(0);

  const [graphFilterOptions, setGraphFilterOptions] = useState([
    "Minggu Ini",
    "Bulan Ini",
    "Tahun Ini",
  ]);
  const [graphFilter, setGraphFilter] = useState("Minggu Ini");

  const [chickenDetail, setChickenDetail] = useState([]);
  const [ayamChartData, setAyamChartData] = useState([]);
  const [chickenAgeData, setChickenAgeData] = useState([]);

  const detailPages = ["detail-ayam"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );
  const navigate = useNavigate();

  const detailAyamHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/detail-ayam";

    navigate(detailPath);
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

  const fetchChickenCages = async () => {
    try {
      const cageResponse = await getChickenCage(selectedSite);
      if (cageResponse.status === 200) {
        setChickenCageOptions(cageResponse.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  const fetchOverviewData = async () => {
    try {
      let selectedYear = undefined;

      if (graphFilter === "Tahun Ini") {
        selectedYear = year;
      }

      const overviewResponse = await getChickenOverview(
        selectedSite,
        selectedChickenCage,
        graphFilter,
        selectedYear
      );

      console.log("overviewResponse: ", overviewResponse);
      if (overviewResponse.status == 200) {
        const data = overviewResponse.data.data;
        setChickenDetail(data.chickenDetail);

        const transformedChartData = data.chickenGraphs.map((item) => ({
          date: item.key,
          ayamMati: item.deathChicken,
          ayamSakit: item.sickChicken,
        }));
        setAyamChartData(transformedChartData);

        const pie = data.chickenPie;

        const ageData = [
          { age: "DOC", value: pie.chickenDOC },
          { age: "Grower", value: pie.chickenGrower },
          { age: "Prelayer", value: pie.chickenPrelayer },
          { age: "Layer", value: pie.chickenLayer },
          { age: "Afkir", value: pie.chickenAfkir },
        ];
        setChickenAgeData(ageData);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchChickenCages();
    fetchSites();
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [year, selectedChickenCage, selectedSite, graphFilter]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-3 py-3 gap-4">
          {/* header section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {userRole == "Pekerja Kandang"
                ? "Ringkasan Hari Ini"
                : "Ringkasan Ayam Hari Ini"}
            </h1>

            <div className="flex flex-wrap gap-3 items-center">
              <p>{getTodayDateInBahasa()}</p>
              {(userRole == "Owner" || userRole == "Kepala Kandang") && (
                <div className="flex items-center rounded-lg px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer w-full sm:w-auto">
                  <MdStore size={18} />
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none w-full sm:w-auto"
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

              <div className="flex items-center rounded-lg px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer w-full sm:w-auto">
                <GiBirdCage size={18} />
                <select
                  value={selectedChickenCage}
                  onChange={(e) => setSelectedChickenCage(e.target.value)}
                  className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none w-full sm:w-auto"
                >
                  <option value="">Semua Kandang</option>
                  {chickenCageOptions.map((chickenCage) => (
                    <option key={chickenCage.id} value={chickenCage.cage.id}>
                      {chickenCage.cage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats cards (grid instead of flex for responsiveness) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Populasi */}
            <div className="p-4 rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Total Populasi
                </h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <GiChicken size={24} color="white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold">
                {chickenDetail?.totalLiveChicken ?? "-"}
              </p>
            </div>

            {/* Ayam Sakit */}
            <div className="p-4 rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Ayam Sakit
                </h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <GiHealthDecrease size={24} color="white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold">
                {chickenDetail?.totalSickChicken ?? "-"}
              </p>
            </div>

            {/* Ayam Mati */}
            <div className="p-4 rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Ayam Mati
                </h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <GiDeathSkull size={24} color="white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold">
                {chickenDetail?.totalDeathChicken ?? "-"}
              </p>
            </div>

            {/* KPI Ayam */}
            <div className="p-4 rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">KPI Ayam</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <FaPercentage size={24} color="white" />
                </div>
              </div>
              <div className="flex items-center">
                <p className="text-2xl sm:text-3xl font-semibold pe-2">
                  {chickenDetail?.totalKPIPerformance != null
                    ? new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(chickenDetail.totalKPIPerformance))
                    : "-"}
                </p>
                <p className="text-2xl sm:text-3xl font-semibold">%</p>
              </div>
            </div>
          </div>

          {/* Chart section */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Ayam Mati & Ayam Sakit
                </h2>
                <div className="flex gap-4">
                  {graphFilter === "Tahun Ini" && (
                    <YearSelector year={year} setYear={setYear} />
                  )}
                  <div className="flex items-center rounded-lg px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer w-full sm:w-auto">
                    <FaCalendarAlt size={18} />
                    <select
                      value={graphFilter}
                      onChange={(e) => setGraphFilter(e.target.value)}
                      className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none w-full sm:w-auto"
                    >
                      {graphFilterOptions.map((choice, index) => (
                        <option key={index} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="w-full h-64 sm:h-80 overflow-x-auto">
                <div className="min-w-[800px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ayamChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 50]} />
                      <Tooltip />
                      <Legend verticalAlign="top" align="center" />
                      <Line
                        type="monotone"
                        dataKey="ayamMati"
                        stroke="#ef4444"
                        name="Ayam Mati"
                      />
                      <Line
                        type="monotone"
                        dataKey="ayamSakit"
                        stroke="#facc15"
                        name="Ayam Sakit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow p-4 sm:p-6 border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Distribusi Usia Ayam</h2>
            <div className="w-full h-64 sm:h-80 overflow-x-auto">
              <div
                className="sm:w-full"
                style={{
                  width:
                    window.innerWidth < 640
                      ? `${chickenAgeData.length * 100}px`
                      : "100%",
                  height: "100%",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chickenAgeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4b9ea5" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* <button
            onClick={() => {
              console.log("selectedSite: ", selectedSite);
              console.log("selectedChickenCage: ", selectedChickenCage);
              console.log("graphFilter: ", graphFilter);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md w-full sm:w-auto"
          >
            CHECK
          </button> */}
        </div>
      )}
    </>
  );
};

export default Ayam;
