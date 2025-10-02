import React, { useState } from "react";
import { GoAlertFill } from "react-icons/go";
import PindahAyamModal from "../components/PindahAyamModal";
import { getChickenCage, moveChickenCage } from "../services/cages";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PindahAyam = () => {
  const navigate = useNavigate();

  const [kandangOptions, setKandangOptions] = useState([]);
  const [asal, setAsal] = useState(null);
  const [tujuan, setTujuan] = useState([]);
  const [jumlahDipindah, setJumlahDipindah] = useState("");
  const [showAsalModal, setShowAsalModal] = useState(false);
  const [showTujuanModal, setShowTujuanModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPindahModal, setShowPindahModal] = useState(false);

  const sisaAyam = asal
    ? jumlahDipindah -
      tujuan.reduce((sum, t) => sum + parseInt(t.jumlahAlokasi || 0), 0)
    : 0;

  const handlePilihAsal = (kandang) => {
    setAsal(kandang);
    setShowAsalModal(false);
  };

  const handlePilihTujuan = (kandang) => {
    if (!asal) return;
    setTujuan((prev) => [
      ...prev,
      {
        ...kandang,
        jumlah: Math.min(sisaAyam, kandang.kapasitas),
        jumlahAlokasi: "",
      },
    ]);
    setShowTujuanModal(false);
  };

  const handleUlang = (type, index) => {
    if (type === "asal") {
      setAsal(null);
      setJumlahDipindah("");
      setTujuan([]);
    } else {
      setTujuan((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleJumlahAlokasiChange = (index, value) => {
    setTujuan((prev) => {
      const updated = [...prev];
      updated[index].jumlahAlokasi = parseInt(value);
      return updated;
    });
  };

  const handleConfirmPindah = async () => {
    // console.log("Ayam dipindahkan!");
    const payload = {
      sourceCageId: asal.cage.id,
      destinationChickenCages: tujuan.map((chickenCage) => ({
        destinationCageId: chickenCage.cage.id,
        totalChicken: chickenCage.jumlahAlokasi,
      })),
    };
    try {
      const submitResponse = await moveChickenCage(payload);
      console.log("submitResponse: ", submitResponse);
      if (submitResponse.status == 200) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
    setShowPindahModal(false);
  };

  const tujuanOptions = kandangOptions.filter(
    (kandang) =>
      (!asal || kandang.cage.name !== asal.cage.name) &&
      (!asal || kandang.cage.location.id === asal.cage.location.id) &&
      !tujuan.some((tujuan) => tujuan.cage.name === kandang.cage.name)
  );

  const fetchChickenCages = async () => {
    try {
      const fetchResponse = await getChickenCage();
      console.log("fetchResponse: ", fetchResponse);
      if (fetchResponse.status == 200) {
        setKandangOptions(fetchResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchChickenCages();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Pindah Ayam</h2>
      <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-x-4">
        {/* Kandang Asal */}
        <div className="w-full lg:w-1/2 p-4 border rounded space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Kandang Asal</h3>
            {asal && (
              <button
                className="bg-orange-300 hover:bg-orange-500 cursor-pointer text-black text-base px-3 py-1 rounded"
                onClick={() => handleUlang("asal")}
              >
                Pilih Ulang
              </button>
            )}
          </div>
          {!asal ? (
            <button
              className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded w-full"
              onClick={() => setShowAsalModal(true)}
            >
              Pilih Kandang
            </button>
          ) : (
            <div className="space-y-2 mt-4">
              <div className="flex flex-col gap-1">
                <p>Nama Kandang: </p>
                <p className="text-lg font-bold">{asal.cage.name} </p>
              </div>
              <div className="flex flex-col gap-1">
                <p>Jumlah ayam dalam kandang: </p>
                <p className="text-lg font-bold">{asal.totalChicken} Ekor </p>
              </div>
              <div className="flex flex-col gap-1">
                <p>Ayam yang akan dipindah: </p>
                <input
                  type="number"
                  className="border px-2 py-1 w-full"
                  placeholder="Ayam yang akan dipindah"
                  min={1}
                  max={asal?.totalChicken || 0}
                  value={jumlahDipindah}
                  onChange={(e) => {
                    let value =
                      e.target.value === "" ? "" : parseInt(e.target.value);
                    if (value !== "" && value > asal.totalChicken)
                      value = asal.totalChicken;
                    if (value !== "" && value < 0) value = 0;
                    setJumlahDipindah(value);
                    setTujuan([]);
                  }}
                />
              </div>

              {sisaAyam !== 0 && (
                <p className="text-red-600 font-bold">
                  Sisa ayam yang belum berpindah: {sisaAyam} Ekor
                </p>
              )}
            </div>
          )}
        </div>

        {/* Kandang Tujuan */}
        <div className="w-full lg:flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Kandang Tujuan</h3>
            <button
              className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded"
              onClick={() => {
                if (!asal || sisaAyam < 1) {
                  setShowAlert(true);
                } else {
                  setShowTujuanModal(true);
                }
              }}
            >
              Tambah kandang tujuan
            </button>
          </div>

          {tujuan.map((k, i) => (
            <div key={i} className="p-4 border rounded space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold">Kandang tujuan {i + 1}</h4>
                <button
                  className="bg-orange-300 hover:bg-orange-500 text-black px-3 py-1 rounded cursor-pointer"
                  onClick={() => handleUlang("tujuan", i)}
                >
                  Pilih Ulang ✕
                </button>
              </div>
              <p className="font-medium">Nama Kandang</p>
              <p className="text-lg font-bold">{k.cage.name}</p>
              <p className="font-medium">Kapasitas maksimum</p>
              <p className="text-lg font-bold">{k.kapasitas} Ekor</p>
              <label className="block mt-2 font-medium">
                Alokasi di Kandang ini
              </label>
              <input
                type="number"
                className="border px-2 py-1 w-full"
                placeholder="Ayam yang akan dipindah"
                max={k.kapasitas || 0}
                value={k.jumlahAlokasi}
                onChange={(e) => {
                  let value = parseInt(e.target.value);
                  if (value > k.kapasitas) value = k.kapasitas;
                  if (value < 0) value = 0;
                  handleJumlahAlokasiChange(i, value);
                }}
              />
            </div>
          ))}

          {sisaAyam < 0 && (
            <div className="bg-orange-100 text-red-600 px-4 py-2 rounded flex items-center gap-4 text-base">
              <GoAlertFill size={36} />
              Alokasi melebihi kapasitas maksimum kandang
            </div>
          )}

          {tujuan.length !== 0 && sisaAyam >= 0 && (
            <div className="flex justify-end">
              <button
                className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded"
                onClick={() => setShowPindahModal(true)}
              >
                Konfirmasi pemindahan ayam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAsalModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[95%] md:w-3/4 max-h-[90vh] p-6 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">Daftar Kandang</h3>
              <button
                onClick={() => setShowAsalModal(false)}
                className="text-lg font-bold cursor-pointer hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Wrapper scroll horizontal */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-gray-200">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Kandang</th>
                    <th className="px-4 py-2 text-left">ID Batch</th>
                    <th className="px-4 py-2 text-left">Kategori</th>
                    <th className="px-4 py-2 text-left">Usia Ayam</th>
                    <th className="px-4 py-2 text-left">Jumlah Ayam</th>
                    <th className="px-4 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kandangOptions.map((k, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{k?.cage?.name}</td>
                      <td className="px-4 py-2">{k.batchId}</td>
                      <td className="px-4 py-2">{k.chickenCategory}</td>
                      <td className="px-4 py-2">{k.chickenAge}</td>
                      <td className="px-4 py-2">{k.totalChicken}</td>
                      <td className="px-4 py-2">
                        {k.batchId && (
                          <button
                            onClick={() => handlePilihAsal(k)}
                            className="bg-orange-300 hover:bg-orange-500 px-3 py-1 rounded cursor-pointer"
                          >
                            Pilih Kandang
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showTujuanModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[95%] md:w-3/4 max-h-[90vh] p-6 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">Daftar Kandang Tujuan</h3>
              <button
                onClick={() => setShowTujuanModal(false)}
                className="text-lg font-bold hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Wrapper scroll horizontal */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-gray-200">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Kandang</th>
                    <th className="px-4 py-2 text-left">ID Batch</th>
                    <th className="px-4 py-2 text-left">Kategori</th>
                    <th className="px-4 py-2 text-left">Usia Ayam</th>
                    <th className="px-4 py-2 text-left">Kapasitas</th>
                    <th className="px-4 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tujuanOptions.map((k, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{k?.cage?.name}</td>
                      <td className="px-4 py-2">{k.batchId}</td>
                      <td className="px-4 py-2">{k.chickenCategory}</td>
                      <td className="px-4 py-2">{k.chickenAge}</td>
                      <td className="px-4 py-2">{k.totalChicken}</td>
                      <td className="px-4 py-2">
                        {!k.cage.isUsed && k.totalChicken === 0 && (
                          <button
                            onClick={() => handlePilihTujuan(k)}
                            className="bg-orange-300 hover:bg-orange-500 px-3 py-1 rounded cursor-pointer"
                          >
                            Pilih Kandang
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-lg font-semibold mb-4">
              {sisaAyam == 0
                ? "Tidak ayam yang tersisa untuk dipindah!"
                : sisaAyam < 0
                ? "Ayam yang dipindahkan sudah melebihi batas!"
                : "Silakan pilih kandang asal & isi jumlah yang ingin dipindah terlebih dahulu!"}
            </p>
            <button
              className="bg-green-700 text-white px-4 py-2 rounded"
              onClick={() => setShowAlert(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <PindahAyamModal
        isOpen={showPindahModal}
        onClose={() => setShowPindahModal(false)}
        onConfirm={handleConfirmPindah}
      />

      {/* <button
        onClick={() => {
          const payload = {
            sourceCageId: asal.cage.id,
            destinationChickenCages: tujuan.map((chickenCage) => ({
              destinationCageId: chickenCage.cage.id,
              totalChicken: chickenCage.jumlahAlokasi,
            })),
          };
          console.log("payload: ", payload);
          console.log("asal: ", asal);
          console.log("tujuan: ", tujuan);
        }}
      >
        CHECK
      </button> */}
    </div>
  );
};

export default PindahAyam;
