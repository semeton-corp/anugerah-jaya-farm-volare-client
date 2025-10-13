// src/components/DetailGaji.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserSalaryDetail } from "../services/cashflow"; // adjust path if needed
import ImagePopUp from "../components/ImagePopUp";

/** ========= Utils ========= */
const toNum = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v ?? 0).replace(/[^\d-]/g, "")) || 0;

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const fmtDateID = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const fmtTimeID = (d) =>
  d
    ? new Date(d).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function DetailGaji() {
  const { salaryId } = useParams();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const [popupImage, setPopupImage] = useState(null);

  useEffect(() => {
    if (!salaryId) return;
    setLoading(true);

    getUserSalaryDetail(salaryId)
      .then((resp) => {
        console.log("salary detail response: ", resp);
        const httpOK = resp?.status === 200;
        const payload = resp?.data;
        const apiOK = payload?.status === 200;
        if (!httpOK || !apiOK) {
          throw new Error(payload?.message || "Gagal mengambil detail gaji");
        }

        const d = payload.data || {};

        const paidAt =
          d.paymentDate || d.paidDate || d.createdAt || payload?.paymentDate;

        // Month + User
        const month =
          d.salaryMonth ||
          d.month ||
          payload?.salaryMonth ||
          payload?.month ||
          "-";

        const rawUser = d.user || payload?.user || {};
        const user = {
          id: rawUser.id ?? rawUser.userId,
          name: rawUser.name || rawUser.fullName || "-",
          phone: rawUser.phone || rawUser.phoneNumber || rawUser.mobile || "-",
          role: {
            name:
              rawUser.role?.name || rawUser.roleName || rawUser.jobTitle || "-",
          },
          location:
            rawUser.location?.name ||
            rawUser.location ||
            rawUser.workLocation ||
            rawUser.site ||
            "-",
        };

        // Additional work items (table)
        const additionalJobs = Array.isArray(d.additionalWorkUsers)
          ? d.additionalWorkUsers.map((x, i) => ({
              id: x?.id ?? i,
              date: x?.date || x?.workDate || x?.takenDate || null,
              time: x?.time || x?.workTime || x?.takenTime || null,
              jobName:
                x?.jobName || x?.name || x?.workName || "Pekerjaan tambahan",
              site: x?.site || x?.workSite || "-",
              location: x?.location || x?.workLocation || "-",
              salary: toNum(x?.salary ?? x?.nominal ?? x?.amount ?? 0),
            }))
          : [];

        // Kasbon summaries
        const kasbons = Array.isArray(d.userCashAdvanceSummaries)
          ? d.userCashAdvanceSummaries.map((k, i) => {
              const nominal = toNum(k?.nominal);
              const remaining = toNum(k?.remainingPayment);
              // if API doesn't send explicit paid amount, infer: nominal - remaining
              const paid =
                toNum(k?.paidAmount ?? k?.paymentNominal) ||
                Math.max(0, nominal - remaining);

              return {
                id: k?.id ?? i,
                label: `Kasbon ${i + 1}`,
                dueDate: k?.deadlinePaymentDate || null,
                paid,
                remaining,
              };
            })
          : [];

        const normalized = {
          id: String(salaryId),
          month,
          paymentDate: d.paidDate || null,
          paymentTime: d.paidTime ,
          paymentProof: d.paymentProof || payload?.paymentProof || null,
          paymentMethod: d.paymentMethod || payload?.paymentMethod || "-",

          baseSalary: toNum(d.baseSalary),
          bonus: toNum(d.bonusSalary),
          compensation: toNum(d.compentationSalary),
          serverAdditionalWorkSalary: toNum(d.additionalWorkSalary),

          additionalJobs,
          kasbons,
          user,
        };
        setDetail(normalized);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || "Gagal memuat detail gaji.");
      })
      .finally(() => setLoading(false));
  }, [salaryId]);

  /** ===== Totals ===== */
  const addJobsTotal = useMemo(() => {
    if (!detail) return 0;
    return detail.additionalJobs?.length
      ? detail.additionalJobs.reduce((s, j) => s + Number(j.salary || 0), 0)
      : Number(detail.serverAdditionalWorkSalary || 0);
  }, [detail]);

  const kasbonPaidTotal = useMemo(
    () => (detail?.kasbons || []).reduce((s, k) => s + Number(k.paid || 0), 0),
    [detail]
  );

  const grandTotal = useMemo(() => {
    if (!detail) return 0;
    return (
      Number(detail.baseSalary || 0) +
      addJobsTotal +
      Number(detail.bonus || 0) +
      Number(detail.compensation || 0) -
      kasbonPaidTotal
    );
  }, [detail, addJobsTotal, kasbonPaidTotal]);

  if (loading || !detail) {
    return (
      <div className="p-6 text-center text-gray-500">Memuat detail gaji…</div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Detail Gaji</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 text-sm gap-y-2">
          <div className="text-gray-600">Tanggal Pembayaran Gaji :</div>
          <div className="font-semibold">{detail.paymentDate}</div>

          <div className="text-gray-600">Gaji Bulan :</div>
          <div className="font-semibold">{detail.month || "-"}</div>

          <div className="text-gray-600">Nama Pegawai :</div>
          <div className="font-semibold">{detail.user?.name || "-"}</div>

          <div className="text-gray-600">Jabatan</div>
          <div className="font-semibold">{detail.user?.role?.name || "-"}</div>

          <div className="text-gray-600">Lokasi Pegawai</div>
          <div className="font-semibold">{detail.user?.location || "-"}</div>
        </div>

        <div className="grid grid-cols-2 text-sm gap-y-2">
          <div className="text-gray-600">Waktu :</div>
          <div className="font-semibold">{detail.paymentTime || "-"}</div>

          <div className="text-gray-600">Nomor Telepon Pegawai</div>
          <div className="font-semibold">{detail.user?.phone || "-"}</div>
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <div className="font-semibold mb-3">Informasi Kasbon</div>

        {!detail?.kasbons?.length ? (
          <div className="rounded border p-3 text-sm text-gray-600 bg-gray-50">
            Pegawai tidak memiliki kasbon.
          </div>
        ) : (
          <div className="space-y-3">
            {detail.kasbons.map((k) => (
              <div key={k.id} className="rounded-lg border">
                <div className="p-3">
                  <div className="text-sm font-semibold mb-1">{k.label}</div>
                  <div className="grid grid-cols-2 gap-y-1 text-sm">
                    <div className="text-gray-600">Tenggat Waktu :</div>
                    <div className="font-medium">{fmtDateID(k.dueDate)}</div>

                    <div className="text-gray-600">Nominal Bayar :</div>
                    <div className="font-semibold">
                      {formatIDR(k.paid || 0)}
                    </div>

                    <div className="text-gray-600">Sisa Kasbon :</div>
                    <div className="font-medium">
                      {formatIDR(k.remaining || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4">
        <div className="font-semibold mb-3">Rincian gaji</div>
        <div className="text-sm divide-y">
          <Line label="Gaji Pokok" value={formatIDR(detail.baseSalary)} />
          <Line
            label="Gaji Pekerjaan Tambahan"
            value={formatIDR(addJobsTotal)}
          />
          <Line label="Bonus" value={formatIDR(detail.bonus)} />
          <Line label="Kompensasi" value={formatIDR(detail.compensation)} />
          <Line
            label="Kasbon"
            value={`-${formatIDR(kasbonPaidTotal)}`}
            valueClass="text-red-600"
          />
          <div className="flex items-center justify-between pt-2 font-semibold">
            <div>Total</div>
            <div>{formatIDR(grandTotal)}</div>
          </div>
        </div>

        <div className="mt-4">
          <a
            className={`inline-flex items-center rounded bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 ${
              detail.paymentProof
                ? "cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() => setPopupImage(detail.paymentProof)}
          >
            Lihat Bukti Pembayaran
          </a>
        </div>
      </div>

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
}

function Line({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-gray-700">{label}</div>
      <div className={`ml-4 ${valueClass}`}>{value}</div>
    </div>
  );
}
