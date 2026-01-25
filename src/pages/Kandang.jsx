import React, { useState } from "react";
import { useEffect } from "react";
import { FaWarehouse } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { getChickenCage } from "../services/cages";

const Kandang = () => {
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [kandangData, setKandangData] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchKandangData = async () => {
    try {
      const kandangResponse = await getChickenCage();

      if (kandangResponse.status === 200) {
        const allKandang = kandangResponse.data.data;
        const locationId = parseInt(localStorage.getItem("locationId"), 10);

        let filteredKandang = allKandang;

        console.log("allKandang: ", allKandang);
        if (userRole == "Kepala Kandang") {
          filteredKandang = allKandang.filter(
            (item) => item.cage.location.id === locationId,
          );
        } else if (userRole == "Pekerja Kandang") {
          filteredKandang = allKandang.filter(
            (item) => item.chickenPic === userName,
          );
        }

        console.log("Filtered Kandang:", filteredKandang);
        // Do something with filteredKandang, e.g., set state
        setKandangData(filteredKandang);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchKandangData();
    if (location?.state?.refetch) {
      fetchKandangData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Kandang</h2>
        {/* <button className="flex items-center gap-2 bg-orange-300 text-black text-sm px-4 py-2 rounded hover:bg-orange-500 transition cursor-pointer">
          <FaWarehouse />
          Sidodadi
        </button> */}
      </div>

      <div className="p-6 border  bg-white rounded-[4px]">
        <div className="overflow-x-auto bg-white  rounded">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="py-2 px-4">Kandang</th>
                <th className="py-2 px-4">ID Batch</th>
                <th className="py-2 px-4">Kategori</th>
                <th className="py-2 px-4">Usia</th>
                <th className="py-2 px-4">Jumlah Ayam Hidup</th>
                <th className="py-2 px-4">Kapasitas Maksimum </th>
                <th className="py-2 px-4">PIC Ayam</th>
                <th className="py-2 px-4">PIC Telur</th>
              </tr>
            </thead>
            <tbody>
              {kandangData.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{row?.cage?.name}</td>
                  <td className="py-2 px-4">{row.batchId}</td>
                  <td className="py-2 px-4">{row.cage.chickenCategory}</td>
                  <td className="py-2 px-4">{`${row.chickenAge} minggu`}</td>
                  <td className="py-2 px-4">{`${row.totalChicken} ekor`}</td>
                  <td className="py-2 px-4">{`${row.cage.capacity} ekor`}</td>
                  <td className="py-2 px-4">{row.chickenPic}</td>
                  <td className="py-2 px-4">{row.eggPic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Kandang;
