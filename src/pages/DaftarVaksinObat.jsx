import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getChickenHealthItems } from "../services/chickenMonitorings";

export default function DaftarVaksinObat() {
  const location = useLocation();
  const navigate = useNavigate();

  const detailPage = ["tambah-vaksin", "detail-vaksin-obat"];

  const isDetailPage = detailPage.some((segment) =>
    location.pathname.includes(segment)
  );

  const [vaksinData, setVaksinData] = useState([]);

  const tambahVaksinHandle = () => {
    navigate(`${location.pathname}/tambah-vaksin`);
  };

  const detailVaksinHandle = (id) => {
    navigate(`${location.pathname}/detail-vaksin-obat/${id}`);
  };

  const fetchVaksinData = async () => {
    try {
      const vaksinResponse = await getChickenHealthItems();
      console.log("vaksinResponse: ", vaksinResponse);
      if (vaksinResponse.status === 200) {
        setVaksinData(vaksinResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchVaksinData();

    if (location.state?.refetch) {
      fetchVaksinData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Daftar Vaksin & Obat</h2>

        <button
          onClick={tambahVaksinHandle}
          className="bg-orange-300 hover:bg-orange-500 px-4 sm:px-5 py-2 rounded text-black font-medium text-sm sm:text-base cursor-pointer transition-all"
        >
          + Tambah Vaksin
        </button>
      </div>

      {/* Table Container */}
      <div className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-left border-collapse text-sm text-gray-800">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="px-4 sm:px-6 py-2 whitespace-nowrap">
                Nama Vaksin
              </th>
              <th className="px-4 sm:px-6 py-2 whitespace-nowrap">
                Kategori Vaksin/Obat
              </th>
              <th className="px-4 sm:px-6 py-2 whitespace-nowrap">Usia Ayam</th>
              <th className="px-4 sm:px-6 py-2 whitespace-nowrap">
                Kategori Ayam
              </th>
              <th className="px-4 sm:px-6 py-2 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vaksinData.length > 0 ? (
              vaksinData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    {item.type}
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    {item.chickenAge}
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    {item.chickenCategory}
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    <button
                      onClick={() => detailVaksinHandle(item.id)}
                      className="bg-green-700 hover:bg-green-900 text-white px-3 py-1 rounded text-xs sm:text-sm transition-all"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 py-4 text-sm"
                >
                  Tidak ada data vaksin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
