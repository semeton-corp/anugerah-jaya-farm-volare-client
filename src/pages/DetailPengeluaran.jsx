import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getExpense } from "../services/cashflow";
import ImagePopUp from "../components/ImagePopUp";

const formatRupiah = (n = 0) =>
  "Rp " +
  Number(n || 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const formatDateID = (iso) => {
  try {
    const d = iso ? new Date(iso) : new Date();
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
};

const formatTime = (isoOrHHmm) => {
  if (!isoOrHHmm) return "-";
  if (/^\d{1,2}:\d{2}$/.test(isoOrHHmm)) return isoOrHHmm;
  try {
    const d = new Date(isoOrHHmm);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const Row = ({ label, value }) => (
  <div className="mb-4">
    <div className="text-sm text-gray-600">{label} :</div>
    <div className="font-semibold mt-1">
      {!value || value == "00:00:00" ? "-" : value}
    </div>
  </div>
);

export default function DetailPengeluaran() {
  const { category, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayCategory = useMemo(() => {
    const c = data?.category || data?.expenseCategory;
    return c === "Karyawan" ? "Pegawai" : c || "-";
  }, [data]);

  const createdAt = data?.createdAt || data?.date || null;
  const dateDisplay = formatDateID(createdAt);
  const timeDisplay = data?.time || formatTime(createdAt);

  const [popupImage, setPopupImage] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getExpense(category, id);
      if (res?.status === 200) {
        console.log("res.data?.data: ", res.data?.data);
        setData(res.data?.data ?? res.data);
      }
    } catch (err) {
      console.error("Gagal memuat detail pengeluaran:", err);
      alert("❌ Gagal memuat detail pengeluaran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, id]);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Detail Pengeluaran</h1>
        <div className="rounded border p-6">Memuat…</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Detail Pengeluaran</h1>

      <div className="rounded border border-gray-300 p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Row label="Tanggal" value={dateDisplay} />
          </div>
          <div>
            <Row label="Waktu" value={data?.time} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          <div>
            <Row label="Kategori" value={displayCategory} />
            <Row
              label="Lokasi Transaksi"
              value={data?.placeName || data?.locationName}
            />
            <Row
              label="Nama Transaksi"
              value={data?.name || data?.namaTransaksi}
            />
            <Row label="Penerima" value={data?.receiverName || "-"} />
            <Row
              label="Jumlah Barang"
              value={
                data?.quantityLabel || data?.quantity || data?.jumlahBarang
              }
            />
            <Row
              label="Nominal Transaksi"
              value={formatRupiah(data?.nominal || data?.amount)}
            />

            <div className="mb-4">
              <div className="text-sm text-gray-600">Bukti Pembayaran</div>
              <button
                type="button"
                onClick={() => {
                  setPopupImage(data.paymentProof);
                }}
                className="mt-2 rounded bg-orange-300 hover:bg-orange-500 text-black px-4 py-1.5 cursor-pointer"
              >
                Lihat Bukti Transaksi
              </button>
            </div>

            <Row
              label="Transaksi Diinputkan oleh"
              value={data?.inputBy || data?.operator}
            />
          </div>

          <div>
            <Row
              label="Nomor Telepon Pelanggan"
              value={data?.receiverPhoneNumber || data?.phoneNumber}
            />
            <Row label="Metode Pembayaran" value={data?.paymentMethod || "-"} />
          </div>
        </div>
      </div>

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
}
