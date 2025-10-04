import React from "react";
import { FiCheck } from "react-icons/fi";
import {
  getAdditionalWorks,
  getDailyWorkUser,
  takeAdditionalWorks,
  updateAdditionalWorkStaff,
  updateDailyWorkStaff,
} from "../services/dailyWorks";
import { useState, useEffect } from "react";
import { translateDateToBahasa } from "../utils/dateFormat";
import { getSelfCurrentUserPresence } from "../services/presence";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  getCurrentUserCagePlacement,
  getCurrentUserStorePlacement,
  getCurrentUserWarehousePlacement,
} from "../services/placement";

const Tugas = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const locationId = localStorage.getItem("locationId");
  const userRole = localStorage.getItem("role");

  const [tugasTambahanData, setTugasTambahanData] = useState([]);

  const [dailyWorks, setDailyWorks] = useState([]);
  const [additionalWorks, setAdditionalWorks] = useState([]);
  const [placeIds, setPlaceIds] = useState([]);

  const [isPresence, setIsPresence] = useState(false);

  const detailPages = ["detail-tugas-tambahan"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchPlacement = async () => {
    try {
      let placementResponse;
      let placementName;
      if (userRole == "Pekerja Kandang" || userRole == "Pekerja Telur") {
        placementResponse = await getCurrentUserCagePlacement();
      } else if (userRole == "Pekerja Gudang" || userRole == "Kepala Kandang") {
        placementResponse = await getCurrentUserWarehousePlacement();
      } else {
        placementResponse = await getCurrentUserStorePlacement();
      }

      if (placementResponse.status == 200) {
        const placeIds = (placementResponse.data?.data ?? [])
          .map((item) => {
            const obj = item.cage ?? item.warehouse ?? item.store;
            return (
              obj?.id ??
              obj?._id ??
              (typeof obj === "string" || typeof obj === "number" ? obj : null)
            );
          })
          .filter((id) => id != null);
        setPlaceIds(placeIds);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchTugasTambahanData = async () => {
    try {
      let locationType;
      if (userRole == "Pekerja Kandang" || userRole == "Pekerja Telur") {
        locationType = "Kandang";
      } else if (userRole == "Pekerja Gudang" || userRole == "Kepala Kandang") {
        locationType = "Gudang";
      } else {
        locationType = "Toko";
      }
      const tugasTambahanResponse = await getAdditionalWorks(
        "Available",
        locationId,
        locationType,
        placeIds
      );
      console.log("tugasTambahanResponse: ", tugasTambahanResponse);

      if (tugasTambahanResponse.status == 200) {
        setTugasTambahanData(tugasTambahanResponse.data.data);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat tugas rutin");
      console.log("Error: ", error);
    }
  };

  const fetchAllTugas = async () => {
    try {
      const response = await getDailyWorkUser();
      console.log("response fetch tugas harian: ", response);

      if (response.status == 200) {
        setDailyWorks(response.data.data.dailyWorks);
        setAdditionalWorks(response.data.data.additionalWorks);

        // setTugasTambahanData(response.data.data);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat tugas rutin");
      console.log("Error: ", error);
    }
  };

  const takeAdditionalTaskHandle = async (id) => {
    try {
      const takeResponse = await takeAdditionalWorks(id);
      // console.log("takeResponse: ", takeResponse);
      if (takeResponse.status == 201) {
        alert(
          "✅Berhasil mengambil tugas tambahan, tugas akan masuk ke tugas pegawai esok hari!"
        );
        fetchTugasTambahanData();
        fetchAllTugas();
      }
    } catch (error) {
      if (error.response.data.message == "additional work already full") {
        alert("❌Tidak tersedia slot untuk anda, tugas ini sudah penuh!");
      } else {
        alert("❌Terjadi kesalahan: ", error);
      }
      console.log("error :", error);
    }
  };

  const getTodayPresence = async (id) => {
    try {
      const presenceResponse = await getSelfCurrentUserPresence();
      // console.log("presenceResponse: ", presenceResponse);
      if (presenceResponse.status == 200) {
        console.log(
          "presenceResponse.data.data.status: ",
          presenceResponse.data.data.status
        );
        // setIsPresence(presenceResponse.data.data.isPresent);
        if (presenceResponse.data.data.status === "Hadir") {
          setIsPresence(true);
          // fetchTugasTambahanData();
          fetchAllTugas();
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const detailTugasHandle = (id) => {
    navigate(`${location.pathname}/detail-tugas-tambahan/${id}`);
  };

  const finishAdditionalTask = async (taskId) => {
    const payload = {
      isDone: true,
    };

    try {
      const updateResponse = await updateAdditionalWorkStaff(payload, taskId);
      if (updateResponse.status == 200) {
        fetchAllTugas();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const finishDailyTask = async (taskId) => {
    const payload = {
      isDone: true,
    };

    try {
      const updateResponse = await updateDailyWorkStaff(payload, taskId);
      console.log("updateResponse: ", updateResponse);
      if (updateResponse.status == 200) {
        fetchAllTugas();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Kurang Pekerja":
        return "bg-[#FF5E5E] text-[#640404]";
      case "Pekerja Terpenuhi":
        return "bg-orange-200 text-krisis-text-color";
      default:
        return "bg-[#87FF8B] text-[#066000]";
    }
  };

  useEffect(() => {
    getTodayPresence();
    fetchPlacement();
  }, []);

  useEffect(() => {
    if (isPresence) {
      fetchAllTugas();
      fetchTugasTambahanData();
    }
  }, [placeIds]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="text-2xl sm:text-3xl font-bold mb-4">Tugas</div>

      {!isPresence && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-3 sm:p-4 mb-6 rounded text-sm sm:text-base">
          <p className="flex items-start sm:items-center">
            <span className="mr-2 text-lg">⚠️</span>
            Lakukan presensi harian untuk melihat tugas hari ini
          </p>
        </div>
      )}

      {/* Tugas Tambahan */}
      <div className="border p-4 sm:p-6 border-black-6 rounded-lg bg-white overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Tugas Tambahan
        </h2>
        <table className="min-w-[600px] w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-green-700 text-white text-left">
              <th className="py-2 px-3 sm:px-4">Tanggal</th>
              <th className="py-2 px-3 sm:px-4">Tugas Tambahan</th>
              <th className="py-2 px-3 sm:px-4">Lokasi</th>
              <th className="py-2 px-3 sm:px-4">Sisa Slot</th>
              <th className="py-2 px-3 sm:px-4">Status</th>
              <th className="py-2 px-3 sm:px-4">Aksi</th>
              <th className="py-2 px-3 sm:px-4"></th>
            </tr>
          </thead>
          <tbody>
            {tugasTambahanData?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-3 sm:px-4">{item.date}</td>
                <td className="py-2 px-3 sm:px-4">{item.name}</td>
                <td className="py-2 px-3 sm:px-4">{item.location}</td>
                <td className="py-2 px-3 sm:px-4">{item.remainingSlot}</td>
                <td className="py-2 px-3 sm:px-4">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-2 px-3 sm:px-4">
                  {!item.IsTakenByCurrentUser && item.remainingSlot !== 0 && (
                    <button
                      onClick={() => takeAdditionalTaskHandle(item.id)}
                      className="cursor-pointer bg-green-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 rounded hover:bg-green-900 w-full sm:w-auto"
                    >
                      Ambil
                    </button>
                  )}
                </td>
                <td className="py-2 px-3 sm:px-4">
                  <button
                    onClick={() => detailTugasHandle(item.id)}
                    className="text-black text-xs sm:text-sm underline font-medium cursor-pointer"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tugas Hari Ini */}
      <div className="border p-4 sm:p-6 rounded-lg bg-white border-black-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Tugas hari ini
        </h2>

        {/* Tugas Tambahan */}
        <div className="pb-2 mb-4">
          <h3 className="text-md font-semibold mb-2">Tugas Tambahan</h3>
          {additionalWorks.map((item, i) => (
            <div
              key={i}
              className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border rounded-md flex justify-between items-center mb-2 text-sm"
            >
              <p className="font-medium">{item.additionalWork.name}</p>
              <button
                onClick={() => {
                  if (!item.isDone) finishAdditionalTask(item.id);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex justify-center items-center cursor-pointer ${
                  item.isDone
                    ? "bg-[#87FF8B] text-black hover:bg-[#4d8e4f]"
                    : "bg-gray-200 hover:bg-gray-400"
                }`}
              >
                {item.isDone && <FiCheck />}
              </button>
            </div>
          ))}
        </div>

        {/* Tugas Rutin */}
        <div>
          <h3 className="text-md font-semibold mb-2">Tugas Rutin</h3>
          <div className="space-y-2">
            {dailyWorks.map((item, i) => (
              <div
                key={i}
                className="border bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-md flex justify-between items-center text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium ">
                    {item.dailyWork.description}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.dailyWork.startTime}
                  </p>
                </div>
                <button
                  onClick={() => finishDailyTask(item.id)}
                  className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 ml-2 rounded-md flex justify-center items-center cursor-pointer ${
                    item.isDone
                      ? "bg-[#87FF8B] text-black hover:bg-[#4d8e4f]"
                      : "bg-gray-200 hover:bg-gray-400"
                  }`}
                >
                  {item.isDone && <FiCheck />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tugas;
