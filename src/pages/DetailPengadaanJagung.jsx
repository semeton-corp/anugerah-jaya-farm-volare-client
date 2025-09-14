import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createWarehouseItemCornProcurementPayment,
  deleteWarehouseItemCornProcurementPayment,
  getWarehouseItemCornProcurement,
  updateWarehouseItemCornProcurementPayment,
} from "../services/warehouses";
import { EditPembayaranModal } from "../components/EditPembayaranModal";
import { MdDelete } from "react-icons/md";
import { BiSolidEditAlt } from "react-icons/bi";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const toDDMMYYYY = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-200 text-gray-800",
    warning: "bg-orange-200 text-orange-900",
    success: "bg-[#87FF8B] text-[#256d25]",
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

const TambahPembayaranModal = ({
  open,
  onClose,
  onSave,
  defaultMethod = "Tunai",
}) => {
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
  const [nominal, setNominal] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentProof, setPaymentProof] = useState("https://example.com");

  useEffect(() => {
    if (!open) return;
    setPaymentMethod(defaultMethod);
    setNominal("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentProof("https://example.com");
  }, [open, defaultMethod]);

  if (!open) return null;

  return (
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

        <label className="block mb-1 font-medium">Bukti Pembayaran (URL)</label>
        <input
          type="text"
          className="w-full border rounded p-2 mb-4"
          placeholder="https://contoh.com/bukti"
          value={paymentProof}
          onChange={(e) => setPaymentProof(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() =>
              onSave({
                paymentMethod,
                nominal,
                paymentDate,
                paymentProof,
              })
            }
            className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DetailPengadaanJagung() {
  const { id } = useParams();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

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
      const res = await updateWarehouseItemCornProcurementPayment(
        payload,
        id,
        selectedPayment.id
      );
      if (res?.status === 200) {
        alert("✅ Pembayaran berhasil diperbarui");
        setShowEditModal(false);
        setSelectedPayment(null);
        fetchDetail();
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
      const res = await deleteWarehouseItemCornProcurementPayment(
        id,
        selectedPayment.id
      );
      if (res?.status === 200 || res?.status === 204) {
        alert("✅ Pembayaran berhasil dihapus");
        setShowDeleteModal(false);
        setSelectedPayment(null);
        fetchDetail();
      } else {
        alert("Gagal menghapus pembayaran.");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus pembayaran.");
    }
  };

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await getWarehouseItemCornProcurement(id);
      console.log("res: ", res);
      if (res?.status === 200) {
        setData(res.data?.data || null);
      } else {
        setErr("Gagal memuat detail pengadaan.");
      }
    } catch (e) {
      console.error(e);
      setErr("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const {
    orderDate,
    inputDate,
    estimationArrivalDate,
    warehouse,
    supplier,
    item,
    quantity,
    unit,
    totalPrice,
    price,
    discount,
    cornWaterLevel,
    ovenCondition,
    isOvenCanOperateInNearDay,
    expiredAt,
    deadlinePaymentDate,
    payments = [],
    statusShipping,
    procurementStatus,
  } = data || {};

  const priceNumber = Number(price || 0);
  const discountNumber = Number(discount || 0);

  const pricePerKgAfterDiscount = useMemo(() => {
    if (!priceNumber) return 0;
    return Math.round(priceNumber * (1 - discountNumber / 100));
  }, [priceNumber, discountNumber]);

  const totalPriceNumber = useMemo(() => {
    const fromApi = Number(totalPrice || 0);
    if (fromApi) return fromApi;
    return Math.round(Number(quantity || 0) * pricePerKgAfterDiscount);
  }, [totalPrice, quantity, pricePerKgAfterDiscount]);

  const paymentRows = useMemo(() => {
    let sisa = totalPriceNumber;
    return (payments || []).map((p) => {
      const nominalNum = Number(p.nominal || p.amount || 0);
      sisa = Math.max(sisa - nominalNum, 0);
      return {
        id: p.id,
        paymentDate: p.paymentDate || p.date || "-",
        paymentMethod: p.paymentMethod || "-",
        nominalNum,
        remainingNum: sisa,
        proof: p.paymentProof || p.proof || "-",
      };
    });
  }, [payments, totalPriceNumber]);

  const totalPaid = useMemo(
    () =>
      (payments || []).reduce(
        (a, p) => a + Number(p.nominal || p.amount || 0),
        0
      ),
    [payments]
  );
  const finalRemaining = Math.max(totalPriceNumber - totalPaid, 0);
  const payStatus =
    finalRemaining === 0 && (payments?.length || 0) > 0
      ? "Lunas"
      : "Belum Lunas";
  const shipTone =
    procurementStatus === "Sedang Dikirim"
      ? "warning"
      : procurementStatus == "Sampai - Tidak Sesuai"
      ? "success"
      : procurementStatus == "Sampai - Sesuai"
      ? "success"
      : "neutral";

  const submitPayment = async ({
    paymentMethod,
    nominal,
    paymentDate,
    paymentProof,
  }) => {
    if (!nominal || Number(nominal) <= 0) {
      alert("Nominal pembayaran harus lebih dari 0.");
      return;
    }
    if (!paymentDate) {
      alert("Tanggal bayar wajib diisi.");
      return;
    }
    const payload = {
      paymentDate: toDDMMYYYY(paymentDate),
      nominal: String(nominal),
      paymentMethod,
      paymentProof,
    };

    // console.log("payload: ", payload);

    try {
      const res = await createWarehouseItemCornProcurementPayment(payload, id);
      if (res?.status === 200 || res?.status === 201) {
        alert("✅ Pembayaran berhasil ditambahkan");
        setShowPaymentModal(false);
        fetchDetail();
      } else {
        alert("Gagal menambahkan pembayaran.");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan pembayaran.");
    }
  };

  if (loading) return <div className="p-4">Memuat detail…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!data) return <div className="p-4">Data tidak ditemukan.</div>;

  return (
    <div className="border rounded p-4 m-4">
      <h2 className="text-2xl font-semibold mb-4">Detail Pengadaan Jagung</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <div>
          <p className="text-gray-600">Tanggal Pemesanan</p>
          <p className="text-lg font-semibold">
            {orderDate || inputDate || "-"}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Status Pengiriman</p>
          <Badge tone={shipTone}>{procurementStatus || "-"}</Badge>
        </div>
        <div>
          <p className="text-gray-600">Estimasi Tiba</p>
          <p className="text-lg font-semibold">
            {estimationArrivalDate || "-"}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Gudang</p>
          <p className="text-lg font-semibold">{warehouse?.name || "-"}</p>
        </div>
      </div>

      {/* Ringkasan utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-gray-600">Supplier</p>
          <p className="text-lg font-semibold">{supplier?.name || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600">Nama Barang</p>
          <p className="text-lg font-semibold">{item?.name || "Jagung"}</p>
        </div>
        <div>
          <p className="text-gray-600">Jumlah</p>
          <p className="text-lg font-semibold">
            {quantity ?? 0} {unit || item?.unit || "Kg"}
          </p>
        </div>
      </div>

      {/* Kualitas & Oven */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-gray-600">Kadar Air</p>
          <p className="text-lg font-semibold">
            {cornWaterLevel != null ? `${cornWaterLevel}%` : "-"}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Kondisi Oven</p>
          <p className="text-lg font-semibold">{ovenCondition || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600">Oven bisa hidup 1-2 hari?</p>
          <p className="text-lg font-semibold">
            {isOvenCanOperateInNearDay === true
              ? "Ya"
              : isOvenCanOperateInNearDay === false
              ? "Tidak"
              : "-"}
          </p>
        </div>
      </div>

      {/* Harga */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div>
          <p className="text-gray-600">Harga Normal / Kg</p>
          <p className="text-lg font-semibold">{rupiah(priceNumber)}</p>
        </div>
        <div>
          <p className="text-gray-600">Diskon</p>
          <p className="text-lg font-semibold">
            {discountNumber ? `${discountNumber}%` : "0%"}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Harga Beli / Kg</p>
          <p className="text-lg font-semibold">
            {rupiah(pricePerKgAfterDiscount)}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Harga Total</p>
          <p className="text-lg font-semibold">{rupiah(totalPriceNumber)}</p>
        </div>
      </div>

      {/* Tanggal penting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-gray-600">Kadaluarsa</p>
          <p className="text-lg font-semibold">{expiredAt || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600">Tenggat Pembayaran</p>
          <p className="text-lg font-semibold">{deadlinePaymentDate || "-"}</p>
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
                  : payments?.length
                  ? "warning"
                  : "neutral"
              }
            >
              {finalRemaining === 0
                ? "Dibayar Penuh"
                : payments?.length
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
                  <th className="text-left px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-500"
                      colSpan={5}
                    >
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                ) : (
                  paymentRows.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="px-3 py-2">{p.paymentDate}</td>
                      <td className="px-3 py-2">{p.paymentMethod}</td>
                      <td className="px-3 py-2">{rupiah(p.nominalNum)}</td>
                      <td className="px-3 py-2">{rupiah(p.remainingNum)}</td>
                      <td className="px-3 py-2 underline">{p.proof || "-"}</td>
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
              <Badge tone={finalRemaining === 0 ? "success" : "warning"}>
                {finalRemaining === 0 ? "Lunas" : "Belum Lunas"}
              </Badge>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">
                Sisa Bayar :{" "}
                <p className="text-3xl">{rupiah(finalRemaining)}</p>
              </p>
            </div>
          </div>
        </div>
      </div>

      <TambahPembayaranModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={submitPayment}
      />

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
    </div>
  );
}
