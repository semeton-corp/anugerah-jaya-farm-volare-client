import React, { useEffect, useMemo } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { PiMoneyWavyFill } from "react-icons/pi";
import { MdStore } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { LuWheat } from "react-icons/lu";
import { FiMaximize2 } from "react-icons/fi";
import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

import {
  GiBirdCage,
  GiHealthDecrease,
  GiChicken,
  GiDeathSkull,
} from "react-icons/gi";
import { FaCalendarAlt, FaPercentage } from "react-icons/fa";

const COLORS = ["#06b6d4", "#facc15", "#f97316", "#10b981", "#ef4444"];

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  formatDate,
  getTodayDateInBahasa,
  getTodayMonthYear,
  getTodayYear,
} from "../utils/dateFormat";
import { getLocations } from "../services/location";
import { getChickenCage } from "../services/cages";
import { getChickenAndCompanyPerformanceOverview } from "../services/chickenMonitorings";

const getBarColor = (day) => {
  if (day === "Selasa") return "#FF5E5E";
  if (day === "Jumat") return "#F2D08A";
  else return "#87FF8B";
};

const Kinerja = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [chickenCageOptions, setChickenCageOptions] = useState([]);
  const [selectedChickenCage, setSelectedChickenCage] = useState(0);

  const [chickenBarCharts, setChickenBarCharts] = useState([]);
  const [chickenPerformanceSummary, setChickenPerformanceSummary] = useState(
    []
  );

  const [
    incomeAndExpensePerformanceBarCharts,
    setIncomeAndExpensePerformanceBarCharts,
  ] = useState([]);

  const ageDistributionData = useMemo(() => {
    const src = chickenBarCharts || {};
    const pick = (k) => Number(src?.[k] ?? 0);

    const preLayerVal =
      src?.chickenPreLayer != null
        ? pick("chickenPreLayer")
        : pick("chickentPreLayer");

    return [
      { stage: "DOC", value: pick("chickenDOC") },
      { stage: "Pre Layer", value: preLayerVal },
      { stage: "Grower", value: pick("chickenGrower") },
      { stage: "Layer", value: pick("chickenLayer") },
      { stage: "Afkir", value: pick("chickenAfkir") },
    ];
  }, [chickenBarCharts]);

  const [bepGoodEgg, setBepGoodEgg] = useState([]);
  const [marginOfSafety, setMarginOfSafety] = useState([]);
  const [rcRatio, setRcRatio] = useState([]);

  const location = useLocation();
  const detailPages = ["detail-kinerja-ayam"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );
  const navigate = useNavigate();

  const [graphFilterOptions, setGraphFilterOptions] = useState([
    "Minggu Ini",
    "Bulan Ini",
    "Tahun Ini",
  ]);
  const [graphFilter, setGraphFilter] = useState("Minggu Ini");

  const detailKinerjaAyamHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/detail-kinerja-ayam";

    navigate(detailPath);
  };

  const [selectedFilter, setSelectedFilter] = useState("Rentabilitas");

  const fetchSites = async () => {
    try {
      const res = await getLocations();
      if (res.status === 200) {
        setSiteOptions(res.data.data);
        console.log("res.data.data: ", res.data.data);
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
        console.log("cageResponse.data.data: ", cageResponse.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  const fetchPerformanceOverview = async () => {
    try {
      const year = getTodayYear();
      const performanceResponse = await getChickenAndCompanyPerformanceOverview(
        selectedSite,
        selectedChickenCage,
        year
      );
      console.log("performanceResponse: ", performanceResponse);
      if (performanceResponse.status === 200) {
        setChickenBarCharts(performanceResponse.data.data.chickenBarCharts);
        setChickenPerformanceSummary(
          performanceResponse.data.data.chickenPerformanceSummary
        );
        setIncomeAndExpensePerformanceBarCharts(
          performanceResponse.data.data.incomeAndExpensePerformanceBarCharts
        );

        console.log(
          "performanceResponse.data.data.incomeAndExpensePerformanceBarCharts: ",
          performanceResponse.data.data.incomeAndExpensePerformanceBarCharts
        );

        setBepGoodEgg(performanceResponse.data.data.bepGoodEgg);
        setMarginOfSafety(performanceResponse.data.data.marginOfSafety);
        setRcRatio(performanceResponse.data.data.rcRatio);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchChickenCages();
  }, []);

  useEffect(() => {
    fetchPerformanceOverview();
  }, [selectedChickenCage, selectedSite]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-4 py-3 gap-4 ">
          {/* header section */}
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Kinerja</h1>
            <div className="flex gap-2">
              {userRole == "Owner" && (
                <>
                  <div className="flex items-center rounded-lg px-4 py-2 bg-[#BFBFBF]">
                    {getTodayDateInBahasa()}
                  </div>
                  <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
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
                  <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                    <GiBirdCage size={18} />
                    <select
                      value={selectedChickenCage}
                      onChange={(e) => setSelectedChickenCage(e.target.value)}
                      className="ml-2 bg-transparent text-base font-medium outline-none"
                    >
                      <option value="">Semua Kandang</option>
                      {chickenCageOptions.map((chickenCage) => (
                        <option
                          key={chickenCage.id}
                          value={chickenCage.cage.id}
                        >
                          {chickenCage.cage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex md:grid-cols-2 gap-4 justify-between">
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Konsumsi pakan</h2>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="p-2 rounded-xl bg-green-700">
                  <LuWheat size={24} color="white" />
                </div>
                <div className="flex items-center">
                  <p className="text-3xl font-semibold me-3">
                    {chickenPerformanceSummary?.foodConsumption}
                  </p>
                  <p className="text-xl font-semibold">Ton</p>
                </div>
              </div>
            </div>

            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">HDP rata-rata</h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="p-2 rounded-xl bg-green-700">
                    <MdEgg size={24} color="white" />
                  </div>
                  <div className="flex items-center">
                    <p className="text-3xl font-semibold pe-2">
                      {Number(
                        chickenPerformanceSummary?.foodConsumption
                      ).toFixed(2)}
                    </p>
                    <p className="text-xl font-semibold">%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Berat telur rata-rata</h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="p-2 rounded-xl bg-green-700">
                    <MdEgg size={24} color="white" />
                  </div>
                  <div className="flex items-center">
                    <p className="text-3xl font-semibold pe-2">
                      {Number(
                        chickenPerformanceSummary?.averageEggWeight
                      ).toFixed(2)}
                    </p>
                    <p className="text-xl font-semibold">gr</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">FCR rata-rata</h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="p-2 rounded-xl bg-green-700">
                      <GiChicken size={24} color="white" />
                    </div>
                    <div className="flex">
                      <p className="text-3xl font-semibold pe-2">
                        {Number(
                          chickenPerformanceSummary?.averageFCR || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Mortalitas rata-rata</h2>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="p-2 rounded-xl bg-green-700">
                  <GiChicken size={24} color="white" />
                </div>
                <div>
                  <p className="text-3xl font-semibold">
                    {Number(
                      chickenPerformanceSummary?.averageMortalityRate
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="p-4 border border-black-6 rounded-lg">
                <h2 className="text-lg font-bold mb-4">Distribusi Usia Ayam</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={ageDistributionData}
                    margin={{ top: 20, left: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis tickFormatter={(v) => v.toLocaleString("id-ID")} />
                    <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                    <Bar dataKey="value" fill="#5A9EA7" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className=" p-4 border border-black-6 rounded-lg">
              <div className="space-y-4 mt-3">
                <div className="flex justify-end">
                  <span className="inline-block rounded bg-gray-300 px-4 py-1 font-semibold text-gray-800 shadow">
                    {getTodayMonthYear()}
                  </span>
                </div>

                <div className="rounded-xl border-2 border-teal-900 bg-slate-100 px-4 py-5 text-center">
                  <p className="font-semibold text-[15px] leading-tight mb-2">
                    Break Even Point (BEP) Telur OK
                  </p>
                  <p className="text-4xl font-extrabold">
                    {Number(bepGoodEgg).toFixed(2)}
                    <span className="font-bold">Kg</span>
                  </p>
                </div>

                <div className="rounded-xl border-2 border-teal-900 bg-slate-100 px-4 py-5 text-center">
                  <p className="font-semibold text-[15px] leading-tight mb-2">
                    Margin of Safety (MOS)
                  </p>
                  <p className="text-4xl font-extrabold">
                    {Number(marginOfSafety).toFixed(2)}{" "}
                    <span className="font-bold">%</span>
                  </p>
                </div>

                <div className="rounded-xl border-2 border-teal-900 bg-slate-100 px-4 py-5 text-center">
                  <p className="font-semibold text-[15px] leading-tight mb-2">
                    Return on Cost Ratio (R/C Ratio)
                  </p>
                  <p className="text-4xl font-extrabold">
                    {Number(rcRatio).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-black-6 rounded-lg mt-3">
            <h2 className="text-lg font-bold mb-4">
              Grafik Pendapatan vs Pengeluaran
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={incomeAndExpensePerformanceBarCharts}
                margin={{ top: 20, right: 30, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" />
                <YAxis tickFormatter={(v) => v.toLocaleString("id-ID")} />
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Pendapatan"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Pengeluaran"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default Kinerja;
