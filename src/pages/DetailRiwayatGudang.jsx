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
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Detail Riwayat</h1>

      <div className="border rounded p-4 sm:p-6 bg-white">
        <div className="mb-6">
          <label className="block font-medium mb-1 text-sm sm:text-base">
            Status
          </label>
          <span
            className={`inline-block px-3 py-1 rounded text-xs sm:text-sm font-semibold ${
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm sm:text-base">Waktu :</p>
            <p className="font-bold text-base sm:text-lg">
              {historyData?.time}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm sm:text-base">Tanggal :</p>
            <p className="font-bold text-base sm:text-lg">
              {historyData?.date}
            </p>
          </div>
        </div>

        {status === "Stok diperbaharui" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm sm:text-base">
                Tempat Barang
              </p>
              <p className="font-bold text-base sm:text-lg">
                Gudang Pusat (DUMMY)
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Asal Barang</p>
              <p className="font-bold text-base sm:text-lg">
                {historyData?.source}
              </p>
            </div>
            {historyData?.destination != "-" && (
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Tujuan Barang
                </p>
                <p className="font-bold text-base sm:text-lg">
                  {historyData?.destination}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600 text-sm sm:text-base">Nama Barang</p>
          <p className="font-bold text-base sm:text-lg">
            {historyData?.itemName}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm sm:text-base">
              Jumlah Barang Awal
            </p>
            <p className="font-bold text-base sm:text-lg">{`${historyData?.quantityBefore} ${historyData?.itemUnit}`}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm sm:text-base">
              Jumlah Barang Akhir
            </p>
            <p className="font-bold text-base sm:text-lg">{`${historyData?.quantityAfter} ${historyData?.itemUnit}`}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-sm sm:text-base">
            Diperbaharui oleh
          </p>
          <p className="font-bold text-base sm:text-lg">
            {historyData?.updatedBy}
          </p>
        </div>
      </div>
    </div>
  );
}
