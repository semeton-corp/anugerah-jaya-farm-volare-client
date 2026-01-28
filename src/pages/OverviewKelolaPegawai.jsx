import React from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { PiMoneyWavyFill } from "react-icons/pi";
import { MdStore } from "react-icons/md";
import { FaLocationDot, FaClock } from "react-icons/fa6";
import { BiTask } from "react-icons/bi";

import profileAvatar from "../assets/profile_avatar.svg";
import { FiMaximize2 } from "react-icons/fi";
import { useState } from "react";
import { BsPersonVcardFill } from "react-icons/bs";

import {
  GiBirdCage,
  GiHealthDecrease,
  GiChicken,
  GiDeathSkull,
} from "react-icons/gi";
import { FaPercentage } from "react-icons/fa";
import { MdTask } from "react-icons/md";

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
import { getUserPerformanceOverview } from "../services/user";
import { useEffect } from "react";
import MonthYearSelector from "../components/MonthYearSelector";
import { getLocations } from "../services/location";

const MONTHS_ID = [
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

const OverviewKelolaPegawai = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [selectedFilter, setSelectedFilter] = useState("Rentabilitas");

  const [userPerformanceSummary, setUserPerformanceSummary] = useState([]);
  const [performaKpiChart, setPerformaKpiChart] = useState([]);
  const sortedPerformaKpiChart = [...performaKpiChart]
    .sort((a, b) => {
      const numA = parseInt(a.key.replace("Minggu ", ""), 10);
      const numB = parseInt(b.key.replace("Minggu ", ""), 10);
      return numA - numB;
    })
    .map((item) => {
      const num = parseInt(item.key.replace("Minggu ", ""), 10);
      return {
        ...item,
        key: `Minggu ${num}`,
      };
    });
  console.log("performaKpiChart: ", performaKpiChart);
  console.log("sortedPerformaKpiChart: ", sortedPerformaKpiChart);

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId"),
  );

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [monthName, setMonthName] = useState(MONTHS_ID[month]);

  const fetchOverviewData = async () => {
    const params = {
      locationId: selectedSite,
      month: monthName,
      year: year,
    };

    try {
      const overviewResponse = await getUserPerformanceOverview(params);
      console.log("overviewResponse:", overviewResponse);
      if (overviewResponse.status == 200) {
        const data = overviewResponse.data.data;
        setUserPerformanceSummary(data.userPerformanceSummary);
        setPerformaKpiChart(data.userPerformanceGraphs);
      }
    } catch (error) {
      console.log("error:", error);
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
    fetchSites();
    fetchOverviewData();
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [monthName, year, selectedSite]);

  return (
    <div className="flex flex-col px-4 py-3 gap-4 ">
      {/* header section */}
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Kinerja</h1>

        <div className="flex gap-2">
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

          <MonthYearSelector
            month={month}
            year={year}
            setMonth={setMonth}
            setMonthName={setMonthName}
            setYear={setYear}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pegawai Aktif */}
        <div className="p-4 rounded-md bg-green-100 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Pegawai Aktif</h2>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-700">
              <BsPersonVcardFill size={24} color="white" />
            </div>
            <p className="text-3xl font-semibold">
              {`${userPerformanceSummary?.totalUser ?? "-"} Orang`}
            </p>
          </div>
        </div>

        {/* KPI All */}
        <div className="p-4 rounded-md bg-green-100 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">KPI All</h2>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-700">
              <FaPercentage size={24} color="white" />
            </div>
            <p className="text-3xl font-semibold">
              {userPerformanceSummary?.kpiAll != null
                ? new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(userPerformanceSummary?.kpiAll))
                : "-"}{" "}
              <span className="text-xl font-semibold">%</span>
            </p>
          </div>
        </div>

        {/* KPI Kerja */}
        <div className="p-4 rounded-md bg-green-100 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">KPI Kerja</h2>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-700">
              <FaPercentage size={24} color="white" />
            </div>
            <p className="text-3xl font-semibold">
              {userPerformanceSummary?.kpiUser != null
                ? new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(userPerformanceSummary?.kpiUser))
                : "-"}{" "}
              <span className="text-xl font-semibold">%</span>
            </p>
          </div>
        </div>

        {/* KPI Ayam */}
        <div className="p-4 rounded-md bg-green-100 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">KPI Ayam</h2>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-700">
              <FaPercentage size={24} color="white" />
            </div>
            <p className="text-3xl font-semibold">
              {userPerformanceSummary?.kpiChicken != null
                ? new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(userPerformanceSummary?.kpiChicken))
                : "-"}{" "}
              <span className="text-xl font-semibold">%</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px] bg-white rounded-lg py-6 px-6 border border-gray-300">
            <h2 className="text-lg font-semibold mb-4">
              Statistik KPI Pegawai
            </h2>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={sortedPerformaKpiChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" />
                <YAxis
                  label={{
                    value: "Nilai KPI",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => value.toFixed(2)}
                  labelFormatter={(label) => `Minggu: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="kpiUserPerformance"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Kinerja Pegawai"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewKelolaPegawai;
