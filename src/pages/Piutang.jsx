// src/pages/Piutang.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MonthYearSelector from "../components/MonthYearSelector";
import { getReceivablesOverview } from "../services/cashflow";
import { FaPlus, FaWhatsapp, FaExclamationTriangle } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";

// --- helpers ---
const formatRupiah = (n = 0) =>
  "Rp " +
  Number(n || 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const COLORS = {
  "Piutang Belum Terbayar": "#215963", // teal (dark)
  "Piutang Sudah Terbayar": "#E29901", // orange
};

const toWA = (phone) => {
  if (!phone) return "#";
  // normalize: 08123... -> 628123...
  const digits = String(phone).replace(/[^\d]/g, "");
  const withCc = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${withCc}`;
};

const CATEGORY_OPTIONS = [
  "Penjualan Telur Toko",
  "Penjualan Telur Gudang",
  "Penjualan Ayam Afkir",
  "Kasbon",
];

export default function Piutang() {
  const navigate = useNavigate();
  const location = useLocation();

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date())
  );

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Piutang")
  );

  const [category, setCategory] = useState("Semua");

  const [receivables, setReceivables] = useState([]);
  const [pie, setPie] = useState(null);
  const [loading, setLoading] = useState(true);

  const detailPages = ["tambah-kasbon", "detail-piutang"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchOverview = async () => {
    try {
      setLoading(true);
      if (category == "") {
        setCategory("Semua");
      }
      const res = await getReceivablesOverview(category, monthName, year);
      console.log("res: ", res);
      if (res?.status === 200) {
        const payload = res.data?.data || {};
        setPie(payload.receivablesPie || null);
        setReceivables(payload.receivables || []);
      }
    } catch (e) {
      console.error("Gagal memuat piutang:", e);
      setPie(null);
      setReceivables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    if (location?.state?.refetch) {
      fetchOverview();
      window.history.replaceState({}, document.title);
    }
  }, [monthName, year, category, location]);

  const pieData = useMemo(() => {
    if (!pie) return [];
    return [
      {
        name: "Piutang Belum Terbayar",
        value: Number(pie.unpaidPercentage || 0),
      },
      {
        name: "Piutang Sudah Terbayar",
        value: Number(pie.paidPercentage || 0),
      },
    ].filter((d) => d.value > 0);
  }, [pie]);

  const handleTambahKasbon = () => {
    navigate(`${location.pathname}/tambah-kasbon`);
  };

  const handleDetail = (category, id) => {
    navigate(`${location.pathname}/detail-piutang/${category}/${id}`);
  };

  const isOverdue = (deadline, remaining) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return false;
    const stillOwe = Number(remaining || 0) > 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return stillOwe && d < today;
  };

  const statusPill = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("lunas") && !s.includes("belum")) {
      return (
        <span className="inline-block rounded bg-aman-box-surface-color text-aman-text-color px-3 py-1  ">
          Lunas
        </span>
      );
    }
    if (s.includes("belum")) {
      return (
        <span className="inline-block rounded bg-kritis-box-surface-color text-kritis-text-color px-3 py-1 ">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-block rounded bg-gray-400 text-white px-3 py-1 ">
        {status || "-"}
      </span>
    );
  };

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Piutang</h1>
        <div className="flex gap-4">
          <MonthYearSelector
            month={month}
            year={year}
            setMonth={setMonth}
            setMonthName={setMonthName}
            setYear={setYear}
          />
        </div>
      </div>

      <PageNotificationsSection pageNotifications={pageNotifications} />

      {/* Card */}
      <div className="border rounded-md p-4">
        {/* Chart */}
        <div className="max-w-xl">
          {loading ? (
            <div className="text-sm text-gray-500">Memuat…</div>
          ) : pieData.length > 0 ? (
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
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-500">
              Tidak ada data untuk periode ini.
            </div>
          )}
        </div>

        {/* Add button */}
        <div className="flex items-start justify-end my-4">
          <button
            onClick={handleTambahKasbon}
            className="flex items-center gap-2 rounded bg-orange-300 hover:bg-orange-500 text-black px-4 py-2"
          >
            <FaPlus />
            Tambah Kasbon
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="py-3 px-4 text-left rounded-tl-md">
                  Tenggat Pembayaran
                </th>
                <th className="py-3 px-4 text-left">Kategori</th>
                <th className="py-3 px-4 text-left">Lokasi Transaksi</th>
                <th className="py-3 px-4 text-left">Nama Pelanggan</th>
                <th className="py-3 px-4 text-left">Nominal Transaksi</th>
                <th className="py-3 px-4 text-left">Sisa Tagihan</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Hubungi</th>
                <th className="py-3 px-4 text-left rounded-tr-md">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading && receivables.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-gray-500 italic"
                  >
                    Tidak ada data untuk periode ini.
                  </td>
                </tr>
              )}

              {receivables.map((r) => {
                const overdue = isOverdue(
                  r.deadlinePaymentDate,
                  r.remainingPayment
                );
                return (
                  <tr
                    key={`${r.category}-${r.id}`}
                    className={`align-top ${overdue && "bg-orange-400/15"}`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {overdue && (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        <span className={`${overdue && "text-red-500"}`}>
                          {r.deadlinePaymentDate}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{r.category}</td>
                    <td className="py-3 px-4">{r.placeName}</td>
                    <td className="py-3 px-4">{r.name}</td>
                    <td className="py-3 px-4 font-medium">
                      {formatRupiah(r.totalNominal)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatRupiah(r.remainingPayment)}
                    </td>
                    <td className="py-3 px-4">{statusPill(r.paymentStatus)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          const localNumber = r.phoneNumber;
                          const waNumber = localNumber.replace(/^0/, "62");
                          const message = `Halo ${r.name},
                          Kami dari Anugerah Jaya Farm ingin mengingatkan mengenai tagihan Anda:
                          
                          📅 Tenggat: ${r.deadlinePaymentDate}
                          🏷️ Kategori: ${r.category}
                          📍 Lokasi: ${r.placeName}
                          💰 Total: ${formatRupiah(r.totalNominal)}
                          💵 Sisa Tagihan: ${formatRupiah(r.remainingPayment)}
                          
                          Mohon konfirmasi terkait pembayaran ini. Terima kasih 🙏`;

                          const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                            message
                          )}`;
                          window.open(waURL, "_blank");
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded bg-green-700 hover:bg-green-900 cursor-pointer"
                        title="Kirim pesan WA"
                      >
                        <IoLogoWhatsapp className="text-white" size={20} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="rounded bg-green-700 hover:bg-green-900 text-white px-3 py-1.5 cursor-pointer"
                        onClick={() => {
                          handleDetail(r.category, r.id);
                        }}
                      >
                        Lihat detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {receivables.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={9} className="py-2 px-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
