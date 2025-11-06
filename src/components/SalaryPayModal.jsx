import React, { useEffect, useMemo, useState } from "react";
import { getUserSalaryDetail, payUserSalary } from "../services/cashflow";
import { uploadFile } from "../services/file";

/** ========= Utilities ========= */
const formatIDR = (n) => {
  const num = parseFloat(n);
  if (isNaN(num)) return "Rp 0";
  const rounded = Math.round(num);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
};

const toNumber = (v) => {
  if (typeof v === "number") return v;
  if (!v) return 0;
  return Number(String(v).replace(/[^\d-]/g, "")) || 0;
};

async function postSaveSalaryPayment(payload) {
  return new Promise((res) => setTimeout(() => res({ ok: true }), 600));
}

export default function SalaryPayModal({ isOpen, onClose, salaryId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [compensation, setCompensation] = useState(0);
  const [proofFile, setProofFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("Tunai");

  const [isEditingBase, setIsEditingBase] = useState(false);
  const [baseSalaryEdit, setBaseSalaryEdit] = useState(0);

  const [isEditingComp, setIsEditingComp] = useState(false);
  const [compEdit, setCompEdit] = useState(0);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [kasbonModalId, setKasbonModalId] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const [paymentProof, setPaymentProof] = useState("");

  const handleClose = React.useCallback(() => {
    setIsEditingBase(false);
    setIsEditingComp(false);
    setBaseSalaryEdit(0);
    setCompEdit(0);
    setShowDetailModal(false);
    setKasbonModalId(null);

    onClose && onClose();
  }, [onClose]);

  const toStr = (n) => String(Number(n || 0));
  const formatDMY = (date = new Date()) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  async function uploadProofFile(file) {
    if (!file) return undefined;
    return "";
  }

  useEffect(() => {
    if (!isOpen || !salaryId) return;
    setLoading(true);

    getUserSalaryDetail(salaryId)
      .then((resp) => {
        const httpOK = resp?.status === 200;
        const payload = resp?.data;
        const apiOK = payload?.status === 200;
        console.log("resp: ", resp);

        if (!httpOK || !apiOK) {
          throw new Error(payload?.message || "Failed to get salary detail");
        }

        const d = payload.data || {};
        console.log("payload.data: ", payload.data);

        const monthFromApi =
          d.salaryMonth ||
          d.month ||
          payload?.salaryMonth ||
          payload?.month ||
          "-";

        const rawUser = d.user || payload?.user || null;

        const normalizedUser = rawUser
          ? {
              id: rawUser.id ?? rawUser.userId ?? undefined,
              name: rawUser.name || rawUser.fullName || "-",
              email: rawUser.email || rawUser.username || undefined,
              role: {
                name:
                  rawUser.role?.name ||
                  rawUser.roleName ||
                  rawUser.position?.name ||
                  rawUser.jobTitle ||
                  "-",
              },
              location:
                rawUser.location?.name ||
                rawUser.location ||
                rawUser.workLocation ||
                rawUser.site ||
                "-",
              photoProfile:
                rawUser.photoProfile ||
                rawUser.photo ||
                rawUser.avatarUrl ||
                undefined,
            }
          : null;

        const additionalJobs = Array.isArray(d.additionalWorkUsers)
          ? d.additionalWorkUsers.map((x, i) => ({
              id: x?.id ?? i,
              date: x?.date || x?.workDate || x?.takenDate || null,
              time: x?.time || x?.workTime || x?.takenTime || null,
              jobName:
                x?.jobName || x?.name || x?.workName || "Pekerjaan tambahan",
              site: x?.site || x?.workSite || "-",
              location: x?.location || x?.workLocation || "-",
              salary: toNumber(x?.salary ?? x?.nominal ?? x?.amount ?? 0),
            }))
          : [];

        const kasbons = Array.isArray(d.userCashAdvanceSummaries)
          ? d.userCashAdvanceSummaries.map((k, i) => ({
              id: k?.id ?? i,
              label: `Kasbon ${i + 1}`,
              dueDate: k?.deadlinePaymentDate || null,
              isOverdue: Boolean(k?.isMoreThanDeadlinePaymentDate),
              remaining: toNumber(k?.remainingPayment ?? k?.nominal ?? 0),
              payAmount: toNumber(k?.remainingPayment ?? k?.nominal ?? 0),
            }))
          : [];

        const normalized = {
          id: String(salaryId),
          month: monthFromApi,
          user: normalizedUser,

          baseSalary: toNumber(d.baseSalary),
          bonus: Math.ceil(Number(d.bonusSalary) || 0),
          defaultCompensation: toNumber(d.compentationSalary),

          additionalJobs,
          serverAdditionalWorkSalary: toNumber(d.additionalWorkSalary),

          kasbons,
        };
        console.log("normalized: ", normalized);

        setDetail(normalized);
        setCompensation(normalized.defaultCompensation || 0);
        setBaseSalaryEdit(normalized.baseSalary || 0);
        setCompEdit(normalized.defaultCompensation || 0);
        setProofFile(null);
        setShowDetailModal(false);
        setKasbonModalId(null);
      })
      .catch((e) => {
        console.error(e);
        alert(e?.message || "Gagal memuat detail gaji.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, salaryId]);

  const addJobsTotal = useMemo(() => {
    if (!detail) return 0;
    if (detail.additionalJobs?.length) {
      return detail.additionalJobs.reduce(
        (sum, j) => sum + Number(j.salary || 0),
        0
      );
    }
    return Number(detail.serverAdditionalWorkSalary || 0);
  }, [detail]);

  const kasbonPayTotal = useMemo(
    () =>
      (detail?.kasbons || []).reduce(
        (sum, k) => sum + Number(k.payAmount || 0),
        0
      ),
    [detail]
  );

  const grandTotal = useMemo(() => {
    const base = Number(detail?.baseSalary || 0);
    const bonus = Number(detail?.bonus || 0);
    const komp = Number(compensation || 0);
    return base + addJobsTotal + bonus + komp - kasbonPayTotal;
  }, [detail, addJobsTotal, kasbonPayTotal, compensation]);

  const overdue = (dateStr) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      const t = new Date();
      d.setHours(0, 0, 0, 0);
      t.setHours(0, 0, 0, 0);
      return d < t;
    } catch {
      return false;
    }
  };

  const setKasbonPay = (kasbonId, val) => {
    setDetail((d) => {
      if (!d) return d;
      const next = { ...d };
      next.kasbons = (d.kasbons || []).map((k) => {
        if (k.id !== kasbonId) return k;
        const nv = Math.max(
          0,
          Math.min(toNumber(val), Number(k.remaining || 0))
        );
        return { ...k, payAmount: nv };
      });
      return next;
    });
  };

  const selectedKasbon =
    (detail?.kasbons || []).find((k) => k.id === kasbonModalId) || null;

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);

    if (!paymentProof) {
      alert("❌ Mohon memasukkan bukti pembayaran!");
      setSaving(false);
      return;
    }

    try {
      const userCashAdvancePayments = (detail.kasbons || [])
        .filter((k) => Number(k.payAmount) > 0)
        .map((k) => ({
          userCashAdvanceId: k.id,
          paymentDate: formatDMY(new Date()),
          nominal: toStr(k.payAmount),
          paymentMethod,
          paymentProof: paymentProof,
        }));

      const payload = {
        userId: detail.user?.id,
        baseSalary: toStr(detail.baseSalary),
        bonusSalary: toStr(detail.bonus),
        compentationSalary: toStr(compensation),
        additionalWorkSalary: toStr(addJobsTotal),
        paymentProof: paymentProof,
        paymentMethod,
        userCashAdvancePayments,
      };

      console.log("payload: ", payload);

      const resp = await payUserSalary(payload, salaryId);

      if (resp?.status >= 200 && resp?.status < 300) {
        onSaved && onSaved();
      } else {
        throw new Error("Gagal menyimpan pembayaran.");
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "Gagal menyimpan pembayaran.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* Main modal */}
      <div className="absolute inset-0 p-4 md:p-8 overflow-auto">
        <div className="mx-auto max-w-5xl bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b">
            <h2 className="text-lg md:text-xl font-semibold">Bayar Gaji</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 rounded px-2 py-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-6">
            {loading || !detail ? (
              <div className="py-16 text-center text-gray-500">Loading…</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Summary */}
                <div className="border rounded-lg">
                  <div className="p-4 md:p-5">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Gaji Bulan</div>
                      <div className="font-medium">{detail.month || "-"}</div>

                      <div className="text-gray-500">Nama Pegawai</div>
                      <div className="font-medium">
                        {detail.user?.name || "-"}
                      </div>

                      <div className="text-gray-500">Jabatan</div>
                      <div className="font-medium">
                        {detail.user?.role?.name || "-"}
                      </div>

                      <div className="text-gray-500">Lokasi Pegawai</div>
                      <div className="font-medium">
                        {detail.user?.location || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <div className="p-4 md:p-5">
                    <div className="font-semibold mb-3">Informasi Kasbon</div>
                    <div className="space-y-3">
                      {!detail?.kasbons?.length ? (
                        <div className=" p-4  text-gray-600/50 italic ">
                          Pegawai tidak memiliki kasbon.
                        </div>
                      ) : (
                        detail.kasbons.map((k) => {
                          const isOver =
                            typeof k.isOverdue === "boolean"
                              ? k.isOverdue
                              : overdue(k.dueDate);
                          const isZero = Number(k.payAmount || 0) <= 0;

                          return (
                            <div key={k.id} className="border rounded-lg">
                              <div className="p-3 md:p-4">
                                <div className="text-sm font-medium mb-1">
                                  {k.label}
                                </div>
                                <div className="text-sm grid grid-cols-2 gap-y-1">
                                  <div className="text-gray-500">
                                    Tenggat Waktu
                                  </div>
                                  <div className="font-medium">
                                    {k.dueDate
                                      ? new Date(k.dueDate).toLocaleDateString(
                                          "id-ID",
                                          {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        )
                                      : "-"}{" "}
                                    {isOver && (
                                      <span
                                        className="ml-1 text-red-600"
                                        title="Terlambat"
                                      >
                                        ▲
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-gray-500">
                                    Nominal Bayar
                                  </div>
                                  <div className="font-medium">
                                    {formatIDR(k.payAmount || 0)}
                                  </div>

                                  <div className="text-gray-500">
                                    Sisa Kasbon
                                  </div>
                                  <div className="font-medium">
                                    {formatIDR(k.remaining || 0)}
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <button
                                    className={`rounded px-3 py-1.5 text-sm ${
                                      isZero
                                        ? "bg-orange-300 hover:bg-orange-500 text-black cursor-pointer"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    }`}
                                    onClick={() => setKasbonModalId(k.id)}
                                  >
                                    {isZero
                                      ? "Bayar Kasbon"
                                      : "Edit Nominal Bayar"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Rincian gaji */}
                <div className="border rounded-lg">
                  <div className="p-4 md:p-5">
                    <div className="font-semibold mb-3">Rincian gaji</div>
                    <div className="space-y-2 text-sm">
                      {/* Gaji Pokok (editable) */}
                      <div className="flex items-center justify-between">
                        <div className="text-gray-700">Gaji Pokok</div>

                        {!isEditingBase ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded border px-3 py-1 hover:bg-gray-300 cursor-pointer"
                              onClick={() => {
                                setBaseSalaryEdit(
                                  Number(detail.baseSalary || 0)
                                );
                                setIsEditingBase(true);
                              }}
                            >
                              Edit
                            </button>
                            <div className="font-medium">
                              {formatIDR(detail.baseSalary)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded bg-green-700 hover:bg-green-900 text-white px-2 py-1  cursor-pointer"
                              onClick={() => {
                                setDetail((d) => ({
                                  ...d,
                                  baseSalary: Number(baseSalaryEdit || 0),
                                }));
                                setIsEditingBase(false);
                              }}
                            >
                              Simpan
                            </button>
                            <button
                              className="rounded border px-2 py-1  hover:bg-gray-300 cursor-pointer"
                              onClick={() => {
                                setBaseSalaryEdit(
                                  Number(detail.baseSalary || 0)
                                );
                                setIsEditingBase(false);
                              }}
                            >
                              Batal
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              className="w-32 border rounded px-2 py-1 text-right"
                              value={
                                baseSalaryEdit ? formatIDR(baseSalaryEdit) : ""
                              }
                              onChange={(e) =>
                                setBaseSalaryEdit(toNumber(e.target.value))
                              }
                              placeholder="Rp 0"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-gray-700">
                          Gaji Pekerjaan Tambahan
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded border hover:bg-gray-200 text-gray-800 px-3 py-1 cursor-pointer"
                            onClick={() => setShowDetailModal(true)}
                          >
                            Detail
                          </button>
                          <div className="font-medium">
                            {formatIDR(addJobsTotal)}
                          </div>
                        </div>
                      </div>

                      <RowLine label="Bonus" right={formatIDR(detail.bonus)} />
                      {console.log("detail.bonus: ", detail.bonus)}
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-gray-700">Kompensasi</div>
                        <div className="flex items-center justify-between gap-3">
                          {!isEditingComp ? (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded border px-3 py-1 hover:bg-gray-300 cursor-pointer"
                                onClick={() => {
                                  setCompEdit(Number(compensation || 0));
                                  setIsEditingComp(true);
                                }}
                              >
                                Edit
                              </button>
                              <div className="font-medium">
                                {formatIDR(compensation)}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded bg-green-700 hover:bg-green-900 text-white px-2 py-1  cursor-pointer"
                                onClick={() => {
                                  setCompensation(Number(compEdit || 0));
                                  setIsEditingComp(false);
                                }}
                              >
                                Simpan
                              </button>
                              <button
                                className="rounded border px-2 py-1  hover:bg-gray-300 cursor-pointer"
                                onClick={() => {
                                  setCompEdit(Number(compensation || 0));
                                  setIsEditingComp(false);
                                }}
                              >
                                Batal
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="w-32 border rounded px-2 py-1 text-right"
                                value={compEdit ? formatIDR(compEdit) : ""}
                                onChange={(e) =>
                                  setCompEdit(toNumber(e.target.value))
                                }
                                placeholder="Rp 0"
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <RowLine
                        label="Kasbon"
                        right={`-${formatIDR(kasbonPayTotal)}`}
                        rightClass="text-red-600"
                      />

                      <div className="flex items-center justify-between border-t pt-2 mt-2">
                        <div className="font-semibold">Total</div>
                        <div className="font-semibold">
                          {formatIDR(grandTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-700">
                    Metode Pembayaran
                  </label>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Non Tunai">Non Tunai</option>
                  </select>
                </div>

                <div className="border rounded-lg">
                  <div className="p-4 md:p-5 space-y-3">
                    <div className="text-sm font-medium">Bukti Pembayaran</div>

                    <label className="flex items-center gap-2 border rounded px-3 py-2 text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 w-full md:w-auto">
                      <span>⬆</span>
                      <span className="truncate max-w-xs">
                        {paymentProof?.split("/").pop() || "Pilih file…"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
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
                    </label>

                    <div className="pt-2 flex justify-start md:justify-end">
                      <button
                        onClick={handleSave}
                        disabled={isUploading}
                        className={`rounded w-full md:w-auto text-white px-4 py-2 ${
                          isUploading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-900 cursor-pointer"
                        }`}
                      >
                        {isUploading
                          ? "Menyimpan..."
                          : "Simpan Pembayaran Gaji"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailModal && (
        <SubModal
          title="Detail gaji Pekerjaan tambahan"
          onClose={() => setShowDetailModal(false)}
        >
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="text-left p-2">Tanggal Ambil</th>
                  <th className="text-left p-2">Waktu Ambil</th>
                  <th className="text-left p-2">Nama Pekerjaan</th>
                  <th className="text-left p-2">Site</th>
                  <th className="text-left p-2">Lokasi</th>
                  <th className="text-right p-2">Gaji</th>
                </tr>
              </thead>
              <tbody>
                {!detail?.additionalJobs?.length ? (
                  <>
                    <tr>
                      <td
                        colSpan={6}
                        className="p-3 text-center text-sm text-gray-600 bg-gray-50"
                      >
                        Tidak ada pekerjaan tambahan yang diambil.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold" colSpan={5}>
                        Total
                      </td>
                      <td className="p-2 text-right font-semibold">
                        {formatIDR(addJobsTotal)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {(detail.additionalJobs || []).map((j) => (
                      <tr key={j.id} className="border-b">
                        <td className="p-2">
                          {j.date
                            ? new Date(j.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="p-2">{j.time || "-"}</td>
                        <td className="p-2">{j.jobName}</td>
                        <td className="p-2">{j.site}</td>
                        <td className="p-2">{j.location}</td>
                        <td className="p-2 text-right">
                          {formatIDR(j.salary)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="p-2 font-semibold" colSpan={5}>
                        Total
                      </td>
                      <td className="p-2 text-right font-semibold">
                        {formatIDR(addJobsTotal)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </SubModal>
      )}

      {kasbonModalId && selectedKasbon && (
        <SubModal
          title="Bayar Kasbon"
          onClose={() => setKasbonModalId(null)}
          footer={
            <button
              className="rounded bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-sm"
              onClick={() => setKasbonModalId(null)}
            >
              Simpan Pembayaran Kasbon
            </button>
          }
        >
          <div className="text-sm mb-1">{selectedKasbon.label}</div>
          <div className="grid grid-cols-2 gap-y-1 text-sm mb-3">
            <div className="text-gray-500">Tenggat Waktu Kasbon</div>
            <div className="font-medium">
              {selectedKasbon.dueDate
                ? new Date(selectedKasbon.dueDate).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}{" "}
              {(typeof selectedKasbon.isOverdue === "boolean"
                ? selectedKasbon.isOverdue
                : overdue(selectedKasbon.dueDate)) && (
                <span className="ml-1 text-red-600">▲</span>
              )}
            </div>
          </div>
          <div className="text-sm mb-2">Nominal Bayar Kasbon</div>
          <input
            type="text"
            inputMode="numeric"
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Rp 0"
            value={
              selectedKasbon.payAmount
                ? formatIDR(selectedKasbon.payAmount)
                : ""
            }
            onChange={(e) => setKasbonPay(selectedKasbon.id, e.target.value)}
          />
          <div className="mt-2 text-sm text-gray-700">
            Sisa Kasbon :{" "}
            <span className="font-medium">
              {formatIDR(selectedKasbon.remaining)}
            </span>
          </div>
        </SubModal>
      )}
    </div>
  );
}

function SubModal({ title, children, onClose, footer = null }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded px-2 py-1"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="p-4 border-t flex justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}

function RowLine({ label, right, rightClass = "" }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-700">{label}</div>
      <div className={`font-medium ${rightClass}`}>{right}</div>
    </div>
  );
}
