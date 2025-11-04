import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import MonthYearSelector from "../components/MonthYearSelector";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getExpenseOverview } from "../services/cashflow";
import { useEffect } from "react";
import ImagePopUp from "../components/ImagePopUp";

const CATEGORY_OPTIONS = [
  "Semua",
  "Operasional",
  "Pengadaan Ayam DOC",
  "Pengadaan Barang",
  "Pengadaan Jagung",
  "Lain-lain",
  "Pegawai",
];

const COLORS = {
  Operasional: "#5fa9ad",
  "Pengadaan Ayam DOC": "#215963",
  "Pengadaan Barang": "#f59e0b",
  "Pengadaan Jagung": "#ECBB55",
  "Lain-lain": "#5F4000",
  Pegawai: "#F6CF7D",
};

const formatRupiah = (n = 0) =>
  "Rp " +
  Number(n)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function Pengeluaran() {
  const navigate = useNavigate();
  const location = useLocation();

  const [expenseData, setExpenseData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [totalNominal, setTotalNominal] = useState(0);

  const pieData = useMemo(() => {
    if (!pieChartData) return [];
    const map = {
      Operasional: "operationalPercentage",
      "Pengadaan Ayam DOC": "chickenProcurementPercentage",
      "Pengadaan Barang": "warehouseItemProcurementPercentage",
      "Pengadaan Jagung": "warehouseItemCornProcurementPercentage",
      "Lain-lain": "otherPercentage",
      Pegawai: "staffPercentage",
    };

    return Object.entries(map)
      .map(([name, key]) => ({
        name,
        value: Number(pieChartData[key] ?? 0),
      }))
      .filter((d) => d.value > 0);
  }, [pieChartData]);

  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date())
  );

  const [popupImage, setPopupImage] = useState(null);

  const detailPages = ["tambah-pengeluaran", "detail-pengeluaran"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const PieTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const pct = totalNominal ? Math.round((value / totalNominal) * 100) : 0;
    return (
      <div className="rounded-md border bg-white px-3 py-2 shadow text-sm">
        <div className="font-medium">{name}</div>
        <div className="text-gray-700">
          {formatRupiah(value)} ({pct}%)
        </div>
      </div>
    );
  };

  const handleTambahPengeluaran = () => {
    navigate(`${location.pathname}/tambah-pengeluaran`);
  };

  const handleDetailPengeluaran = (category, id) => {
    navigate(`${location.pathname}/detail-pengeluaran/${category}/${id}`);
  };

  const fetchExpenseData = async () => {
    try {
      const fetchExpenseResponse = await getExpenseOverview(
        category,
        monthName,
        year
      );
      console.log("fetchExpenseResponse: ", fetchExpenseResponse);
      if (fetchExpenseResponse.status == 200) {
        setExpenseData(fetchExpenseResponse.data.data.expenses);
        setPieChartData(fetchExpenseResponse.data.data.expensePie);
        setTotalNominal(fetchExpenseResponse.data.data.totalExpense);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [category, monthName, year]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-4">
        <h1 className="text-2xl font-bold">Pengeluaran</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="ml-2 bg-transparent text-base font-medium outline-none cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
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

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600">
          Periode:{" "}
          <span className="text-lg font-medium">
            {monthName} {year}
          </span>
        </span>
        <span className="text-sm text-gray-600">
          Kategori: <span className="text-lg font-medium">{category}</span>
        </span>
        <span className="text-sm text-gray-600">
          Total Pemasukan:{" "}
          <span className="text-lg font-semibold">
            {formatRupiah(totalNominal)}
          </span>
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-md p-4">
        <div className="p-4 w-full max-w-2xl my-4">
          {pieData.length > 0 ? (
            <>
              {/* Desktop Chart */}
              <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={45}
                      stroke="#fff"
                      strokeWidth={1}
                      paddingAngle={2}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={COLORS[d.name] || "#9CA3AF"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${Number(v).toFixed(2)}%`, n]}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconSize={16}
                      wrapperStyle={{ fontSize: 14 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mobile Chart */}
              <div className="block md:hidden">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={60}
                      innerRadius={30}
                      stroke="#fff"
                      strokeWidth={1}
                      paddingAngle={2}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={COLORS[d.name] || "#9CA3AF"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${Number(v).toFixed(2)}%`, n]}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              Tidak ada data untuk periode ini.
            </div>
          )}
        </div>

        {/* Chart + Add button row */}
        <div className="flex items-start justify-end gap-4 my-3">
          <button
            onClick={() => handleTambahPengeluaran()}
            className="flex items-center gap-2 rounded bg-orange-300 hover:bg-orange-500 text-black px-4 py-2 h-10 mt-2"
          >
            <FaPlus />
            Tambah pengeluaran
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="py-3 px-4 text-left rounded-tl-md">Tanggal</th>
                <th className="py-3 px-4 text-left">Kategori</th>
                <th className="py-3 px-4 text-left">Nama Transaksi</th>
                <th className="py-3 px-4 text-left">Lokasi Transaksi</th>
                <th className="py-3 px-4 text-left">Nominal Transaksi</th>
                <th className="py-3 px-4 text-left">Penerima</th>
                <th className="py-3 px-4 text-left rounded-tr-md">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenseData.map((item) => (
                <tr
                  key={`${item.category}-${item.date}-${item.id}`}
                  className="align-top"
                >
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.location}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatRupiah(item.nominal)}
                  </td>
                  <td className="py-3 px-4">{item.receiverName}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2 w-28">
                      <button
                        className="rounded bg-orange-300 hover:bg-orange-500 text-black px-3 py-1.5"
                        onClick={() => setPopupImage(item.paymentProof)}
                      >
                        Lihat Bukti
                      </button>
                      <button
                        className="rounded bg-green-700 hover:bg-green-900 text-white px-3 py-1.5"
                        onClick={() =>
                          handleDetailPengeluaran(item.category, item.id)
                        }
                      >
                        Lihat detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {expenseData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-500 italic"
                  >
                    Tidak ada data untuk periode & kategori terpilih.
                  </td>
                </tr>
              )}
            </tbody>

            {/* {expenseData.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 font-semibold" colSpan={4}>
                    Total
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {formatRupiah(totalNominal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )} */}
          </table>
        </div>
      </div>

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
}
