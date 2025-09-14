import React, { useRef } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
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
  takeWarehouseOrderItem,
} from "../services/warehouses";
import KonfirmasiBarangSampaiGudangModal from "../components/KonfirmasiBarangSampaiGudangModal";
import BatalPengadaanBarangModal from "../components/BatalPengadaanBarangModal";
import { GoAlertFill } from "react-icons/go";

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

  const [daftarBarangData, setDaftarBarangData] = useState([]);
  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false);
  const [isShowBatalModal, setIsShowBatalModal] = useState(false);

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
      const dataResponse = await getWarehouseItemProcurements(date, page);
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
    fetchBarangData();

    if (location.state?.refetch) {
      fetchBarangData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  useEffect(() => {
    fetchBarangData();
  }, [selectedDate, page]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Pengadaan Barang</h1>
      </div>

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

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-700  text-white text-left">
                <th className="px-4 py-3">Tanggal Pemesanan</th>
                <th className="px-4 py-3">Nama barang</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Estimasi Tiba</th>
                <th className="px-4 py-3">Tenggat Pembayaran</th>
                <th className="px-4 py-3">Status Pembayaran</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 ">Aksi</th>
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
                    <tr className="border-b">
                      <td className="px-4 py-3">{r.orderDate}</td>
                      <td className="px-4 py-3">{r.item.name}</td>
                      <td className="px-4 py-3">{`${r.quantity} ${r.item.unit}`}</td>
                      <td className="px-4 py-3">{r.supplier.name}</td>
                      <td className="px-4 py-3">{r.estimationArrivalDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              r.paymentStatus === "Lunas"
                                ? "text-gray-200"
                                : isLate
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {r.paymentStatus == "Lunas"
                              ? "(Lunas)"
                              : r.deadlinePaymentDate || "-"}
                          </span>

                          {isLate && (
                            <span title="Terlambat" className="text-red-500">
                              <GoAlertFill size={24} />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {r.paymentStatus === "Lunas"
                          ? badge("Lunas", "success")
                          : r.paymentStatus === "Belum Dibayar"
                          ? badge("Belum Dibayar", "danger")
                          : badge("Belum Lunas", "warning")}
                      </td>

                      <td className="px-4 py-3">
                        {r.procurementStatus === "Sampai - Sesuai"
                          ? badge("Sampai - Sesuai", "success")
                          : r.procurementStatus === "Sampai - Tidak Sesuai"
                          ? badge("Sampai - Tidak Sesuai", "success")
                          : r.procurementStatus == "Sedang Dikirim"
                          ? badge("Sedang Dikirim", "warning")
                          : r.procurementStatus
                          ? badge(r.procurementStatus, "neutral")
                          : "-"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!r.IsArrived && (
                            <button
                              onClick={() => {
                                setIsShowConfirmModal(true);
                                setSelectedItem(r);
                              }}
                              className="bg-orange-300 hover:bg-orange-500 cursor-pointer text-black px-3 py-1 rounded"
                            >
                              Barang Sampai
                            </button>
                          )}

                          <button
                            onClick={() => handleDetail(r.id)}
                            className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-3 py-1 rounded"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* thin separator */}
                    <tr>
                      <td colSpan={9}>
                        <div className="h-px bg-gray-200 w-full" />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {daftarBarangData.length == 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between mt-16 px-6">
            {daftarBarangData?.length > 0 ? (
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
