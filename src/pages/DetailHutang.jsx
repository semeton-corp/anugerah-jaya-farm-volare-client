// src/pages/DetailHutang.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getDebt } from "../services/cashflow";
import {
  createWarehouseItemProcurementPayment,
  createWarehouseItemCornProcurementPayment,
  updateWarehouseItemCornProcurementPayment,
  deleteWarehouseItemCornProcurementPayment,
  updateWarehouseItemProcurementPayment,
  deleteWarehouseItemProcurementPayment,
} from "../services/warehouses";
import {
  createChickenProcurementPayment,
  deleteChickenProcurementPayment,
  updateChickenProcurementPayment,
} from "../services/chickenMonitorings";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { EditPembayaranModal } from "../components/EditPembayaranModal";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { FaExclamationTriangle } from "react-icons/fa";
import { uploadFile } from "../services/file";
import ImagePopUp from "../components/ImagePopUp";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const isOverdue = (deadline, remaining) => {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return false;
  const stillOwe = Number(remaining || 0) > 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return stillOwe && d < today;
};

const formatTanggalID = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
};

const toDDMMYYYY = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const Badge = ({ children, tone = "warning" }) => {
  const tones = {
    warning: "bg-orange-200 text-orange-900",
    success: "bg-[#87FF8B] text-[#256d25]",
    neutral: "bg-gray-200 text-gray-800",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded ${tones[tone]}`}>
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
  const [paymentProof, setPaymentProof] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPaymentMethod(defaultMethod);
    setNominal("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentProof("");
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
          accept="image/*"
          className="w-full border rounded p-2 mb-4"
          onChange={async (e) => {
            const fileInput = e.target;
            const file = fileInput.files?.[0];
            if (!file) return;

            setIsUploading(true);

            try {
              const fileUrl = await uploadFile(file);
              setPaymentProof(fileUrl);
            } catch (err) {
              console.error("Upload error:", err);
              alert("Upload gagal. Silakan coba lagi.");
              fileInput.value = "";
            } finally {
              setIsUploading(false);
            }
          }}
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
              onSave({ paymentMethod, nominal, paymentDate, paymentProof })
            }
            disabled={isUploading}
            className={`px-4 py-2 rounded text-white ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-900 cursor-pointer"
            }`}
          >
            {isUploading ? "Mengunggah..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

const callAddPaymentByCategory = (category, id, payload) => {
  const cat = (category || "").toLowerCase();
  console.log("cat: ", cat);
  if (cat.includes("ayam doc") || cat.includes("pengadaan ayam")) {
    return createChickenProcurementPayment(payload, id);
  }

  if (cat.includes("pengadaan jagung") || cat.includes("jagung")) {
    return createWarehouseItemCornProcurementPayment(payload, id);
  }

  if (
    cat.includes("pengadaan gudang") ||
    cat.includes("pengadaan barang") ||
    cat.includes("gudang") ||
    cat.includes("semua") //error the category
  ) {
    return createWarehouseItemProcurementPayment(payload, id);
  }

  return Promise.reject(
    new Error("Kategori hutang tidak dikenali untuk tambah pembayaran.")
  );
};

const callUpdatePaymentByCategory = (category, id, paymentId, payload) => {
  const cat = (category || "").toLowerCase();

  if (cat.includes("ayam doc") || cat.includes("pengadaan ayam")) {
    return updateChickenProcurementPayment(payload, id, paymentId);
  }

  if (cat.includes("pengadaan jagung") || cat.includes("jagung")) {
    return updateWarehouseItemCornProcurementPayment(payload, id, paymentId);
  }

  if (
    cat.includes("pengadaan gudang") ||
    cat.includes("pengadaan barang") ||
    cat.includes("gudang") ||
    cat.includes("semua") //error the category
  ) {
    return updateWarehouseItemProcurementPayment(payload, id, paymentId);
  }

  return Promise.reject(
    new Error("Kategori hutang tidak dikenali untuk update pembayaran.")
  );
};

const callDeletePaymentByCategory = (category, id, paymentId) => {
  const cat = (category || "").toLowerCase();

  if (cat.includes("ayam doc") || cat.includes("pengadaan ayam")) {
    return deleteChickenProcurementPayment(id, paymentId);
  }

  if (cat.includes("pengadaan jagung") || cat.includes("jagung")) {
    return deleteWarehouseItemCornProcurementPayment(id, paymentId);
  }

  if (
    cat.includes("pengadaan gudang") ||
    cat.includes("pengadaan barang") ||
    cat.includes("gudang") ||
    cat.includes("semua") //error the category
  ) {
    return deleteWarehouseItemProcurementPayment(id, paymentId);
  }

  return Promise.reject(
    new Error("Kategori hutang tidak dikenali untuk hapus pembayaran.")
  );
};

export default function DetailHutang() {
  const { category, id } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [popupImage, setPopupImage] = useState(null);

  const overdue = isOverdue(data?.deadlinePaymentDate, data?.remainingPayment);

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
      const categoryKey = data?.category || category;
      const res = await callUpdatePaymentByCategory(
        categoryKey,
        id,
        selectedPayment.id,
        payload
      );

      if (res?.status === 200 || res?.status === 201) {
        alert("✅ Pembayaran berhasil diperbarui");
        setShowEditModal(false);
        setSelectedPayment(null);
        fetchDetail();
      } else {
        alert("❌Gagal memperbarui pembayaran.");
      }
    } catch (e) {
      console.error(e);
      if (e?.response?.data?.message === "nominal is to high") {
        alert("❌Nominal pembayaran melebihi sisa pembayaran.");
      } else {
        alert("❌Gagal memperbarui pembayaran.");
      }
    }
  };

  const submitDeletePayment = async () => {
    if (!selectedPayment?.id) return;

    try {
      const categoryKey = data?.category || category;
      const res = await callDeletePaymentByCategory(
        categoryKey,
        id,
        selectedPayment.id
      );

      if (res?.status === 200 || res?.status === 204) {
        alert("✅ Pembayaran berhasil dihapus");
        setShowDeleteModal(false);
        setSelectedPayment(null);
        fetchDetail();
      } else {
        alert("❌ Gagal menghapus pembayaran.");
      }
    } catch (e) {
      console.error("delete payment error:", e);
      alert(e?.response?.data?.message || "Gagal menghapus pembayaran.");
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setErr("");

      let res;
      try {
        res = await getDebt(category, id);
      } catch {
        res = await getDebt(id);
      }

      if (res?.status === 200) {
        console.log("res.data?.data: ", res.data?.data);
        setData(res.data?.data || res.data || null);
      } else {
        setErr("Gagal memuat detail hutang.");
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
  }, [id, category]);

  const payments = useMemo(
    () =>
      data?.payments || data?.paymentHistories || data?.paymentHistory || [],
    [data]
  );

  const totalNominal =
    data?.totalNominal ??
    data?.totalPrice ??
    data?.nominal ??
    data?.amount ??
    0;

  const totalPaid = useMemo(
    () =>
      (payments || []).reduce(
        (a, p) => a + Number(p.nominal ?? p.amount ?? 0),
        0
      ),
    [payments]
  );

  const remaining = Math.max(Number(totalNominal || 0) - totalPaid, 0);
  const payStatus =
    remaining === 0 && (payments?.length || 0) > 0 ? "Lunas" : "Belum Lunas";

  const paymentRows = useMemo(() => {
    let sisa = Number(totalNominal || 0);
    return (payments || []).map((p) => {
      const nominalNum = Number(p.nominal ?? p.amount ?? 0);
      sisa = Math.max(sisa - nominalNum, 0);
      return {
        id: p.id,
        date: p.paymentDate || p.date || "-",
        method: p.paymentMethod || p.method || "-",
        nominal: nominalNum,
        remaining: sisa,
        proof: p.paymentProof || p.proof || "-",
      };
    });
  }, [payments, totalNominal]);

  const submitPayment = async ({
    paymentMethod,
    nominal,
    paymentDate,
    paymentProof,
  }) => {
    if (!nominal || Number(nominal) <= 0) {
      alert("❌Nominal pembayaran harus lebih dari 0.");
      return;
    }

    if (!paymentDate) {
      alert("❌Tanggal bayar wajib diisi.");
      return;
    }

    if (!paymentProof) {
      alert("❌Bukti pembayaran wajib diisi.");
      return;
    }

    const payload = {
      paymentMethod,
      nominal: String(nominal),
      paymentDate: toDDMMYYYY(paymentDate),
      paymentProof,
    };

    try {
      await callAddPaymentByCategory(data?.category || category, id, payload);
      alert("✅ Pembayaran berhasil ditambahkan");
      setShowPaymentModal(false);
      fetchDetail();
    } catch (error) {
      if (error.response.data.message == "nominal is to high") {
        alert("❌Nominal pembayaran melebihi sisa pembayaran!");
      }
    }
  };

  if (loading) return <div className="p-4">Memuat detail…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!data) return <div className="p-4">Data tidak ditemukan.</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Detail Hutang</h1>

      <div className="rounded border p-6 ">
        <div className="mb-4">
          <div className="text-gray-600 "> Input :</div>
          <div className="mt-1 font-extrabold">
            {formatTanggalID(
              data?.date || data?.transactionDate || data?.createdAt
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
          <div>
            <div className="text-gray-600"> Tanggal Tenggat Pembayaran :</div>
            <div className="flex items-center gap-2 ">
              {overdue && <FaExclamationTriangle className="text-red-500" />}
              <span className={`${overdue && "text-red-500 font-bold"}`}>
                {data?.deadlinePaymentDate}
              </span>
            </div>
          </div>

          <div>
            <div className="text-gray-600">Waktu :</div>
            <div className="mt-1 font-extrabold">
              {data?.time || data?.transactionTime || "10:30"}
            </div>
          </div>

          <div>
            <div className="text-gray-600">Kategori</div>
            <div className="mt-1 font-extrabold">
              {data?.category || category || "-"}
            </div>
          </div>
          <div />

          <div>
            <div className="text-gray-600">Lokasi Transaksi</div>
            <div className="mt-1 font-extrabold">
              {data?.placeName || data?.location || data?.locationName || "-"}
            </div>
          </div>
          <div />

          <div>
            <div className="text-gray-600">Nama Transaksi</div>
            <div className="mt-1 font-extrabold">
              {data?.transactionName || data?.itemName || data?.name || "-"}
            </div>
          </div>
          <div />

          <div>
            <div className="text-gray-600">Penerima</div>
            <div className="mt-1 font-extrabold">
              {data?.receiverName ||
                data?.supplier?.name ||
                data?.partnerName ||
                data?.name ||
                "-"}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Nomor Telepon Pelanggan</div>
            <div className="mt-1 font-extrabold">
              {data?.receiverPhoneNumber || data?.phoneNumber || "-"}
            </div>
          </div>

          <div>
            <div className="text-gray-600">Nominal Hutang</div>
            <div className="mt-1 font-extrabold">{rupiah(totalNominal)}</div>
          </div>
        </div>
      </div>

      <div className="rounded border">
        <div className="flex items-center justify-between p-4">
          <p className="text-lg font-semibold">Pembayaran</p>
          <button
            onClick={() => {
              if (data?.paymentStatus === "Lunas") {
                alert("✅ Pembayaran sudah lunas!");
              } else {
                setShowPaymentModal(true);
              }
            }}
            className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded text-black cursor-pointer"
          >
            Pilih Pembayaran
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="mb-3">
            <span className="font-semibold mr-2">Tipe Pembayaran :</span>
            <Badge tone={data?.paymentType === "Penuh" ? "success" : "warning"}>
              {data?.paymentType}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Tanggal</th>
                  <th className="text-left px-3 py-2">Metode Pembayaran</th>
                  <th className="text-left px-3 py-2">Nominal Pembayaran</th>
                  <th className="text-left px-3 py-2">Sisa Cicilan</th>
                  <th className="text-left px-3 py-2">Bukti Pembayaran</th>
                  <th className="text-left px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-500"
                      colSpan={6}
                    >
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                ) : (
                  paymentRows.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="px-3 py-2">{formatTanggalID(p.date)}</td>
                      <td className="px-3 py-2">{p.method}</td>
                      <td className="px-3 py-2">{rupiah(p.nominal)}</td>
                      <td className="px-3 py-2">{rupiah(p.remaining)}</td>
                      <td className="px-3 py-2">
                        {p.proof ? (
                          <td
                            className="px-3 py-2 underline text-green-700 hover:text-green-900 cursor-pointer"
                            onClick={() => setPopupImage(p.proof)}
                          >
                            {p.proof ? "Bukti Pembayaran" : "-"}
                          </td>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="w-full px-4 py-2 flex gap-3">
                        <BiSolidEditAlt
                          onClick={() => {
                            setSelectedPayment({
                              id: p.id,
                              paymentMethod: p.method,
                              nominal: p.nominal,
                              paymentDate: p.date,
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

          <div className="mb-3 mt-4">
            <span className="text-lg font-semibold mr-2">
              Status Pembayaran :
            </span>
            <Badge
              tone={data?.paymentStatus === "Lunas" ? "success" : "warning"}
            >
              {data?.paymentStatus}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div />
            <div className="text-right">
              <p className="">Sisa Cicilan</p>
              <p className="text-2xl font-extrabold">
                {rupiah(data?.remainingPayment)}
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

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
}
