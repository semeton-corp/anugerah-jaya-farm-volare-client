import React from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { PiMoneyWavyFill } from "react-icons/pi";
import {
  FaArrowUpLong,
  FaArrowDownLong,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { FiMaximize2 } from "react-icons/fi";
import { BsCheckCircleFill } from "react-icons/bs";
import { TfiReload } from "react-icons/tfi";

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
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getGeneralOverview } from "../services/general";
import { useEffect } from "react";
import { useState } from "react";
import { fmtRp } from "./GajiPegawai";
import { getTodayDateInBahasa } from "../utils/dateFormat";

const data = [
  { date: "29 Mar", produksi: 25, penjualan: 30 },
  { date: "30 Mar", produksi: 14, penjualan: 40 },
  { date: "31 Mar", produksi: 30, penjualan: 33 },
  { date: "01 Apr", produksi: 22, penjualan: 40 },
  { date: "02 Apr", produksi: 16, penjualan: 8 },
  { date: "03 Apr", produksi: 25, penjualan: 20 },
  { date: "04 Apr", produksi: 43, penjualan: 32 },
];

const OverviewOwner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [chickenSummary, setChickenSummary] = useState([]);
  const [eggSummary, setEggSummary] = useState([]);
  const [productionAndSaleEggGraphs, setProductionAndSaleEggGraphs] = useState(
    [],
  );
  const [saleSummary, setSaleSummary] = useState([]);
  const [storeItemSummary, setStoreItemSummary] = useState([]);
  const [warehouseItemSummary, setWarehouseItemSummary] = useState([]);

  const detailPages = [
    "riwayat-aktivitas",
    "stok-toko",
    "stok-gudang",
    "total-ayam",
  ];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment),
  );

  const fetchOverviewData = async () => {
    try {
      const overviewDataResponse = await getGeneralOverview();
      // console.log("overviewData: ", overviewData);
      if (overviewDataResponse.status == 200) {
        const overviewData = overviewDataResponse.data.data;
        setChickenSummary(overviewData.chickenSummary);
        setEggSummary(overviewData.eggSummary);
        setProductionAndSaleEggGraphs(overviewData.productionAndSaleEggGraphs);
        setSaleSummary(overviewData.saleSummary);
        setStoreItemSummary(overviewData.storeItemSummary);
        setWarehouseItemSummary(overviewData.warehouseItemSummary);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleTotalAyamDetail = () => {
    const newPath = location.pathname.replace(
      "ringkasan",
      "ayam/ringkasan-ayam",
    );
    navigate(newPath);
  };

  const handleStokGudangDetail = () => {
    const newPath = location.pathname.replace(
      "ringkasan",
      "gudang/stok-gudang",
    );
    navigate(newPath);
  };

  const handleStokTokoDetail = () => {
    const newPath = location.pathname.replace(
      "ringkasan",
      "toko/overview-toko",
    );
    navigate(newPath);
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  if (isDetailPage) {
    <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4 ">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Ringkasan Hari ini</h1>
        <p>{getTodayDateInBahasa()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 w-full rounded-md border-2 border-black-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Produksi Telur OK</h2>
            <div className="p-2 rounded-xl bg-green-700">
              <MdEgg size={24} color="white" />
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-4">
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-lg sm:text-xl font-bold text-center">
                {Number(
                  eggSummary?.totalGoodEggProductionInIkat,
                ).toLocaleString("id-ID")}
              </p>
              <p className="text-xl text-center">Ikat</p>
            </div>
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-lg sm:text-xl font-bold text-center">
                {Number(
                  eggSummary?.totalGoodEggProductionInKarpet,
                ).toLocaleString("id-ID")}
              </p>
              <p className="text-xl text-center">Karpet</p>
            </div>
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-lg sm:text-xl font-bold text-center">
                {Number(eggSummary?.totalGoodEggProductionInKg).toLocaleString(
                  "id-ID",
                )}
              </p>
              <p className="text-xl text-center">Kg</p>
            </div>
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-lg sm:text-xl font-bold text-center">
                {Number(
                  eggSummary?.totalGoodEggProductionInButir,
                ).toLocaleString("id-ID")}
              </p>
              <p className="text-xl text-center">Butir</p>
            </div>
          </div>
        </div>

        <div className="p-4 w-full rounded-md border-2 border-black-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Penjualan Telur OK</h2>
            <div className="p-2 rounded-xl bg-green-700">
              <MdEgg size={24} color="white" />
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-4">
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-lg sm:text-xl font-bold text-center">
                {Number(eggSummary?.totalGoodEggSaleInIkat).toLocaleString(
                  "id-ID",
                )}
              </p>
              <p className="text-xl text-center">Ikat</p>
            </div>
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-lg sm:text-xl font-bold text-center">
                {Number(eggSummary?.totalGoodEggSaleInKg).toLocaleString(
                  "id-ID",
                )}
              </p>
              <p className="text-xl text-center">Kg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row  items-stretch gap-6">
        <div className="w-full lg:w-6/8 bg-white rounded-lg p-4 border border-black-6">
          <h2 className="text-xl font-semibold mb-4">Produksi & Penjualan</h2>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={productionAndSaleEggGraphs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [`${value} Kg`, name]}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend verticalAlign="top" align="right" />
              <Line
                type="monotone"
                dataKey="production"
                stroke="#ef4444"
                name="Produksi Telur"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sale"
                stroke="#f59e0b"
                name="Penjualan Telur"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full h-full lg:w-2/8 flex flex-col gap-4">
          <div className="bg-white h-full p-[20px] border border-black-6 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pendapatan</h2>
              <div className="p-2 rounded-xl bg-green-700">
                <PiMoneyWavyFill size={24} color="white" />
              </div>
            </div>
            <div className="mt-6 mb-2">
              <div className="flex gap-8 ">
                <div>
                  <p className="text-2xl font-semibold">
                    {fmtRp(saleSummary?.income)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white h-full p-[20px] border border-black-6 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Keuntungan</h2>
              <div className="p-2 rounded-xl bg-green-700">
                <PiMoneyWavyFill size={24} color="white" />
              </div>
            </div>
            <div className="mt-6 mb-2">
              <div className="flex gap-8 ">
                <div>
                  <p className="text-2xl font-semibold">
                    {fmtRp(saleSummary?.profit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:h-65">
        <div className="bg-white flex-1 p-4 border border-black-6 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Total ayam</h2>
            <div
              onClick={handleTotalAyamDetail}
              className="p-2 rounded-full hover:bg-black-4 cursor-pointer"
            >
              <FiMaximize2 size={24} color="" />
            </div>
          </div>

          <div className="h-5/8 flex flex-col justify-between my-8">
            <div className="flex justify-between px-4">
              <div className="flex gap-2">
                <p className="text-xl font-bold">
                  {chickenSummary?.totalLiveChicken}
                </p>
                <p className="text-xl">Ekor</p>
              </div>
              <p className="text-xl font-bold">Ayam Hidup</p>
            </div>

            <div className="flex justify-between px-4">
              <div className="flex gap-2">
                <p className="text-xl font-bold">
                  {chickenSummary?.totalSickChicken}
                </p>
                <p className="text-xl">Ekor</p>
              </div>
              <p className="text-xl font-bold">Ayam Sakit</p>
            </div>

            <div className="flex  justify-between px-4">
              <div className="flex gap-2">
                <p className="text-xl font-bold">
                  {chickenSummary?.totalDeathChicken}
                </p>
                <p className="text-xl">Ekor</p>
              </div>
              <p className="text-xl font-bold">Ayam Mati</p>
            </div>
          </div>
        </div>

        <div className="bg-white flex-1 p-4 border border-black-6 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Stok gudang</h2>
            <div
              onClick={handleStokGudangDetail}
              className="p-2 rounded-full hover:bg-black-4 cursor-pointer"
            >
              <FiMaximize2 size={24} color="" />
            </div>
          </div>

          <div className="flex w-full gap-4 px-4 justify-center">
            <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
              <div className="flex flex-col justify-center gap-2">
                <div className="flex flex-col items-center">
                  <p className="text-[40px] font-bold">
                    {warehouseItemSummary?.totalSafeItem}
                  </p>
                  <p className="text-xl">Barang</p>
                </div>
                <div className="rounded-[4px] bg-[#87FF8B] flex items-center">
                  <p className="w-full text-center">aman</p>
                </div>
              </div>
            </div>
            <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
              <div className="flex flex-col justify-center gap-2">
                <div className="flex flex-col items-center">
                  <p className="text-[40px] font-bold">
                    {" "}
                    {warehouseItemSummary?.totalNotSafeItem}
                  </p>
                  <p className="text-xl">Barang</p>
                </div>
                <div className="rounded-[4px] bg-[#FF5E5E] flex items-center">
                  <p className="w-full text-center">kritis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white flex-1 p-4 border border-black-6 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Stok toko</h2>
            <div
              onClick={handleStokTokoDetail}
              className="p-2 rounded-full hover:bg-black-4 cursor-pointer"
            >
              <FiMaximize2 size={24} color="" />
            </div>
          </div>

          <div className="flex w-full gap-4 px-4 justify-center">
            <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
              <div className="flex flex-col justify-center gap-2">
                <div className="flex flex-col items-center">
                  <p className="text-[40px] font-bold">
                    {" "}
                    {storeItemSummary?.totalSafeItem}
                  </p>
                  <p className="text-xl">Barang</p>
                </div>
                <div className="rounded-[4px] bg-[#87FF8B] flex items-center">
                  <p className="w-full text-center">aman</p>
                </div>
              </div>
            </div>
            <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
              <div className="flex flex-col justify-center gap-2">
                <div className="flex flex-col items-center">
                  <p className="text-[40px] font-bold">
                    {" "}
                    {storeItemSummary?.totalNotSafeItem}
                  </p>
                  <p className="text-xl">Barang</p>
                </div>
                <div className="rounded-[4px] bg-[#FF5E5E] flex items-center">
                  <p className="w-full text-center">kritis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewOwner;
