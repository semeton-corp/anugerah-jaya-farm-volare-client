// KonfirmasiPemesananDocModal.jsx
import React, { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { convertToInputDateFormat } from "../utils/dateFormat";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { uploadFile } from "../services/file";
import ImagePopUp from "./ImagePopUp";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const KonfirmasiPemesananDocModal = ({
  onClose,
  onConfirm,
  order = {
    orderDate: "20 Maret 2025",
    supplier: "Dagang A",
    kandang: "Sidodadi DOC",
    kandangOptions: ["Sidodadi DOC", "Kediri DOC", "Blitar DOC"],
    quantity: 1100,
    price: 5000000,
  },
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [kandang, setKandang] = useState(order.kandang);
  const [qty, setQty] = useState(order.quantity);
  const [price, setPrice] = useState(order.price);
  const [estimationArrivalDate, setEtaDate] = useState(today);
  const [deadlinePaymentDate, setDeadlinePaymentDate] = useState(today);

  const orderTotal = useMemo(() => Number(price || 0), [price]);

  const [editKandang, setEditKandang] = useState(false);
  const [editQty, setEditQty] = useState(false);
  const [editPrice, setEditPrice] = useState(false);

  const [payments, setPayments] = useState([]);
  const totalPaid = useMemo(
    () => payments.reduce((acc, p) => acc + Number(p.nominal || 0), 0),
    [payments]
  );
  const remaining = Number(price || 0) - totalPaid;
  const paymentStatus =
    remaining === 0 && payments.length > 0 ? "Lunas" : "Belum Lunas";

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState("Penuh");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [nominal, setNominal] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);

  const [draftPayments, setDraftPayments] = useState([]);

  const [popupImage, setPopupImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const dateRef = useRef(null);

  const recomputeRemaining = (list) => {
    let sisa = orderTotal;
    return list.map((p) => {
      const n = Number(p.nominal || 0);
      sisa = Math.max(sisa - n, 0);
      return {
        ...p,
        nominal: String(n),
        remaining: String(sisa),
      };
    });
  };

  const addPayment = () => {
    const n = Number(nominal || 0);
    let errorMessage = "";

    if (!paymentDate) {
      errorMessage = "Tanggal pembayaran belum diisi.";
    } else if (!paymentMethod) {
      errorMessage = "Metode pembayaran belum dipilih.";
    } else if (n <= 0) {
      errorMessage = "Nominal pembayaran harus lebih dari 0.";
    } else if (!paymentProof) {
      errorMessage = "Bukti pembayaran wajib diunggah!";
    }

    if (errorMessage) {
      alert(`⚠️ ${errorMessage}`);
      return;
    }

    const newPay = {
      paymentDate: convertToInputDateFormat(paymentDate),
      paymentMethod,
      nominal: String(n),
      paymentProof: paymentProof ? paymentProof : "-",
    };
    setPayments((prev) => recomputeRemaining([...prev, newPay]));
    resetPaymentForm();
  };

  const resetPaymentForm = () => {
    setShowPaymentModal(false);
    setPaymentMethod("Tunai");
    setNominal("");
    setPaymentProof(null);
    setPaymentDate(new Date().toISOString().slice(0, 10));
  };

  const deletePayment = (idx) => {
    setPayments((p) => p.filter((_, i) => i !== idx));
  };

  const confirmOrder = () => {
    const cleanedPayments = payments.map(({ remaining, ...rest }) => rest);
    if (paymentType === "Penuh") {
      if (remaining != 0) {
        alert("❌ Pastikan jumlah pembayaran melunasi harga pemesanan!");
        return;
      }
    }

    if (remaining < 0) {
      alert("❌ Pastikan jumlah valid!");
      return;
    }

    onConfirm?.({
      quantity: Number(qty || 0),
      totalPrice: price,
      estimationArrivalDate: convertToInputDateFormat(estimationArrivalDate),
      deadlinePaymentDate:
        paymentType === "Penuh"
          ? null
          : convertToInputDateFormat(deadlinePaymentDate),
      payments: cleanedPayments,
      paymentType: paymentType,
    });
  };

  const remainingAfterIdx = (idx) => {
    const paidToIdx = payments
      .slice(0, idx + 1)
      .reduce((acc, p) => acc + Number(p.nominal || 0), 0);
    return Math.max(Number(price || 0) - paidToIdx, 0);
  };

  useEffect(() => {
    setPayments(recomputeRemaining(payments));
  }, [price]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[95%] max-w-3xl p-6 rounded shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-6">
          Konfirmasi Pemesanan DOC
        </h2>

        {/* Info utama */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tanggal Pemesanan</p>
            <p className="font-semibold">{order.orderDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Supplier</p>
            <p className="font-semibold">{order.supplier}</p>
          </div>
        </div>

        {/* Detail kandang, harga, jumlah, estimasi tiba */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kandang */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Kandang</p>
            </div>
            {editKandang ? (
              <select
                className="border rounded px-3 py-2 mt-1 w-full"
                value={kandang.id}
                onChange={(e) => {
                  const selectedCage = order.kandangOptions?.find(
                    (k) => k.id === parseInt(e.target.value)
                  );
                  setKandang(selectedCage);
                }}
              >
                {order.kandangOptions?.map((kandang) => (
                  <option key={kandang.id} value={kandang.id}>
                    {kandang.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="font-bold mt-1">{kandang.name}</p>
            )}
          </div>

          {/* Harga */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Harga</p>
              <button
                className="p-1 rounded border hover:bg-gray-100"
                onClick={() => setEditPrice((v) => !v)}
                title="Edit Harga"
              >
                <BiSolidEditAlt size={16} />
              </button>
            </div>
            {editPrice ? (
              <input
                type="text"
                inputMode="numeric"
                className="border rounded px-3 py-2 mt-1 w-full"
                value={formatThousand(price)}
                onChange={(e) => {
                  const raw = onlyDigits(e.target.value);
                  setPrice(raw);
                }}
              />
            ) : (
              <p className="font-bold mt-1">{rupiah(price)}</p>
            )}
          </div>

          {/* Jumlah Pemesanan */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Jumlah Pemesanan</p>
              <button
                className="p-1 rounded border hover:bg-gray-100"
                onClick={() => setEditQty((v) => !v)}
                title="Edit Jumlah"
              >
                <BiSolidEditAlt size={16} />
              </button>
            </div>
            {editQty ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={qty}
                  min={0}
                  max={kandang?.capacity}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > kandang.capacity) {
                      setQty(kandang.capacity);
                    } else {
                      setQty(value);
                    }
                  }}
                />
                <span className="font-semibold">Ekor</span>
              </div>
            ) : (
              <p className="font-bold mt-1">{qty} Ekor</p>
            )}
          </div>

          {/* Estimasi tiba */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">Tanggal Estimasi Tiba</p>
            <input
              type="date"
              value={estimationArrivalDate || ""}
              onChange={(e) => setEtaDate(e.target.value)}
              className="border rounded px-3 py-2 mt-1 w-full"
              style={{ appearance: "auto" }}
            />
          </div>
        </div>

        {/* Tipe pembayaran */}
        <div className="flex flex-col mb-4">
          <label className="text-sm">Tipe Pembayaran</label>
          <select
            className="border rounded p-2"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="Penuh">Penuh</option>
            <option value="Cicil">Cicil</option>
          </select>
        </div>

        {/* Tenggat bayar */}
        {paymentType !== "Penuh" && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Tenggat Pembayaran</p>
            <input
              type="date"
              value={deadlinePaymentDate || ""}
              onChange={(e) => setDeadlinePaymentDate(e.target.value)}
              className="border rounded px-3 py-2 mt-1 w-full"
              style={{ appearance: "auto" }}
            />
          </div>
        )}

        {/* Tabel pembayaran */}
        <div className="border rounded mt-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-2">
            <p className="font-semibold text-lg">Pembayaran</p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black cursor-pointer w-full md:w-auto"
            >
              Pilih Pembayaran
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="text-left px-3 py-2">Tanggal</th>
                    <th className="text-left px-3 py-2">Metode</th>
                    <th className="text-left px-3 py-2">Nominal</th>
                    <th className="text-left px-3 py-2">Sisa Bayar</th>
                    <th className="text-left px-3 py-2">Bukti</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        className="px-3 py-3 text-center text-gray-500"
                        colSpan={6}
                      >
                        Belum ada data pembayaran.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{p.paymentDate}</td>
                        <td className="px-3 py-2">{p.paymentMethod}</td>
                        <td className="px-3 py-2">{rupiah(p.nominal)}</td>
                        <td className="px-3 py-2">
                          {rupiah(remainingAfterIdx(i))}
                        </td>
                        <td className="px-3 py-2">
                          {p.paymentProof ? (
                            <td
                              className="px-3 py-2 underline text-green-700 hover:text-green-900 cursor-pointer text-center"
                              onClick={() => setPopupImage(p.paymentProof)}
                            >
                              {p.paymentProof ? "Bukti Pembayaran" : "-"}
                            </td>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => deletePayment(i)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Hapus"
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Status */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Status :</span>
                <span
                  className={`px-3 py-1 rounded ${
                    paymentStatus === "Lunas"
                      ? "bg-green-200 text-green-900"
                      : "bg-orange-200 text-orange-900"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              <div className="text-left md:text-right">
                <p className="text-lg sm:text-xl font-bold">
                  Sisa Bayar : {rupiah(remaining)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer w-full sm:w-auto"
          >
            Batal
          </button>
          <button
            onClick={confirmOrder}
            className="px-4 py-2 rounded bg-green-700 hover:bg-green-900 text-white cursor-pointer w-full sm:w-auto"
          >
            Konfirmasi
          </button>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-xl">
            <h3 className="text-lg font-bold mb-4">Pembayaran</h3>

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
              type="text"
              inputMode="numeric"
              className="w-full border rounded p-2 mb-3"
              placeholder="Masukkan nominal"
              value={formatThousand(nominal)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setNominal(raw);
              }}
            />

            <label className="block mb-1 font-medium">Tanggal Bayar</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-3"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              ref={dateRef}
            />
            <label className="block mb-1 font-medium">Bukti Pembayaran</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded p-2 mb-4"
              onChange={async (e) => {
                const fileInput = e.target;
                const file = fileInput.files?.[0];
                if (!file) return;

                setIsUploading(true);

                try {
                  const fileUrl = await uploadFile(file);
                  setPaymentProof(fileUrl);
                } catch (err) {
                  console.error("Upload error:", err);
                  alert("Upload gagal. Silakan coba lagi.");
                  fileInput.value = "";
                } finally {
                  setIsUploading(false);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={addPayment}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900 cursor-pointer"
                }`}
              >
                {isUploading ? "Mengunggah..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
};

export default KonfirmasiPemesananDocModal;
