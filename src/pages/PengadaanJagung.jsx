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
} from "../services/warehouses";
import KonfirmasiBarangSampaiJagungModal from "../components/KonfirmasiBarangSampaiJagungModal";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";

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
  const location = useLocation();
  const navigate = useNavigate();

  const [daftarJagungData, setDaftarJagungData] = useState([]);
  const detailPages = ["draft-pengadaan-jagung", "detail-pengadaan-jagung"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Pengadaan Barang Jagung")
  );

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

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
      const dataResponse = await getWarehouseItemCornProcurements(date);
      console.log("dataResponse: ", dataResponse);
      if (dataResponse.status === 200) {
        setDaftarJagungData(
          dataResponse.data.data.WarehouseItemCornProcurements
        );
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

  useEffect(() => {
    fetchJagungData();
    if (location.state?.refetch) {
      fetchJagungData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Pengadaan Jagung</h1>
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
        {/* Pagination Section */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Menampilkan 1-10 dari 1000 riwayat
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-md bg-green-200 text-green-700 font-medium">
              Previous
            </button>
            <button className="px-4 py-2 rounded-md bg-green-700 text-white font-medium">
              Next
            </button>
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
