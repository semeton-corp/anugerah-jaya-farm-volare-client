import React, { useEffect, useMemo, useState } from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";

import { convertToInputDateFormat, toDDMMYYYY } from "../utils/dateFormat";
import {
  createWarehouseItemProcurementPayment,
  deleteWarehouseItemProcurementPayment,
  getWarehouseItemProcurement,
  updateWarehouseItemProcurementPayment,
} from "../services/warehouses";
import { EditPembayaranModal } from "../components/EditPembayaranModal";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import ImagePopUp from "../components/ImagePopUp";
import { uploadFile } from "../services/file";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const toISO = (d) => (d ? d : new Date().toISOString().slice(0, 10));

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-200 text-gray-800",
    warning: "bg-orange-200 text-orange-900",
    success: "bg-[#87FF8B] text-[#066000]",
    info: "bg-cyan-200 text-cyan-900",
    danger: "bg-red-200 text-red-900",
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

const DetailPengadaanBarang = () => {
  const { id } = useParams();

  const [data, setData] = useState({
    orderDate: "-",
    estimationArrivalDate: "-",
    statusShipping: "-",
    item: { name: "-" },
    supplier: { name: "-" },
    quantity: 0,
    unit: "Kg",
    price: 0,
    totalPrice: 0,
    payments: [],
  });

  const todayISO = new Date().toISOString().slice(0, 10);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentDate, setPaymentDate] = useState(todayISO);
  const [nominal, setNominal] = useState("");
  const [paymentProof, setPaymentProof] = useState();

  const [popupImage, setPopupImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const priceTotal = Number(data?.totalPrice || 0);

  const rows = useMemo(() => {
    let sisa = priceTotal;
    return (data?.payments || []).map((p) => {
      const n = Number(p.nominal || 0);
      sisa = Math.max(sisa - n, 0);
      return {
        id: p.id,
        date: p.date,
        paymentMethod: p.paymentMethod,
        nominalNum: n,
        remainingNum: sisa,
        proof: p.paymentProof || p.proof || "-",
      };
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

  const shipTone = (() => {
    const status = data?.procurementStatus?.toLowerCase();

    if (!status) return "neutral";

    if (status === "sedang dikirim") return "warning";

    if (status.includes("sampai")) return "success";

    if (status.includes("batal") || status.includes("cancel")) return "error";

    return "info";
  })();

  const fetchDetailData = async () => {
    try {
      const res = await getWarehouseItemProcurement(id);
      console.log("res: ", res);
      if (res.status === 200) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error("Error get detail:", e);
    }
  };

  const addPayment = async () => {
    if (nominal <= 0) {
      alert("❌ Nominal pembayaran harus lebih dari 0!");
      return;
    }

    if (!paymentProof) {
      alert("❌ Silahkan unggah bukti pembayaran!");
      return;
    }

    try {
      const payload = {
        nominal: nominal,
        paymentMethod: paymentMethod,
        paymentDate: convertToInputDateFormat(toISO(paymentDate)),
        paymentProof: paymentProof,
      };
      const resp = await createWarehouseItemProcurementPayment(payload, id);
      if (resp.status === 201) {
        alert("✅ Pembayaran berhasil ditambahkan");
        setShowPaymentModal(false);
        setNominal("");
        setPaymentMethod("Tunai");
        setPaymentDate(todayISO);
        fetchDetailData();
      }
    } catch (e) {
      alert(`❌Terjadi Kesalahan: ${e.response.data.message}`);
      console.error("Error add payment:", e);
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
      paymentDate: toDDMMYYYY(paymentDate),
      nominal: String(nominal),
      paymentMethod,
      paymentProof,
    };

    try {
      console.log("id: ", id);
      console.log("var: ", selectedPayment.id);
      const res = await updateWarehouseItemProcurementPayment(
        payload,
        id,
        selectedPayment.id
      );
      if (res?.status === 200) {
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
      } else {
        alert("❌Gagal memperbarui pembayaran.");
      }
    }
  };

  // DELETE
  const submitDeletePayment = async () => {
    if (!selectedPayment?.id) return;
    try {
      const res = await deleteWarehouseItemProcurementPayment(
        id,
        selectedPayment.id
      );
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

  useEffect(() => {
    fetchDetailData();
  }, [id]);

  return (
    <div className="border rounded-lg p-4 md:p-6 bg-white">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-left">
        Detail Pengadaan Barang
      </h2>

      {/* STATUS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm md:text-base">
            Status Pengiriman
          </p>
          <div className="mt-1">
            <Badge tone={shipTone}>{data?.procurementStatus ?? "-"}</Badge>
          </div>
        </div>
        <div>
          <p className="text-gray-600 text-sm md:text-base">
            Status Pembayaran
          </p>
          <div className="mt-1">
            <Badge tone={payStatus === "Lunas" ? "success" : "warning"}>
              {payStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* MAIN INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm md:text-base">
            Tanggal Pemesanan
          </p>
          <p className="text-base md:text-lg font-semibold">
            {data?.orderDate}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm md:text-base">Tanggal Tiba</p>
          <p className="text-base md:text-lg font-semibold">
            {data?.estimationArrivalDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm md:text-base">Nama Barang</p>
          <p className="text-base md:text-lg font-semibold">
            {data?.item?.name}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm md:text-base">Supplier</p>
          <p className="text-base md:text-lg font-semibold">
            {data?.supplier?.name}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm md:text-base">Jumlah Pemesanan</p>
          <p className="text-base md:text-lg font-semibold">
            {data?.quantity} {data?.item?.unit || "Kg"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm md:text-base">
            Harga Beli / Unit
          </p>
          <p className="text-base md:text-lg font-semibold">
            {rupiah(data?.price)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm md:text-base">Harga Beli Total</p>
          <p className="text-base md:text-lg font-semibold">
            {rupiah(data?.totalPrice)}
          </p>
        </div>
      </div>

      {/* PEMBAYARAN SECTION */}
      <div className="border rounded-lg mt-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
          <p className="font-semibold text-lg md:text-xl">Pembayaran</p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black font-medium w-full sm:w-auto text-center"
          >
            Pilih Pembayaran
          </button>
        </div>

        <div className="px-3 md:px-4 pb-4">
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm md:text-base">Tipe Pembayaran :</span>
            <Badge
              tone={
                finalRemaining === 0
                  ? "success"
                  : data.payments?.length
                  ? "warning"
                  : "danger"
              }
            >
              {finalRemaining === 0
                ? "Dibayar Penuh"
                : data.payments?.length
                ? "Dibayar Sebagian"
                : "Belum Dibayar"}
            </Badge>
          </div>

          {/* TABLE SCROLLABLE */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="text-left px-3 py-2 whitespace-nowrap">
                    Tanggal
                  </th>
                  <th className="text-left px-3 py-2 whitespace-nowrap">
                    Metode Pembayaran
                  </th>
                  <th className="text-left px-3 py-2 whitespace-nowrap">
                    Nominal Pembayaran
                  </th>
                  <th className="text-left px-3 py-2 whitespace-nowrap">
                    Sisa Bayar
                  </th>
                  <th className="text-left px-3 py-2 whitespace-nowrap">
                    Bukti Pembayaran
                  </th>
                  <th className="px-3 py-2 whitespace-nowrap text-center">
                    Aksi
                  </th>
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
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{p.date}</td>
                      <td className="px-3 py-2">{p.paymentMethod}</td>
                      <td className="px-3 py-2">{rupiah(p.nominalNum)}</td>
                      <td className="px-3 py-2">{rupiah(p.remainingNum)}</td>
                      <td
                        className="px-3 py-2 text-green-700 hover:text-green-900 underline cursor-pointer"
                        onClick={() => p.proof && setPopupImage(p.proof)}
                      >
                        {p.proof ? "Bukti Pembayaran" : "-"}
                      </td>
                      <td className="px-3 py-2 flex justify-center gap-3">
                        <BiSolidEditAlt
                          onClick={() => {
                            setSelectedPayment({
                              id: p.id,
                              paymentMethod: p.paymentMethod,
                              nominal: p.nominalNum,
                              paymentDate: p.paymentDate,
                              paymentProof: p.proof,
                            });
                            setShowEditModal(true);
                          }}
                          size={22}
                          className="cursor-pointer text-black hover:text-gray-400"
                        />
                        <MdDelete
                          onClick={() => {
                            setSelectedPayment({ id: p.id });
                            setShowDeleteModal(true);
                          }}
                          size={22}
                          className="cursor-pointer text-black hover:text-gray-400"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-sm md:text-base">
                Status Pembayaran:
              </span>
              <Badge tone={payStatus === "Lunas" ? "success" : "warning"}>
                {payStatus}
              </Badge>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right">
              <p className="font-semibold text-sm md:text-base text-gray-700">
                Sisa Bayar:
              </p>
              <p className="text-2xl md:text-3xl font-bold text-green-700 leading-tight">
                {rupiah(finalRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Tambah Pembayaran */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="bg-white w-full max-w-md sm:max-w-lg p-5 rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-4 text-center sm:text-left">
              Tambah Pembayaran
            </h3>

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
              type="text"
              inputMode="numeric"
              className="w-full border rounded p-2 mb-3"
              placeholder="Masukkan nominal"
              value={formatThousand(nominal)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setNominal(raw);
              }}
            />

            <label className="block mb-1 font-medium">Tanggal Bayar</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-3"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <label className="block mb-1 font-medium">Bukti Pembayaran</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded p-2 mb-4"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                try {
                  const fileUrl = await uploadFile(file);
                  setPaymentProof(fileUrl);
                } catch (err) {
                  console.error("Upload error:", err);
                  alert("Upload gagal. Silakan coba lagi.");
                } finally {
                  setIsUploading(false);
                }
              }}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setNominal("");
                  setPaymentMethod("Tunai");
                  setPaymentDate(todayISO);
                }}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white text-center ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                Batal
              </button>
              <button
                onClick={addPayment}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white text-center ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900"
                }`}
              >
                {isUploading ? "Mengunggah..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-4">Hapus pembayaran ini?</h3>
            <div className="flex justify-center flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={submitDeletePayment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE POPUP */}
      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
};

export default DetailPengadaanBarang;
