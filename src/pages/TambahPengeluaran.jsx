// src/pages/TambahPengeluaran.jsx
import React, { useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { getLocations } from "../services/location";
import { useEffect } from "react";
import { getStores } from "../services/stores";
import { getWarehouses } from "../services/warehouses";
import { getCage } from "../services/cages";
import { createExpense } from "../services/cashflow";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadFile } from "../services/file";

const formatTanggalID = (d = new Date()) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);

const REQUIRED_KEYS = [
  "expenseCategory",
  "locationId",
  "placeId",
  "locationType",
  "receiverName",
  "name",
  "receiverPhoneNumber",
  "nominal",
  "paymentMethod",
  "paymentProof",
];

const KATEGORI_OPTIONS = ["Operasional", "Lain-lain"];
export default function TambahPengeluaran() {
  const navigate = useNavigate();
  const locaiton = useLocation();

  const [popupImage, setPopupImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    expenseCategory: KATEGORI_OPTIONS[0],
    locationId: "",
    placeId: "",
    locationType: "",
    receiverName: "",
    name: "",
    receiverPhoneNumber: "",
    nominal: "",
    paymentMethod: "Tunai",
    description: "",
    paymentProof: "",
  });

  const isNonEmpty = (v) => v != null && String(v).trim() !== "";

  const isFormValid = (form) =>
    REQUIRED_KEYS.every((k) => isNonEmpty(form[k])) && Number(form.nominal) > 0;

  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [selectedLokasiId, setSelectedLokasiId] = useState(0);

  const onlyDigits = (s = "") => s.replace(/\D/g, "");
  const formatThousand = (s = "") =>
    onlyDigits(s).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const onNominalChange = (e) => {
    const raw = onlyDigits(e.target.value);
    setForm((f) => ({ ...f, nominal: raw }));
  };

  const getId = (o) =>
    o?.id ?? o?._id ?? o?.storeId ?? o?.cageId ?? o?.warehouseId ?? o?.value;

  const getName = (o) =>
    o?.name ??
    o?.storeName ??
    o?.cageName ??
    o?.warehouseName ??
    o?.title ??
    "-";

  const mapOptions = (arr, sourceLabel) =>
    (arr || []).map((item) => ({
      placeId: getId(item),
      label: `${getName(item)} (${sourceLabel})`,
      locationType: sourceLabel,
    }));

  const [siteOptions, setSiteOptions] = useState([]);

  const fileRef = useRef(null);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onLokasiChange = (e) => {
    const value = e.target.value;
    const opt = lokasiOptions.find((o) => String(o.placeId) === String(value));
    setForm((f) => ({
      ...f,
      placeId: value,
      locationType: opt?.locationType || "",
    }));
  };

  const onChooseFile = () => fileRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    setForm((f) => ({ ...f, paymentProof: file || null }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      expenseCategory: form.expenseCategory,
      locationId: parseInt(form.locationId),
      placeId: parseInt(form.placeId),
      locationType: form.locationType,
      receiverName: form.receiverName,
      name: form.name,
      receiverPhoneNumber: form.receiverPhoneNumber,
      nominal: form.nominal,
      paymentMethod: form.paymentMethod,
      description: form.description,
      paymentProof: form.paymentProof,
    };

    console.log("payload: ", payload);

    if (!isFormValid(payload)) {
      alert("❌ Pastikan semua field terisi dengan benar!");
      return;
    }

    try {
      const createResponse = await createExpense(payload);
      if (createResponse.status == 201) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      if (error.response.data.message == "invalid phone number") {
        alert(
          "❌ Mohon masukkan format nomor telepon dengan benar. Contoh: 08xxxxxxxxx"
        );
      }
      console.log("error :", error);
    }
  };

  const fetchSite = async () => {
    try {
      const siteResponse = await getLocations();
      if (siteResponse.status == 200) {
        const sites = siteResponse?.data?.data ?? [];
        setSiteOptions(sites);
        if (sites.length > 0) {
          const firstId = sites[0]?.id ?? sites[0]?._id;
          console.log("firstId: ", firstId);
          setForm((prev) => ({ ...prev, locationId: String(firstId || "") }));
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchLokasi = async () => {
    try {
      if (!form?.locationId) return;
      const [storesRes, cagesRes, warehousesRes] = await Promise.all([
        getStores(form.locationId),
        getCage(form.locationId),
        getWarehouses(form.locationId),
      ]);

      const stores = mapOptions(
        storesRes?.data?.data ?? storesRes?.data,
        "Toko"
      );
      const cages = mapOptions(
        cagesRes?.data?.data ?? cagesRes?.data,
        "Kandang"
      );
      const warehouses = mapOptions(
        warehousesRes?.data?.data ?? warehousesRes?.data,
        "Gudang"
      );

      const merged = [...stores, ...cages, ...warehouses];
      console.log("merged: ", merged);
      setLokasiOptions(merged);
      setForm((f) => ({
        ...f,
        placeId: merged[0].placeId,
        locationType: merged[0]?.locationType || "",
      }));
    } catch (error) {
      console.error("error :", error);
    }
  };

  useEffect(() => {
    fetchSite();
  }, []);

  useEffect(() => {
    fetchLokasi();
  }, [form.locationId]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Tambah Pengeluaran</h1>
        <div className="text-gray-700 font-medium">{formatTanggalID()}</div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-md border border-gray-300 p-5 md:p-6"
      >
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Kategori Pengeluaran
          </label>
          <select
            value={form.expenseCategory}
            onChange={onChange("expenseCategory")}
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
          >
            <option value="" disabled>
              Pilih kategori pengeluaran
            </option>
            {KATEGORI_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Site Transaksi
          </label>
          <select
            value={form.locationId}
            onChange={onChange("locationId")}
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
          >
            <option value="" disabled>
              Pilih lokasi pengeluaran
            </option>
            {siteOptions.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Lokasi Transaksi
          </label>
          <select
            value={form.placeId}
            onChange={onLokasiChange}
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
          >
            <option value="" disabled>
              Pilih lokasi pengeluaran
            </option>
            {lokasiOptions.map((o) => (
              <option key={`${o.locationType}-${o.placeId}`} value={o.placeId}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Nama Transaksi
          </label>
          <input
            type="text"
            value={form.name}
            onChange={onChange("name")}
            placeholder="Masukkan nama traksaksi..."
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Penerima</label>
            <input
              type="text"
              value={form.receiverName}
              onChange={onChange("receiverName")}
              placeholder="Masukkan nama penerima..."
              className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nomor Telepon
            </label>
            <input
              type="number"
              value={form.receiverPhoneNumber}
              onChange={onChange("receiverPhoneNumber")}
              placeholder="Masukkan nomor telepon penerima..."
              className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nominal Pengeluaran
            </label>

            <div className="flex items-center rounded border border-gray-300 bg-gray-100 px-3 py-2">
              <span className="text-gray-600 mr-2 select-none">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatThousand(form.nominal)}
                onChange={onNominalChange}
                placeholder="0"
                className="flex-1 bg-transparent outline-none border-0 focus:ring-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Metode Pembayaran
            </label>
            <select
              value={form.paymentMethod}
              onChange={onChange("paymentMethod")}
              className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
            >
              <option value="" disabled>
                Pilih metode pembayaran
              </option>
              <option value="Tunai">Tunai</option>
              <option value="Non Tunai">Non Tunai</option>
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Bukti Pembayaran
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
            onChange={async (e) => {
              const fileInput = e.target;
              const file = fileInput.files?.[0];
              if (!file) return;

              setIsUploading(true);

              try {
                const fileUrl = await uploadFile(file);
                setForm((prev) => ({
                  ...prev,
                  paymentProof: fileUrl,
                }));
              } catch (err) {
                console.error("Upload error:", err);
                alert("Upload gagal. Silakan coba lagi.");
                fileInput.value = "";
              } finally {
                setIsUploading(false);
              }
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Deskripsi Pengeluaran
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={onChange("description")}
            placeholder="Tuliskan deskripsi pengeluaran..."
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={isUploading}
            type="submit"
            className={`rounded ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-900 cursor-pointer"
            } text-white px-5 py-2`}
          >
            {isUploading ? "Mengunggah..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
