import React, { useEffect, useMemo, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { getListUser } from "../services/user";
import {
  createUserCashAdvance,
  getUserCashAdvanceByUserId,
} from "../services/cashflow";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";

const formatRupiah = (n = 0) =>
  "Rp " +
  Number(n || 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const formatTanggalID = (dateLike) => {
  try {
    const d = new Date(dateLike);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
};

const addOneMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
};

const formatDeadline = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function TambahKasbon() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = useMemo(() => new Date(), []);
  const dueDefault = useMemo(() => addOneMonth(today), [today]);

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts?.includes("Pinjaman Pegawai")
  );

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const selectedUser = useMemo(
    () => users.find((u) => u.id == selectedUserId),
    [users, selectedUserId]
  );

  const [cashAdvances, setCashAdvances] = useState([]);

  const [nominal, setNominal] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await getListUser();
      console.log("userResponse: ", res);
      if (res?.status === 200) {
        setUsers(res.data?.data ?? []);
      }
    } catch (e) {
      console.error("Gagal memuat daftar pegawai:", e);
    }
  };

  const fetchAdvances = async (userId) => {
    if (!userId) {
      setCashAdvances([]);
      return;
    }
    try {
      const res = await getUserCashAdvanceByUserId(userId);
      console.log("kasbonResponse : ", res);
      if (res?.status === 200) {
        setCashAdvances(res.data?.data ?? []);
      }
    } catch (e) {
      console.error("Gagal memuat kasbon pengguna:", e);
      setCashAdvances([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAdvances(selectedUserId);
  }, [selectedUserId]);

  const handleNominalChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setNominal("");
      return;
    }
    const formatted = Number(raw).toLocaleString("id-ID");
    setNominal(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nominalNumber = Number(String(nominal).replace(/\./g, "")) || 0;

    const payload = {
      userId: selectedUserId,
      nominal: String(nominalNumber),
      deadlinePaymentDate: formatDeadline(dueDefault),
    };

    try {
      const createCashResponse = await createUserCashAdvance(payload);
      if (createCashResponse.status == 201) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tambah Kasbon</h1>
        <div className="text-gray-700 font-medium">
          {formatTanggalID(today)}
        </div>
      </div>

      <PageNotificationsSection pageNotifications={pageNotifications} />

      <form
        onSubmit={handleSubmit}
        className="rounded-md border border-gray-300 p-5 md:p-6"
      >
        {/* Borrower row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block font-semibold mb-2">Peminjam</label>
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
              >
                <option value="">Pilih Nama Pegawai Peminjam</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Nomor Telepon</label>
            <div className="w-full rounded py-2">
              {selectedUser?.phoneNumber || "-"}
            </div>
          </div>
        </div>

        {/* Informasi Kasbon existing */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Informasi Kasbon</div>
          {cashAdvances.length === 0 ? (
            <div className=" text-gray-500">
              Pegawai belum memiliki kasbon aktif.
            </div>
          ) : (
            <div className="space-y-3">
              {cashAdvances.map((k, idx) => {
                const isLate = Boolean(k.isMoreThanDeadlinePaymentDate);
                return (
                  <div
                    key={k.id || idx}
                    className="rounded border border-gray-300 p-3"
                  >
                    <div
                      className={`flex items-center gap-2 font-semibold ${
                        isLate && "text-red-500"
                      } `}
                    >
                      Kasbon {idx + 1}
                      {isLate && (
                        <FaExclamationTriangle className="text-red-500" />
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="flex gap-2">
                        Tenggat Waktu :{" "}
                        <p className={`${isLate && "text-red-500"}`}>
                          {formatTanggalID(k.deadlinePaymentDate)}
                        </p>
                      </div>
                      <div className="mt-1">
                        Sisa Kasbon :{" "}
                        <span className="font-semibold">
                          {formatRupiah(k.remainingPayment)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nominal Pinjam */}
        <div className="mb-5">
          <label className="block font-semibold mb-2">Nominal Pinjam</label>
          <div className="flex items-center rounded border border-gray-300 bg-gray-100 px-3 py-2">
            <span className="mr-2 text-gray-600">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={nominal}
              onChange={handleNominalChange}
              placeholder="0"
              className="flex-1 bg-transparent outline-none border-0 focus:ring-0"
            />
          </div>
        </div>

        {/* Due date */}
        <div className="mb-6">
          <div className="block font-semibold mb-2">Tenggat Pembayaran</div>
          <div className="text-lg font-semibold">
            {formatTanggalID(dueDefault)}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded bg-green-700 hover:bg-green-900 text-white px-5 py-2"
            disabled={!selectedUserId || !nominal}
            title={
              !selectedUserId || !nominal
                ? "Pilih pegawai dan isi nominal dulu"
                : undefined
            }
          >
            Simpan
          </button>
        </div>
      </form>
      <button
        onClick={() => {
          console.log("selectedUser: ", selectedUser);
        }}
      >
        CHECK
      </button>
    </div>
  );
}
