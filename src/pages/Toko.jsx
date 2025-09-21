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
  const detailPages = ["detail-stok-toko", "riwayat-aktivitas-toko"];
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
        <div className="flex flex-col px-4 py-3 gap-4 ">
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Ringkasan</h1>
            <div className="flex gap-2">
              {userRole != "Pekerja Toko" && (
                <div className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <MdStore size={18} />
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
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
          <div className="flex md:grid-cols-2 gap-4 justify-between">
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Pendapatan</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <PiMoneyWavyFill size={24} color="white" />
                </div>
              </div>
              <div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <p className="text-3xl font-semibold me-3">Rp</p>
                    <p className="text-3xl font-semibold">
                      {new Intl.NumberFormat("id-ID").format(totalIncome)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Piutang</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <PiMoneyWavyFill size={24} color="white" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <p className="text-3xl font-semibold me-3">Rp</p>
                    <p className="text-3xl font-semibold">
                      {new Intl.NumberFormat("id-ID").format(totalReceivables)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur OK Terjual</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdShoppingCart size={24} color="white" />
                </div>
              </div>

              <div className="flex mt-4">
                <div className=" items-center">
                  <p className="text-xl font-semibold me-3">{`${goodEggInIkat} Ikat`}</p>
                  <p className="text-xl font-semibold me-3">{`${goodEggInKg} Kg`}</p>
                </div>
              </div>
              <div className="flex  flex-wrap gap-4">
                <div className="flex flex-wrap gap-4"></div>
              </div>
            </div>
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Retak Terjual</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdShoppingCart size={24} color="white" />
                </div>
              </div>

              <div className="flex mt-4">
                <div className=" items-center">
                  <p className="text-xl font-semibold me-3">{`${crackedEggInIkat} Ikat`}</p>
                  <p className="text-xl font-semibold me-3">{`${crackedEggInKg} Kg`}</p>
                </div>
              </div>
            </div>
            <div className="p-4 w-full rounded-md bg-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Bonyok Terjual</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdShoppingCart size={24} color="white" />
                </div>
              </div>

              <div className="flex mt-4">
                <div className=" flex flex-col items-center">
                  <p className="text-xl font-semibold me-3">{`${brokenEggInPlastik} Plastik`}</p>
                </div>
              </div>
              <div className="flex  flex-wrap gap-4">
                <div className="flex flex-wrap gap-4"></div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-lg border border-black-6 bg-white">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Rekapitulasi Penjualan
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center rounded-lg px-2 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <select
                    value={itemId}
                    onChange={(e) => {
                      const itemNameObj = eggCategoryOptions.find(
                        (item) => item.id === Number(e.target.value)
                      );
                      setItemId(e.target.value);
                      setItemName(itemNameObj.name);
                    }}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
                  >
                    {eggCategoryOptions.map((choice, index) => (
                      <option key={index} value={choice.id}>
                        {choice.name}
                      </option>
                    ))}
                  </select>
                </div>
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
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={storeGraph}>
                <XAxis dataKey="key" />
                <YAxis
                  label={{
                    value: itemName == "Telur Bonyok" ? "Plastik" : "Kg",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: 12 },
                  }}
                />
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="center"
                  formatter={(value) => {
                    if (value === "ok") return "Telur OK";
                    if (value === "retak") return "Telur Retak";
                    if (value === "pecah") return "Telur Pecah";
                    return value;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00c853"
                  strokeWidth={2}
                  name="Jumlah"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-6 rounded-lg border border-black-6 bg-white">
            <div className="overflow-x-auto">
              <div className="flex justify-end mb-3">
                <div></div>
                <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <FaMoneyBillWave size={18} />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt} className="text-black">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white text-center">
                    <th className="py-2 px-4">
                      {category == "Pendapatan"
                        ? "Tanggal"
                        : "Tenggat Pembayaran"}
                    </th>
                    <th className="py-2 px-4">Tempat</th>
                    <th className="py-2 px-4">Kategori</th>
                    <th className="py-2 px-4">Nama Customer</th>
                    {category == "Pendapatan" && (
                      <>
                        <th className="py-2 px-4">Item</th>
                        <th className="py-2 px-4">Satuan</th>
                        <th className="py-2 px-4">Qty</th>
                      </>
                    )}

                    <th className="py-2 px-4">Total Nominal</th>
                    {category == "Piutang" && (
                      <>
                        <th className="py-2 px-4">Sisa Pembayaran</th>
                      </>
                    )}

                    {category == "Pendapatan" && (
                      <>
                        <th className="py-2 px-4">Bukti Bayar</th>
                      </>
                    )}

                    {category == "Piutang" && (
                      <>
                        <th className="py-2 px-4">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {storeCashFlows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 text-center"
                    >
                      <td className="py-2 px-4">
                        {row.date || row.deadlinePaymentDate}
                      </td>
                      <td className="py-2 px-4">{row.placeName}</td>
                      <td className="py-2 px-4">{row.category}</td>
                      <td className="py-2 px-4">
                        {row.customerName || row.name}
                      </td>
                      {category == "Pendapatan" && (
                        <>
                          <td className="py-2 px-4">{row.itemName}</td>
                          <td className="py-2 px-4">{row.itemUnit}</td>
                          <td className="py-2 px-4">{row.quantity}</td>
                        </>
                      )}

                      {category == "Piutang" && (
                        <>
                          <td className="py-2 px-4">
                            Rp{" "}
                            {parseInt(row.remainingPayment).toLocaleString(
                              "id-ID"
                            )}
                          </td>
                        </>
                      )}

                      <td className="py-2 px-4">
                        Rp{" "}
                        {parseInt(
                          row.nominal || row.totalNominal
                        ).toLocaleString("id-ID")}
                      </td>

                      {category == "Pendapatan" && (
                        <>
                          <td className="py-2 px-4">
                            <a
                              href={row.paymentProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-700 hover:underline hover:text-green-300"
                            >
                              Lihat
                            </a>
                          </td>
                        </>
                      )}

                      {category == "Piutang" && (
                        <>
                          <td className="py-2 px-4">
                            {row.paymentStatus === "Lunas" ? (
                              <span className="px-3 py-1 bg-aman-box-surface-color text-aman-text-color font-semibold rounded shadow-sm">
                                Lunas
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-kritis-box-surface-color text-kritis-text-color font-semibold rounded shadow-sm">
                                Belum Lunas
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-16 px-6">
              {storeCashFlows?.length > 0 ? (
                <p className="text-sm text-[#CCCCCC]">{`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat`}</p>
              ) : (
                <p></p>
              )}

              <div className="flex gap-3">
                <div
                  className={`rounded-[4px] py-2 px-6 ${
                    page <= 1 || totalPages <= 0
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-green-100 hover:bg-green-200 cursor-pointer"
                  } flex items-center justify-center text-black text-base font-medium `}
                  onClick={() =>
                    page > 1 && totalPages > 0 && setPage(page - 1)
                  }
                >
                  <p>Previous</p>
                </div>
                <div
                  className={`rounded-[4px] py-2 px-6 ${
                    page >= totalPages || totalPages <= 0
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800 cursor-pointer"
                  } flex items-center justify-center text-white text-base font-medium `}
                  onClick={() =>
                    page < totalPages && totalPages > 0 && setPage(page + 1)
                  }
                >
                  <p>Next</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              console.log("month: ", month);
              console.log("monthName: ", monthName);
              console.log("year: ", year);
              console.log("itemId: ", itemId);
              console.log("graphFilter: ", graphFilter);
              console.log("itemName: ", itemName);
              console.log("storeGraph: ", storeGraph);
            }}
          >
            CHECK
          </button>
        </div>
      )}
    </>
  );
};

export default Toko;
