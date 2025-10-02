import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  deleteAfkirCustomer,
  getAfkirCustomer,
} from "../services/chickenMonitorings";

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const fmtDate = (d) => {
  if (!d) return "-";
  const dd = new Date(d);
  return isNaN(dd)
    ? d
    : dd.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const Badge = ({ tone = "neutral", children }) => {
  const tones = {
    neutral: "bg-gray-200 text-gray-800",
    success: "bg-green-200 text-green-900",
    warning: "bg-orange-200 text-orange-900",
    danger: "bg-red-200 text-red-900",
  };
  return <span className={`px-3 py-1 rounded ${tones[tone]}`}>{children}</span>;
};

const pick = (obj, keys, fallback = undefined) =>
  keys.reduce((v, k) => (v !== undefined ? v : obj?.[k]), undefined) ??
  fallback;

export default function DetailPelangganAfkir() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cust, setCust] = useState(null);

  const getDetail = async () => {
    let live = true;
    getAfkirCustomer(id)
      .then((res) => {
        if (!live) return;
        console.log("res: ", res);
        setCust(res?.data?.data || null);
        setErr("");
      })
      .catch((e) => {
        setErr(e?.response?.data?.message || "Gagal memuat data pelanggan");
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  };

  useEffect(() => {
    setLoading(true);
    getDetail();
    if (location?.state?.refetch) {
      getDetail();
      window.history.replaceState({}, document.title);
    }
  }, [id, location]);

  const sales = useMemo(() => cust?.afkirChickenSales || [], [cust]);
  const detailPages = ["edit-pelanggan-ayam"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const handleEdit = (id) => {
    navigate(`${location.pathname}/edit-pelanggan-ayam`);
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await deleteAfkirCustomer(id);
      if (deleteResponse.status == 204) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const goToSaleDetail = (saleId) => {
    navigate(`/owner/kinerja/jual-ayam-afkir/penjualan/${saleId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Detail Pelanggan</h1>
        <div className="animate-pulse border rounded-lg p-6 bg-white">
          <div className="h-5 w-40 bg-gray-200 mb-3 rounded" />
          <div className="h-5 w-64 bg-gray-200 mb-3 rounded" />
          <div className="h-5 w-56 bg-gray-200 mb-6 rounded" />
          <div className="h-8 w-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Detail Pelanggan</h1>
        <div className="border rounded-lg p-6 bg-white text-red-700">{err}</div>
      </div>
    );
  }

  if (!cust) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Detail Pelanggan</h1>
        <div className="border rounded-lg p-6 bg-white">
          Data tidak ditemukan.
        </div>
      </div>
    );
  }

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detail Pelanggan</h1>

      <div className="border rounded-lg p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Nama Pelanggan</p>
            <p className="font-semibold text-lg">{cust.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Alamat</p>
            <p className="font-semibold text-lg">{cust.address || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nomor Telepon</p>
            <p className="font-semibold text-lg">{cust.phoneNumber || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Harga Terakhir (Ekor)</p>
            <p className="font-semibold text-lg">{rupiah(cust.latestPrice)}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => handleEdit(id)}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 cursor-pointer"
          >
            Edit data pelanggan
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(true);
            }}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
          >
            Hapus
          </button>
        </div>

        <div className="mt-8 border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-lg">Riwayat Penjualan Ayam</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-green-700 text-white text-left">
                  <th className="px-4 py-3 rounded-l">Tanggal Jual</th>
                  <th className="px-4 py-3">Usia ayam (minggu)</th>
                  <th className="px-4 py-3">Jumlah Ayam (Ekor)</th>
                  <th className="px-4 py-3">Harga Ayam (Ekor)</th>
                  <th className="px-4 py-3">Harga Ayam Total</th>
                  <th className="px-4 py-3">Status Pembayaran</th>
                  <th className="px-4 py-3 rounded-r">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-600 border-t"
                    >
                      Belum ada riwayat penjualan.
                    </td>
                  </tr>
                ) : (
                  sales.map((s) => {
                    const saleId = s.id ?? s.saleId;
                    const soldAt = pick(s, ["date", "soldAt", "createdAt"]);
                    const ageWeeks = pick(
                      s,
                      ["ageWeeks", "age", "chickenAgeWeeks"],
                      0
                    );
                    const qty = pick(s, ["quantity", "qty", "chickenCount"], 0);
                    const price = pick(
                      s,
                      ["pricePerChicken", "price", "unitPrice"],
                      0
                    );
                    const total = pick(
                      s,
                      ["totalPrice", "total", "amount"],
                      qty * price
                    );
                    const statusRaw = (
                      pick(s, ["paymentStatus", "status"], "UNPAID") || ""
                    )
                      .toString()
                      .toUpperCase();
                    const isPaid = ["PAID", "LUNAS", "SUCCESS"].includes(
                      statusRaw
                    );

                    return (
                      <tr key={saleId} className="border-t">
                        <td className="px-4 py-3">{fmtDate(soldAt)}</td>
                        <td className="px-4 py-3">{ageWeeks}</td>
                        <td className="px-4 py-3">{qty}</td>
                        <td className="px-4 py-3">{rupiah(price)}</td>
                        <td className="px-4 py-3">{rupiah(total)}</td>
                        <td className="px-4 py-3">
                          {isPaid ? (
                            <Badge tone="success">Lunas</Badge>
                          ) : (
                            <Badge tone="warning">Belum Lunas</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => goToSaleDetail(saleId)}
                            className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-900 cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/15 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] text-center shadow-lg">
            <p className="text-lg font-medium mb-6">
              Apakah anda yakin untuk menghapus data pelanggan ini?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 font-semibold"
              >
                Tidak
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 font-semibold"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
