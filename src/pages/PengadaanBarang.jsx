import React, { useRef } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete, MdStore } from "react-icons/md";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getChickenMonitoring } from "../services/chickenMonitorings";
import { deleteChickenData } from "../services/chickenMonitorings";
import {
  formatDate,
  formatDateToDDMMYYYY,
  getTodayDateInBahasa,
  parseToDate,
} from "../utils/dateFormat";
import {
  arrivalConfirmationWarehouseItemProcurement,
  getWarehouseItemProcurements,
  getWarehouseOrderItems,
  getWarehouses,
  takeWarehouseOrderItem,
} from "../services/warehouses";
import KonfirmasiBarangSampaiGudangModal from "../components/KonfirmasiBarangSampaiGudangModal";
import BatalPengadaanBarangModal from "../components/BatalPengadaanBarangModal";
import { GoAlertFill } from "react-icons/go";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";
import { getCurrentUserWarehousePlacement } from "../services/placement";
import { FaMoneyBillWave } from "react-icons/fa6";

const toNice = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const isOverdue = (iso) => {
  if (!iso) return false;
  const today = new Date();
  const d = new Date(iso + "T23:59:59");
  return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const badge = (text, variant = "neutral") => {
  const map = {
    warning: "bg-[#F2D08A] text-[#5F4000]",
    info: "bg-teal-200 text-teal-900",
    danger: "bg-[#FF5E5E] text-[#640404]",
    success: "bg-[#87FF8B] text-[#0E6A09]",
    neutral: "bg-stone-200 text-stone-900",
  };
  return (
    <span className={`px-3 py-1 rounded text-sm font-medium ${map[variant]}`}>
      {text}
    </span>
  );
};

const PengadaanBarang = () => {
  const userRole = localStorage.getItem("role");

  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [warehouses, setWarehouses] = useState();
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("");
  const paymentStatusOptions = ["Belum Lunas", "Lunas"];

  const [daftarBarangData, setDaftarBarangData] = useState([]);
  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false);
  const [isShowBatalModal, setIsShowBatalModal] = useState(false);

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Pengadaan Barang")
  );

  const [page, setPage] = useState(1);
  const [totalData, setTotaldata] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedItem, setSelectedItem] = useState(null);

  const detailPages = ["draft-pengadaan-barang", "detail-pengadaan-barang"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchBarangData = async () => {
    try {
      const date = formatDateToDDMMYYYY(selectedDate);
      const dataResponse = await getWarehouseItemProcurements(
        selectedWarehouse,
        paymentStatus,
        date,
        page
      );
      console.log("dataResponse: ", dataResponse);
      if (dataResponse.status == 200) {
        setDaftarBarangData(dataResponse.data.data.warehouseItemProcurements);
        setTotaldata(dataResponse.data.data.totalData);
        setTotalPages(dataResponse.data.data.totalPage);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchWarehouseData = async () => {
    try {
      const warehouseResponse = await getWarehouses(selectedSite);
      console.log("warehouseResponse: ", warehouseResponse);
      if (warehouseResponse.status == 200) {
        setWarehouses(warehouseResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchWarehousePlacement = async () => {
    try {
      const placementResponse = await getCurrentUserWarehousePlacement();
      console.log("placementResponse: ", placementResponse);
      if (placementResponse.status == 200) {
        setSelectedWarehouse(placementResponse?.data?.data[0]?.warehouse?.id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const confirmBatalHandle = () => {
    console.log("test:");
    setIsShowBatalModal(false);
  };

  const confirmBarangSampaiHandle = async (payload) => {
    const normalizedPayload = {
      ...payload,
      quantity: Number(payload.quantity) || 0,
    };

    try {
      const arriveResponse = await arrivalConfirmationWarehouseItemProcurement(
        normalizedPayload,
        selectedItem.id
      );
      if (arriveResponse.status == 200) {
        fetchBarangData();
      }
    } catch (error) {
      console.log("error :", error);
    }
    setIsShowConfirmModal(false);
  };

  const handleDraftPengadaanBarang = () => {
    navigate(`${location.pathname}/draft-pengadaan-barang`);
  };

  const handleDetail = (id) => {
    navigate(`${location.pathname}/detail-pengadaan-barang/${id}`);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  useEffect(() => {
    if (userRole == "Pekerja Gudang") {
      fetchWarehousePlacement();
    } else {
      fetchWarehouseData();
    }
  }, []);

  useEffect(() => {
    fetchBarangData();
    if (location.state?.refetch) {
      fetchBarangData();
      window.history.replaceState({}, document.title);
    }
  }, [location, selectedDate, page, selectedWarehouse, paymentStatus]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Pengadaan Barang
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          {/* Payment Status Filter */}
          <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer transition-all duration-200 w-full">
            <FaMoneyBillWave size={18} className="flex-shrink-0" />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none w-full"
            >
              <option value="">Semua Status Pembayaran</option>
              {paymentStatusOptions.map((opt) => (
                <option key={opt} value={opt} className="text-black">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Filter (Owner / Kepala Kandang only) */}
          {(userRole === "Owner" || userRole === "Kepala Kandang") && (
            <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer transition-all duration-200 w-full">
              <MdStore size={18} className="flex-shrink-0" />
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  const warehouseId = e.target.value;
                  console.log("warehouseId:", warehouseId);
                  setSelectedWarehouse(warehouseId);
                }}
                className="ml-2 bg-transparent text-sm sm:text-base font-medium outline-none w-full"
              >
                <option value="">Semua Gudang</option>
                {warehouses?.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <PageNotificationsSection pageNotifications={pageNotifications} />

      <div className="bg-white p-4 border rounded-lg w-full border-black-6">
        <div className="flex justify-end items-center mb-4">
          <div
            onClick={handleDraftPengadaanBarang}
            className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
          >
            <div className="text-base font-medium ms-2 text-black">
              Draft Pengadaan Barang
            </div>
          </div>
        </div>

        <div className="mt-3 w-full overflow-x-auto border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="px-4 py-3 whitespace-nowrap">
                  Tanggal Pemesanan
                </th>
                <th className="px-4 py-3 whitespace-nowrap">Nama Barang</th>
                <th className="px-4 py-3 whitespace-nowrap">Jumlah</th>
                <th className="px-4 py-3 whitespace-nowrap">Supplier</th>
                <th className="px-4 py-3 whitespace-nowrap">Estimasi Tiba</th>
                <th className="px-4 py-3 whitespace-nowrap">
                  Tenggat Pembayaran
                </th>
                <th className="px-4 py-3 whitespace-nowrap">
                  Status Pembayaran
                </th>
                <th className="px-4 py-3 whitespace-nowrap">Keterangan</th>
                <th className="px-4 py-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftarBarangData.map((r, idx) => {
                const paidDate = parseToDate(
                  r.paidDate || r.paymentPaidDate || r.paid_at || ""
                );
                const deadlineDate = parseToDate(
                  r.deadlinePaymentDate ||
                    r.deadline ||
                    r.deadline_at ||
                    r.deadlinePaymentDate
                );

                const isPaidLate =
                  paidDate && deadlineDate
                    ? paidDate.getTime() > deadlineDate.getTime()
                    : false;

                const isLate =
                  (r.isMoreThanDeadlinePaymentDate || isPaidLate) &&
                  r.paymentStatus !== "Lunas";

                return (
                  <React.Fragment key={r.id ?? idx}>
                    <tr className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.orderDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{`${r.quantity} ${r.item.unit}`}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.supplier.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.estimationArrivalDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`${
                              r.paymentStatus === "Lunas"
                                ? "text-gray-400"
                                : isLate
                                ? "text-red-600 font-semibold"
                                : ""
                            }`}
                          >
                            {r.paymentStatus === "Lunas"
                              ? "(Lunas)"
                              : r.deadlinePaymentDate || "-"}
                          </span>

                          {isLate && (
                            <span
                              title="Terlambat"
                              className="text-red-500 flex-shrink-0"
                            >
                              <GoAlertFill size={20} />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.paymentStatus === "Lunas"
                          ? badge("Lunas", "success")
                          : r.paymentStatus === "Belum Dibayar"
                          ? badge("Belum Dibayar", "danger")
                          : badge("Belum Lunas", "warning")}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.procurementStatus === "Sampai - Sesuai"
                          ? badge("Sampai - Sesuai", "success")
                          : r.procurementStatus === "Sampai - Tidak Sesuai"
                          ? badge("Sampai - Tidak Sesuai", "danger")
                          : r.procurementStatus === "Sedang Dikirim"
                          ? badge("Sedang Dikirim", "warning")
                          : r.procurementStatus
                          ? badge(r.procurementStatus, "neutral")
                          : "-"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row gap-2">
                          {!r.IsArrived && (
                            <button
                              onClick={() => {
                                setIsShowConfirmModal(true);
                                setSelectedItem(r);
                              }}
                              className="bg-orange-300 hover:bg-orange-500 text-black px-3 py-1 rounded text-sm font-medium"
                            >
                              Barang Sampai
                            </button>
                          )}

                          <button
                            onClick={() => handleDetail(r.id)}
                            className="bg-green-700 hover:bg-green-900 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {daftarBarangData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-6 px-4 py-3 border-t">
            {daftarBarangData?.length > 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">
                {`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat`}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500">&nbsp;</p>
            )}

            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                disabled={page <= 1 || totalPages <= 0}
                onClick={() => page > 1 && totalPages > 0 && setPage(page - 1)}
                className={`rounded py-2 px-4 text-sm sm:text-base font-medium transition-all ${
                  page <= 1 || totalPages <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-100 hover:bg-green-200 text-black"
                }`}
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages || totalPages <= 0}
                onClick={() =>
                  page < totalPages && totalPages > 0 && setPage(page + 1)
                }
                className={`rounded py-2 px-4 text-sm sm:text-base font-medium transition-all ${
                  page >= totalPages || totalPages <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-white"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {isShowConfirmModal && selectedItem && (
        <KonfirmasiBarangSampaiGudangModal
          isOpen={isShowConfirmModal}
          onClose={() => setIsShowConfirmModal(false)}
          onConfirm={confirmBarangSampaiHandle}
          data={selectedItem}
        />
      )}

      {isShowBatalModal && selectedItem && (
        <BatalPengadaanBarangModal
          isOpen={isShowBatalModal}
          onCancel={() => setIsShowBatalModal(false)}
          onConfirm={confirmBatalHandle}
        />
      )}
    </div>
  );
};

export default PengadaanBarang;
