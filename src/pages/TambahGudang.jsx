import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocations } from "../services/location";
import {
  createWarehouses,
  getWarehousesDetail,
  updateWarehouseItem,
  updateWarehouses,
} from "../services/warehouses";

const TambahGudang = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [namaGudang, setNamaGudang] = useState("");
  const [lokasiGudang, setLokasiGudang] = useState("");
  const [maxCornCapacity, setMaxCornCapacity] = useState("");

  const [locationOptions, setLocationOptions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaGudang || !lokasiGudang || !maxCornCapacity) {
      alert("❌ Mohon masukkan semua data gudang dengan benar!");
      return;
    }

    const data = {
      name: namaGudang,
      locationId: parseInt(lokasiGudang),
      cornCapacity: parseInt(maxCornCapacity),
    };

    if (id) {
      try {
        const updateResponse = await updateWarehouses(data, id);
        // console.log("updateResponse: ", updateResponse);
        if (updateResponse.status === 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    } else {
      try {
        const createResponse = await createWarehouses(data);
        //   console.log("createResponse: ", createResponse);
        if (createResponse.status === 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    }

    console.log("Gudang data:", data);

    // TODO: send data to backend here
  };

  const fetchDetailData = async () => {
    try {
      const detailResponse = await getWarehousesDetail(id);
      //   console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        // SetGudang(detailResponse.data.data);3
        setNamaGudang(detailResponse.data.data.name);
        setLokasiGudang(detailResponse.data.data.location.id);

        // console.log("detailResponse.data.data: ", detailResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchLocationOptions = async () => {
    try {
      const locationsResponse = await getLocations();
      //   console.log("locationsResponse: ", locationsResponse);

      if (locationsResponse.status === 200) {
        const allLocations = locationsResponse.data.data;
        const role = localStorage.getItem("role");
        const locationId = parseInt(localStorage.getItem("locationId"), 10);

        if (role !== "Owner") {
          const filteredLocations = allLocations.filter(
            (item) => item.id === locationId
          );
          setLocationOptions(filteredLocations);
        } else {
          setLocationOptions(allLocations);
        }
      }
    } catch (error) {
      alert("Terjadi Kesalahan :", error);
    }
  };

  useEffect(() => {
    fetchLocationOptions();

    if (id) {
      fetchDetailData();
    }
  }, []);

  return (
    <div className="mx-6 mt-10 p-6 bg-white rounded border">
      <h1 className="text-xl font-bold mb-6">
        {id ? "Edit Toko" : "Tambah Gudang"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Gudang */}
        <div>
          <label className="block font-medium mb-1">Nama Gudang</label>
          <input
            type="text"
            value={namaGudang}
            onChange={(e) => setNamaGudang(e.target.value)}
            placeholder="Tuliskan nama gudang"
            className="w-full border rounded px-3 py-2 bg-gray-100 focus:outline-none focus:ring"
            required
          />
        </div>

        {/* Lokasi Gudang */}
        <div>
          <label className="block font-medium mb-1">Lokasi Gudang</label>
          <select
            value={lokasiGudang}
            onChange={(e) => setLokasiGudang(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-gray-100 focus:outline-none focus:ring"
            required
          >
            <option value="">Pilih site lokasi gudang</option>
            {locationOptions.map((lokasi, idx) => (
              <option key={idx} value={lokasi.id}>
                {lokasi.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Kapasitas Maksimum Jagung (Kg)
          </label>
          <input
            type="number"
            value={maxCornCapacity}
            onChange={(e) => setMaxCornCapacity(e.target.value)}
            placeholder="Masukkan jumlah maksimal jagung..."
            className="w-full border rounded px-3 py-2 bg-gray-100 focus:outline-none focus:ring"
            required
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </form>
      {/* <button
        onClick={() => {
          console.log("namaGudang: ", namaGudang);
          console.log("lokasiGudang: ", lokasiGudang);
        }}
      >
        Check
      </button> */}
    </div>
  );
};

export default TambahGudang;
