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

const kinerjaData = [
  { day: "Minggu", value: 44 },
  { day: "Senin", value: 52 },
  { day: "Selasa", value: 30 },
  { day: "Rabu", value: 48 },
  { day: "Kamis", value: 52 },
  { day: "Jumat", value: 39 },
  { day: "Sabtu", value: 52 },
];

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

const kpiData = [
  { date: "29 Mar", kpi: 40 },
  { date: "30 Mar", kpi: 25 },
  { date: "31 Mar", kpi: 50 },
  { date: "01 Apr", kpi: 35 },
  { date: "02 Apr", kpi: 25 },
  { date: "03 Apr", kpi: 40 },
  { date: "04 Apr", kpi: 65 },
];

const pegawaiHariIni = [
  {
    pegawai: {
      nama: "Budi Santoso",
      email: "budi.s@company.com",
    },
    jabatan: "Kepala Kandang",
    status: "Hadir",
    jamMasuk: "09.00",
    jamPulang: "-",
    jumlahLembur: "-",
  },
  {
    pegawai: {
      nama: "Gede Indra",
      email: "Indra@company.com",
    },
    jabatan: "Pegawai Gudang",
    status: "Hadir",
    jamMasuk: "08.45",
    jamPulang: "18.00",
    jumlahLembur: "2 jam",
  },
  {
    pegawai: {
      nama: "Siti Rahayu",
      email: "siti@company.com",
    },
    jabatan: "Pekerja Kandang",
    status: "Hadir",
    jamMasuk: "08.30",
    jamPulang: "17.40",
    jumlahLembur: "-",
  },
];

const OverviewKelolaPegawai = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [selectedFilter, setSelectedFilter] = useState("Rentabilitas");

  const [userPerformanceSummary, setUserPerformanceSummary] = useState([]);
  const [performaKpiChart, setPerformaKpiChart] = useState([]);

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
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

      {/* Telur  ok, retak, pecah, reject*/}
      <div className="flex md:grid-cols-2 gap-4 justify-between">
        {/* telur OK */}
        <div className="p-4 w-full rounded-md bg-green-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pegawai Aktif</h2>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="p-2 rounded-xl bg-green-700">
              <BsPersonVcardFill size={24} color="white" />
            </div>
            <div className="flex items-center">
              {/* popuasl */}
              <p className="text-3xl font-semibold me-3">
                {`${userPerformanceSummary?.totalUser ?? "-"} Orang`}
              </p>
            </div>
          </div>
        </div>

        {/* penjualan telur */}
        <div className="p-4 w-full rounded-md bg-green-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">KPI All</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* item butir */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="p-2 rounded-xl bg-green-700">
                  <FaPercentage size={24} color="white" />
                </div>
                {/* popuasl */}
                <div className="flex items-center">
                  <p className="text-3xl font-semibold pe-2">
                    {userPerformanceSummary?.kpiAll != null
                      ? new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(Number(userPerformanceSummary?.kpiAll))
                      : "-"}
                  </p>
                  <p className="text-xl font-semibold">%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 w-full rounded-md bg-green-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">KPI Kerja</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* item butir */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="p-2 rounded-xl bg-green-700">
                  <FaPercentage size={24} color="white" />
                </div>
                {/* popuasl */}
                <div className="flex items-center">
                  <p className="text-3xl font-semibold pe-2">
                    {userPerformanceSummary?.kpiUser != null
                      ? new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(Number(userPerformanceSummary?.kpiUser))
                      : "-"}
                  </p>
                  <p className="text-xl font-semibold">%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 w-full rounded-md bg-green-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">KPI Ayam</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* item butir */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="p-2 rounded-xl bg-green-700">
                  <FaPercentage size={24} color="white" />
                </div>
                {/* popuasl */}
                <div className="flex items-center">
                  <p className="text-3xl font-semibold pe-2">
                    {userPerformanceSummary?.kpiChicken != null
                      ? new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(Number(userPerformanceSummary?.kpiChicken))
                      : "-"}
                  </p>
                  <p className="text-xl font-semibold">%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* chart, incomes, and history section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-5/5 bg-white rounded-lg py-6 ps-6 pe-9 border border-gray-300">
          <h2 className="text-lg font-semibold mb-4 ">Statistik KPI Pegawai</h2>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={performaKpiChart}>
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

        {/* <div className="w-3/5 bg-white p-4 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold">Kinerja perusahaan</h2>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              <option>Rentabilitas</option>
              <option>Produktivitas</option>
              <option>Penjualan</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={performaKpiChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" />
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
        </div> */}
      </div>

      {/* detail penjualan */}
      {/* <div className="bg-white p-4 rounded-lg border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Daftar pegawai hari ini</h2>
          <div className="p-2 rounded-full hover:bg-black-4 cursor-pointer">
            <FiMaximize2 size={24} color="" />
          </div>
        </div>
        <div className="">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="py-2 px-4">Pegawai</th>
                <th className="py-2 px-4">Jabatan</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Jam masuk</th>
                <th className="py-2 px-4">Jam pulang</th>
                <th className="py-2 px-4">Jumlah Lembur</th>
              </tr>
            </thead>
            <tbody className="">
              {pegawaiHariIni.map((item, index) => (
                <tr key={index} className="border-b ">
                  <td className="py-2 px-4 ">
                    <div className="flex w-72 gap-6">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <img src={profileAvatar} alt="Profile Avatar" />
                      </div>

                      <div className="w-52">
                        <p className="text-base font-me leading-tight">
                          {item.pegawai.nama}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.pegawai.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className=" items-center px-4">{item.jabatan}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center h-full">
                      <div
                        className={`min-w-[80px] py-1 px-2 rounded text-sm font-semibold text-center ${
                          item.status === "Hadir"
                            ? "bg-aman-box-surface-color text-aman-text-color"
                            : "bg-kritis-box-surface-color text-kritis-text-color"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex  items-center h-full">
                      <p className="pe-2">{item.jamMasuk}</p>
                      <p className="">WIB</p>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex  items-center h-full">
                      <p className="pe-2">{item.jamPulang}</p>
                      <p className="">WIB</p>
                    </div>
                  </td>
                  <td className="py-2 px-4 h-full">{item.jumlahLembur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
};

export default OverviewKelolaPegawai;
