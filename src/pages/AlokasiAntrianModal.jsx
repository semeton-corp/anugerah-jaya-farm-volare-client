import React, { useRef, useState, useMemo, useEffect } from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import {
  formatDateToDDMMYYYY,
  convertToInputDateFormat,
} from "../utils/dateFormat";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { uploadFile } from "../services/file";
import ImagePopUp from "../components/ImagePopUp";

// Helpers
const parseNumber = (raw) => {
  if (raw == null || raw === "") return 0;
  const cleaned = String(raw).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};
const formatIDR = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const AlokasiAntrianModal = ({
  customerName,
  itemName,
  quantity,
  setQuantity,
  units,
  unit,
  setUnit,
  setShowAlokasiModal,
  paymentHistory,
  setPaymentHistory,
  paymentDate,
  setPaymentDate,
  paymentStatus,
  paymentMethod,
  setPaymentMethod,
  nominal,
  setNominal,
  remaining,
  itemTotalPrice,
  itemPriceDiscount,
  paymentType,
  setPaymentType,
  paymentProof,
  setPaymentProof,
  submitHandle,
  sendDate,
  setSendDate,
}) => {
  const [payments, setPayments] = useState(() =>
    Array.isArray(paymentHistory) ? paymentHistory.slice() : []
  );

  useEffect(() => {
    if (typeof setPaymentHistory === "function") {
      setPaymentHistory(payments);
    }
  }, [payments, setPaymentHistory]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const [popupImage, setPopupImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const dateInputRef = useRef(null);

  const baseTotal = useMemo(
    () => parseNumber(itemTotalPrice) - parseNumber(itemPriceDiscount),
    [itemTotalPrice, itemPriceDiscount]
  );

  const totalPaid = useMemo(
    () => (payments || []).reduce((acc, p) => acc + parseNumber(p.nominal), 0),
    [payments]
  );

  const finalRemaining = Math.max(baseTotal - totalPaid, 0);

  const remainingAfterIndex = (idx) => {
    let sisa = baseTotal;
    for (let i = 0; i <= idx; i++) {
      sisa = Math.max(sisa - parseNumber(payments[i]?.nominal), 0);
    }
    return sisa;
  };

  const openAddPaymentModal = () => {
    setEditingIndex(-1);
    setPaymentMethod("Tunai");
    setNominal("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentProof("");
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (index) => {
    const p = payments[index];
    if (!p) return;
    setEditingIndex(index);
    setPaymentMethod(p.paymentMethod || "Tunai");
    const iso =
      p.paymentDate && p.paymentDate.includes("-")
        ? (() => {
            const parts = p.paymentDate.split("-");
            if (parts.length === 3 && parts[2].length === 4) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return p.paymentDate;
          })()
        : new Date().toISOString().slice(0, 10);
    setPaymentDate(
      convertToInputDateFormat(iso)
        ? (() => {
            const parts = p.paymentDate.split("-");
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          })()
        : iso
    );
    setNominal(String(p.nominal || ""));
    setPaymentProof(p.paymentProof || "");
    setShowPaymentModal(true);
  };

  const savePayment = () => {
    const nominalNum = parseNumber(nominal);
    if (!nominalNum || nominalNum <= 0) {
      alert("Nominal pembayaran harus lebih dari 0.");
      return;
    }
    if (!paymentDate) {
      alert("Tanggal pembayaran wajib diisi.");
      return;
    }

    if (!paymentProof) {
      alert("❌Silahkan upload bukti pembayaran");
      return;
    }

    const iso = paymentDate;
    const [yyyy, mm, dd] = iso.split("-");
    const ddmmyyyy = `${dd}-${mm}-${yyyy}`;

    const entry = {
      paymentDate: ddmmyyyy,
      paymentMethod: paymentMethod || "Tunai",
      nominal: String(nominalNum),
      paymentProof: paymentProof,
    };

    setPayments((prev) => {
      if (editingIndex >= 0) {
        const copy = prev.slice();
        copy[editingIndex] = entry;
        return copy;
      } else {
        return [...prev, entry];
      }
    });

    setShowPaymentModal(false);
    setEditingIndex(-1);
  };

  const deletePayment = (index) => {
    if (!confirm("Hapus pembayaran ini?")) return;
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = () => {
    const payload = {
      payments: payments.map((p) => ({
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        nominal: String(p.nominal),
        paymentProof: p.paymentProof,
      })),
      paymentType,
      quantity,
      unit,
      sendDate,
    };

    if (paymentType === "Penuh") {
      if (finalRemaining !== 0) {
        alert(
          "Untuk pembayaran penuh, pastikan total pembayaran melunasi tagihan."
        );
        return;
      }
    }
    submitHandle(payload);
  };

  useEffect(() => {
    if (Array.isArray(paymentHistory) && paymentHistory.length > 0) {
      setPayments(paymentHistory.slice());
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[95%] max-w-3xl p-6 rounded shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Alokasi Telur Antrian Pesanan
        </h2>

        <div className="mb-2">
          <p className="text-sm">Nama Pembeli</p>
          <p className="font-bold">{customerName}</p>
        </div>
        <div className="mb-2">
          <p className="text-sm">Nama Barang</p>
          <p className="font-bold">{itemName}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">
              Jumlah Barang
            </label>
            <input
              type="number"
              value={quantity}
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Satuan</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {units?.map((u, idx) => (
                <option key={idx} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Tanggal Kirim
          </label>
          <input
            ref={dateInputRef}
            className="w-full border rounded p-2 mb-4 cursor-pointer"
            type="date"
            value={sendDate}
            onChange={(e) => setSendDate(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <p>
            Harga Barang :{" "}
            <span className="font-semibold">{formatIDR(itemTotalPrice)}</span>
          </p>
          <p>
            Potongan Harga :{" "}
            <span className="font-semibold">
              -{formatIDR(itemPriceDiscount)}
            </span>
          </p>
        </div>

        <hr className="my-4" />

        <div className="mb-4">
          <p className="text-lg font-bold">
            Total : <span className="ml-2">{formatIDR(baseTotal)}</span>
          </p>
        </div>

        {/* paymentType above the table */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipe Pembayaran
            </label>
            <select
              className="border rounded p-2"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="">-- Pilih Tipe Pembayaran --</option>
              <option value="Penuh">Penuh</option>
              <option value="Cicil">Cicil</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                if (paymentStatus === "Lunas") {
                  alert("Pesanan ini sudah Lunas!");
                } else {
                  openAddPaymentModal();
                }
              }}
              className="px-4 py-2 bg-orange-400 hover:bg-orange-600 rounded text-black"
            >
              Pilih Pembayaran
            </button>
          </div>
        </div>

        {/* payments table */}
        <div className="p-4 border border-black-6 rounded-[4px]">
          <div className="mt-4">
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Metode Pembayaran</th>
                  <th className="px-4 py-2">Nominal Pembayaran</th>
                  <th className="px-4 py-2">Sisa Cicilan</th>
                  <th className="px-4 py-2">Bukti</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-gray-500 italic">
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3">{p.paymentDate}</td>
                      <td className="px-4 py-3">{p.paymentMethod}</td>
                      <td className="px-4 py-3">
                        {formatIDR(parseNumber(p.nominal))}
                      </td>
                      <td className="px-4 py-3">
                        {formatIDR(remainingAfterIndex(i))}
                      </td>
                      <td className="px-3 py-2">
                        {p.paymentProof ? (
                          <td
                            className="px-3 py-2 underline text-green-700 hover:text-green-900 cursor-pointer"
                            onClick={() => setPopupImage(p.paymentProof)}
                          >
                            {p.paymentProof ? "Bukti Pembayaran" : "-"}
                          </td>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 flex gap-3 justify-center">
                        <BiSolidEditAlt
                          size={20}
                          onClick={() => openEditPaymentModal(i)}
                          className="cursor-pointer"
                        />
                        <MdDelete
                          size={20}
                          onClick={() => deletePayment(i)}
                          className="cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* status & final remaining */}
          <div className="flex mt-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className=" font-bold">Status Pembayaran: </h1>
              <div
                className={`px-3 py-2  rounded-[4px] ${
                  finalRemaining === 0
                    ? "bg-green-100 text-black"
                    : "bg-orange-200 text-black"
                }`}
              >
                {finalRemaining === 0 ? "Lunas" : "Belum Lunas"}
              </div>
            </div>

            <div>
              <div className="text-sm">Sisa cicilan</div>
              <div className="text-lg font-extrabold">
                {formatIDR(finalRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={() => {
              setShowAlokasiModal(false);
            }}
            className="p-2 text-green-700 px-6 rounded border border-green-700 hover:bg-green-200"
          >
            Batal
          </button>
          <button
            onClick={handleCreateOrder}
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-900"
          >
            Buat Pesanan
          </button>
        </div>
      </div>

      {/* Add/Edit Payment Modal */}
      {showPaymentModal && (
        <div className="fixed w-full inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4">
              {editingIndex >= 0 ? "Edit Pembayaran" : "Tambah Pembayaran"}
            </h3>

            <label className="block mb-2 font-medium">Metode Pembayaran</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tunai">Tunai</option>
              <option value="Non Tunai">Non Tunai</option>
            </select>

            <label className="block mb-2 font-medium">Nominal Pembayaran</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border p-2 rounded mb-4"
              placeholder="Masukkan nominal pembayaran"
              value={formatThousand(nominal)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setNominal(raw);
              }}
            />

            <label className="block font-medium mb-2">Tanggal Bayar</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-4"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <label className="block mb-2 font-medium">Bukti Pembayaran</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded p-2 mb-4"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploading(true);

                try {
                  const fileUrl = await uploadFile(file);
                  setPaymentProof(fileUrl);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsUploading(false);
                }
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setEditingIndex(-1);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-500 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={savePayment}
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

export default AlokasiAntrianModal;
