import React, { useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAfkirChickenSales } from "../services/chickenMonitorings";
import { useEffect } from "react";
import { LiaOilCanSolid } from "react-icons/lia";
import { useSelector } from "react-redux";
import PageNotificationsCard from "../components/PageNotificationsCard";

const getStatusColor = (status) => {
  switch (status) {
    case "Belum Lunas":
      return "bg-orange-200 text-orange-900";
    case "Belum Lunas":
      return "bg-[#FF5E5E] text-[#640404]";
    case "Lunas":
      return "bg-[#87FF8B] text-[#066000]";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

const JualAyamAfkir = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [salesData, setSalesData] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const paymentStatusOptions = ["Belum Dibayar", "Belum Lunas", "Lunas"];

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts.includes("Penjualan Ayam")
  );
  console.log("pageNotifications: ", pageNotifications);

  const detailPages = [
    "draft-penjualan-ayam",
    "daftar-pelanggan-ayam",
    "detail-penjualan-ayam",
  ];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const draftPenjualanAyamHandle = () => {
    navigate(`${location.pathname}/draft-penjualan-ayam`);
  };

  const draftPelangganAyamHandle = () => {
    navigate(`${location.pathname}/daftar-pelanggan-ayam`);
  };

  const fetchSalesData = async () => {
    try {
      const saleResponse = await getAfkirChickenSales(page, paymentStatus);

      if (saleResponse.status == 200) {
        setSalesData(saleResponse.data.data.afkirChickenSales);
        setTotalData(saleResponse.data.data.totalData);
        setTotalPages(saleResponse.data.data.totalPage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchSalesData();
    if (location?.state?.refetch) {
      fetchSalesData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchSalesData();
  }, [page, paymentStatus]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold mb-6">Jual Ayam Afkir</h2>
        <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
          <FaMoneyBillWave size={18} />
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="ml-2 bg-transparent text-base font-medium outline-none"
          >
            <option value="">Semua Status Pembayaran</option>
            {paymentStatusOptions.map((opt) => (
              <option key={opt} value={opt} className="text-black">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto flex flex-col gap-3">
        {pageNotifications &&
          pageNotifications.map((item, index) => (
            <PageNotificationsCard key={index} description={item.description} />
          ))}
      </div>

      <div className="bg-white p-4 rounded shadow border">
        <div className="flex justify-end items-center mb-3">
          <div className="flex gap-2">
            <button
              onClick={draftPelangganAyamHandle}
              className="bg-orange-300 hover:bg-orange-500 cursor-pointer px-3 py-2 rounded text-sm font-medium"
            >
              Daftar Pelanggan Ayam
            </button>
            <button
              onClick={draftPenjualanAyamHandle}
              className="bg-orange-300 hover:bg-orange-500 cursor-pointer px-3 py-2 rounded text-sm font-medium"
            >
              Draft Penjualan Ayam
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="p-3">Tanggal Jual</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Status Pembayaran</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.sellDate}</td>
                  <td className="p-3">{item.afkirChickenCustomer.name}</td>
                  <td className="p-3">{`${item.totalSellChicken} Ekor`}</td>
                  <td className="p-3">
                    <span
                      className={`text-sm px-3 py-1 rounded font-medium ${getStatusColor(
                        item.paymentStatus
                      )}`}
                    >
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`detail-penjualan-ayam/${item.id}`)
                      }
                      className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-3 py-1 rounded text-sm"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex justify-between mt-16 px-6">
          {salesData?.length > 0 ? (
            <p className="text-sm text-[#CCCCCC]">{`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat`}</p>
          ) : (
            <p></p>
          )}
          <div className="flex gap-3">
            <div
              className={`rounded-[4px] py-2 px-6 ${
                page <= 1 || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-100 hover:bg-green-200 cursor-pointer"
              } flex items-center justify-center text-black text-base font-medium `}
              onClick={() => page > 1 && totalPages > 0 && setPage(page - 1)}
            >
              <p>Previous</p>
            </div>
            <div
              className={`rounded-[4px] py-2 px-6 ${
                page >= totalPages || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800 cursor-pointer"
              } flex items-center justify-center text-white text-base font-medium `}
              onClick={() =>
                page < totalPages && totalPages > 0 && setPage(page + 1)
              }
            >
              <p>Next</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JualAyamAfkir;
