// src/pages/DetailPiutang.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getReceivables,
  createUserCashAdvancePayment,
} from "../services/cashflow";
import { createStoreSalePayment } from "../services/stores";
import { createAfkirChickenSalePayment } from "../services/chickenMonitorings";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { createWarehouseSalePayment } from "../services/warehouses";

// ===== Utils =====
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const toDDMMYYYY = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const formatTanggalID = (dateLike) => {
  try {
    const d = new Date(dateLike);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateLike || "-";
  }
};

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-200 text-gray-800",
    warning: "bg-orange-200 text-orange-900",
    success: "bg-[#87FF8B] text-[#256d25]",
    info: "bg-cyan-200 text-cyan-900",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
};

const TambahPembayaranModal = ({
  open,
  onClose,
  onSave,
  defaultMethod = "Tunai",
}) => {
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
  const [nominal, setNominal] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentProof, setPaymentProof] = useState("https://example.com");

  useEffect(() => {
    if (!open) return;
    setPaymentMethod(defaultMethod);
    setNominal("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentProof("https://example.com");
  }, [open, defaultMethod]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-xl">
        <h3 className="text-lg font-bold mb-4">Tambah Pembayaran</h3>

        <label className="block mb-1 font-medium">Metode Pembayaran</label>
        <select
          className="w-full border rounded p-2 mb-3"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="Tunai">Tunai</option>
          <option value="Non Tunai">Non Tunai</option>
        </select>

        <label className="block mb-1 font-medium">Nominal Pembayaran</label>
        <input
          type="number"
          className="w-full border rounded p-2 mb-3"
          placeholder="Masukkan nominal"
          value={formatThousand(nominal)}
          onChange={(e) => {
            const raw = onlyDigits(e.target.value);
            setNominal(raw);
          }}
          min={0}
        />

        <label className="block mb-1 font-medium">Tanggal Bayar</label>
        <input
          type="date"
          className="w-full border rounded p-2 mb-3"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />

        <label className="block mb-1 font-medium">Bukti Pembayaran (URL)</label>
        <input
          type="text"
          className="w-full border rounded p-2 mb-4"
          placeholder="https://contoh.com/bukti"
          value={paymentProof}
          onChange={(e) => setPaymentProof(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() =>
              onSave({
                paymentMethod,
                nominal,
                paymentDate,
                paymentProof,
              })
            }
            className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

const callAddPaymentByCategory = (category, id, payload) => {
  const cat = (category || "").toLowerCase();

  if (cat.includes("kasbon")) {
    return createUserCashAdvancePayment(payload, id);
  }

  if (cat.includes("penjualan telur gudang")) {
    return createWarehouseSalePayment(payload, id);
  }

  if (cat.includes("penjualan telur toko")) {
    return createStoreSalePayment(payload, id);
  }

  if (cat.includes("penjualan ayam afkir") || cat.includes("ayam afkir")) {
    return createAfkirChickenSalePayment(payload, id);
  }

  return Promise.reject(new Error("Kategori pembayaran tidak dikenali."));
};

export default function DetailPiutang() {
  const { id, category } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = category
        ? await getReceivables(category, id)
        : await getReceivables(id);

      if (res?.status === 200) {
        console.log("res.data?.data: ", res.data?.data);
        setData(res.data?.data || null);
      } else {
        setErr("Gagal memuat detail piutang.");
      }
    } catch (e) {
      console.error(e);
      setErr("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, category]);

  const {
    date,
    time,
    category: cat,
    placeName,
    customerName,
    name,
    customerPhoneNumber,
    phoneNumber,
    remainingPayment,
    totalNominal,
    nominal,
    totalPrice,
    inputBy,
    operator,
    paymentType,
    deadlinePaymentDate,
    paymentStatus,
    payments = [],
  } = data || {};

  const headerCategory = category || "-";
  const customer = customerName || name || "-";
  const telp = customerPhoneNumber || phoneNumber || "-";
  const lokasi = placeName || "-";
  const diinput = inputBy || operator || "-";

  const totalPiutang = Number(totalNominal || nominal || totalPrice || 0);

  const paymentRows = useMemo(() => {
    let sisa = totalPiutang;
    return (payments || []).map((p) => {
      const nominalNum = Number(p.nominal || p.amount || 0);
      sisa = Math.max(sisa - nominalNum, 0);
      return {
        id: p.id,
        paymentDate: p.paymentDate || p.date || "-",
        paymentMethod: p.paymentMethod || "-",
        nominalNum,
        remainingNum: p.remaining,
        proof: p.paymentProof || p.proof || "-",
      };
    });
  }, [payments, totalPiutang]);

  const totalPaid = useMemo(
    () =>
      (payments || []).reduce(
        (a, p) => a + Number(p.nominal || p.amount || 0),
        0
      ),
    [payments]
  );
  const finalRemaining = Math.max(totalPiutang - totalPaid, 0);
  const statusBadge = paymentStatus === "Lunas" ? "success" : "warning";
  const statusText = finalRemaining === 0 ? "Lunas" : "Belum Lunas";

  const submitPayment = async ({
    paymentMethod,
    nominal,
    paymentDate,
    paymentProof,
  }) => {
    if (!nominal || Number(nominal) <= 0) {
      alert("Nominal pembayaran harus lebih dari 0.");
      return;
    }
    if (!paymentDate) {
      alert("Tanggal bayar wajib diisi.");
      return;
    }

    const payload = {
      paymentMethod,
      nominal: String(nominal),
      paymentDate: toDDMMYYYY(paymentDate),
      paymentProof,
    };

    console.log("payload: ", payload);

    try {
      await callAddPaymentByCategory(headerCategory, id, payload);
      alert("✅ Pembayaran berhasil ditambahkan");
      setShowPaymentModal(false);
      fetchDetail();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Gagal menambahkan pembayaran.");
    }
  };

  if (loading) return <div className="p-4">Memuat detail…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!data) return <div className="p-4">Data tidak ditemukan.</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Detail Piutang</h1>

      {/* Header card */}
      <div className="rounded-md border border-gray-300 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-10">
          <div>
            <div className="text-gray-600">Tanggal :</div>
            <div className="mt-1 font-extrabold">{formatTanggalID(date)}</div>
          </div>
          <div>
            <div className="text-gray-600">Waktu :</div>
            <div className="mt-1 font-extrabold">{time || "-"}</div>
          </div>

          <div>
            <div className="text-gray-600">Kategori</div>
            <div className="mt-1 font-extrabold">{headerCategory}</div>
          </div>
          <div />

          <div>
            <div className="text-gray-600">Lokasi Transaksi</div>
            <div className="mt-1 font-extrabold">{lokasi}</div>
          </div>
          <div />

          <div>
            <div className="text-gray-600">Pelanggan</div>
            <div className="mt-1 font-extrabold">{customer}</div>
          </div>
          <div>
            <div className="text-gray-600">Nomor Telepon Pelanggan</div>
            <div className="mt-1 font-extrabold">{telp}</div>
          </div>

          <div>
            <div className="text-gray-600">Nominal Transaksi</div>
            <div className="mt-1 font-extrabold">{rupiah(nominal)}</div>
          </div>
          <div />

          <div>
            <div className="text-gray-600">Transaksi Diinputkan oleh</div>
            <div className="mt-1 font-extrabold">{diinput}</div>
          </div>
        </div>
      </div>

      {/* Riwayat Pembayaran */}
      <div className="rounded-md border border-gray-300">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-sm">Tipe Pembayaran : </span>
              <Badge
                tone={
                  paymentType?.toLowerCase() === "cicil" ? "warning" : "success"
                }
              >
                {paymentType || "—"}
              </Badge>
            </div>
            <div className="text-sm">
              Tenggat Pembayaran :{" "}
              <span className="font-semibold">
                {deadlinePaymentDate || "-"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (paymentStatus != "Lunas") {
                setShowPaymentModal(true);
              } else {
                alert("✅Pembayaran Sudah Lunas!");
              }
            }}
            className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black cursor-pointer"
          >
            Tambah Pembayaran
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Tanggal</th>
                  <th className="text-left px-3 py-2">Metode Pembayaran</th>
                  <th className="text-left px-3 py-2">Nominal Pembayaran</th>
                  <th className="text-left px-3 py-2">Sisa Cicilan</th>
                  <th className="text-left px-3 py-2">Bukti Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-500"
                      colSpan={5}
                    >
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                ) : (
                  paymentRows.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="px-3 py-2">{p.paymentDate}</td>
                      <td className="px-3 py-2">{p.paymentMethod}</td>
                      <td className="px-3 py-2">{rupiah(p.nominalNum)}</td>
                      <td className="px-3 py-2">{rupiah(p.remainingNum)}</td>
                      <td className="px-3 py-2 underline">
                        {p.proof && p.proof !== "-" ? (
                          <a href={p.proof} target="_blank" rel="noreferrer">
                            Bukti Pembayaran
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Status Pembayaran :</span>
              <Badge tone={statusBadge}>{paymentStatus}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm">Sisa Cicilan</p>
              <p className="text-xl font-extrabold">
                {rupiah(remainingPayment)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <TambahPembayaranModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={submitPayment}
      />
    </div>
  );
}
