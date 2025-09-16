import { useState } from "react";
import ConfirmUpdateModal from "../components/ConfirmModal";
import { useLocation, useNavigate } from "react-router-dom";
import {
  updateWarehouseItem,
  updateWarehouseItemCorn,
} from "../services/warehouses";

export default function EditStokBarang() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    warehouseId,
    itemId,
    quantity,
    itemName,
    unit,
    estimationRunOut,
    description,
  } = location.state || {};

  const [jumlah, setJumlah] = useState(quantity || 0);
  const [estimasiHabis, setEstimasiHabis] = useState(
    parseInt(estimationRunOut || 0)
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    let payload = {
      quantity: parseInt(jumlah),
    };

    if (itemName !== "Jagung") {
      payload.runOutCountDown = parseInt(estimasiHabis);
    }

    try {
      let updateResponse;
      if (itemName !== "Jagung") {
        updateResponse = await updateWarehouseItem(
          payload,
          warehouseId,
          itemId
        );
      } else if (itemName == "Jagung") {
        updateResponse = await updateWarehouseItemCorn(payload, itemId);
      }
      // console.log("updateResponse: ", updateResponse);
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
      <h1 className="text-2xl font-bold mb-4">Edit Stok Barang</h1>

      <div className="border rounded p-8">
        {description && (
          <>
            <div className="mb-4">
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
            </div>
          </>
        )}

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
              onChange={(e) => setJumlah(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded bg-gray-100 focus:outline-none"
            />
            <span className="font-semibold">Kg</span>
          </div>
        </div>

        {/* Jumlah Barang */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Estimasi Habis
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={estimasiHabis}
              onChange={(e) => setEstimasiHabis(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded bg-gray-100 focus:outline-none"
            />
            <span className="font-semibold">Hari lagi</span>
          </div>
        </div> */}

        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowConfirm(true);
            }}
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
