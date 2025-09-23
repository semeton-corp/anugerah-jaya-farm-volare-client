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

const Tugas = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tugasTambahanData, setTugasTambahanData] = useState([]);

  const [dailyWorks, setDailyWorks] = useState([]);
  const [additionalWorks, setAdditionalWorks] = useState([]);

  const [isPresence, setIsPresence] = useState(false);

  const detailPages = ["detail-tugas-tambahan"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchTugasTambahanData = async () => {
    try {
      const response = await getAdditionalWorks();
      console.log("response tugas tambahan: ", response);

      if (response.status == 200) {
        setTugasTambahanData(response.data.data);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat tugas rutin");
      console.log("Error: ", error);
    }
  };

  const fetchAllTugas = async () => {
    try {
      const response = await getDailyWorkUser();
      // console.log("response fetch tugas: ", response);

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
          "Berhasil mengambil tugas tambahan, tugas akan masuk ke tugas pegawai esok hari!"
        );
        fetchTugasTambahanData();
      }
    } catch (error) {
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
          fetchTugasTambahanData();
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
      // console.log("updateResponse: ", updateResponse);
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
      case "Belum Diproses":
        return "bg-[#FF5E5E] text-[#640404]";
      case "Sedang Diproses":
        return "bg-orange-200 text-krisis-text-color";
      case "Selesai":
        return "bg-[#87FF8B] text-[#066000]";
      default:
        return "";
    }
  };

  useEffect(() => {
    getTodayPresence();
    if (isPresence) {
      fetchTugasTambahanData();
      fetchAllTugas();
    }
  }, []);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4">
      {/* header */}
      <div className="text-3xl font-bold mb-4">Tugas</div>
      {!isPresence && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p className="flex items-center">
            <span className="mr-2 text-lg">⚠️</span>
            Lakukan presensi harian untuk melihat tugas hari ini
          </p>
        </div>
      )}

      {/* tugas tambahan  */}
      <div className="border p-4 border-black-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Tugas Tambahan</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-700 text-white text-left">
              <th className="py-2 px-4">Tanggal</th>
              <th className="py-2 px-4">Tugas Tambahan</th>
              <th className="py-2 px-4">Lokasi</th>
              <th className="py-2 px-4">Sisa Slot</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {tugasTambahanData?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{item.date}</td>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4">{item.location}</td>
                <td className="py-2 px-4">{item.remainingSlot}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-2 px-4 flex gap-2">
                  {!item.IsTakenByCurrentUser && (
                    <button
                      onClick={() => {
                        takeAdditionalTaskHandle(item.id);
                      }}
                      className="cursor-pointer bg-green-700 text-white text-sm font-semibold px-4 py-1 rounded hover:bg-green-900"
                    >
                      Ambil
                    </button>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => detailTugasHandle(item.id)}
                    className=" text-black text-sm underline font-medium cursor-pointer"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tugas hari ini */}
      <div className="border p-4 rounded-lg bg-white border-black-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Tugas hari ini</h2>

        {/* Tugas Tambahan */}
        <div className="pb-2 mb-4">
          <h3 className="text-md font-semibold mb-2">Tugas Tambahan</h3>
          {additionalWorks.map((item, i) => (
            <div className="bg-gray-100 px-4 py-3 border-1 rounded-md flex justify-between items-center mb-2">
              <p className="font-medium">{item.additionalWork.description}</p>
              <button
                onClick={() => {
                  if (!item.isDone) {
                    finishAdditionalTask(item.id);
                    // console.log("item: ", item);
                  }
                }}
                className={`w-8 h-8 rounded-md flex justify-center items-center cursor-pointer ${
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
                className="border-1 bg-gray-100 px-4 py-3 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{item.dailyWork.description}</p>
                  <p className="text-sm text-gray-600">{item.waktu}</p>
                </div>
                <button
                  onClick={() => finishDailyTask(item.id)}
                  className={`w-8 h-8 rounded-md flex justify-center items-center cursor-pointer  ${
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
      {/* <button
        onClick={() => {
          console.log("tugasTambahanData: ", tugasTambahanData);
          console.log("additionalWorks: ", additionalWorks);
        }}
      >
        check
      </button> */}
    </div>
  );
};

export default Tugas;
