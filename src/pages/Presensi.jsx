import React, { useEffect, useRef, useState } from "react";
import { formatDate, getTodayDateInBahasa } from "../utils/dateFormat";
import { PiCalendarBlank } from "react-icons/pi";
import {
  getSelfCurrentUserPresence,
  arrivalPresence,
  departurePresence,
  getSelfCurrentUserPresences,
  updatePresence,
} from "../services/presence";
import MonthYearSelector from "../components/MonthYearSelector";
import { uploadFile } from "../services/file";

const Presensi = () => {
  const [presenceId, setPresenceId] = useState(0);
  const [isPresence, setIsPresence] = useState(false);
  const [isGoHome, setIsGoHome] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [note, setNote] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [evidence, setEvidence] = useState();

  const monthNamesBahasa = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const today = new Date();
  const monthIndex = today.getMonth();

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date()),
  );

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

  const getTodayPresence = async () => {
    try {
      const presenceResponse = await getSelfCurrentUserPresence();
      console.log("currentPresenceResponse: ", presenceResponse);
      if (presenceResponse.status == 200) {
        const presenceData = presenceResponse.data.data;
        setPresenceId(presenceData.id);

        if (presenceData.status === "Alpha" && presenceData.startTime === "-") {
          setIsGoHome(false);
          setIsPresence(false);
        } else if (
          presenceData.status === "Hadir" &&
          presenceData.endTime === "-"
        ) {
          setIsGoHome(false);
          setIsPresence(true);
        } else {
          setIsGoHome(true);
          setIsPresence(true);
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const getAttandanceData = async () => {
    try {
      const allPresenceResponse = await getSelfCurrentUserPresences(
        monthName,
        year,
      );
      console.log("allPresenceResponse: ", allPresenceResponse);
      if (allPresenceResponse.status == 200) {
        setAttendanceData(allPresenceResponse.data.data.presences);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const arrivalHandlePresence = async () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const startTime = `${hours}:${minutes}`;
    console.log("startTime: ", startTime);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // const latitude = position.coords.latitude;
        // const longitude = position.coords.longitude;
        const latitude = -8.556790777490797;
        const longitude = 115.21758360400582;

        // console.log("latitude: ", latitude);
        // console.log("longitude: ", longitude);
        const payload = {
          status: "Hadir",
          startTime: startTime,
          latitude: latitude,
          longitude: longitude,
        };

        // console.log("payload: ", payload);
        // console.log("presenceId: ", presenceId);

        try {
          const res = await updatePresence(payload, presenceId);
          // console.log("res: ", res);
          if (res.status == 200) {
            getTodayPresence();
          }
          // console.log("Update success:", res.data);
        } catch (err) {
          const serverMessage = err?.response?.data?.message;

          let customMessage = "Terjadi kesalahan tak terduga" + err;
          if (serverMessage === "can't presence start more than 16.00 PM") {
            customMessage =
              "❌Tidak bisa melakukan presensi melebihi jam kerja 16.00 PM";
          }

          if (
            serverMessage ===
            "presence time must be between 05.00 AM and 08.00 AM"
          ) {
            customMessage =
              "❌Presensi hanya bisa dilakukan antara jam 05.00 AM hingga 08.00 AM";
          }

          if (
            serverMessage ===
            "presence time must be between 05.00 AM and 07.00 AM"
          ) {
            customMessage =
              "❌Presensi hanya bisa dilakukan antara jam 05.00 AM hingga 07.00 AM";
          }

          if (serverMessage === "location is not within the allowed radius") {
            customMessage =
              "Pastikan Anda berada di lokasi kerja! Presensi hanya bisa dilakukan di tempat kerja.";
          } else if (serverMessage === "user presence not found") {
            customMessage =
              "❌Anda tidak bisa melakukan presensi hari ini, hubungi penanggung jawab terkait! Jika akun anda baru, presensi akan bisa dilakukan keesokan hari";
          }

          alert(customMessage);
        }
      },
      (error) => {
        console.error("Location error:", error);
      },
    );
  };

  const departureHandlePresence = async () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const endTime = `${hours}:${minutes}`;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // const latitude = -8.556790777490797;
        // const longitude = 115.21758360400582;

        const payload = {
          status: "Hadir",
          endTime: endTime,
          latitude: latitude,
          longitude: longitude,
        };

        // console.log("payload: ", payload);
        // console.log("presenceId: ", presenceId);

        try {
          const res = await updatePresence(payload, presenceId);
          console.log("hadirButton: ", res);
          if (res.status == 200) {
            getTodayPresence();
          }
          // console.log("Update success:", res.data);
        } catch (err) {
          const serverMessage = err?.response?.data?.message;

          let customMessage = "Terjadi kesalahan tak terduga";

          if (serverMessage === "location is not within the allowed radius") {
            customMessage =
              "❌Pastikan Anda berada di lokasi kerja! Presensi hanya bisa dilakukan di tempat kerja.";
          } else if (serverMessage === "user presence not found") {
            customMessage =
              "❌Anda tidak bisa melakukan presensi hari ini, hubungi penanggung jawab terkait! Jika akun anda baru, presensi akan bisa dilakukan keesokan hari";
          }

          alert(customMessage);
        }
      },
      (error) => {
        console.error("Location error:", error);
      },
    );
  };

  const handleSakit = () => {
    setModalType("sakit");
    setShowModal(true);
  };

  const handleIzin = () => {
    setModalType("izin");
    setShowModal(true);
  };

  const handleSubmitSakit = async () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const endTime = `${hours}:${minutes}`;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // const latitude = -8.556790777490797;
        // const longitude = 115.21758360400582;

        if (!evidence) {
          alert("❌Silakan unggah bukti sakit Anda.");
          return;
        }

        if (!note) {
          alert("❌Silakan isi keterangan sakit Anda.");
          return;
        }

        const payload = {
          status: "Sakit",
          evidence: evidence,
          note: note,
          latitude: latitude,
          longitude: longitude,
        };

        // console.log("payload: ", payload);
        // console.log("presenceId: ", presenceId);

        try {
          const res = await updatePresence(payload, presenceId);
          if (res.status == 200) {
            getTodayPresence();
            alert(
              "✅Berhasil melakukan pengajuan sakit, mohon tunggu persetujuan",
            );
            setShowModal(false);
            setEvidence(null);
            setNote("");
          }
          // console.log("Update success:", res.data);
        } catch (err) {
          const serverMessage = err?.response?.data?.message;

          let customMessage = "Terjadi kesalahan tak terduga";

          if (serverMessage === "location is not within the allowed radius") {
            customMessage =
              "Pastikan Anda berada di lokasi kerja! Presensi hanya bisa dilakukan di tempat kerja.";
          } else if (serverMessage === "user presence not found") {
            customMessage =
              "❌Anda tidak bisa melakukan presensi hari ini, hubungi penanggung jawab terkait! Jika akun anda baru, presensi akan bisa dilakukan keesokan hari";
          }

          alert(customMessage);
        }
      },
      (error) => {
        console.error("Location error:", error);
      },
    );
  };
  const handleSubmitIzin = async () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const endTime = `${hours}:${minutes}`;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // const latitude = -8.556790777490797;
        // const longitude = 115.21758360400582;

        if (!evidence) {
          alert("❌Silakan unggah bukti izin Anda.");
          return;
        }

        if (!note) {
          alert("❌Silakan isi keterangan izin Anda.");
          return;
        }

        const payload = {
          status: "Izin",
          evidence: evidence,
          note: note,
          latitude: latitude,
          longitude: longitude,
        };

        console.log("payload: ", payload);
        // console.log("presenceId: ", presenceId);

        try {
          const res = await updatePresence(payload, presenceId);
          if (res.status == 200) {
            getTodayPresence();
            alert(
              "✅Berhasil melakukan pengajuan izin, mohon tunggu persetujuan",
            );
            setShowModal(false);
            setEvidence(null);
            setNote("");
          }
          console.log("Update success:", res.data);
        } catch (err) {
          const serverMessage = err?.response?.data?.message;

          let customMessage = "Terjadi kesalahan tak terduga";

          if (serverMessage === "location is not within the allowed radius") {
            customMessage =
              "Pastikan Anda berada di lokasi kerja! Presensi hanya bisa dilakukan di tempat kerja.";
          } else if (serverMessage === "user presence not found") {
            customMessage =
              "❌Anda tidak bisa melakukan presensi hari ini, hubungi penanggung jawab terkait! Jika akun anda baru, presensi akan bisa dilakukan keesokan hari";
          }

          alert(customMessage);
        }
      },
      (error) => {
        console.error("Location error:", error);
      },
    );
  };

  useEffect(() => {
    getTodayPresence();
    getAttandanceData();
  }, [isPresence, isGoHome, monthName]);

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Presensi</h1>

      {/* Presensi Harian */}
      <div className="bg-white rounded border border-black-6 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h2 className="font-semibold text-md sm:text-lg">Presensi Harian</h2>
          <p className="text-xs sm:text-sm">{getTodayDateInBahasa()}</p>
        </div>

        <div
          className={`grid gap-4 sm:gap-6 ${
            isGoHome || isPresence
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {/* Hadir / Pulang / Info */}
          <div
            onClick={
              isGoHome
                ? () => {}
                : isPresence
                  ? departureHandlePresence
                  : arrivalHandlePresence
            }
            className={`text-center py-2 rounded text-base sm:text-lg font-semibold ${
              isGoHome
                ? "bg-black-5 text-black-8"
                : isPresence
                  ? "bg-kritis-box-surface-color hover:bg-[#C34747] text-kritis-text-color cursor-pointer hover:text-white"
                  : "bg-aman-box-surface-color hover:bg-[#1D7E20] text-aman-text-color cursor-pointer hover:text-white"
            }`}
          >
            {isGoHome
              ? "Anda sudah melakukan presensi hari ini"
              : isPresence
                ? "Pulang"
                : "Hadir"}
          </div>

          {!isPresence && !isGoHome && (
            <>
              <div
                onClick={handleSakit}
                className="text-center py-2 rounded text-base sm:text-lg font-semibold bg-kritis-box-surface-color hover:bg-[#C34747] text-kritis-text-color cursor-pointer hover:text-white"
              >
                Sakit
              </div>
              <div
                onClick={handleIzin}
                className="text-center py-2 rounded text-base sm:text-lg font-semibold bg-orange-300 hover:bg-orange-500 text-warning-text-color cursor-pointer hover:text-white"
              >
                Izin
              </div>
            </>
          )}
        </div>
        <p className="pt-4 text-xs sm:text-sm">
          *Presensi hanya bisa dilakukan di tempat bekerja
        </p>
      </div>

      {/* Tabel Presensi */}
      <div className="bg-white rounded border border-black-6 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
          <div></div>
          <MonthYearSelector
            month={month}
            year={year}
            setMonth={setMonth}
            setMonthName={setMonthName}
            setYear={setYear}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-base">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Jam masuk</th>
                <th className="p-2 text-left">Jam pulang</th>
                <th className="p-2 text-left">Jumlah Lembur</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.startTime}</td>
                  <td className="p-2">{row.endTime}</td>
                  <td className="p-2">{row.overTime}</td>
                  <td className="p-2">
                    <span
                      className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-medium ${
                        row.startTime !== ""
                          ? "bg-aman-box-surface-color text-aman-text-color"
                          : "bg-kritis-box-surface-color text-kritis-text-color"
                      }`}
                    >
                      {row.startTime !== "" ? "Hadir" : "Tidak hadir"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full relative mx-2">
            <button
              onClick={() => {
                setShowModal(false);
                setEvidence(null);
                setNote("");
              }}
              className="absolute top-2 right-3 text-lg sm:text-xl cursor-pointer hover:text-gray-500"
            >
              ✖
            </button>

            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Pengajuan {modalType === "sakit" ? "Sakit" : "Izin"}
            </h2>

            <div className="mb-4">
              <label className="block mb-1">Keterangan</label>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Tuliskan alasan sakit / izin"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">
                Bukti {modalType === "sakit" ? "Sakit" : "Izin"}
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-3 py-2 text-sm"
                onChange={async (e) => {
                  const fileInput = e.target;
                  const file = fileInput.files?.[0];
                  if (!file) return;

                  setIsUploading(true);

                  try {
                    const fileUrl = await uploadFile(file);
                    setEvidence(fileUrl);
                  } catch (err) {
                    console.error("Upload error:", err);
                    alert("Upload gagal. Silakan coba lagi.");
                    fileInput.value = "";
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
            </div>

            <div className="text-right">
              <button
                onClick={() => {
                  if (modalType === "sakit") {
                    handleSubmitSakit();
                  } else {
                    handleSubmitIzin();
                  }
                }}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900 cursor-pointer"
                }`}
              >
                {isUploading ? "Mengunggah..." : "Ajukan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presensi;
