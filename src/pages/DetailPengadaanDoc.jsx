import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";
import {
  createChickenProcurementPayment,
  deleteChickenProcurementPayment,
  getChickenProcurement,
  updateChickenProcurementPayment,
} from "../services/chickenMonitorings";
import {
  convertToInputDateFormat,
  formatDateToDDMMYYYY,
} from "../utils/dateFormat";
import { EditPembayaranModal } from "../components/EditPembayaranModal";
import { deleteWarehouseItemCornProcurementPayment } from "../services/warehouses";
import ImagePopUp from "../components/ImagePopUp";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-200 text-gray-800",
    warning: "bg-orange-200 text-orange-900",
    success: "bg-[#87FF8B] text-black",
    info: "bg-cyan-200 text-cyan-900",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
};

export default function DetailPengadaanDoc() {
  const [data, setData] = useState({
    orderDate: "-",
    estimationDate: "-",
    statusShipping: "-",
    supplierName: "-",
    cageName: "-",
    quantity: 0,
    totalPrice: 0,
    payments: [
      {
        id: 1,
        paymentDate: "27 Maret 2025",
        paymentMethod: "Tunai",
        nominal: 2500000,
        proof: "Bukti Pembayaran",
      },
    ],
  });

  const { id } = useParams();

  const today = new Date().toISOString().slice(0, 10);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentDate, setPaymentDate] = useState(today);
  const [nominal, setNominal] = useState("");
  const [paymentProof, setPaymentProof] = useState("https://example.com");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [popupImage, setPopupImage] = useState(null);

  const priceTotal = Number(data?.totalPrice || 0);
  const rows = useMemo(() => {
    let sisa = priceTotal;
    return (data?.payments || []).map((p) => {
      const n = Number(p.nominal || 0);
      sisa = Math.max(sisa - n, 0);
      return { ...p, nominalNum: n, remainingNum: sisa };
    });
  }, [data, priceTotal]);

  const totalPaid = useMemo(
    () =>
      (data?.payments || []).reduce((a, p) => a + Number(p.nominal || 0), 0),
    [data]
  );
  const finalRemaining = Math.max(priceTotal - totalPaid, 0);
  const payStatus =
    finalRemaining === 0 && (data?.payments?.length || 0) > 0
      ? "Lunas"
      : "Belum Lunas";
  const shipTone =
    data?.procurementStatus == "Sedang Dikirim" ? "warning" : "success";

  const addPayment = async () => {
    try {
      const payload = {
        nominal: nominal,
        paymentMethod: paymentMethod,
        paymentDate: convertToInputDateFormat(paymentDate),
        paymentProof: paymentProof,
      };
      console.log("id: ", id);
      console.log("payload: ", payload);
      const paymentResponse = await createChickenProcurementPayment(
        payload,
        id
      );
      console.log("paymentResponse: ", paymentResponse);

      if (paymentResponse.status === 201) {
        alert("✅ Pembayaran berhasil ditambahkan");
        setShowPaymentModal(false);
        setNominal("");
        setPaymentMethod("Tunai");
        setPaymentDate(today);
        fetchDetailData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const submitEditPayment = async ({
    paymentMethod,
    nominal,
    paymentDate,
    paymentProof,
  }) => {
    if (!selectedPayment?.id) return;

    const payload = {
      paymentDate: formatDateToDDMMYYYY(paymentDate),
      nominal: String(nominal),
      paymentMethod,
      paymentProof,
    };
    console.log("payload: ", payload);

    try {
      const res = await updateChickenProcurementPayment(
        payload,
        id,
        selectedPayment.id
      );
      console.log("res: ", res);
      if (res?.status === 201) {
        alert("✅ Pembayaran berhasil diperbarui");
        setShowEditModal(false);
        setSelectedPayment(null);
        fetchDetailData();
      } else {
        alert("❌Gagal memperbarui pembayaran.");
      }
    } catch (e) {
      console.error(e);
      if (e?.response?.data?.message == "nominal is to high") {
        alert("❌Nominal pembayaran melebihi sisa pembayaran.");
      } else if (
        e?.response?.data?.message == "chicken procurement is already paid"
      ) {
        alert("❌Tidak bisa memperbaharui pembayaran yang sudah lunas");
      } else {
        alert("❌Gagal memperbarui pembayaran.");
      }
    }
  };

  // DELETE
  const submitDeletePayment = async () => {
    if (!selectedPayment?.id) return;
    try {
      const res = await deleteChickenProcurementPayment(id, selectedPayment.id);
      console.log("res: ", res);
      if (res?.status === 200 || res?.status === 204) {
        alert("✅ Pembayaran berhasil dihapus");
        setShowDeleteModal(false);
        setSelectedPayment(null);
        fetchDetailData();
      } else {
        alert("Gagal menghapus pembayaran.");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus pembayaran.");
    }
  };

  const fetchDetailData = async () => {
    try {
      const detailResponse = await getChickenProcurement(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        setData(detailResponse.data.data);
        console.log("detailResponse.data.data: ", detailResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching procurement details:", error);
    }
  };

  useEffect(() => {
    fetchDetailData();
  }, []);

  return (
    <div className="border rounded p-6 m-4">
      <h2 className="text-xl sm:text font-semibold mb-4">
        Detail Pengadaan DOC
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 text-sm">
        <div>
          <p className="text-gray-600">Tanggal Pemesanan</p>
          <p className="text-base sm:text-lg font-semibold">
            {data?.orderDate}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Status Pengiriman</p>
          <Badge tone={shipTone}>{data?.procurementStatus}</Badge>
        </div>
        <div>
          <p className="text-gray-600">Estimasi Tiba</p>
          <p className="text-base sm:text-lg font-semibold">
            {data?.estimationArrivalDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">Supplier</p>
          <p className="text-base sm:text-lg font-semibold">
            {data?.supplier?.name}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Kandang</p>
          <p className="text-base sm:text-lg font-semibold">
            {data?.cage?.name}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Jumlah Pemesanan</p>
          <p className="text-base sm:text-lg font-semibold">{data?.quantity}</p>
        </div>
        <div>
          <p className="text-gray-600">Harga</p>
          <p className="text-base sm:text-lg font-semibold">
            {rupiah(data?.totalPrice)}
          </p>
        </div>
        {data?.receiveQuantity && (
          <div>
            <p className="text-gray-600">Jumlah Diterima</p>
            <p
              className={`text-base sm:text-lg font-semibold ${
                data?.receiveQuantity < data?.quantity
                  ? "text-kritis-box-surface-color"
                  : "text-aman-text-color"
              }`}
            >
              {data?.receiveQuantity}
            </p>
          </div>
        )}
      </div>
      <div className="border rounded mt-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
          <p className="font-semibold text-lg">Pembayaran</p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black cursor-pointer w-full sm:w-auto"
          >
            Tambah Pembayaran
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="mb-3">
            <span className="text-sm mr-2">Tipe Pembayaran :</span>
            <Badge
              tone={
                finalRemaining === 0
                  ? "success"
                  : data.payments?.length
                  ? "warning"
                  : "neutral"
              }
            >
              {finalRemaining === 0
                ? "Dibayar Penuh"
                : data.payments?.length
                ? "Dibayar Setengah"
                : "Belum Dibayar"}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm sm:text-base">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Tanggal</th>
                  <th className="text-left px-3 py-2">Metode Pembayaran</th>
                  <th className="text-left px-3 py-2">Nominal Pembayaran</th>
                  <th className="text-left px-3 py-2">Sisa Bayar</th>
                  <th className="text-left px-3 py-2">Bukti Pembayaran</th>
                  <th className="text-left px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-500"
                      colSpan={6}
                    >
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="px-3 py-2">{p.date}</td>
                      <td className="px-3 py-2">{p.paymentMethod}</td>
                      <td className="px-3 py-2">{rupiah(p.nominalNum)}</td>
                      <td className="px-3 py-2">{rupiah(p.remainingNum)}</td>
                      <td className="px-3 py-2">
                        {p.paymentProof ? (
                          <td
                            className="px-3 py-2 underline text-green-700 hover:text-green-900 cursor-pointer text-center"
                            onClick={() => setPopupImage(p.paymentProof)}
                          >
                            {p.paymentProof ? "Bukti Pembayaran" : "-"}
                          </td>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="w-full px-4 py-2 flex gap-3">
                        <BiSolidEditAlt
                          onClick={() => {
                            console.log("p.paymentDate: ", p.date);
                            setSelectedPayment({
                              id: p.id,
                              paymentMethod: p.paymentMethod,
                              nominal: p.nominalNum,
                              paymentDate: p.date,
                              paymentProof: p.paymentProof,
                            });
                            setShowEditModal(true);
                          }}
                          size={24}
                          className="cursor-pointer text-black hover:text-gray-300 transition-colors duration-200"
                        />
                        <MdDelete
                          onClick={() => {
                            setSelectedPayment({ id: p.id });
                            setShowDeleteModal(true);
                          }}
                          size={24}
                          className="cursor-pointer text-black hover:text-gray-300 transition-colors duration-200"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Status Pembayaran :</span>
              <Badge tone={payStatus === "Lunas" ? "success" : "warning"}>
                {payStatus}
              </Badge>
            </div>
            <div className="text-sm sm:text-right w-full sm:w-auto">
              <p>Sisa Bayar : {rupiah(finalRemaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-xl">
            <h3 className="text-lg font-bold mb-4">Tambah Pembayaran</h3>

            <label className="block mb-1 font-medium">Metode Pembayaran</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tunai">Tunai</option>
              <option value="Non Tunai">Non Tunai</option>
            </select>

            <label className="block mb-1 font-medium">Nominal Pembayaran</label>
            <input
              type="number"
              className="w-full border rounded p-2 mb-3"
              placeholder="Masukkan nominal"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
            />

            <label className="block mb-1 font-medium">Tanggal Bayar</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-3"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <label className="block mb-1 font-medium">Bukti Pembayaran</label>
            <input type="file" className="w-full border rounded p-2 mb-4" />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setNominal("");
                  setPaymentMethod("Tunai");
                  setPaymentDate(today);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={addPayment}
                className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT modal */}
      <EditPembayaranModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPayment(null);
        }}
        onSave={submitEditPayment}
        title="Edit Pembayaran"
        initialValues={
          selectedPayment && {
            paymentMethod: selectedPayment.paymentMethod,
            nominal: selectedPayment.nominal,
            paymentDate: selectedPayment.paymentDate,
            paymentProof: selectedPayment.paymentProof,
          }
        }
      />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm p-6 rounded shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-center">
              Hapus pembayaran ini?
            </h3>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={submitDeletePayment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
}
