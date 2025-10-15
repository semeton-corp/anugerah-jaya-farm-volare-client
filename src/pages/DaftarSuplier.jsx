import React from "react";
import { IoSearch } from "react-icons/io5";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlank } from "react-icons/pi";
import { BiSolidEditAlt } from "react-icons/bi";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { getSuppliers } from "../services/supplier";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const DaftarSuplier = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const detailPage = ["tambah-supplier", "detail-supplier"];

  const isDetailPage = detailPage.some((segment) =>
    location.pathname.includes(segment)
  );

  const [supplierData, setSupplierData] = useState([]);

  const fetchSupplierData = async () => {
    try {
      const supplierResponse = await getSuppliers();
      // console.log("supplierResponse: ", supplierResponse);
      if (supplierResponse.status == 200) {
        setSupplierData(supplierResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const tambahSupplierHandle = () => {
    navigate(`${location.pathname}/tambah-supplier`);
  };

  const lihatDetailHandle = (id) => {
    navigate(`${location.pathname}/detail-supplier/${id}`);
  };

  useEffect(() => {
    fetchSupplierData();

    if (location.state?.refetch) {
      fetchSupplierData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call parent function with search input
  };

  if (isDetailPage) {
    return <Outlet />;
  }
  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Daftar Supplier</h1>

        <button
          onClick={tambahSupplierHandle}
          className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 text-sm sm:text-base font-medium cursor-pointer transition-all"
        >
          + Tambah Supplier
        </button>
      </div>

      {/* Main Box */}
      <div className="rounded-md border border-gray-300 bg-white shadow-sm">
        <div className="px-3 sm:px-6 py-4 sm:py-6 overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800 border-collapse">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left whitespace-nowrap">
                  Nama Supplier
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap">
                  Alamat
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap">
                  Nomor Telepon
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>

            <tbody>
              {supplierData.length > 0 ? (
                supplierData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-2 min-w-[200px]">{item.address}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.phoneNumber}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => lihatDetailHandle(item.id)}
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
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data supplier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DaftarSuplier;
