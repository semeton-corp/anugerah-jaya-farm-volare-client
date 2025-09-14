import React from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete, MdStore } from "react-icons/md";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getEggMonitoring } from "../services/eggs";
import { PiCalendarBlank } from "react-icons/pi";
import { deleteEggData } from "../services/eggs";
import {
  formatDate,
  formatDateToDDMMYYYY,
  getTodayDateInBahasa,
} from "../utils/dateFormat";
import { useRef } from "react";
import { getLocations } from "../services/location";

const DetailProduksi = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const [produksiDetail, setProduksiDetail] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const isDetailPage = location.pathname.includes("input-telur");

  const isSelectedDateToday = (selectedDate) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStr = `${yyyy}-${mm}-${dd}`;
    return selectedDate === todayStr;
  };
  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const inputTelurHandle = () => {
    navigate(`${location.pathname}/input-telur`);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    console.log("date: ", date);
    setSelectedDate(date);
  };

  const fetchDataTelur = async () => {
    try {
      let response;

      const date = formatDateToDDMMYYYY(selectedDate);
      response = await getEggMonitoring(selectedSite, date);
      console.log("response: ", response);
      if (response?.status === 200) {
        setProduksiDetail(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await getLocations();
      if (res.status === 200) {
        setSiteOptions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  useEffect(() => {
    fetchDataTelur();
    fetchSites();
    if (location.state?.refetch) {
      fetchDataTelur();
    }
  }, [location]);

  useEffect(() => {
    fetchDataTelur();
  }, [selectedSite, selectedDate]);

  const editDataHandle = (dataId) => {
    const currectPath = location.pathname;
    navigate(`${currectPath}/input-telur/${dataId}`);
  };

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Data Produksi Telur</h1>
        <div className="flex gap-4">
          {userRole == "Owner" && (
            <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
              <MdStore size={18} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="ml-2 bg-transparent text-base font-medium outline-none"
              >
                <option value="">Semua Site</option>
                {siteOptions.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className="flex items-center rounded-lg bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2"
            onClick={openDatePicker}
          >
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2"
            />
          </div>
        </div>
      </div>

      <div className=" flex gap-4">
        <div className=" w-full bg-white px-8 py-6 rounded-lg border border-black-6">
          {userRole != "Pekerja Gudang" && (
            <div className="flex justify-end items-start mb-4">
              <div
                onClick={inputTelurHandle}
                className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
              >
                <div className="text-base font-medium ms-2 text-black">
                  + Input Data Harian
                </div>
              </div>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-700 text-white text-center">
                <th className="py-2 px-4">Kandang</th>
                <th className="py-2 px-4">Total (butir)</th>
                <th className="py-2 px-4">OK (butir)</th>
                <th className="py-2 px-4">Berat Telur Ok (Gr/butir)</th>
                <th className="py-2 px-4">Retak (butir)</th>
                <th className="py-2 px-4">Reject (butir)</th>
                <th className="py-2 px-4">Abnormality (%)</th>
                <th className="py-2 px-4">Status</th>
                {isSelectedDateToday(selectedDate) && (
                  <th className="py-2 px-4">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="text-center">
              {produksiDetail.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 px-4">{item?.chickenCage.cage?.name}</td>
                  <td className="py-2 px-4">{item?.totalAllEgg}</td>
                  <td className="py-2 px-4">{item?.totalGoodEgg}</td>
                  <td className="py-2 px-4">{item?.averageWeight}</td>
                  <td className="py-2 px-4">{item?.totalCrackedEgg}</td>
                  <td className="py-2 px-4">{item?.totalRejectEgg}</td>
                  <td className="py-2 px-4">
                    {item?.abnormalityRate !== undefined &&
                    item?.abnormalityRate !== null
                      ? parseFloat(item.abnormalityRate).toFixed(2)
                      : "-"}
                  </td>
                  <td className="py-2 px-4 flex justify-center">
                    <span
                      className={`w-24 py-1 flex justify-center rounded text-sm font-semibold ${
                        item.status === "Aman"
                          ? "bg-aman-box-surface-color text-aman-text-color"
                          : item.status === "Periksa"
                          ? "bg-update-icon-color text-orange-900"
                          : "bg-kritis-box-surface-color text-kritis-text-color"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {isSelectedDateToday(selectedDate) &&
                    (item.chickenCage.eggPic === userName ||
                      userRole === "Owner" ||
                      userRole === "Kepala Kandang") && (
                      <td className="py-1 px-4  text-center">
                        <span
                          onClick={() => editDataHandle(item.id)}
                          className="py-1 px-5 flex justify-center rounded-[4px] bg-green-700 hover:bg-green-900 cursor-pointer  text-white "
                        >
                          Lihat Detail
                        </span>
                      </td>
                    )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* {userRole === "Owner" && (
            <div className="border-t-3 border-t-black-6 mt-12">
              <div className="mb-10"></div>
              <div className="flex justify-between mt-4 px-6">
                <p className="text-sm text-[#CCCCCC]">Menampilkan 1-7 data</p>
                <div className="flex gap-3">
                  <div className="rounded-[4px] py-2 px-6 bg-green-100 flex items-center justify-center text-black text-base font-medium hover:bg-green-200 cursor-pointer">
                    <p>Previous </p>
                  </div>
                  <div className="rounded-[4px] py-2 px-6 bg-green-700 flex items-center justify-center text-white text-base font-medium hover:bg-green-800 cursor-pointer">
                    <p>Next</p>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default DetailProduksi;
