import React, { useEffect, useRef, useState } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { GoAlertFill } from "react-icons/go";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  formatDate,
  formatDateToDDMMYYYY,
  getTodayDateInBahasa,
  parseToDate,
} from "../utils/dateFormat";
import {
  arrivalConfirmationWarehouseItemCornProcurement,
  getWarehouseItemCornProcurements,
  getWarehouses,
} from "../services/warehouses";
import KonfirmasiBarangSampaiJagungModal from "../components/KonfirmasiBarangSampaiJagungModal";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdStore } from "react-icons/md";
import { getCurrentUserWarehousePlacement } from "../services/placement";

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

const PengadaanJagung = () => {
  const userRole = localStorage.getItem("role");

  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [daftarJagungData, setDaftarJagungData] = useState([]);
  const detailPages = ["draft-pengadaan-jagung", "detail-pengadaan-jagung"];

  const [paymentStatus, setPaymentStatus] = useState("");
  const paymentStatusOptions = ["Belum Lunas", "Lunas"];

  const [page, setPage] = useState(1);
  const [totalData, setTotaldata] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Pengadaan Barang Jagung")
  );

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [warehouses, setWarehouses] = useState();
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const fetchJagungData = async () => {
    try {
      const date = formatDateToDDMMYYYY(selectedDate);
      const dataResponse = await getWarehouseItemCornProcurements(
        selectedWarehouse,
        paymentStatus,
        date,
        page
      );
      console.log("dataResponse: ", dataResponse);
      if (dataResponse.status === 200) {
        setDaftarJagungData(
          dataResponse.data.data.WarehouseItemCornProcurements
        );
        setTotaldata(dataResponse.data.data.totalData);
        setTotalPages(dataResponse.data.data.totalPage);
      }
    } catch (error) {
      console.error("Error fetching corn data:", error);
    }
  };

  const confirmBarangSampaiHandle = async (payload) => {
    console.log("test:", payload);
    try {
      const arriveResponse =
        await arrivalConfirmationWarehouseItemCornProcurement(
          payload,
          selectedItem.id
        );
      console.log("arriveResponse: ", arriveResponse);
      if (arriveResponse.status == 200) {
        fetchJagungData();
      }
    } catch (error) {
      console.log("error :", error);
    }
    setIsShowConfirmModal(false);
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

  useEffect(() => {
    fetchJagungData();
    if (location.state?.refetch) {
      fetchJagungData();
      window.history.replaceState({}, document.title);
    }
  }, [
    location,
    location,
    selectedDate,
    page,
    selectedWarehouse,
    paymentStatus,
  ]);

  useEffect(() => {
    fetchJagungData();
  }, [selectedDate]);

  const handleBarangSampai = (item) => {
    setIsShowConfirmModal(true);
    setSelectedItem(item);
  };

  const handleDetail = (id) => {
    navigate(`${location.pathname}/detail-pengadaan-jagung/${id}`);
  };

  const handleDraftPengadaanJagung = () => {
    navigate(`${location.pathname}/draft-pengadaan-jagung`);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

  useEffect(() => {
    if (userRole == "Pekerja Gudang") {
      fetchWarehousePlacement();
    } else {
      fetchWarehouseData();
    }
  }, []);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Pengadaan Jagung</h1>
        <div className="flex gap-4">
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
          {(userRole === "Owner" || userRole === "Kepala Kandang") && (
            <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
              <MdStore size={18} />
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  const warehouseId = e.target.value;
                  console.log("warehouseId: ", warehouseId);
                  setSelectedWarehouse(warehouseId);
                }}
                className="ml-2 bg-transparent text-base font-medium outline-none"
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

      {/* Main Table Section */}
      <div className="bg-white p-4 border rounded-lg w-full border-black-6">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={handleDraftPengadaanJagung}
            className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
          >
            <div className="text-base font-medium ms-2 text-black">
              Draft Pengadaan Jagung
            </div>
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="px-4 py-3">Tanggal Pemesanan</th>
                <th className="px-4 py-3">Nama barang</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Tenggat Pembayaran</th>
                <th className="px-4 py-3">Status Pembayaran</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftarJagungData.map((item, idx) => {
                const paidDate = parseToDate(
                  item.paidDate ||
                    item.paymentPaidDate ||
                    item.paid_at ||
                    item.paid_at_date ||
                    ""
                );
                const deadlineDate = parseToDate(
                  item.deadlinePaymentDate ||
                    item.deadline ||
                    item.deadline_at ||
                    ""
                );

                const isPaidLate =
                  paidDate && deadlineDate
                    ? paidDate.getTime() > deadlineDate.getTime()
                    : false;

                const isLate =
                  (item.isMoreThanDeadlinePaymentDate || isPaidLate) &&
                  item.paymentStatus !== "Lunas";

                return (
                  <React.Fragment key={item.id ?? idx}>
                    <tr className="border-b">
                      <td className="px-4 py-3">{item.orderDate}</td>
                      <td className="px-4 py-3">{item.item?.name}</td>
                      <td className="px-4 py-3">{`${item.quantity} ${
                        item.item?.unit || ""
                      }`}</td>
                      <td className="px-4 py-3">{item.supplier?.name}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              item.paymentStatus === "Lunas"
                                ? "text-gray-200"
                                : isLate
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {item.paymentStatus === "Lunas"
                              ? "(Lunas)"
                              : item.deadlinePaymentDate || "-"}
                          </span>

                          {isLate && (
                            <span title="Terlambat" className="text-red-500">
                              <GoAlertFill size={24} />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {item.paymentStatus === "Lunas"
                          ? badge("Lunas", "success")
                          : item.paymentStatus === "Belum Dibayar"
                          ? badge("Belum Dibayar", "danger")
                          : badge("Belum Lunas", "warning")}
                      </td>

                      <td className="px-4 py-3">
                        {item.procurementStatus === "Sampai - Sesuai"
                          ? badge("Sampai - Sesuai", "success")
                          : item.procurementStatus === "Sampai - Tidak Sesuai"
                          ? badge("Sampai - Tidak Sesuai", "success")
                          : item.procurementStatus === "Sedang Dikirim"
                          ? badge("Sedang Dikirim", "warning")
                          : item.procurementStatus
                          ? badge(item.procurementStatus, "neutral")
                          : "-"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!item.IsArrived && (
                            <button
                              onClick={() => handleBarangSampai(item)}
                              className="bg-orange-300 hover:bg-orange-500 text-black px-3 py-1 rounded"
                            >
                              Barang Sampai
                            </button>
                          )}
                          <button
                            onClick={() => handleDetail(item.id)}
                            className="bg-green-700 hover:bg-green-900 text-white px-3 py-1 rounded"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {daftarJagungData.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-16 px-6">
          {daftarJagungData?.length > 0 ? (
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
      {isShowConfirmModal && selectedItem && (
        <KonfirmasiBarangSampaiJagungModal
          isOpen={isShowConfirmModal}
          onClose={() => setIsShowConfirmModal(false)}
          onConfirm={confirmBarangSampaiHandle}
          data={selectedItem}
        />
      )}
      <button
        onClick={() => {
          console.log("daftarJagungData: ", daftarJagungData);
          console.log(
            "daftarJagungData[0].isArrived: ",
            daftarJagungData[0].IsArrived
          );
        }}
      >
        CHECk
      </button>
    </div>
  );
};

export default PengadaanJagung;
