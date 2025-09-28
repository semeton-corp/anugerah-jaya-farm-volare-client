import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getUserPresenceSummaries,
  getUserPresenceWorkDetailSummaries,
} from "../services/presence";
import MonthYearSelector from "../components/MonthYearSelector";
import { formatDate, formatDateToDDMMYYYY } from "../utils/dateFormat";

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

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [monthName, setMonthName] = useState(MONTHS_ID[now.getMonth()]);

  const [todayPresences, setTodayPresences] = useState([]);
  const [presenceSummaries, setPresenceSummaries] = useState([]);

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
      const date = formatDateToDDMMYYYY(formatDate(new Date()));
      console.log("date: ", date);
      const todayPresenceResponse = await getUserPresenceWorkDetailSummaries(
        locationItem.roleId,
        locationItem.placeType,
        locationItem.placeId,
        date
      );

      console.log("todayPresenceResponse: ", todayPresenceResponse);

      if (todayPresenceResponse.status == 200) {
        setTodayPresences(todayPresenceResponse.data.data);
      }
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
      if (summaryResponse.status == 200) {
        setPresenceSummaries(summaryResponse.data.data);
      }
      console.log("summaryResponse: ", summaryResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchTodayPresence();
    fetchPresenceSummary();
  }, [monthName, year]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        {`Presensi ${locationItem.placeName}`}
      </h1>

      {/* Absensi Hari Ini */}
      <div className="bg-white border border-black-6 rounded p-4 mb-6">
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
          <tbody className="divide-y divide-gray-200">
            {todayPresences.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`${row.photoProfile}`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{row.nama}</p>
                      <p className="text-gray-500 ">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{row.roleName}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1  font-medium rounded ${
                      row.status == "Alpha"
                        ? "bg-kritis-box-surface-color text-kritis-text-color"
                        : row.status == "Hadir"
                        ? "bg-aman-box-surface-color text-aman-text-color"
                        : row.status == "Sakit"
                        ? "bg-orange-400 text-orange-900"
                        : "bg-green-300 text-orange-8000"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">{row.arrivedTime}</td>
                <td className="px-6 py-4">{row.departureTime}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${row.workDonePercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {row.workDonePercentage}%
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rangkuman Presensi */}
      <div className="bg-white border border-black-6 rounded p-4">
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
            {presenceSummaries.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`${row.photoProfile}`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{row.nama}</p>
                      <p className="text-gray-500 ">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{row.roleName}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-lg font-semibold bg-aman-box-surface-color text-green-700">
                    {row.totalPresentUser}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-lg font-semibold bg-orange-100 text-yellow-700">
                    {row.totalSickUser}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-lg font-semibold bg-green-100 text-green-700">
                    {row.totalPermissionUser}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-lg  font-semibold bg-kritis-box-surface-color text-kritis-text-color">
                    {row.totalAlphaUser}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PresensiLokasi;
