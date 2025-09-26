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

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const toISO = (d) => (d ? d : new Date().toISOString().slice(0, 10));

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-200 text-gray-800",
    warning: "bg-orange-200 text-orange-900",
    success: "bg-[#87FF8B] text-[#066000]",
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
  const [paymentProof, setPaymentProof] = useState("https://example.com");

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
      if (res.status === 200) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error("Error get detail:", e);
    }
  };

  const addPayment = async () => {
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
    <div className="border rounded p-4">
      <h2 className="text-2xl font-semibold mb-4">Detail Pengadaan Barang</h2>

      {/* Status di header */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
        <div>
          <p className="text-gray-600">Status Pengiriman</p>
          <div className="mt-1">
            <Badge tone={shipTone}>{data?.procurementStatus ?? "-"}</Badge>
          </div>
        </div>
        <div>
          <p className="text-gray-600">Status Pembayaran</p>
          <div className="mt-1">
            <Badge tone={payStatus === "Lunas" ? "success" : "warning"}>
              {payStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Info utama */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
        <div>
          <p className="text-gray-600">Tanggal Pemesanan</p>
          <p className="text-lg font-semibold">{data?.orderDate}</p>
        </div>
        <div>
          <p className="text-gray-600">Tanggal Tiba</p>
          <p className="text-lg font-semibold">{data?.estimationArrivalDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-gray-600">Nama Barang</p>
          <p className="text-lg font-semibold">{data?.item?.name}</p>
        </div>
        <div>
          <p className="text-gray-600">Supplier</p>
          <p className="text-lg font-semibold">{data?.supplier?.name}</p>
        </div>
        <div>
          <p className="text-gray-600">Jumlah Pemesanan</p>
          <p className="text-lg font-semibold">
            {data?.quantity} {data?.unit || "Kg"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-gray-600">Harga Beli / Unit</p>
          <p className="text-lg font-semibold">{rupiah(data?.price)}</p>
        </div>
        <div>
          <p className="text-gray-600">Harga Beli Total</p>
          <p className="text-lg font-semibold">{rupiah(data?.totalPrice)}</p>
        </div>
      </div>

      {/* Pembayaran */}
      <div className="border rounded mt-3">
        <div className="flex items-center justify-between p-4">
          <p className="font-semibold text-lg">Pembayaran</p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-black cursor-pointer"
          >
            Pilih Pembayaran
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
                ? "Dibayar Sebagian"
                : "Belum Dibayar"}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Tanggal</th>
                  <th className="text-left px-3 py-2">Metode Pembayaran</th>
                  <th className="text-left px-3 py-2">Nominal Pembayaran</th>
                  <th className="text-left px-3 py-2">Sisa Bayar</th>
                  <th className="text-left px-3 py-2">Bukti Pembayaran</th>
                  <th className="px-3 py-2"></th>
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
                      <td className="px-3 py-2 underline cursor-pointer">
                        {p.proof}
                      </td>
                      <td className="w-full px-4 py-2 flex gap-3">
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

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Status Pembayaran :</span>
              <Badge tone={payStatus === "Lunas" ? "success" : "warning"}>
                {payStatus}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                Sisa Bayar :{" "}
                <p className="text-3xl">{rupiah(finalRemaining)}</p>
              </p>
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
              type="text"
              inputMode="numeric"
              className="w-full border rounded p-2 mb-3"
              placeholder="Masukkan nominal"
              value={formatThousand(nominal)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setNominal(raw);
              }}
              min={0}
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
              className="w-full border rounded p-2 mb-4"
              onChange={(e) =>
                setPaymentProof(
                  e.target.files?.[0]?.name
                    ? `file://${e.target.files[0].name}`
                    : "https://example.com"
                )
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setNominal("");
                  setPaymentMethod("Tunai");
                  setPaymentDate(todayISO);
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
      <button
        onClick={() => {
          console.log("data: ", data);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default DetailPengadaanBarang;
