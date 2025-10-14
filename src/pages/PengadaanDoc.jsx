import React from "react";
import { useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import KonfirmasiPengadaanDocModal from "../components/KonfirmasiPengadaanDocModal";
import {
  arrivalConfirmationChickenProcurement,
  getChickenProcurements,
} from "../services/chickenMonitorings";
import { useEffect } from "react";
import { GoAlertFill } from "react-icons/go";
import { parseToDate } from "../utils/dateFormat";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";

const getPaymentClass = (status) => {
  switch (status) {
    case "Belum Lunas":
      return "bg-orange-200 text-orange-900";
    case "Belum Dibayar":
      return "bg-[#FF5E5E] text-[#640404]";
    case "Lunas":
      return "bg-[#87FF8B] text-[#066000]";
    default:
      return "";
  }
};

const getShippingClass = (status) => {
  switch (status) {
    case false:
      return "bg-orange-200 text-orange-900";
    case true:
      return "bg-[#87FF8B] text-[#066000]";
    default:
      return "";
  }
};

const PengadaanDoc = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Pengadaan Ayam")
  );

  const [paymentStatus, setPaymentStatus] = useState("");
  const paymentStatusOptions = ["Belum Dibayar", "Belum Lunas", "Lunas"];

  const [showBarangsampaiModal, setShowBarangSampaiModal] = useState(false);

  const detailPages = ["draft-pesan-doc", "detail-pengadaan-doc"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchOrderData = async () => {
    try {
      const ordersResponse = await getChickenProcurements(page, paymentStatus);
      console.log("ordersResponse: ", ordersResponse);
      if (ordersResponse.status === 200) {
        setOrderData(ordersResponse.data.data.chickenProcurements);
        setTotalData(ordersResponse.data.data.totalData);
        setTotalPages(ordersResponse.data.data.totalPage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleSubmitArrivalConfiramation = async (result) => {
    try {
      const payload = {
        quantity: parseInt(result.quantity),
        ...(result.catatan?.trim() ? { note: result.catatan } : {}),
      };

      const arrivalResponse = await arrivalConfirmationChickenProcurement(
        payload,
        selectedItem.id
      );

      if (arrivalResponse.status === 200) {
        alert("✅ Konfirmasi pengadaan berhasil");
        setShowBarangSampaiModal(false);
        fetchOrderData();
      }
      console.log("arrivalResponse: ", arrivalResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const draftPesanDocHandle = () => {
    navigate(`${location.pathname}/draft-pesan-doc`);
  };

  const handleDetailProcurement = (id) => {
    navigate(`${location.pathname}/detail-pengadaan-doc/${id}`);
  };

  useEffect(() => {
    fetchOrderData();
    if (location?.state?.refetch) {
      fetchOrderData();
    }
  }, [location]);

  useEffect(() => {
    fetchOrderData();
  }, [page, paymentStatus]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Pengadaan DOC</h1>

        <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer w-full md:w-auto">
          <FaMoneyBillWave size={18} />
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="ml-2 bg-transparent text-base font-medium outline-none w-full md:w-auto"
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

      <PageNotificationsSection pageNotifications={pageNotifications} />

      {/* Table container */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-300 mt-3">
        <div className="flex justify-end items-center mb-2">
          <button
            onClick={draftPesanDocHandle}
            className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer text-sm md:text-base"
          >
            Draft Pesan DOC
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="p-2 md:p-3">Tanggal Pemesanan</th>
                <th className="p-2 md:p-3">Kandang</th>
                <th className="p-2 md:p-3">Jumlah</th>
                <th className="p-2 md:p-3">Supplier</th>
                <th className="p-2 md:p-3">Estimasi Tiba</th>
                <th className="p-2 md:p-3">Tenggat Pembayaran</th>
                <th className="p-2 md:p-3">Status Pembayaran</th>
                <th className="p-2 md:p-3">Status Pengiriman</th>
                <th className="p-2 md:p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orderData.map((order, index) => {
                const paidDate = parseToDate(
                  order.paidDate ||
                    order.paid_at ||
                    order.paymentPaidDate ||
                    order.paid_on ||
                    ""
                );
                const deadlineDate = parseToDate(
                  order.deadlinePaymentDate ||
                    order.deadline ||
                    order.deadline_at ||
                    ""
                );

                const isPaidLate =
                  paidDate && deadlineDate
                    ? paidDate.getTime() > deadlineDate.getTime()
                    : false;

                const isLate =
                  (order.isMoreThanDeadlinePaymentDate || isPaidLate) &&
                  order.paymentStatus !== "Lunas";

                return (
                  <tr key={order.id ?? index} className="border-t">
                    <td className="p-2 md:p-3">{order.orderDate}</td>
                    <td className="p-2 md:p-3">{order.cage?.name}</td>
                    <td className="p-2 md:p-3">{order.quantity}</td>
                    <td className="p-2 md:p-3">{order.supplier?.name}</td>
                    <td className="p-2 md:p-3">
                      {order.estimationArrivalDate}
                    </td>

                    <td className="p-2 md:p-3 flex items-center gap-2">
                      <span
                        className={
                          order.paymentStatus === "Lunas"
                            ? "text-gray-400"
                            : isLate
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {order.paymentStatus === "Lunas"
                          ? "(Lunas)"
                          : order.deadlinePaymentDate || "-"}
                      </span>

                      {isLate && (
                        <span
                          title="Sudah melewati deadline"
                          className="text-red-600"
                        >
                          <GoAlertFill size={20} />
                        </span>
                      )}
                    </td>

                    <td className="p-2 md:p-3">
                      <span
                        className={`px-2 py-1 text-xs md:text-sm font-medium rounded ${getPaymentClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="p-2 md:p-3">
                      <span
                        className={`px-2 py-1 text-xs md:text-sm font-medium rounded ${getShippingClass(
                          order.IsArrived
                        )}`}
                      >
                        {order.procurementStatus}
                      </span>
                    </td>

                    <td className="p-2 md:p-3 flex flex-col md:flex-row gap-2">
                      {!order.IsArrived && (
                        <button
                          onClick={() => {
                            setShowBarangSampaiModal(true);
                            setSelectedItem(order);
                          }}
                          className="bg-orange-300 hover:bg-orange-500 text-xs md:text-sm px-3 py-1 rounded cursor-pointer"
                        >
                          Ayam Sampai
                        </button>
                      )}
                      <button
                        onClick={() => handleDetailProcurement(order.id)}
                        className="bg-green-700 hover:bg-green-900 text-white text-xs md:text-sm px-3 py-1 rounded cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-6 px-2 md:px-6">
          {orderData?.length > 0 ? (
            <p className="text-sm text-gray-400">{`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat`}</p>
          ) : (
            <p></p>
          )}
          <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
            <div
              className={`rounded py-2 px-4 ${
                page <= 1 || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-100 hover:bg-green-200 cursor-pointer"
              } flex items-center justify-center text-black text-sm md:text-base font-medium w-full md:w-auto`}
              onClick={() => page > 1 && totalPages > 0 && setPage(page - 1)}
            >
              <p>Previous</p>
            </div>
            <div
              className={`rounded py-2 px-4 ${
                page >= totalPages || totalPages <= 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800 cursor-pointer"
              } flex items-center justify-center text-white text-sm md:text-base font-medium w-full md:w-auto`}
              onClick={() =>
                page < totalPages && totalPages > 0 && setPage(page + 1)
              }
            >
              <p>Next</p>
            </div>
          </div>
        </div>
      </div>

      {showBarangsampaiModal && (
        <KonfirmasiPengadaanDocModal
          data={{
            kandang: selectedItem?.cage?.name || "-",
            namaBarang: "Ayam DOC",
            supplier: selectedItem?.supplier?.name || "-",
            supplierPhone: selectedItem?.supplier?.phoneNumber || "-",
            jumlah: selectedItem?.quantity || 0,
          }}
          onClose={() => setShowBarangSampaiModal(false)}
          onConfirm={(result) => {
            handleSubmitArrivalConfiramation(result);
          }}
        />
      )}
    </div>
  );
};

export default PengadaanDoc;
