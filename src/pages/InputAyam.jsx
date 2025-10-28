import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getCage, getChickenCage, getChickenCageFeed } from "../services/cages";
import { kategoriAyam } from "../data/KategoriAyam";
import { deleteChickenData, inputAyam } from "../services/chickenMonitorings";
import { getChickenMonitoringById } from "../services/chickenMonitorings";
import { useParams } from "react-router-dom";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { MdDelete } from "react-icons/md";
import { updateChickenMonitoring } from "../services/chickenMonitorings";
import {
  deleteChickenVaccineMonitoring,
  deleteChickenDiseaseMonitoring,
} from "../services/chickenMonitorings";
import DeleteModal from "../components/DeleteModal";

const InputAyam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const locationId = localStorage.getItem("locationId");
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  const [chickenCages, setChickenCages] = useState([]);
  const [selectedChickenCage, setSelectedChickenCage] = useState("");
  const isCageEmpty =
    (selectedChickenCage?.cage && !selectedChickenCage.cage.isUsed) ||
    selectedChickenCage?.totalChicken == 0;
  const isAssignToCage = chickenCages.length > 0;

  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const [selectedChikenCategory, setSelectedChikenCategory] = useState("");
  const [ageChiken, setAgeChiken] = useState(0);
  const [totalLiveChicken, setTotalLiveChicken] = useState(0);
  const [totalSickChicken, setTotalSickChicken] = useState(0);
  const [totalDeathChicken, setTotalDeathChicken] = useState(0);
  const [totalFeed, setTotalFeed] = useState(0);
  const [note, setNote] = useState("");

  const [isEditMode, setIsEditMode] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [remainingFeed, setRemainingFeed] = useState();

  const fetchRemainingFeed = async () => {
    try {
      const detailResponse = await getChickenCageFeed(selectedChickenCage.id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status == 200) {
        setRemainingFeed(detailResponse.data.data.remainingTotalFeed);
      }
    } catch (error) {
      setRemainingFeed(0);
      console.log("error :", error);
    }
  };

  useEffect(() => {
    const fetchCages = async () => {
      try {
        let response;
        if (userRole == "Owner") {
          response = await getChickenCage();
        } else {
          response = await getChickenCage(locationId);
        }
        const dataChickenCage = response.data.data;

        console.log("dataChickenCage: ", dataChickenCage);

        if (userRole !== "Owner" && userRole !== "Kepala Kandang") {
          const filteredChickenCage = dataChickenCage.filter(
            (item) => item.chickenPic === userName
          );
          setChickenCages(filteredChickenCage);
          setSelectedChickenCage(filteredChickenCage[0]);
        } else {
          setChickenCages(dataChickenCage);
          setSelectedChickenCage(dataChickenCage[0]);
        }

        if (id) {
          const updateResponse = await getChickenMonitoringById(id);
          const data = updateResponse.data.data;
          console.log("THERE IS DATA: ", data);
          setSelectedChickenCage(data.chickenCage);
          setTotalSickChicken(data.totalSickChicken);
          setTotalDeathChicken(data.totalDeathChicken);
          setTotalFeed(data.totalFeed);
          setNote(data.note);
          setIsEditMode(false);
        }
      } catch (error) {
        console.error("Gagal memuat data kandang:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCages();
  }, []);

  useEffect(() => {
    console.log("selectedChickenCage: ", selectedChickenCage);
    fetchRemainingFeed();
  }, [selectedChickenCage]);

  async function deleteDataHandle() {
    try {
      const response = await deleteChickenData(id);
      console.log("response.status", response.status);

      if (response.status === 204) {
        alert("✅ Data berhasil dihapus!");
        navigate(-1);
      } else {
        alert("⚠️ Gagal menghapus data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal menghapus data ayam:", error);
      alert("❌ Terjadi kesalahan saat menghapus data.");
    }
  }

  async function simpanAyamHandle() {
    setLoading(true);

    if (!selectedChickenCage || !totalFeed) {
      alert("❌Silahkan masukkan jumlah pakan dengan benar!");
      setLoading(false);
      return;
    }

    const payload = {
      chickenCageId: parseInt(selectedChickenCage.id),
      totalSickChicken: parseInt(totalSickChicken ?? 0),
      totalDeathChicken: parseInt(totalDeathChicken ?? 0),
      totalFeed: parseFloat(totalFeed),
      note: note,
    };

    console.log("Payload ready to send: ", payload);

    try {
      if (id) {
        const updateResponse = await updateChickenMonitoring(id, payload);
        if (updateResponse.status === 200) {
          navigate(-1, { state: { refetch: true } });
        }
      } else {
        const response = await inputAyam(payload);
        console.log("response status: ", response.status);
        console.log("response message: ", response.message);
        if (response.status === 201) {
          navigate(-1, { state: { refetch: true } });
        }
      }
    } catch (error) {
      console.log("error:", error);

      const errorMessage =
        error?.response?.data?.message || error.message || "Terjadi kesalahan";

      if (errorMessage === "chicken monitoring already exists for today") {
        alert("❌Sudah terdapat data untuk kandang yang dipilih hari ini!");
      } else if (
        errorMessage.includes("insufficient feed stock to adjust by")
      ) {
        const match = errorMessage.match(/adjust by ([\d.]+)/);
        const amount = match ? match[1] : "0";

        alert(
          `❌ Jumlah pakan yang tersedia kurang, silahkan aduk pakan sejumlah ${parseInt(
            amount
          )} kg`
        );
      } else {
        alert("❌Gagal menyimpan data: " + errorMessage);
      }

      console.error(
        "❌Gagal menyimpan atau mengupdate data ayam:",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  }

  const getDisplayValue = (val) => (val === 0 ? "" : val);

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-xl sm:text-3xl font-bold">
          {userRole === "Pekerja Kandang" ? "Data Ayam" : "Detail Ayam"}
        </h1>
      </div>

      <div className="w-full mx-auto p-6 bg-white shadow rounded border border-black-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold mb-1">Input data harian</h2>
          <p className="text-sm sm:text-base ">{getTodayDateInBahasa()}</p>
        </div>
        <label className="block font-medium  mb-1">Pilih kandang</label>
        {isEditMode ? (
          <select
            className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-4"
            value={
              selectedChickenCage ? JSON.stringify(selectedChickenCage) : ""
            }
            onChange={(e) => {
              const cageObj = JSON.parse(e.target.value);
              setSelectedChickenCage(cageObj);
              console.log("cageObj: ", cageObj);
            }}
          >
            <option value="" disabled hidden>
              Pilih kandang...
            </option>
            {chickenCages.map((cage) => (
              <option key={cage.id} value={JSON.stringify(cage)}>
                {cage.cage.name || "Tanpa Nama"}
              </option>
            ))}
          </select>
        ) : (
          <div>
            <p className="text-lg font-bold mb-4">
              {selectedChickenCage.cage.name}
            </p>
          </div>
        )}
        {isCageEmpty && (
          <p className="text-red-600 font-semibold mb-4">
            Kandang yang dipilih masih kosong
          </p>
        )}
        {!isAssignToCage && (
          <p className="text-red-600 font-semibold mb-4">
            Anda belum menjadi PIC kandang manapun! Silahkan hubungi penanggung
            jawab
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">ID Batch</label>
            <div className="flex items-center py-3">
              <p className="text-lg font-bold">
                {selectedChickenCage?.batchId
                  ? `${selectedChickenCage?.batchId}`
                  : `-`}
              </p>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Kategori ayam</label>
            <div className="flex items-center py-3">
              <p className="text-lg font-bold">
                {selectedChickenCage?.chickenCategory
                  ? `${selectedChickenCage?.chickenCategory}`
                  : `-`}
              </p>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Usia ayam (Minggu)</label>
            <div className="flex items-center py-3">
              <p className="text-lg font-bold">
                {selectedChickenCage?.chickenAge
                  ? `${selectedChickenCage?.chickenAge}`
                  : `0`}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Jumlah ayam hidup</label>
            <div className="flex items-center py-3">
              <p className="text-lg font-bold">
                {selectedChickenCage?.totalChicken
                  ? `${selectedChickenCage?.totalChicken}`
                  : `-`}
              </p>
            </div>
          </div>
        </div>

        <label className="block font-medium mb-1">
          Jumlah Pakan Yang Tersedia
        </label>
        <div className="flex items-center py-3">
          <p className="text-lg font-bold">
            {remainingFeed ? `${remainingFeed} Kg` : `-`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Jumlah ayam sakit</label>
            {isEditMode ? (
              <input
                type="number"
                value={getDisplayValue(totalSickChicken)}
                className={`w-full border border-black-6 rounded p-2 
              ${
                isCageEmpty || !isAssignToCage
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black-4"
              }`}
                placeholder="Masukkan jumlah ayam sakit"
                onChange={(e) => {
                  setTotalSickChicken(e.target.value);
                }}
                disabled={isCageEmpty || !isAssignToCage}
              />
            ) : (
              <div>
                <p className="text-lg font-bold mb-4">{totalSickChicken}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Jumlah ayam mati</label>
            {isEditMode ? (
              <input
                type="number"
                value={getDisplayValue(totalDeathChicken)}
                className={`w-full border border-black-6 rounded p-2 
                  ${
                    isCageEmpty || !isAssignToCage
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-black-4"
                  }`}
                placeholder="Masukkan jumlah ayam mati"
                onChange={(e) => {
                  setTotalDeathChicken(e.target.value);
                }}
                disabled={isCageEmpty || !isAssignToCage}
              />
            ) : (
              <div>
                <p className="text-lg font-bold mb-4">{totalDeathChicken}</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="mt-4">
            <label className="block font-medium mb-1">Jumlah pakan (Kg)</label>
            {isEditMode ? (
              <input
                type="number"
                value={getDisplayValue(totalFeed)}
                className={`w-full border border-black-6 rounded p-2 
                  ${
                    isCageEmpty || !isAssignToCage
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-black-4"
                  }`}
                placeholder="Masukkan jumlah pakan"
                onChange={(e) => {
                  setTotalFeed(e.target.value);
                }}
                disabled={isCageEmpty || !isAssignToCage}
              />
            ) : (
              <div>
                <p className="text-lg font-bold mb-4">{totalFeed}</p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block font-medium mb-1">
              Jumlah pakan (Gr/Ekor)
            </label>
            <div className="flex items-center py-3">
              <p className="text-lg font-bold">
                {totalFeed &&
                selectedChickenCage?.totalChicken &&
                parseInt(selectedChickenCage.totalChicken) !== 0
                  ? `${(
                      (totalFeed * 1000) /
                      parseInt(selectedChickenCage.totalChicken)
                    ).toFixed(2)}`
                  : `-`}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-medium mb-1">Catatan Pekerja</label>
          {isEditMode ? (
            <textarea
              type="text"
              value={note}
              className={`w-full border border-black-6 rounded p-2 
                  ${
                    isCageEmpty || !isAssignToCage
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-black-4"
                  }`}
              placeholder="Masukkan catatan jika terdapat catatan untuk kondisi kandang"
              onChange={(e) => {
                setNote(e.target.value);
              }}
              disabled={isCageEmpty || !isAssignToCage}
            />
          ) : (
            <div>
              <p className="text-lg font-bold mb-4">{note ? note : "-"}</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between text-right">
          <div></div>
          <div className="flex gap-3">
            {id && (
              <div className="text-right">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`${
                    isEditMode
                      ? "bg-red-600 hover:bg-red-800"
                      : "bg-green-700 hover:bg-green-900 "
                  } text-white py-3 px-8 rounded cursor-pointer`}
                >
                  {isEditMode ? "Batal Edit" : "Edit"}
                </button>
              </div>
            )}
            {isEditMode && (
              <button
                onClick={simpanAyamHandle}
                className="py-3 px-8 rounded text-white cursor-pointer
                bg-green-700 hover:bg-green-900
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                disabled={isCageEmpty || !isAssignToCage}
              >
                Simpan
              </button>
            )}

            {id && !isEditMode && (
              <div className="text-right">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white py-3 px-8 rounded hover:bg-red-800 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
        {/* <div className="mt-6 text-right ">
          <button
            onClick={() => {
              const payload = {
                chickenCageId: parseInt(selectedChickenCage),
                totalSickChicken: parseInt(totalSickChicken),
                totalDeathChicken: parseInt(totalDeathChicken),
                totalFeed: parseFloat(totalFeed),
                note: note,
              };
              console.log("payload: ", payload);
              console.log("cages: ", chickenCages);
              console.log("selectedChickenCage: ", selectedChickenCage);
              console.log("totalFeed: ", totalFeed);
              console.log("totalLiveChicken: ", totalLiveChicken);
            }}
            className="bg-emerald-700 text-white py-2 px-6 rounded hover:bg-emerald-600 cursor-pointer"
          >
            Check
          </button>
        </div> */}
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={deleteDataHandle}
      />
    </div>
  );
};

export default InputAyam;
