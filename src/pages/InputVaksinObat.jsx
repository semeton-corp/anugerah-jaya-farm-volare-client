import React, { useEffect } from "react";
import { useState } from "react";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createChickenHealthMonitoring,
  getChickenHealthItems,
  getChickenHealthMonitoringById,
  getChickenHealthMonitoringsDetails,
  updateChickenHealthMonitoring,
} from "../services/chickenMonitorings";

const InputVaksinObat = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { id, monitoringId } = useParams();

  const [jenis, setJenis] = useState("");
  const [nama, setNama] = useState("");
  const [dosis, setDosis] = useState("");
  const [satuan, setSatuan] = useState("");
  const [penyakit, setPenyakit] = useState("");

  const [chickenCage, setChickenCage] = useState();

  // Sample options
  const jenisOptions = ["Vaksin Rutin", "Vaksin Kondisional", "Obat"];
  const [namaOptions, setNamaOptions] = useState([
    "Vaksin DOC",
    "Obat A",
    "Vaksin B",
  ]);
  const satuanOptions = ["mililiter", "liter", "gram", "kilogram"];

  const handleSubmit = async () => {
    const payload = {
      type: jenis,
      healthItemName: nama,
      dose: parseFloat(dosis),
      unit: satuan,
      chickenCageId: parseInt(id),
      disease: penyakit,
    };

    // console.log("payload: ", payload);
    // console.log("Payload to submit:", payload);
    // alert("Data berhasil disiapkan!");

    if (monitoringId) {
      updateChickenHealthMonitoring;
      try {
        const updateResponse = await updateChickenHealthMonitoring(
          payload,
          monitoringId
        );

        if (updateResponse.status === 200) {
          navigate(-1, { state: { refetch: true } });
        }

        // console.log("updateResponse: ", updateResponse);
      } catch (error) {
        const apiMessage = error?.response?.data?.message;

        if (
          apiMessage === "disease is required, since you choose medicine type"
        ) {
          alert("Data penyakit wajib diisi jika jenis item adalah obat");
        } else {
          alert(apiMessage || "Terjadi kesalahan");
        }
      }
    } else {
      try {
        const createResponse = await createChickenHealthMonitoring(payload);
        // console.log("createResponse: ", createResponse);
        if (createResponse.status === 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        const apiMessage = error?.response?.data?.message;

        if (
          apiMessage === "disease is required, since you choose medicine type"
        ) {
          alert("Data penyakit wajib diisi jika jenis item adalah obat");
        } else {
          alert(apiMessage || "Terjadi kesalahan");
        }
      }
    }
  };

  const fetchDetailVaksinObat = async () => {
    try {
      const detailResponse = await getChickenHealthMonitoringsDetails(id);
      // console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        setChickenCage(detailResponse.data.data.chickenCage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchMonitoringDetail = async () => {
    try {
      const monitoringResponse = await getChickenHealthMonitoringById(
        monitoringId
      );
      console.log("monitoringResponse: ", monitoringResponse);
      if (monitoringResponse.status === 200) {
        setNama(monitoringResponse.data.data.healthItemName);
        setDosis(monitoringResponse.data.data.dose);
        setJenis(monitoringResponse.data.data.type);
        setPenyakit(monitoringResponse.data.data.disease);
        setSatuan(monitoringResponse.data.data.unit);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchChickenHealthItems = async () => {
    try {
      const healthResponse = await getChickenHealthItems();
      // console.log("healthResponse: ", healthResponse);
      if (healthResponse.status === 200) {
        const namaOptions = healthResponse.data.data.map((item) => item.name);
        // console.log("namaOptions: ", namaOptions);
        setNamaOptions(namaOptions);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDetailVaksinObat();
    fetchChickenHealthItems();
    if (monitoringId) {
      fetchMonitoringDetail();
    }
  }, []);

  return (
    <div className="border border-black-6 rounded p-8 m-4 bg-white w-full  mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Input data vaksin / obat
        </h2>
        <p className="text-sm sm:text-base font-medium text-gray-500">
          {getTodayDateInBahasa()}
        </p>
      </div>

      {/* Informasi Ayam */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm md:text-base">
        <div>
          <p className="text-gray-600">ID Ayam</p>
          <p className="text-lg font-bold">{chickenCage?.batchId}</p>
        </div>
        <div>
          <p className="text-gray-600">Kategori ayam</p>
          <p className="text-lg font-bold">{chickenCage?.chickenCategory}</p>
        </div>
        <div>
          <p className="text-gray-600">Usia ayam</p>
          <p className="text-lg font-bold">{chickenCage?.chickenAge}</p>
        </div>
        <div className="col-span-3">
          <p className="text-gray-600">Jumlah ayam hidup</p>
          <p className="text-lg font-bold ">{chickenCage?.totalChicken} Ekor</p>
        </div>
      </div>

      {/* Form */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Jenis</label>
        <select
          className="w-full bg-gray-100 p-2 rounded border"
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
        >
          <option value="" disabled>
            Pilih jenis vaksin/obat
          </option>
          {jenisOptions.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Nama vaksin / obat</label>
        <input
          list="vaksinList"
          className="w-full bg-gray-100 p-2 rounded border"
          placeholder="Pilih atau tuliskan nama vaksin / obat yang digunakan"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <datalist id="vaksinList">
          {namaOptions.map((opt, index) => (
            <option key={index} value={opt} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Input dosis</label>
          <input
            type="number"
            className="w-full bg-gray-100 p-2 rounded border"
            placeholder="Masukkan jumlah dosis yang digunakan"
            value={dosis}
            onChange={(e) => setDosis(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Satuan dosis</label>
          <select
            className="w-full bg-gray-100 p-2 rounded border"
            value={satuan}
            onChange={(e) => setSatuan(e.target.value)}
          >
            <option value="" disabled>
              Pilih satuan jumlah dosis
            </option>
            {satuanOptions.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Penyakit</label>
        <input
          type="text"
          className="w-full bg-gray-100 p-2 rounded border"
          placeholder="Kosongkan bila tidak ada penyakit / hanya melakukan vaksin"
          value={penyakit}
          onChange={(e) => setPenyakit(e.target.value)}
        />
      </div>

      {/* Simpan */}
      <div className="text-right">
        <button
          className="bg-green-700 hover:bg-green-900 text-white py-2 px-6 rounded cursor-pointer"
          onClick={handleSubmit}
        >
          Simpan
        </button>
      </div>
    </div>
  );
};

export default InputVaksinObat;
