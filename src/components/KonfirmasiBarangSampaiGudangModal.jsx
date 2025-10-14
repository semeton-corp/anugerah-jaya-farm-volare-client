import React, { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";

const KonfirmasiBarangSampaiGudangModal = ({
  isOpen,
  onClose,
  onConfirm,
  data,
}) => {
  const [mode, setMode] = useState("Sesuai");
  const [jumlah, setJumlah] = useState(data?.quantity || "");
  const [catatan, setCatatan] = useState("");
  const expectedQuantity = data?.quantity;

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm({
      quantity: jumlah,
      note: mode === "Tidak Sesuai" ? catatan : "",
    });
    onClose();
  };

  const handleContactSeller = () => {
    if (!data?.supplier?.phoneNumber) {
      alert("Nomor WhatsApp supplier tidak tersedia!");
      return;
    }

    const supplierName = data?.supplier?.name || "Supplier";
    const itemName = data?.item?.name || "-";
    const unit = data?.item?.unit || "";
    const expected = expectedQuantity || "-";
    const received = jumlah || "-";
    const note = catatan || "-";

    const rawMessage = `
Halo *${supplierName}*, kami dari *Anugerah Jaya Farm* ingin menyampaikan ada ketidaksesuaian pada barang yang dikirim:

📦 *Barang:* ${itemName}
📊 *Jumlah dipesan:* ${expected} ${unit}
📊 *Jumlah diterima:* ${received} ${unit}
📝 *Catatan:* ${note}

Mohon tindak lanjutnya, terima kasih 🙏
  `;

    const waNumber = data.supplier.phoneNumber.replace(/^0/, "62");
    const message = encodeURIComponent(rawMessage.trim());
    const waURL = `https://api.whatsapp.com/send?phone=${waNumber}&text=${message}`;

    window.open(waURL, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/15 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Konfirmasi barang sampai</h2>
        <div className="flex mb-4 gap-2">
          <button
            className={`flex-1 py-2 rounded border ${
              mode === "Sesuai"
                ? "bg-green-100 border-green-500"
                : "border-gray-300 hover:bg-green-100 cursor-pointer"
            }`}
            onClick={() => setMode("Sesuai")}
          >
            Sesuai
          </button>
          <button
            className={`flex-1 py-2 rounded border ${
              mode === "Tidak Sesuai"
                ? "bg-green-100 border-green-500"
                : "border-gray-300 hover:bg-green-100 cursor-pointer"
            }`}
            onClick={() => setMode("Tidak Sesuai")}
          >
            Tidak Sesuai
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Nama Barang</p>
            <p className="font-bold">{data?.item?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Supplier</p>
            <p className="font-bold">{data?.supplier?.name}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Jumlah Barang</p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah barang yang datang"
              className="w-full border rounded px-2 py-1"
              disabled={mode == "Sesuai"}
            />
            <span className="font-bold">{data?.satuan}</span>
          </div>
        </div>

        {mode === "Tidak Sesuai" && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Catatan ketidaksesuaian</p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Masukkan catatan ketidaksesuaian barang yang sampai"
              className="w-full border rounded px-2 py-1"
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="text-green-900 border border-green-300 px-4 py-2 rounded hover:bg-green-100 transition"
          >
            Batal
          </button>

          {mode === "Tidak Sesuai" && (
            <button
              onClick={handleContactSeller}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded transition cursor-pointer"
            >
              <IoLogoWhatsapp className="text-lg" />
              Hubungi Supplier
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded transition cursor-pointer"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default KonfirmasiBarangSampaiGudangModal;
