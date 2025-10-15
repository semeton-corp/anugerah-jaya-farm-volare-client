import React, { useState, useEffect } from "react";
import {
  createChickenHealthItem,
  getChickenHealthItemById,
  updateChickenHealthItem,
} from "../services/chickenMonitorings";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const TambahVaksinObat = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { id } = useParams();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [chickenAge, setChickenAge] = useState("");
  const [chickenCategory, setChickenCategory] = useState(null);
  const [note, setNote] = useState("");

  const kategoriVaksinList = ["Vaksin Rutin", "Vaksin Kondisional", "Obat"];

  useEffect(() => {
    const age = parseInt(chickenAge);
    if (!chickenAge || isNaN(age)) {
      setChickenCategory(null);
      return;
    }
    if (age >= 0 && age <= 9) {
      setChickenCategory("DOC");
    } else if (age >= 10 && age <= 15) {
      setChickenCategory("Grower");
    } else if (age >= 16 && age <= 17) {
      setChickenCategory("Pre-Layer");
    } else if (age >= 18) {
      setChickenCategory("Layer");
    } else {
      setChickenCategory(null);
    }
  }, [chickenAge]);

  const fetchDetailData = async () => {
    try {
      const detailResponse = await getChickenHealthItemById(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        // setDetailData(detailResponse.data.data);
        setName(detailResponse.data.data.name);
        setType(detailResponse.data.data.type);
        setChickenAge(detailResponse.data.data.chickenAge || "");
        setChickenCategory(detailResponse.data.data.chickenCategory || null);
        setNote(detailResponse.data.data.note || "");
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDetailData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      type,
      chickenAge: chickenAge ? parseInt(chickenAge) : null,
      chickenCategory,
      note,
    };
    if (id) {
      try {
        const updateResponse = await updateChickenHealthItem(data, id);
        console.log("updateResponse: ", updateResponse);

        if (updateResponse.status === 200) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    } else {
      try {
        const createResponse = await createChickenHealthItem(data);
        console.log("createResponse: ", createResponse);

        if (createResponse.status === 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    }

    console.log("Form data:", data);
  };

  return (
    <div className="mt-8 px-4 sm:px-8">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Tambah Vaksin / Obat
      </h1>

      {/* Form Container */}
      <div className="mx-auto w-full  bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Nama vaksin / obat
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama vaksin / obat"
              className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Kategori vaksin
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih kategori…</option>
              {kategoriVaksinList.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Chicken Age */}
          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Usia ayam
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                value={chickenAge}
                onChange={(e) => setChickenAge(e.target.value)}
                placeholder="Masukkan usia ayam"
                className="w-1/3 sm:w-1/5 border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="font-semibold text-sm sm:text-base">Minggu</span>
            </div>
          </div>

          {/* Chicken Category */}
          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Kategori ayam
            </label>
            <div className="py-2 text-base sm:text-lg font-semibold text-gray-700">
              {chickenCategory || "-"}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Catatan
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan catatan untuk vaksin (*opsional)"
              className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-green-700 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-900 transition-colors cursor-pointer text-sm sm:text-base"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahVaksinObat;
