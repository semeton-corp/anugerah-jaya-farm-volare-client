import { useEffect } from "react";
import { useState } from "react";
import { toISODate } from "../utils/dateFormat";
import { uploadFile } from "../services/file";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";

export const EditPembayaranModal = ({
  open,
  onClose,
  onSave,
  title = "Tambah Pembayaran",
  defaultMethod = "Tunai",
  initialValues,
}) => {
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
  const [nominal, setNominal] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentProof, setPaymentProof] = useState("https://example.com");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setPaymentMethod(initialValues.paymentMethod || defaultMethod);
      setNominal(
        initialValues.nominal != null ? String(initialValues.nominal) : ""
      );

      const isoLike = toISODate(initialValues.paymentDate);
      setPaymentDate(isoLike);

      setPaymentProof(initialValues.paymentProof);
    } else {
      setPaymentMethod(defaultMethod);
      setNominal("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setPaymentProof("https://example.com");
    }
  }, [open, defaultMethod, initialValues]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-xl">
        <h3 className="text-lg font-bold mb-4">{title}</h3>

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
          min={0}
        />

        <label className="block mb-1 font-medium">Tanggal Bayar</label>
        <input
          type="date"
          className="w-full border rounded p-2 mb-3"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />

        <label className="block mb-1 font-medium">Bukti Pembayaran</label>
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
  );
};
