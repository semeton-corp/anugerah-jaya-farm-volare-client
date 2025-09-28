import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getUserPresenceSummaries,
  getUserPresenceWorkDetailSummaries,
} from "../services/presence";
import MonthYearSelector from "../components/MonthYearSelector";

const MONTHS_ID = [
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

const PresensiLokasi = () => {
  const { state } = useLocation();
  const locationItem = state?.locationItem;
  console.log("locationItem: ", locationItem);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [monthName, setMonthName] = useState(MONTHS_ID[now.getMonth()]);
  const absensiHariIni = [
    {
      id: 1,
      nama: "Budi Santoso",
      email: "budi@company.com",
      jabatan: "Pekerja Kandang",
      status: "Hadir",
      jamMasuk: "09.00 WIB",
      jamPulang: "- WIB",
      progres: 80,
    },
    {
      id: 2,
      nama: "Gede Indra",
      email: "indra@company.com",
      jabatan: "Pekerja Kandang",
      status: "Hadir",
      jamMasuk: "08.45 WIB",
      jamPulang: "18.00 WIB",
      progres: 100,
    },
    {
      id: 3,
      nama: "Siti Rahayu",
      email: "siti@company.com",
      jabatan: "Pekerja Kandang",
      status: "Hadir",
      jamMasuk: "08.30 WIB",
      jamPulang: "- WIB",
      progres: 0,
    },
  ];

  const rangkumanPresensi = [
    {
      id: 1,
      nama: "Budi Santoso",
      email: "budi@company.com",
      jabatan: "Pekerja Kandang",
      hadir: 10,
      sakit: 0,
      izin: 1,
      alpha: 0,
    },
    {
      id: 2,
      nama: "Gede Indra",
      email: "indra@company.com",
      jabatan: "Pekerja Kandang",
      hadir: 10,
      sakit: 1,
      izin: 0,
      alpha: 0,
    },
    {
      id: 3,
      nama: "Siti Rahayu",
      email: "siti@company.com",
      jabatan: "Pekerja Kandang",
      hadir: 10,
      sakit: 0,
      izin: 0,
      alpha: 0,
    },
  ];

  const fetchTodayPresence = async () => {
    try {
      const todayPresenceResponse = await getUserPresenceWorkDetailSummaries(
        locationItem.roleId,
        locationItem.placeType,
        locationItem.placeId
      );
      console.log("todayPresenceResponse: ", todayPresenceResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPresenceSummary = async () => {
    try {
      const summaryResponse = await getUserPresenceSummaries(
        locationItem.roleId,
        locationItem.placeType,
        locationItem.placeId,
        monthName,
        year
      );
      console.log("summaryResponse: ", summaryResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchTodayPresence();
    fetchPresenceSummary();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        {`Presensi ${locationItem.placeName}`}
      </h1>

      {/* Absensi Hari Ini */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Absensi Hari Ini</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-700 text-left text-sm font-medium text-white">
              <th className="px-6 py-3">Pegawai</th>
              <th className="px-6 py-3">Jabatan</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Jam Masuk</th>
              <th className="px-6 py-3">Jam Pulang</th>
              <th className="px-6 py-3">Penyelesaian Tugas</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200">
            {absensiHariIni.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        row.nama
                      )}&background=random`}
                      alt={row.nama}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{row.nama}</p>
                      <p className="text-gray-500 text-xs">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{row.jabatan}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">{row.jamMasuk}</td>
                <td className="px-6 py-4">{row.jamPulang}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${row.progres}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{row.progres}%</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rangkuman Presensi */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold mb-4">Rangkuman Presensi</h2>
          <MonthYearSelector
            month={month}
            year={year}
            setMonth={setMonth}
            setMonthName={setMonthName}
            setYear={setYear}
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-700 text-left text-sm font-medium text-white">
              <th className="px-6 py-3">Pegawai</th>
              <th className="px-6 py-3">Jabatan</th>
              <th className="px-6 py-3">Jumlah Hadir</th>
              <th className="px-6 py-3">Jumlah Sakit</th>
              <th className="px-6 py-3">Jumlah Izin</th>
              <th className="px-6 py-3">Jumlah Alpha</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200">
            {rangkumanPresensi.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        row.nama
                      )}&background=random`}
                      alt={row.nama}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{row.nama}</p>
                      <p className="text-gray-500 text-xs">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{row.jabatan}</td>
                <td className="px-6 py-4">{row.hadir}</td>
                <td className="px-6 py-4">{row.sakit}</td>
                <td className="px-6 py-4">{row.izin}</td>
                <td className="px-6 py-4">{row.alpha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PresensiLokasi;
