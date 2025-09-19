import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocations } from "../services/location";
import { createStore, getStoreDetail, updateStore } from "../services/stores";

const TambahToko = () => {
  const navigate = useNavigate();

  const [namaToko, setNamaToko] = useState("");
  const [lokasi, setLokasi] = useState("");

  const [locationOptions, setLocationOptions] = useState([]);

  const { id } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaToko || !lokasi) {
      alert("❌ Mohon masukkan semua data toko dengan benar!");
      return;
    }

    const payload = {
      name: namaToko,
      locationId: parseInt(lokasi),
    };
    // console.log("payload: ", payload);
    if (id) {
      try {
        const updateResponse = await updateStore(payload, id);
        // console.log("updateResponse: ", updateResponse);
        if (updateResponse.status === 200) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    } else {
      try {
        const createResponse = await createStore(payload);
        // console.log("createResponse: ", createResponse);
        if (createResponse.status === 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
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

  const fetchTokoDetail = async () => {
    try {
      const res = await getStoreDetail(id);
      console.log("res: ", res);
      if (res.status === 200) {
        setNamaToko(res.data.data.name);
        setLokasi(res.data.data.location.id);

        // setToko(res.data.data);
        // setEmployees(res.data.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocationOptions();
    if (id) {
      fetchTokoDetail();
    }
  }, []);

  return (
    <div className="p-6">
      <div className="border rounded p-6 mx-auto">
        <h1 className="text-xl font-bold mb-6">
          {id ? "Edit Toko" : "Tambah Toko"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nama toko */}
          <div>
            <label className="block mb-1 font-medium">Nama Toko</label>
            <input
              type="text"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              placeholder="Tuliskan nama kandang"
              className="w-full p-2 border rounded bg-gray-100"
              required
            />
          </div>

          {/* Lokasi toko */}
          <div>
            <label className="block mb-1 font-medium">Lokasi Toko</label>
            <select
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100"
              required
            >
              <option value="" disabled>
                Pilih site lokasi kandang
              </option>
              {locationOptions.map((lokasi, index) => (
                <option key={index} value={lokasi.id}>
                  {lokasi.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit button */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahToko;
