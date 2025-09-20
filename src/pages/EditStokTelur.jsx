import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmUpdateModal from "../components/ConfirmModal";
import { updateWarehouseItem } from "../services/warehouses";

export default function EditStokTelur() {
  const location = useLocation();
  const navigate = useNavigate();

  const { warehouseId, itemId, quantity, itemName, unit, description } =
    location.state || {};

  const [jumlah, setJumlah] = useState(quantity || "");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate(-1);
    }
  }, [location.state, navigate]);

  const handleSubmit = async () => {
    const payload = {
      quantity: parseInt(jumlah),
    };

    try {
      const updateResponse = await updateWarehouseItem(
        payload,
        warehouseId,
        itemId
      );
      if (updateResponse.status == 200) {
        setShowConfirm(false);
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Stok Telur</h1>

      <div className="border rounded p-8">
        {description && (
          <>
            <label className="block text-sm font-medium mb-1">
              Keterangan Stok
            </label>

            <span
              className={`w-24 py-1 flex justify-center rounded text-sm font-semibold ${
                description === "Aman"
                  ? "bg-aman-box-surface-color text-aman-text-color"
                  : "bg-kritis-box-surface-color text-kritis-text-color"
              }`}
            >
              {description}
            </span>
          </>
        )}
        <div className="mb-4"></div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nama Barang</label>
          <p className="font-bold">{itemName}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Jumlah Barang
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded bg-gray-100 focus:outline-none"
            />
            <span className="font-semibold">{unit || "Kg"}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>

      <ConfirmUpdateModal
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
}
