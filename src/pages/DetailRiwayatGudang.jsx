import React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getWarehouseItemHistoryById } from "../services/warehouses";
import { useState } from "react";

export default function DetailRiwayatGudang() {
  const [status, setStatus] = React.useState("Stok Masuk");

  const { id } = useParams();
  const [historyData, setHistoryData] = useState([]);

  const fetchHistoryData = async () => {
    try {
      const historyResponse = await getWarehouseItemHistoryById(id);
      console.log("historyResponseDetail: ", historyResponse);
      if (historyResponse.status == 200) {
        setHistoryData(historyResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detail Riwayat</h1>

      <div className="border rounded p-6 bg-white">
        <div className="mb-6">
          <label className="block font-medium mb-1">Status</label>
          <span
            className={`inline-block px-3 py-1 rounded  font-semibold ${
              historyData?.status === "Barang Masuk"
                ? "bg-aman-box-surface-color text-aman-text-color"
                : historyData?.status === "Barang Keluar"
                ? "bg-kritis-box-surface-color text-kritis-text-color"
                : "bg-orange-200 text-yellow-900"
            }`}
          >
            {historyData?.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className=" text-gray-600">Waktu :</p>
            <p className="font-bold text-lg">{historyData?.time}</p>
          </div>
          <div>
            <p className=" text-gray-600">Tanggal :</p>
            <p className="font-bold text-lg">{historyData?.date}</p>
          </div>
        </div>
        {status === "Stok diperbaharui" ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className=" text-gray-600">Tempat Barang</p>
              <p className="font-bold text-lg">Gudang Pusat (DUMMY)</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className=" text-gray-600">Asal Barang</p>
              <p className="font-bold text-lg">{historyData?.source}</p>
            </div>
            {historyData?.destination != "-" && (
              <div>
                <p className=" text-gray-600">Tujuan Barang</p>
                <p className="font-bold text-lg">{historyData?.destination}</p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <p className=" text-gray-600">Nama barang</p>
          <p className="font-bold text-lg">{historyData?.itemName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className=" text-gray-600">Jumlah barang awal</p>
            <p className="font-bold text-lg">{`${historyData?.quantityBefore}`}</p>
          </div>
          <div>
            <p className=" text-gray-600">Jumlah barang akhir</p>
            <p className="font-bold text-lg">{`${historyData?.quantityAfter}`}</p>
          </div>
        </div>

        <div>
          <p className=" text-gray-600">Diperbaharui oleh</p>
          <p className="font-bold text-lg">{historyData?.updatedBy}</p>
        </div>
      </div>
    </div>
  );
}
