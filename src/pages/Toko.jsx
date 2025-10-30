import { PiCalendarBlank } from "react-icons/pi";
import { MdShoppingCart } from "react-icons/md";
import { PiMoneyWavyFill } from "react-icons/pi";
import { MdStore } from "react-icons/md";
import { FiMaximize2 } from "react-icons/fi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

import {
  FaWarehouse,
  FaTruck,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import React, { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import MonthYearSelector from "../components/MonthYearSelector";
import { getCurrentUserStorePlacement } from "../services/placement";
import { getItems } from "../services/item";
import {
  getStoreCashflows,
  getStoreOverview,
  getStores,
} from "../services/stores";

const salesData = [
  { date: "29 Mar", ok: 24, retak: 4, pecah: 2 },
  { date: "30 Mar", ok: 13, retak: 5, pecah: 2 },
  { date: "31 Mar", ok: 30, retak: 6, pecah: 3 },
  { date: "01 Apr", ok: 20, retak: 7, pecah: 4 },
  { date: "02 Apr", ok: 14, retak: 9, pecah: 2 },
  { date: "03 Apr", ok: 25, retak: 7, pecah: 3 },
  { date: "04 Apr", ok: 44, retak: 5, pecah: 1 },
];

const Toko = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const detailPages = [
    "detail-stok-toko",
    "riwayat-aktivitas-toko",
    "detail-pendapatan",
    "detail-piutang",
  ];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );
  const navigate = useNavigate();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalReceivables, setTotalReceivables] = useState(0);

  const [brokenEggInPlastik, setBrokenEggInPlastik] = useState(0);
  const [crackedEggInIkat, setCrackedEggInIkat] = useState(0);
  const [crackedEggInKg, setCrackedEggInKg] = useState(0);
  const [goodEggInIkat, setGoodEggInIkat] = useState(0);
  const [goodEggInKg, setGoodEggInKg] = useState(0);

  const [storeGraph, setStoreGraph] = useState([]);
  const [graphFilterOptions, setGraphFilterOptions] = useState([
    "Minggu Ini",
    "Bulan Ini",
    "Tahun Ini",
  ]);
  const [graphFilter, setGraphFilter] = useState("Minggu Ini");
  const [eggCategoryOptions, setEggCategoryOptions] = useState([
    "Telur OK",
    "Telur Retak",
    "Telur Bonyok",
  ]);
  const months = [
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

  const today = new Date();
  const [month, setMonth] = useState(new Date().getMonth());
  const [monthName, setMonthName] = useState(months[today.getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());

  const [storeCashFlows, setStoreCashFlows] = useState([]);

  const [categoryOptions, setCategoryOptions] = useState([
    "Pendapatan",
    "Piutang",
  ]);
  const [category, setCategory] = useState(categoryOptions[0]);

  const [page, setPage] = useState(1);
  const [totalData, setTotaldata] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  const [itemId, setItemId] = useState(0);
  const [itemName, setItemName] = useState("");

  const detailStokTokoHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/detail-stok-toko";

    navigate(detailPath);
  };

  const riwayatAktivitasTokoHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/riwayat-aktivitas-toko";

    navigate(detailPath);
  };

  const getOverviewData = async () => {
    try {
      const overviewResponse = await getStoreOverview(
        monthName,
        year,
        selectedStore,
        itemId,
        graphFilter
      );
      console.log("overviewResponse: ", overviewResponse);

      if (overviewResponse.status === 200) {
        const data = overviewResponse.data.data.storeOverviewDetail;
        setStoreGraph(overviewResponse.data.data.storeGraphs);
        setBrokenEggInPlastik(data.brokenEggInPlastik);
        setCrackedEggInIkat(data.crackedEggInIkat);
        setCrackedEggInKg(data.crackedEggInKg);
        setGoodEggInIkat(data.goodEggInIkat);
        setGoodEggInKg(data.goodEggInKg);
        setTotalIncome(data.totalIncome);
        setTotalReceivables(data.totalReceivables);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPendapatanPiutangData = async () => {
    try {
      const pendapatanPiutangResponse = await getStoreCashflows(
        monthName,
        year,
        category,
        page,
        selectedStore
      );
      console.log("pendapatanPiutangResponse: ", pendapatanPiutangResponse);
      if (pendapatanPiutangResponse.status === 200) {
        setStoreCashFlows(pendapatanPiutangResponse.data.data.storeCashflows);
        setTotaldata(pendapatanPiutangResponse.data.data.totalData);
        setTotalPages(pendapatanPiutangResponse.data.data.totalPage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const getDetailData = async () => {
    try {
      const itemResponse = await getItems();
      if (itemResponse.status == 200) {
        const eggCategoryOptions = itemResponse.data.data.filter(
          (item) => item.category == "Telur" && item.name !== "Telur Reject"
        );
        console.log("eggCategoryOptions:", eggCategoryOptions);
        setItemId(eggCategoryOptions[0].id);
        setItemName(eggCategoryOptions[0].name);
        setEggCategoryOptions(eggCategoryOptions);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchCurentStore = async () => {
    try {
      const placementResponse = await getCurrentUserStorePlacement();
      console.log("placementResponse: ", placementResponse);
      if (placementResponse.status == 200) {
        const storeId = placementResponse.data.data[0].store.id;
        setSelectedStore(storeId);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchAllStores = async () => {
    try {
      console.log("selectedSite: ", selectedSite);
      const response = await getStores(selectedSite);
      if (response.status == 200) {
        setStores(response.data.data);
        setSelectedStore(response.data.data[0].id);
      }
    } catch (error) {
      alert("Gagal memuat data toko: ", error);
      console.log("error: ", error);
    }
  };

  const handlePendapatanDetail = (category, id, parentId) => {
    navigate(
      `${location.pathname}/detail-pendapatan/${category}/${id}/${parentId}`
    );
  };

  const handlePiutangDetail = (category, id, parentId) => {
    navigate(`${location.pathname}/detail-piutang/${category}/${id}`);
  };

  useEffect(() => {
    getDetailData();
    if (userRole != "Pekerja Toko") {
      fetchAllStores();
    } else {
      fetchCurentStore();
    }
  }, []);

  useEffect(() => {
    if (selectedStore && itemId) {
      getOverviewData();
    }

    if (category) {
      fetchPendapatanPiutangData();
    }
  }, [selectedStore, itemId, monthName, year, graphFilter, page, category]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-3 sm:px-4 py-3 gap-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">
              Ringkasan
            </h1>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {userRole !== "Pekerja Toko" && (
                <div className="flex items-center w-full sm:w-auto rounded px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer transition">
                  <MdStore size={18} />
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none w-full"
                  >
                    {stores.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <MonthYearSelector
                month={month}
                year={year}
                setMonth={setMonth}
                setMonthName={setMonthName}
                setYear={setYear}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Pendapatan", value: totalIncome },
              { title: "Piutang", value: totalReceivables },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-md bg-green-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base sm:text-lg font-semibold">
                    {item.title}
                  </h2>
                  <div className="p-2 rounded-xl bg-green-700">
                    <PiMoneyWavyFill size={24} color="white" />
                  </div>
                </div>
                <div className="flex items-center flex-wrap">
                  <p className="text-xl sm:text-2xl font-semibold me-2">Rp</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {new Intl.NumberFormat("id-ID").format(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Egg Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-green-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Telur OK Terjual
                </h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <PiMoneyWavyFill size={24} color="white" />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-lg font-semibold">{`${goodEggInIkat} Ikat`}</p>
                <p className="text-lg font-semibold">{`${goodEggInKg} Kg`}</p>
              </div>
            </div>

            <div className="p-4 rounded-md bg-green-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Telur Retak Terjual
                </h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <PiMoneyWavyFill size={24} color="white" />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-lg font-semibold">{`${crackedEggInIkat} Ikat`}</p>
                <p className="text-lg font-semibold">{`${crackedEggInKg} Kg`}</p>
              </div>
            </div>

            <div className="p-4 rounded-md bg-green-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  Telur Bonyok Terjual
                </h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <PiMoneyWavyFill size={24} color="white" />
                </div>
              </div>
              <p className="text-lg font-semibold mt-2">{`${brokenEggInPlastik} Plastik`}</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-4 sm:p-6 rounded-lg border bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-green-800">
                Rekapitulasi Penjualan
              </h2>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center rounded-lg px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <select
                    value={itemId}
                    onChange={(e) => {
                      const itemNameObj = eggCategoryOptions.find(
                        (item) => item.id === Number(e.target.value)
                      );
                      setItemId(e.target.value);
                      setItemName(itemNameObj.name);
                    }}
                    className="ml-2 bg-transparent text-sm md:text-base font-medium outline-none"
                  >
                    {eggCategoryOptions.map((choice, index) => (
                      <option key={index} value={choice.id}>
                        {choice.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center rounded-lg px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <FaCalendarAlt size={18} />
                  <select
                    value={graphFilter}
                    onChange={(e) => setGraphFilter(e.target.value)}
                    className="ml-2 bg-transparent text-sm md:text-base font-medium outline-none"
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

            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={storeGraph}>
                    <XAxis dataKey="key" />
                    <YAxis
                      label={{
                        value: itemName === "Telur Bonyok" ? "Plastik" : "Kg",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00c853"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-4 sm:p-6 rounded-lg border bg-white shadow-sm">
            <div className="flex justify-end mb-3">
              <div className="flex items-center rounded-lg px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                <FaMoneyBillWave size={18} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ml-2 bg-transparent text-sm md:text-base font-medium outline-none"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-green-700 text-white text-center">
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Tempat</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Total</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {storeCashFlows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 text-center"
                    >
                      <td className="py-2 px-3">{row.date || row.paidDate}</td>
                      <td className="py-2 px-3">{row.placeName}</td>
                      <td className="py-2 px-3">{row.category}</td>
                      <td className="py-2 px-3">
                        {row.customerName || row.name}
                      </td>
                      <td className="py-2 px-3">
                        Rp{" "}
                        {parseInt(
                          row.nominal || row.totalNominal
                        ).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 text-xs sm:text-sm md:text-base">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded font-semibold text-center whitespace-nowrap ${
                            row.paymentStatus === "Lunas" || row.date
                              ? "bg-green-200 text-green-900"
                              : "bg-red-200 text-red-900"
                          }`}
                        >
                          {row.date ? "Lunas" : row.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex justify-center ">
                        <div className="flex flex-col gap-2 w-28">
                          <span
                            className="rounded bg-green-700 hover:bg-green-900 text-white px-3 py-1.5 cursor-pointer"
                            onClick={() => {
                              if (category == "Pendapatan") {
                                handlePendapatanDetail(
                                  row.category,
                                  row.id,
                                  row.parentId
                                );
                              } else {
                                handlePiutangDetail(row.category, row.id);
                              }
                            }}
                          >
                            Lihat detail
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm items-center gap-3">
              {storeCashFlows?.length > 0 && (
                <p className="text-gray-400 text-center sm:text-left">
                  Menampilkan halaman {page} dari {totalPages} halaman. Total{" "}
                  {totalData} data.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={`rounded py-2 px-4 ${
                    page <= 1
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-green-100 hover:bg-green-200"
                  }`}
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => page < totalPages && setPage(page + 1)}
                  className={`rounded py-2 px-4 text-white ${
                    page >= totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Toko;
