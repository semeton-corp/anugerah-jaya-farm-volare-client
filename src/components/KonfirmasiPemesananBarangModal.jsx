import React, { useMemo, useRef, useState } from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { uploadFile } from "../services/file";
import ImagePopUp from "./ImagePopUp";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const toYmd = (d = new Date()) => {
  const dt = new Date(d);
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};
const todayNice = () =>
  new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const num = (x, def = 0) => {
  const n = Number(String(x || "").replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? def : n;
};

const toISO = (d) => d;
const toNiceID = (iso) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";
const toDDMMYYYY = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

const KonfirmasiPemesananBarangModal = ({
  selectedItem = {},
  supplierOptions,
  onClose,
  onConfirm,
}) => {
  const itemObj = selectedItem?.item ?? {};
  const supplierObj = selectedItem?.supplier ?? {};

  const orderDate = selectedItem?.inputDate;
  const [itemName] = useState(itemObj?.name ?? "—");
  const unit = itemObj?.unit || "Kg";
  const [supplier, setSupplier] = useState(supplierObj || "");

  const filteredSupplier = supplierOptions?.filter((supplier) =>
    supplier.itemIds.includes(selectedItem.item.id)
  );

  const [deadlinePaymentDate, setDeadlinePaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [dailyNeed, setDailyNeed] = useState(
    num(selectedItem?.dailySpending, 1)
  );
  const [daysNeed, setDaysNeed] = useState(num(selectedItem?.daysNeed, 1));
  const [pricePerUnit, setPricePerUnit] = useState(num(selectedItem?.price, 0));

  const [editDaily, setEditDaily] = useState(false);
  const [editDays, setEditDays] = useState(false);
  const [editPrice, setEditPrice] = useState(false);
  const [editSupplier, setEditSupplier] = useState(false);

  const qty = useMemo(
    () => Math.max(num(dailyNeed) * num(daysNeed), 0),
    [dailyNeed, daysNeed]
  );
  const orderTotal = useMemo(
    () => Math.max(qty * num(pricePerUnit), 0),
    [qty, pricePerUnit]
  );

  const [etaDate, setEtaDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiredAt, setExpiredAt] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [paymentType, setPaymentType] = useState("Penuh");
  const [payments, setPayments] = useState([]);
  const totalPaid = useMemo(
    () => payments.reduce((a, p) => a + num(p.nominal), 0),
    [payments]
  );
  const remaining = orderTotal - totalPaid;
  const paymentStatus =
    remaining === 0 && payments.length > 0 ? "Lunas" : "Belum Lunas";

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentDate, setPaymentDate] = useState(toYmd());
  const [nominal, setNominal] = useState("");

  const [paymentProof, setPaymentProof] = useState();
  const [popupImage, setPopupImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const dateRef = useRef(null);

  const remainingAfterIdx = (idx) => {
    const paidToIdx = payments
      .slice(0, idx + 1)
      .reduce((acc, p) => acc + num(p.nominal), 0);
    return Math.max(orderTotal - paidToIdx, 0);
  };

  const addPayment = () => {
    if (nominal <= 0) {
      alert("❌ Nominal pembayaran harus lebih dari 0!");
      return;
    }

    if (!paymentProof) {
      alert("❌ Silahkan unggah bukti pembayaran!");
      return;
    }

    setPayments((prev) => [
      ...prev,
      {
        paymentDate: toISO(paymentDate),
        paymentMethod,
        nominal: String(num(nominal)),
        proof: paymentProof,
      },
    ]);

    setShowPaymentModal(false);
    setNominal("");
    setPaymentDate(toYmd());
    setPaymentProof();
  };

  const deletePayment = (idx) =>
    setPayments((prev) => prev.filter((_, i) => i !== idx));

  const handleConfirm = () => {
    if (!supplier?.id) {
      alert("❌ Silahkan memilih supplier terlebih dahulu pada tombol edit!");
      return;
    }

    if (paymentType === "Penuh" && totalPaid != orderTotal) {
      alert(
        "❌ Total pembayaran harus sama dengan total harga untuk pembayaran penuh."
      );
      return;
    }

    if (remaining < 0) {
      alert("❌ Masukkan total pembayaran yang valid!");
      return;
    }

    const payload = {
      warehouseId: selectedItem?.warehouse?.id ?? null,
      itemId: selectedItem?.item?.id ?? null,
      supplierId: supplier?.id ?? null,
      dailySpending: parseInt(dailyNeed),
      daysNeed: parseInt(daysNeed),
      price: String(pricePerUnit),
      estimationArrivalDate: toDDMMYYYY(etaDate),
      expiredAt: toDDMMYYYY(expiredAt),
      paymentType: paymentType,
      deadlinePaymentDate:
        paymentType == "Penuh" ? null : toDDMMYYYY(deadlinePaymentDate),
      payments: payments.map((p) => ({
        paymentDate: toDDMMYYYY(p.paymentDate),
        nominal: String(p.nominal ?? "0"),
        paymentProof: p.proof,
        paymentMethod: p.paymentMethod ?? "Tunai",
      })),
    };

    onConfirm?.(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 overflow-y-auto">
      <div className="bg-white w-[95%] max-w-4xl p-4 md:p-6 rounded shadow-lg my-8 mt-10 md:mt-16">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center md:text-left">
          Konfirmasi Pemesanan Barang
        </h2>

        {/* Info atas */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <p className="text-sm text-gray-600">Tanggal Pemesanan</p>
            <p className="font-semibold break-words">{orderDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nama Barang</p>
            <p className="font-semibold break-words">{itemName}</p>
          </div>
          <div>
            <div className="flex items-center justify-between md:justify-start">
              <p className="text-sm text-gray-600">Supplier</p>
              <button
                className="p-1 rounded border hover:bg-gray-100 ml-2"
                onClick={() => setEditSupplier((v) => !v)}
                title="Edit"
              >
                <BiSolidEditAlt size={16} />
              </button>
            </div>
            {editSupplier ? (
              <select
                className="w-full border rounded px-3 py-2 bg-gray-100 mt-1"
                value={supplier?.id || ""}
                onChange={(e) =>
                  setSupplier(
                    filteredSupplier.find(
                      (s) => s.id === Number(e.target.value)
                    )
                  )
                }
              >
                <option value="" disabled>
                  Pilih supplier...
                </option>
                {filteredSupplier?.length > 0 ? (
                  filteredSupplier?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Tidak ada supplier tersedia
                  </option>
                )}
              </select>
            ) : (
              <p
                className={`mt-1 ${
                  supplier.name ? "font-semibold" : "italic text-gray-500"
                }`}
              >
                {supplier.name || "supplier belum dipilih"}
              </p>
            )}
          </div>
        </div>

        {/* Baris angka utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-2">
          <div>
            <div className="flex items-center gap-2 justify-between md:justify-start">
              <p className="text-sm text-gray-600">Kebutuhan per-hari</p>
              <button
                className="p-1 rounded border hover:bg-gray-100"
                onClick={() => setEditDaily((v) => !v)}
                title="Edit"
              >
                <BiSolidEditAlt size={16} />
              </button>
            </div>
            {editDaily ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={dailyNeed}
                  onChange={(e) => setDailyNeed(e.target.value)}
                  min={0}
                />
                <span className="font-semibold">{unit}</span>
              </div>
            ) : (
              <p className="font-bold mt-1">
                {dailyNeed} {unit}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between md:justify-start">
              <p className="text-sm text-gray-600">Kebutuhan (hari)</p>
              <button
                className="p-1 rounded border hover:bg-gray-100"
                onClick={() => setEditDays((v) => !v)}
                title="Edit"
              >
                <BiSolidEditAlt size={16} />
              </button>
            </div>
            {editDays ? (
              <input
                type="number"
                className="border rounded px-3 py-2 mt-1 w-full"
                value={daysNeed}
                onChange={(e) => setDaysNeed(e.target.value)}
                min={0}
              />
            ) : (
              <p className="font-bold mt-1">{daysNeed} Hari</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600">Jumlah Pemesanan</p>
            <p className="font-bold mt-1">
              {qty} {unit}
            </p>
          </div>
        </div>

        {/* Harga */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-2">
          <div>
            <div className="flex items-center gap-2 justify-between md:justify-start">
              <p className="text-sm text-gray-600">Harga Beli / Unit</p>
              <button
                className="p-1 rounded border hover:bg-gray-100"
                onClick={() => setEditPrice((v) => !v)}
                title="Edit"
              >
                <BiSolidEditAlt size={16} />
              </button>
            </div>
            {editPrice ? (
              <input
                type="number"
                className="border rounded px-3 py-2 mt-1 w-full"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                min={0}
              />
            ) : (
              <p className="font-bold mt-1">{rupiah(pricePerUnit)}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600">Harga Beli Total</p>
            <p className="font-bold mt-1">{rupiah(orderTotal)}</p>
          </div>
        </div>

        {/* Tanggal Estimasi & Kadaluarsa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tanggal Estimasi Tiba</p>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={etaDate}
              onChange={(e) => setEtaDate(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kadaluarsa (optional)</p>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={expiredAt}
              onChange={(e) => setExpiredAt(e.target.value)}
            />
          </div>
        </div>

        {paymentType !== "Penuh" && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-1">Tenggat Pembayaran</p>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={deadlinePaymentDate}
              onChange={(e) => setDeadlinePaymentDate(e.target.value)}
            />
          </div>
        )}

        {/* Tipe Pembayaran */}
        <div className="flex flex-col mt-3 mb-2">
          <label className="text-sm text-gray-600">Tipe Pembayaran</label>
          <select
            className="border rounded p-2"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="Penuh">Penuh</option>
            <option value="Cicil">Cicil</option>
          </select>
        </div>

        {/* Pembayaran */}
        <div className="border rounded mt-3 overflow-x-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-3">
            <p className="font-semibold text-lg">Pembayaran</p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black cursor-pointer w-full md:w-auto text-center"
            >
              Pilih Pembayaran
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="text-left px-3 py-2">Tanggal</th>
                    <th className="text-left px-3 py-2">Metode</th>
                    <th className="text-left px-3 py-2">Nominal</th>
                    <th className="text-left px-3 py-2">Sisa</th>
                    <th className="text-left px-3 py-2">Bukti</th>
                    <th className="px-3 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        className="px-3 py-3 text-gray-500 text-center"
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
                        <td
                          className="px-3 py-2 underline text-green-700 hover:text-green-900 cursor-pointer"
                          onClick={() => setPopupImage(p.proof)}
                        >
                          {p.proof ? "Bukti Pembayaran" : "-"}
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

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Status Pembayaran :</span>
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
              <div className="text-right w-full md:w-auto">
                <p className="text-sm">Sisa Bayar : {rupiah(remaining)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer w-full md:w-auto"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-green-700 hover:bg-green-900 text-white cursor-pointer w-full md:w-auto"
          >
            Konfirmasi pesanan
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[110] flex justify-center items-start md:items-center bg-black/50 overflow-y-auto">
          <div className="bg-white w-[95%] max-w-lg p-4 md:p-6 rounded shadow-xl my-6 md:my-0 mt-20 md:mt-0 mx-auto">
            <h3 className="text-lg font-bold mb-4 text-center md:text-left">
              Pembayaran
            </h3>

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
              min={0}
            />

            <label className="text-sm text-gray-600">Metode Pembayaran</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tunai">Tunai</option>
              <option value="Non Tunai">Non Tunai</option>
            </select>

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

            <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentProof();
                  setNominal("");
                  setPaymentDate(toYmd());
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer w-full md:w-auto"
              >
                Batal
              </button>
              <button
                onClick={addPayment}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white w-full md:w-auto ${
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

export default KonfirmasiPemesananBarangModal;
