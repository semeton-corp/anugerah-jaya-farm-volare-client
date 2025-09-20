// src/pages/DetailPendapatan.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getIncome } from "../services/cashflow";
import ReceiptModal from "../components/Receipt";
import { getStoreSaleById } from "../services/stores";

const formatRupiah = (n = 0) =>
  "Rp " +
  Number(n || 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const formatTanggalID = (val) => {
  if (!val) return "-";
  // API returns "03 Aug 2025" — try to parse; if fail, show as-is
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
};

const formatTime = (val) => {
  if (!val) return "-";
  // supports "10:30" or ISO
  if (/^\d{1,2}:\d{2}$/.test(val)) return val;
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

// API -> UI category mapping
const mapIncomeCategory = (apiCat) => {
  switch (apiCat) {
    case "Store Egg Sale":
      return "Penjualan Telur Toko";
    case "Warehouse Egg Sale":
      return "Penjualan Telur Gudang";
    case "Afkir Chicken Sale":
      return "Penjualan Ayam Afkir";
    default:
      return apiCat || "-";
  }
};

const Field = ({ label, value, className = "" }) => (
  <div className={className}>
    <div className="text-gray-600">{label}</div>
    <div className="mt-1 font-extrabold">{value ?? "-"}</div>
  </div>
);

export default function DetailPendapatan() {
  const { category, id, parentId } = useParams();
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState(0);
  const [itemName, setItemName] = useState();
  const [quantity, setQuantity] = useState();
  const [unit, setUnit] = useState();
  const [itemPrice, setItemPrice] = useState();
  const [itemTotalPrice, setItemTotalPrice] = useState();
  const [itemPriceDiscount, setItemPriceDiscount] = useState();
  const [paymentHistory, setPaymentHistory] = useState();
  const [remaining, setRemaining] = useState();
  const receiptRef = useRef();

  const data = useMemo(() => {
    if (!raw) return null;
    return {
      tanggal: raw.date,
      waktu: raw.time,
      kategori: mapIncomeCategory(raw.category),
      lokasi: raw.placeName,
      namaPelanggan: raw.customerName,
      telpPelanggan: raw.customerPhoneNumber,
      namaBarang: raw.itemName,
      jumlahBarang: [raw.quantity, raw.itemUnit].filter(Boolean).join(" "),
      tipeTransaksi: raw.paymentType === "Cicil" ? "Cicilan" : raw.paymentType,
      totalTransaksi: Number(raw.totalPrice || 0),
      nominalPemasukan: Number(raw.nominal || 0),
      metodePembayaran: raw.paymentMethod,
      diinputOleh: raw.inputBy ?? raw["inputBy "] ?? raw.operator ?? "-",
      buktiUrl: raw.paymentProof || "",
      strukUrl: raw.receiptUrl || "",
    };
  }, [raw]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const detailResponse = await getIncome(category, id);
      if (detailResponse?.status === 200) {
        setRaw(detailResponse.data?.data ?? detailResponse.data);
      }
    } catch (error) {
      console.log("error :", error);
      alert("❌ Gagal memuat detail pendapatan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionData = async () => {
    try {
      console.log("data: ", data);
      let transactionDataResponse;
      if (data.kategori == "Penjualan Telur Toko") {
        transactionDataResponse = await getStoreSaleById(parentId);
      }
      console.log("transactionDataResponse: ", transactionDataResponse);
      if (transactionDataResponse.status == 200) {
        const transactionData = transactionDataResponse.data.data;
        setCustomerName(transactionData.customer.name);
        setPhone(transactionData.customer.phoneNumber);
        setItemName(transactionData.item.name);
        setQuantity(transactionData.quantity);
        setUnit(transactionData.item.unit);
        setItemPrice(transactionData.price);

        const totalitemPrice = transactionData.price * transactionData.quantity;
        setItemTotalPrice(totalitemPrice);

        const totalDiscount = totalitemPrice - transactionData.totalPrice;
        setItemPriceDiscount(totalDiscount);

        setRemaining(transactionData.remainingPayment);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [category, id]);

  useEffect(() => {
    if (data?.kategori) {
      fetchTransactionData();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Detail Pendapatan</h1>
        <div className="rounded-md border border-gray-300 p-6">Memuat…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Detail Pendapatan</h1>
        <div className="rounded-md border border-gray-300 p-6">
          Data tidak ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Detail Pendapatan</h1>

      <div className="rounded-md border border-gray-300 p-6">
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-10">
          {/* Baris 1 */}
          <Field label="Tanggal" value={formatTanggalID(data.tanggal)} />
          <Field label="Waktu" value={formatTime(data.waktu)} />

          <Field label="Kategori" value={data.kategori} />
          <div />

          <Field label="Lokasi Transaksi" value={data.lokasi} />
          <div />

          <Field label="Nama Pelanggan" value={data.namaPelanggan} />
          <Field label="Nomor Telepon Pelanggan" value={data.telpPelanggan} />

          <Field label="Nama barang" value={data.namaBarang} />
          <Field label="Jumlah Barang" value={data.jumlahBarang} />

          <Field label="Tipe Transaksi" value={data.tipeTransaksi} />
          <div />

          <Field
            label="Total Transaksi"
            value={formatRupiah(data.totalTransaksi)}
          />
          <Field label="Metode Pembayaran" value={data.metodePembayaran} />

          {/* Baris 8 */}
          <Field
            label="Nominal Pemasukan"
            value={formatRupiah(data.nominalPemasukan)}
          />
          <div />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <a
            href={data.buktiUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-orange-300 hover:bg-orange-500 px-4 py-2 font-medium text-black"
            onClick={(e) => !data.buktiUrl && e.preventDefault()}
          >
            Lihat Bukti Transaksi
          </a>
          <a
            className="rounded bg-orange-300 hover:bg-orange-500 px-4 py-2 font-medium text-black cursor-pointer"
            onClick={() => {
              setShowReceiptModal(true);
            }}
          >
            Lihat Struk Transaksi
          </a>
        </div>

        <div className="mt-6">
          <div className="text-gray-600">Transaksi Diinputkan oleh</div>
          <div className="mt-1 font-extrabold">{data.diinputOleh || "-"}</div>
        </div>
      </div>

      {showReceiptModal && (
        <ReceiptModal
          orderId={parentId}
          customerName={customerName}
          customerPhoneNumber={phone}
          itemName={itemName}
          quantity={quantity}
          unit={unit}
          itemPrice={itemPrice}
          itemTotalPrice={itemTotalPrice}
          itemPriceDiscount={itemPriceDiscount}
          paymentHistory={paymentHistory}
          remaining={remaining}
          onClose={() => setShowReceiptModal(false)}
          ref={receiptRef}
        />
      )}
    </div>
  );
}
