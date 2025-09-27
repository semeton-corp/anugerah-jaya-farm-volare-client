import React, { useState, useEffect } from "react";
import { FiMapPin, FiClock } from "react-icons/fi";

// Utility function to format date into Indonesian (simulated from translateDateToBahasa)
const translateDateToBahasa = (date) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("id-ID", options);
};

// --- DUMMY DATA AND SIMULATED SERVICES ---

// Mock storage key (to persist the dummy data across page refreshes)
const STORAGE_KEY = "mock_presence_status";

// Function to simulate fetching today's presence status
const getMockPresenceStatus = () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    return JSON.parse(storedData);
  }
  // Default status: null (no presence recorded yet)
  return null;
};

// Function to simulate saving presence status
const saveMockPresenceStatus = (status) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
};

// --- PRESENSI LOKASI COMPONENT ---

const PresensiLokasi = () => {
  const [presenceStatus, setPresenceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  // Dummy Location
  const [currentLocation] = useState("Kandang Sidodadi, Bali");

  // Function to fetch the user's current presence status
  const fetchPresenceStatus = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const status = getMockPresenceStatus();
      setPresenceStatus(status);
      setIsLoading(false);
    }, 500);
  };

  // Handler for clocking in (Presensi Masuk)
  const handleCheckIn = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Simulate API delay and success
    setTimeout(() => {
      const now = new Date();
      const newStatus = {
        id: "presensi-" + now.getTime(),
        status: "Hadir",
        jamMasuk: now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        jamPulang: null,
        tanggal: translateDateToBahasa(now),
        lokasi: currentLocation,
      };

      saveMockPresenceStatus(newStatus);
      setPresenceStatus(newStatus);
      alert("✅ Presensi masuk berhasil dicatat!");
      setIsProcessing(false);
    }, 1000);
  };

  // Handler for clocking out (Presensi Pulang)
  const handleCheckOut = () => {
    if (isProcessing || !presenceStatus) return;
    setIsProcessing(true);

    // Simulate API delay and success
    setTimeout(() => {
      const now = new Date();
      const updatedStatus = {
        ...presenceStatus,
        jamPulang: now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      saveMockPresenceStatus(updatedStatus);
      setPresenceStatus(updatedStatus);
      alert("✅ Presensi pulang berhasil dicatat!");
      setIsProcessing(false);
    }, 1000);
  };

  useEffect(() => {
    // Check if the stored presence is from a previous day. If so, reset it.
    const storedStatus = getMockPresenceStatus();
    const today = translateDateToBahasa(new Date());

    if (storedStatus && storedStatus.tanggal !== today) {
      localStorage.removeItem(STORAGE_KEY);
    }

    fetchPresenceStatus();
  }, []);

  const today = translateDateToBahasa(new Date());

  if (isLoading) {
    return (
      <div className="p-4 text-center text-lg text-gray-500">
        Memuat status presensi...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Presensi Harian</h1>

      <div className="bg-white border p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold">{today}</h2>
          <span className="text-sm font-medium text-gray-600 flex items-center">
            <FiMapPin className="mr-1 text-red-500" /> **{currentLocation}**
          </span>
        </div>

        {presenceStatus?.status === "Hadir" ? (
          <div className="space-y-4">
            <p className="text-lg font-medium text-green-700 p-2 bg-green-50 border-l-4 border-green-500 rounded">
              Anda sudah berhasil **presensi masuk** hari ini.
            </p>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
              <span className="font-medium text-gray-700">Jam Masuk:</span>
              <span className="font-bold text-lg">
                {presenceStatus.jamMasuk} WIB
              </span>
            </div>

            {presenceStatus.jamPulang ? (
              <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                <span className="font-medium text-gray-700">Jam Pulang:</span>
                <span className="font-bold text-lg text-blue-600">
                  {presenceStatus.jamPulang} WIB
                </span>
              </div>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={isProcessing}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700 transition duration-150 disabled:bg-red-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  "Memproses..."
                ) : (
                  <>
                    <FiClock className="mr-2" /> Presensi Pulang
                  </>
                )}
              </button>
            )}

            {/* Optional: Add a button to reset the dummy status for testing */}
            {!isProcessing && presenceStatus.jamPulang && (
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setPresenceStatus(null);
                  alert("Status presensi direset!");
                }}
                className="w-full text-sm text-gray-500 mt-2 hover:text-red-500"
              >
                Reset Status (For Testing)
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4 text-yellow-700 p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              Anda **belum** melakukan presensi hari ini.
            </p>
            <button
              onClick={handleCheckIn}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition duration-150 disabled:bg-green-300 flex items-center justify-center"
            >
              {isProcessing ? (
                "Memproses..."
              ) : (
                <>
                  <FiClock className="mr-2" /> Presensi Masuk
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresensiLokasi;
