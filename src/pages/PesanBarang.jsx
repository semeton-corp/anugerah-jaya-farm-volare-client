import React, { useState } from "react";
import { useEffect } from "react";
import { MdEgg } from "react-icons/md";
import {
  getEggWarehouseItemSummary,
  getWarehouses,
  getWarehousesByLocation,
} from "../services/warehouses";
import { getItems } from "../services/item";
import { createStoreRequestItem, getStores } from "../services/stores";
import { formatDate, formatDateToDDMMYYYY } from "../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { getCurrentUserStorePlacement } from "../services/placement";

const PesanBarang = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [stok, setStok] = useState([]);

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(0);

  const [selectedWarehouseItem, setSelectedWarehouseItem] = useState(0);

  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [jumlah, setJumlah] = useState("");
  const [tanggal] = useState("20 Maret 2025");

  const barang = {
    nama: "Telur OK",
    satuan: "Ikat",
    stok: "-",
  };

  const handlePesan = async () => {
    if (!selectedWarehouse || !jumlah) {
      alert("Harap lengkapi form pemesanan.");
      return;
    }

    const payload = {
      itemId: selectedWarehouseItem.id,
      warehouseId: parseInt(selectedWarehouse),
      quantity: parseInt(jumlah),
      storeId: parseInt(selectedStore),
    };
    try {
      const pesanResponse = await createStoreRequestItem(payload);
      console.log("pesanResponse: ", pesanResponse);
      if (pesanResponse.status == 201) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      if (
        error.response.data.message == "insuficcient stock for request item"
      ) {
        alert("❌ Stok gudang tidak memadai untuk melakukan pesanan");
      }
      console.log("error :", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const warehousesReponse = await getWarehousesByLocation(selectedSite);
      // console.log("warehousesReponse: ", warehousesReponse);
      if (warehousesReponse.status == 200) {
        setWarehouses(warehousesReponse.data.data);
        setSelectedWarehouse(warehousesReponse.data.data[0].id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchWarehouseItem = async () => {
    try {
      const itemsReponse = await getItems();
      console.log("itemsReponse: ", itemsReponse);
      if (itemsReponse.status == 200) {
        const selectedItem = itemsReponse.data.data.find(
          (item) => item.name == "Telur OK"
        );
        // console.log("selectedItem: ", selectedItem);
        setSelectedWarehouseItem(selectedItem);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchStok = async () => {
    const date = formatDateToDDMMYYYY(formatDate(new Date()));
    // console.log("date: ", date);
    try {
      const stokResponse = await getEggWarehouseItemSummary(
        selectedWarehouse,
        date
      );
      // console.log("stokResponse: ", stokResponse);
      if (stokResponse.status == 200) {
        const selectedStok = stokResponse.data.data.find(
          (item) => item.name == "Telur OK" && item.unit == "Ikat"
        );
        // console.log("stok: ", stok);
        setStok(selectedStok);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchAllStores = async () => {
    try {
      console.log("selectedSite: ", selectedSite);
      const response = await getStores(selectedSite);
      if (response.status == 200) {
        setStores(response.data.data);
        setSelectedStore(response.data.data[0].id);
      }
    } catch (error) {
      alert("Gagal memuat data toko: ", error);
      console.log("error: ", error);
    }
  };

  const fetchPlacement = async () => {
    try {
      const placementResponse = await getCurrentUserStorePlacement();
      if (placementResponse.status == 200) {
        setSelectedStore(placementResponse.data.data[0].store.id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchWarehouseItem();
    if (userRole == "Owner") {
      fetchAllStores();
    } else {
      fetchPlacement();
    }
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchStok();
    }
  }, [selectedWarehouse]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pesan Barang</h1>

      <p className="text-lg font-semibold">
        Stok Tersedia di{" "}
        <span className="text-red-600 font-semibold">
          (Pilih Gudang terlebih dahulu)
        </span>
        :
      </p>

      {/* Kartu Barang */}
      <div className="p-4 max-w-sm rounded-md border-2 border-black-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Telur OK Ikat</h2>
          <div className="p-2 rounded-xl bg-green-700">
            <MdEgg size={24} color="white" />
          </div>
        </div>

        <div className=" justify-center gap-4">
          <div className="flex justify-center flex-wrap gap-4">
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-3xl font-bold text-center">
                {stok.quantity ? parseInt(stok.quantity) : "-"}
              </p>
              <p className="text-xl text-center">Ikat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded p-4 w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Input Pemesanan Barang</h2>
          <p className="text-sm">{tanggal}</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Gudang Pemesanan</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full border bg-gray-100 p-2 rounded"
          >
            <option value="">Pilih gudang tempat pemesanan</option>
            {warehouses?.map((warehouse, index) => (
              <option key={index} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        {userRole == "Owner" && (
          <div>
            <label className="block text-sm mb-1">Toko Pemesan</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full border bg-gray-100 p-2 rounded"
            >
              <option value="">Pilih toko pemesan</option>
              {stores?.map((store, index) => (
                <option key={index} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Nama Barang</label>
          <input
            type="text"
            disabled
            value={selectedWarehouseItem.name}
            className="w-full border bg-gray-100 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Jumlah Pemesanan</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Masukkan jumlah barang..."
              className="w-full max-w-sm border bg-gray-100 p-2 rounded"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
            />
            <span className="font-semibold">{barang.satuan}</span>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={handlePesan}
            className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded cursor-pointer"
          >
            Pesan Barang
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          const payload = {
            itemId: selectedWarehouseItem.id,
            warehouseId: parseInt(selectedWarehouse),
            quantity: parseInt(jumlah),
          };

          console.log("payload: ", payload);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default PesanBarang;
