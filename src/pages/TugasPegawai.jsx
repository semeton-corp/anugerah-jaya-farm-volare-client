import React from "react";
import { IoSearch } from "react-icons/io5";
import { useState, useEffect } from "react";
import {
  getListDailyWorks,
  getAdditionalWorks,
  getWorkOverview,
} from "../services/dailyWorks";
import { translateDateToBahasa } from "../utils/dateFormat";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlank } from "react-icons/pi";
import profileAvatar from "../assets/profile_avatar.svg";

const TugasPegawai = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  const [tugasRutinData, setTugasRutinData] = useState([]);
  const [tugasTambahanData, setTugasTambahanData] = useState([]);

  const detailPages = [
    "tambah-tugas-rutin",
    "tambah-tugas-tambahan",
    "detail-tugas-tambahan",
  ];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchOverviewData = async () => {
    try {
      const overviewResponse = await getWorkOverview();
      console.log("overviewResponse: ", overviewResponse);
      if (overviewResponse.status === 200) {
        setTugasRutinData(overviewResponse.data.data.dailyWorkSummaries);
        setTugasTambahanData(
          overviewResponse.data.data.additionalWorkSummaries
        );
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    // fetchTugasRutinData();
    // fetchTugasTambahanData();
    if (location.state?.refetch) {
      // fetchTugasRutinData();
      // fetchTugasTambahanData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const tambahTugasTambahanHandle = () => {
    navigate(`${location.pathname}/tambah-tugas-tambahan`);
  };

  const detailTugasTambahanHandle = (id) => {
    navigate(`${location.pathname}/detail-tugas-tambahan/${id}`);
  };

  const tambahTugasRutinHandle = () => {
    navigate(`${location.pathname}/tambah-tugas-rutin`);
  };

  const editTugasRutinHandle = (id) => {
    navigate(`${location.pathname}/tambah-tugas-rutin/${id}`);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call parent function with search input
  };

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4 ">
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Tugas Pegawai</h1>
      </div>

      <div className=" rounded-[4px] border border-black-6">
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
          <p className="text-lg font-bold">Tugas Tambahan</p>
          <div
            onClick={() => tambahTugasTambahanHandle()}
            className="rounded-[4px] py-2 px-6 bg-orange-300 hover:bg-orange-500 flex items-center justify-center text-black text-base font-medium cursor-pointer"
          >
            + Tambah tugas
          </div>
        </div>

        <div className="px-4 py-2 overflow-x-auto">
          <table className="w-full min-w-[700px] mb-8 border-collapse">
            <thead className="bg-green-700 text-white text-left text-sm sm:text-base">
              <tr>
                <th className="py-2 px-4">Tanggal</th>
                <th className="py-2 px-4">Tugas Tambahan</th>
                <th className="py-2 px-4">Lokasi</th>
                <th className="py-2 px-4">Sisa Slot Pekerja</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {tugasTambahanData.length > 0 ? (
                tugasTambahanData.map((item, index) => (
                  <tr key={index} className="border-b border-black-6">
                    <td className="py-2 px-4">{item.date}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">{item.location}</td>
                    <td className="py-2 px-4">{item.remainingSlot}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`w-36 py-1 flex justify-center rounded text-sm font-semibold ${
                          item.status === "Pekerja Terpenuhi"
                            ? "bg-aman-box-surface-color text-aman-text-color"
                            : item.status === "Sedang Diproses"
                            ? "bg-orange-200 text-kritis-text-color"
                            : "bg-kritis-box-surface-color text-kritis-text-color"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td
                      onClick={() => detailTugasTambahanHandle(item.id)}
                      className="py-2 px-4 underline text-black hover:text-black-6 cursor-pointer"
                    >
                      Detail
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 px-4 text-center text-black-9"
                  >
                    Belum ada tugas tambahan yang mengambil pekerjaan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className=" rounded-[4px] border border-black-6">
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
          <p className="text-lg font-bold">Tugas Rutin</p>

          <div
            onClick={tambahTugasRutinHandle}
            className="rounded-[4px] py-2 px-6 bg-orange-300 hover:bg-orange-500  text-black font-medium  cursor-pointer"
          >
            + Tambah tugas
          </div>
        </div>

        <div className="px-4 py-2 overflow-x-auto">
          <table className="w-full min-w-[600px] mb-8 border-collapse text-center text-sm sm:text-base">
            <thead className="bg-green-700 text-white rounded-[4px]">
              <tr>
                <th className="py-2 px-4">Jabatan</th>
                <th className="py-2 px-4">Jumlah Tugas</th>
                <th className="py-2 px-4">Jumlah Pekerja</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tugasRutinData.map((item, index) => (
                <tr key={index} className="border-b border-black-6">
                  <td className="py-2 px-4">{item.role.name}</td>
                  <td className="py-2 px-4">{item.totalWork}</td>
                  <td className="py-2 px-4">{item.totalUser}</td>
                  <td className="py-2 px-4 flex justify-center">
                    <span
                      onClick={() => editTugasRutinHandle(item.role.id)}
                      className="rounded-[4px] py-2 px-6 bg-green-700 text-white font-medium hover:bg-green-900 cursor-pointer"
                    >
                      + Edit tugas rutin
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TugasPegawai;
