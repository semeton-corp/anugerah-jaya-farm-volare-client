import React, { useEffect, useState } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { MdStore } from "react-icons/md";
import { TbEggCrackedFilled } from "react-icons/tb";
import { FiMaximize2 } from "react-icons/fi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getLocations } from "../services/location";
import { getChickenCage } from "../services/cages";
import { GiBirdCage } from "react-icons/gi";
import { use } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { getEggOverview } from "../services/eggs";
import { getTodayDateInBahasa } from "../utils/dateFormat";

const ProduksiTelur = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const location = useLocation();
  const navigate = useNavigate();
  const detailPages = ["detail-produksi"];

  const [chartData, setChartData] = useState({});
  const [telurOk, setTelurOk] = useState({});
  const [telurRetak, setTelurRetak] = useState({});
  const [telurReject, setTelurReject] = useState({});

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

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const detailProduksiHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/detail-produksi";

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
        console.log("cageResponse.data.data: ", cageResponse.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  const fetchOverviewData = async () => {
    try {
      const overviewResponse = await getEggOverview(
        selectedSite,
        selectedChickenCage,
        graphFilter
      );
      console.log("overviewResponse: ", overviewResponse);
      if (overviewResponse.status == 200) {
        const details = overviewResponse.data.data.eggOverviewDetail;
        const eggGraphs = overviewResponse.data.data.eggGraphs;

        const telurOK = {
          butir:
            details.find((d) => d.name === "Telur OK" && d.unit === "Butir")
              ?.quantity ?? 0,
          karpet:
            details.find((d) => d.name === "Telur OK" && d.unit === "Karpet")
              ?.quantity ?? 0,
          kg:
            details.find((d) => d.name === "Telur OK" && d.unit === "Kg")
              ?.quantity ?? 0,
          ikat:
            details.find((d) => d.name === "Telur OK" && d.unit === "Ikat")
              ?.quantity ?? 0,
        };

        const telurRetak = {
          butir:
            details.find((d) => d.name === "Telur Retak" && d.unit === "Butir")
              ?.quantity ?? 0,
          karpet:
            details.find((d) => d.name === "Telur Retak" && d.unit === "Karpet")
              ?.quantity ?? 0,
          kg:
            details.find((d) => d.name === "Telur Retak" && d.unit === "Kg")
              ?.quantity ?? 0,
          ikat:
            details.find((d) => d.name === "Telur Retak" && d.unit === "Ikat")
              ?.quantity ?? 0,
        };

        const telurReject = {
          ikat:
            details.find((d) => d.name === "Telur Reject" && d.unit === "Ikat")
              ?.quantity ?? 0,
        };
        setTelurOk(telurOK);
        setTelurRetak(telurRetak);
        setTelurReject(telurReject);

        const mapped = eggGraphs.map((item) => ({
          date: item.key,
          telurOK_butir: item.goodEgg,
          telurRetak: item.crackedEgg,
          telurReject: item.rejectEgg,
        }));

        setChartData(mapped);
        // console.log({ telurOK, telurRetak, telurReject });
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
  }, [selectedChickenCage, selectedSite, graphFilter]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-4 py-3 gap-4 ">
          {/* header section */}
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <div className="flex gap-4 items-center">
              <h1 className="text-3xl font-bold">
                {userRole == "Owner"
                  ? "Ringkasan Produksi Hari Ini"
                  : "Ringkasan Hari ini"}
              </h1>
            </div>

            <div className="flex gap-4 items-center">
              <p>({getTodayDateInBahasa()})</p>

              {userRole == "Owner" && (
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
              )}
              <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                <GiBirdCage size={18} />
                <select
                  value={selectedChickenCage}
                  onChange={(e) => setSelectedChickenCage(e.target.value)}
                  className="ml-2 bg-transparent text-base font-medium outline-none"
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

            {/* <div className="flex gap-2">
              <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                <MdStore size={18} />
                <div className="text-base font-medium ms-2">Semua site</div>
              </div>
              <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                <PiCalendarBlank size={18} />
                <div className="text-base font-medium ms-2">
                  Hari ini (20 Mar 2025)
                </div>
              </div>
            </div> */}
          </div>

          {/* Telur  ok, retak, pecah, reject*/}
          <div className="flex gap-4 items-stretch">
            {/* telur OK */}
            <div className="flex-1 p-4 rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur OK</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdEgg size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                {Object.entries(telurOk)?.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md"
                  >
                    <p className="text-3xl font-bold text-center">{value}</p>
                    <p className="text-xl text-center">{key}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* telur Retak */}
            <div className="flex-1 p-4 rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Retak</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <TbEggCrackedFilled size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                {Object.entries(telurRetak)?.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md"
                  >
                    <p className="text-3xl font-bold text-center">{value}</p>
                    <p className="text-xl text-center">{key}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* penjualan telur */}
            <div className="flex-1 p-4 rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Reject</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <TbEggCrackedFilled size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                {Object.entries(telurReject)?.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md"
                  >
                    <p className="text-3xl font-bold text-center">{value}</p>
                    <p className="text-xl text-center">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* chart, incomes, and history section */}
          <div className="flex flex-col lg:flex-row h-120 gap-6">
            {/* Chart Section (3/4 width on large screens) */}
            <div className="w-full lg:w-full bg-white rounded-lg p-8 border border-black-6">
              <div className="flex gap-4 justify-between">
                <h2 className="text-xl font-semibold mb-4">
                  Rekapitulasi Produksi
                </h2>
                <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <FaCalendarAlt size={18} />
                  <select
                    value={graphFilter}
                    onChange={(e) => setGraphFilter(e.target.value)}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
                  >
                    {graphFilterOptions.map((choice, index) => (
                      <option key={index} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    label={{
                      value: "Butir",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" align="center" />
                  <Line
                    type="monotone"
                    dataKey="telurOK_butir"
                    stroke="#00D007"
                    name="Telur OK (butir)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="telurRetak"
                    stroke="#FFD400"
                    name="Telur Retak"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="telurReject"
                    stroke="#F41C1C"
                    name="Telur Reject"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <button
            onClick={() => {
              console.log("graphFilter: ", graphFilter);
              console.log("selectedSite: ", selectedSite);
              console.log("selectedChickenCage: ", selectedChickenCage);
              console.log("telurOk: ", telurOk);
              console.log("telurRetak: ", telurRetak);
              console.log("telurReject: ", telurReject);
              console.log("chartData: ", chartData);
            }}
          >
            CHECK
          </button>
        </div>
      )}
    </>
  );
};

export default ProduksiTelur;
