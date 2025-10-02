import React, { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getChickenCage } from "../services/cages";
import { createAfkirChickenDraft } from "../services/chickenMonitorings";

const kandangList = [
  { id: 1, name: "Sidodadi 04", jumlah: 4000, umur: 30 },
  { id: 2, name: "Sidodadi 05", jumlah: 3200, umur: 28 },
];

const InputDraftPenjualanAyam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [chickenCages, setCages] = useState();
  const [selectedChickenCage, setSelectedChickenCage] = useState(null);
  const [totalSellChicken, setJumlahTerjual] = useState("");
  const [pricePerChicken, setHargaPerEkor] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);

  const [selectedCustomer, setSelectedCustomer] = useState();

  const detailPages = ["pilih-pembeli-ayam"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const pilihPembeliAyamHandle = () => {
    navigate(`${location.pathname}/pilih-pembeli-ayam`);
  };

  const clearCustomer = () => {
    setSelectedCustomer();
  };

  const fetchCages = async () => {
    try {
      const cagesResponse = await getChickenCage();
      // console.log("cagesResponse: ", cagesResponse);
      if (cagesResponse.status == 200) {
        const cagesData = cagesResponse.data.data;
        const filteredCages = cagesData.filter((cage) => cage.batchId != "");
        console.log("filteredCages: ", filteredCages);
        setCages(filteredCages);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedChickenCage ||
      !selectedCustomer ||
      !totalSellChicken ||
      !pricePerChicken
    ) {
      alert("❌ Mohon isi semua field dengan benar!");
      return;
    }

    try {
      const payload = {
        chickenCageId: selectedChickenCage.id,
        afkirChickenCustomerId: selectedCustomer.id,
        totalSellChicken: parseInt(totalSellChicken),
        pricePerChicken: pricePerChicken,
      };
      console.log("payload: ", payload);
      const submitResponse = await createAfkirChickenDraft(payload);
      console.log("submitResponse: ", submitResponse);

      if (submitResponse.status == 201) {
        const newPath = location.pathname.replace(
          "/input-draft-penjualan-ayam",
          ""
        );
        navigate(newPath, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    const total =
      parseInt(totalSellChicken || 0) * parseInt(pricePerChicken || 0);
    setTotalHarga(total);
  }, [totalSellChicken, pricePerChicken]);

  useEffect(() => {
    fetchCages();
    const picked = location?.state?.selectedCustomer;
    console.log("picked: ", picked);
    if (picked) {
      setSelectedCustomer(picked);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tambah Draft Penjualan Ayam</h2>

      <div className="bg-white border rounded p-6 space-y-6">
        {/* Tanggal Input */}
        <div>
          <p className="text-sm text-gray-600">Tanggal Input</p>
          <p className="font-semibold">20 Maret 2025</p>
        </div>

        {/* Info Kandang */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Kandang</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={selectedChickenCage?.id || ""}
              onChange={(e) => {
                const kandang = chickenCages.find(
                  (chickenCage) => chickenCage.id === parseInt(e.target.value)
                );
                setSelectedChickenCage(kandang);
              }}
            >
              <option value="" disabled>
                Pilih Kandang
              </option>
              {chickenCages?.map((chickenCage) => (
                <option key={chickenCage.id} value={chickenCage.id}>
                  {chickenCage.cage.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Total Jumlah Ayam di Kandang
            </label>
            <p className="font-bold">
              {selectedChickenCage ? selectedChickenCage.totalChicken : "-"}{" "}
              Ekor
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Umur Ayam
            </label>
            <p className="font-bold">
              {selectedChickenCage ? selectedChickenCage.chickenAge : "-"}{" "}
              Minggu
            </p>
          </div>
        </div>

        {/* Pilih Pelanggan */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Pelanggan</label>
          {!selectedCustomer ? (
            <button
              onClick={() =>
                navigate(`${location.pathname}/pilih-pembeli-ayam`)
              }
              className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black cursor-pointer"
            >
              Pilih Pelanggan
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={selectedCustomer?.name ?? ""}
                className="flex-1 border rounded px-3 py-2 bg-gray-100 text-sm w-full"
              />
              <button
                onClick={clearCustomer}
                className="border rounded p-2 hover:bg-gray-100"
                title="Hapus"
              >
                <MdDelete size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Jumlah Ayam */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Jumlah Ayam Terjual
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={totalSellChicken}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value <= (selectedChickenCage?.totalChicken || 0)) {
                    setJumlahTerjual(value);
                  } else {
                    setJumlahTerjual(selectedChickenCage?.totalChicken || 0);
                  }
                }}
                placeholder="Masukkan jumlah ayam yang akan dijual"
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
              <span className="ml-2">Ekor</span>
            </div>
          </div>
        </div>

        {/* Harga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Harga Jual / Ekor
            </label>
            <div className="flex items-center">
              <span className="mr-2">Rp</span>
              <input
                type="number"
                value={pricePerChicken}
                onChange={(e) => setHargaPerEkor(e.target.value)}
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Harga Jual Total
            </label>
            <div className="h-[42px] flex items-center font-bold">
              Rp {totalHarga.toLocaleString("id-ID") || "-"}
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-900"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputDraftPenjualanAyam;
