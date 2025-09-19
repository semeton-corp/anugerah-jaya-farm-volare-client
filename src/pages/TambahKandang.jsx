import React, { useState } from "react";
import { useEffect } from "react";
import { getLocations } from "../services/location";
import { createCage } from "../services/cages";
import { useNavigate } from "react-router-dom";

const TambahKandang = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    locationId: "",
    chickenCategory: "",
    capacity: "",
  });

  const [lokasiOptions, setLocationOptions] = useState([
    "Site A",
    "Site B",
    "Site C",
  ]);
  const jenisOptions = ["DOC", "Grower", "Pre Layer", "Layer", "Afkir"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert locationId and capacity to integers
    const newValue =
      name === "locationId" || name === "capacity"
        ? parseInt(value, 10) || 0
        : value;

    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.locationId ||
      !form.chickenCategory ||
      !form.capacity
    ) {
      alert("❌ Mohon masukkan semua data kandang dengan benar!");
      return;
    }
    // console.log("Data disimpan:", form);

    try {
      const createResponse = await createCage(form);
      // console.log("form: ", form);
      // console.log("createResponse: ", createResponse);

      if (createResponse.status === 201) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchLocationOptions = async () => {
    try {
      const locationsResponse = await getLocations();
      // console.log("locationsResponse: ", locationsResponse);

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
  }, []);

  return (
    <div className="mx-auto m-8 p-8 border rounded rounderd-[4px] shadow bg-white">
      <h2 className="text-xl font-bold mb-6">Tambah Kandang</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nama Kandang</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tuliskan nama kandang"
            className="w-full border rounded px-4 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Lokasi Kandang</label>
          <select
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 bg-gray-100"
          >
            <option value="">Pilih site lokasi kandang</option>
            {lokasiOptions.map((option, index) => (
              <option key={index} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Jenis Kandang</label>
          <select
            name="chickenCategory"
            value={form.chickenCategory}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 bg-gray-100"
          >
            <option value="">Pilih jenis kandang</option>
            {jenisOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Kapasitas Maksimum Kandang (Ekor)
          </label>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            placeholder="Masukkan jumlah kapasitas maksimum kandang"
            className="w-full border rounded px-4 py-2 bg-gray-100"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-900 hover:cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </form>
      <button
        onClick={() => {
          console.log("form: ", form);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default TambahKandang;
