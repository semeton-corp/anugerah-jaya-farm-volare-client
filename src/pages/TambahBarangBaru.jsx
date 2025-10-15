import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCage } from "../services/cages";
import { inputTelur } from "../services/eggs";
import { getEggMonitoringById } from "../services/eggs";
import { useParams } from "react-router-dom";
import { updateEggMonitoring } from "../services/eggs";
import {
  getWarehouseItemById,
  getWarehouses,
  updateWarehouseItem,
} from "../services/warehouses";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { createWarehouseItems } from "../services/warehouses";
import { createItem, getItemById, updateItem } from "../services/item";

const TambahBarangBaru = () => {
  const [cages, setCages] = useState([]);
  const [selectedCage, setSelectedCage] = useState(0);

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(0);

  const [name, setName] = useState("");
  const [category, setCategory] = useState([
    "Barang",
    "Bahan Baku Adukan",
    "Bahan Baku Adukan - Jagung",
    "Pakan Jadi",
  ]);
  const [selectedCategory, setSelectedCategory] = useState(category[0]);
  const [unit, setUnit] = useState("");
  const [dailySpending, setDailySpending] = useState("");

  const navigate = useNavigate();

  const { id } = useParams();

  const fetchWarehouses = async () => {
    try {
      const response = await getWarehouses();
      if (response.status == 200) {
        setWarehouses(response.data.data);
        // console.log("list warehouse: ", response.data.data);

        setSelectedWarehouse(response.data.data[0].id);
        // console.log("selected warehouse: ", response.data.data[0].id);
      }
    } catch (error) {
      console.error("Gagal memuat data gudang:", error);
    }
  };

  const fetchWarehouseItembyId = async (id) => {
    try {
      const detailResponse = await getItemById(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status == 200) {
        setName(detailResponse.data.data.name);
        setSelectedCategory(detailResponse.data.data.category);
        setUnit(detailResponse.data.data.unit);
        setDailySpending(detailResponse.data.data.dailySpending);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    if (id) {
      fetchWarehouseItembyId(id);
    }
  }, []);

  const handleSubmit = async () => {
    const payload = {
      name: name,
      unit: unit,
      category: selectedCategory,
      dailySpending: parseInt(dailySpending),
    };

    if (id) {
      try {
        const updateResponse = await updateItem(payload, id);
        console.log("updateResponse: ", updateResponse);
        if (updateResponse.status == 200) {
          navigate(-1, { state: { refecth: true } });
        }
      } catch (error) {
        alert("❌ Gagal memperbaharui barang baru! ", error);
        console.log("error :", error);
      }
    } else {
      try {
        const createResponse = await createItem(payload);
        // console.log("createResponse: ", createResponse);
        if (createResponse.status == 201) {
          navigate(-1, { state: { refecth: true } });
        }
      } catch (error) {
        alert("❌ Gagal menambahkan barang baru! ", error);
        console.log("error :", error);
      }
    }
  };

  const getDisplayValue = (val) => (val === 0 ? "" : val);

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <h1 className="text-3xl font-bold">
        {id ? "Edit Detail Barang" : "Tambah Barang Baru"}
      </h1>

      <div className="w-full mx-auto p-6 bg-white shadow rounded border">
        <h2 className="text-lg font-semibold mb-1">Input data barang</h2>
        {id ? <></> : <p className="text-sm mb-6">{getTodayDateInBahasa()}</p>}

        {/* nama barang */}
        <label className="block font-medium mb-1">Nama Barang</label>
        <input
          type="text"
          className="w-full border rounded p-2 mb-6 bg-black-4"
          placeholder="Masukkan nama barang"
          value={getDisplayValue(name)}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Pilih kategori */}
        <label className="block font-medium mb-1">Kategori</label>
        <select
          className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-6"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
          }}
        >
          {category.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className="gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">Satuan Barang</label>
            <input
              type="text"
              className="w-full border rounded p-2 bg-black-4"
              placeholder="Masukkan satuan barang..."
              value={getDisplayValue(unit)}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 mb-6 gap-4">
          <div>
            <label className="block font-medium mb-1">
              Jumlah Penggunaan Harian
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                className="w-full border rounded p-2 bg-black-4"
                placeholder="Tulis jumlah penggunaan harian (cth : Karung)"
                value={getDisplayValue(dailySpending)}
                onChange={(e) => setDailySpending(e.target.value)}
              />
              <p className="text-lg font-bold">{unit ?? "-"}</p>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1"></label>
          </div>
        </div>

        {/* {selectedCategory == "Bahan Baku Adukan - Jagung" && (
          <div className="grid grid-cols-2 mb-6 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Kapasitas Maksimum Gudang
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  className="w-full border rounded p-2 bg-black-4"
                  placeholder="Tuliskan kapasitas maksimum jagung yang bisa disimpan"
                  value={getDisplayValue(unit)}
                  onChange={(e) => setUnit(e.target.value)}
                />
                <p className="text-lg font-bold">-</p>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1"></label>
            </div>
          </div>
        )} */}

        <div className="mt-6 text-right">
          <button
            onClick={() => {
              handleSubmit();
              console.log("selectedCage: ", selectedCage);
            }}
            className="bg-green-700 text-white py-2 px-6 rounded hover:bg-green-900 cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
      {/* <button
        onClick={() => {
          console.log("name: ", name);
          console.log("category: ", category);
          console.log("unit: ", unit);
        }}
      >
        Check
      </button> */}
    </div>
  );
};

export default TambahBarangBaru;
