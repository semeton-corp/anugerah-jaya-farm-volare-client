import React, { useState } from "react";
import ConfirmUpdateModal from "../components/ConfirmModal";
import { useNavigate, useParams } from "react-router-dom";
import { getStoreItem, updateStoreItem } from "../services/stores";
import { useEffect } from "react";

const EditStok = () => {
  const navigate = useNavigate();
  const { storeId, itemId } = useParams();

  const [itemName, setItemName] = useState("");
  const [storeName, setStoreName] = useState("");

  const [jumlah, setJumlah] = useState(50);
  const [unit, setUnit] = useState("-");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    try {
      const payload = {
        quantity: parseInt(jumlah),
      };
      const updateResponse = await updateStoreItem(storeId, itemId, payload);
      // console.log("updateResponse: ", updateResponse);
      if (updateResponse.status == 200) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDetail = async () => {
    try {
      const detailResponse = await getStoreItem(storeId, itemId);
      if (detailResponse.status == 200) {
        setItemName(detailResponse.data.data.item.name);
        setStoreName(detailResponse.data.data.store.name);
        setJumlah(detailResponse.data.data.quantity);
        setUnit(detailResponse.data.data.item.unit);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Stok</h2>
      <div className=" border rounded p-4 space-y-6 w-full ">
        <div>
          <label className="block text-sm mb-1">Nama Barang</label>
          <p className="text-lg font-bold">{itemName}</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Nama Toko</label>
          <p className="text-lg font-bold">{storeName}</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Jumlah Barang</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="bg-black-4 border p-2 rounded w-full max-w-[200px]"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
            />
            <span className="font-semibold">{unit}</span>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={() => {
              setShowConfirm(true);
            }}
            className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* Modal */}
      <ConfirmUpdateModal
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
};

export default EditStok;
