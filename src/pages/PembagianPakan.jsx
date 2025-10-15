// src/pages/PembagianPakan.jsx
import React, { useMemo, useState } from "react";
import {
  confirmationChickenCageFeed,
  getChickenCageFeed,
  getChickenCageFeeds,
} from "../services/cages";
import { useEffect } from "react";
import { getWarehouses } from "../services/warehouses";
import { getLocations } from "../services/location";
import { MdStore } from "react-icons/md";

const rupiahKg = (n) =>
  `${Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Kg`;

export default function PembagianPakan() {
  const locationId = localStorage.getItem("locationId");
  const userRole = localStorage.getItem("role");

  const [rows] = useState([]);
  const [kandangList, setKandangList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [gudangOptions, setGudangOptions] = useState([]);
  const [gudangId, setGudangId] = useState("");

  const [confirmationData, setConfirmationData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeedDetails, setEditedFeedDetails] = useState([]);

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const canConfirmRow = (row) => {
    return row.id !== 1;
  };

  const openModal = async (row) => {
    setSelected(row);
    setGudangId("");
    try {
      const detailResponse = await getChickenCageFeed(row?.id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status == 200) {
        const data = detailResponse.data.data;
        setConfirmationData(data);
        setEditedFeedDetails(data.feedDetails);
        setOpen(true);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const submitConfirm = async () => {
    if (!selected) return;
    const payload = {
      warehouseId: parseInt(gudangId),
      chickenCageFeedDetails: confirmationData.feedDetails.map((f) => ({
        itemId: f.item.id,
        category: f.item.category,
        quantity: parseFloat(f.quantity) || 0,
      })),
    };
    console.log("payload: ", payload);
    console.log("selected: ", selected);
    try {
      const confirmResponse = await confirmationChickenCageFeed(
        payload,
        selected.id
      );
      if (confirmResponse.status == 200) {
        closeModal();
        fetchKandangList();
      }
    } catch (error) {
      if (error.response.data.message == "warehouse item not found") {
        alert(
          "❌ Gudang tidak memiliki barang yang diperlukan, silahkan hubungi penanggung jawab!"
        );
        return;
      }
      alert(error.response.data.message);
      console.log("error :", error.response.data.message);
    }
    // console.log("KONFIRMASI PEMBAGIAN PAKAN -> payload:", payload);
  };

  const fetchKandangList = async () => {
    try {
      const kandangResponse = await getChickenCageFeeds(selectedSite);
      console.log("kandangResponse: ", kandangResponse);
      if (kandangResponse.status == 200) {
        const list = kandangResponse.data.data;
        setKandangList(list);
      }
      // console.log("kandangResponse: ", kandangResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const warehouseResponse = await getWarehouses();
      if (warehouseResponse.status == 200) {
        const warehouses = warehouseResponse.data.data;
        let filteredWarehouses;

        if (userRole !== "Owner") {
          filteredWarehouses = warehouses.filter(
            (warehouse) => warehouse.location.id == locationId
          );
        } else {
          filteredWarehouses = warehouses;
        }

        console.log("filteredWarehouses: ", filteredWarehouses);
        setGudangOptions(filteredWarehouses);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await getLocations();
      if (res.status === 200) {
        setSiteOptions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchKandangList();
    fetchSites();
  }, []);

  useEffect(() => {
    fetchKandangList();
  }, [selectedSite]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
        <h1 className="text-3xl font-bold">Pembagian Pakan</h1>

        {userRole == "Owner" && (
          <div className="flex items-center rounded-lg px-4 py-1 bg-orange-300 hover:bg-orange-500 cursor-pointer">
            <MdStore size={18} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="ml-2 bg-transparent text-base font-medium outline-none"
            >
              <option value="">Semua Site</option>
              {siteOptions.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabel */}
      <div className="p-6 bg-white border rounded overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-green-700 text-white text-left text-sm sm:text-base">
              <th className="p-3 whitespace-nowrap">Kandang</th>
              <th className="p-3 whitespace-nowrap">Kategori Ayam</th>
              <th className="p-3 whitespace-nowrap">Usia Ayam </th>
              <th className="p-3 whitespace-nowrap">Jumlah Ayam (Ekor)</th>
              <th className="p-3 whitespace-nowrap">Jenis Pakan</th>
              <th className="p-3 whitespace-nowrap">Jumlah Pakan Minimum</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kandangList.map((r) => (
              <tr key={r.id} className="border-t text-sm sm:text-base">
                <td className="p-3">{r.cage.name}</td>
                <td className="p-3">{r.chickenCategory}</td>
                <td className="p-3">{`${r.chickenAge} Minggu`}</td>
                <td className="p-3">
                  {r.totalChicken.toLocaleString("id-ID")} Ekor
                </td>
                <td className="p-3">{r.feedType}</td>
                <td className="p-3">{rupiahKg(r.totalFeed)}</td>
                <td className="p-3 text-sm sm:text-base whitespace-normal break-words">
                  {r.chickenCategory && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span
                        className={`inline-block text-center px-3 py-1 rounded text-xs sm:text-sm font-medium
                          ${
                            r.isNeedFeed
                              ? "bg-kritis-box-surface-color text-kritis-text-color"
                              : "bg-aman-box-surface-color text-aman-text-color"
                          }
                          `}
                      >
                        {r.isNeedFeed ? "Belum Dibuat" : "Sudah Dibuat"}
                      </span>
                    </div>
                  )}
                </td>

                <td className="p-3">
                  {r.chickenCategory && r.isNeedFeed && (
                    <button
                      disabled={!canConfirmRow(r)}
                      onClick={() => openModal(r)}
                      className={`px-4 py-1 rounded ${
                        canConfirmRow(r)
                          ? "bg-orange-300 hover:bg-orange-500 cursor-pointer"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Konfirmasi
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl m-6 rounded shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-xl font-bold">Konfirmasi Pembagian Pakan</h3>
              <div className="flex items-center gap-3">
                <button
                  className="text-2xl leading-none hover:text-gray-500 cursor-pointer"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Konten Modal */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Kandang</p>
                  <p className="font-semibold">{confirmationData.cage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usia Ayam</p>
                  <p className="font-semibold">
                    {confirmationData.chickenAge} Minggu
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Kategori Ayam</p>
                  <p className="font-semibold">
                    {confirmationData.chickenCategory}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah Ayam</p>
                  <p className="font-semibold">
                    {confirmationData.totalChicken.toLocaleString("id-ID")} Ekor
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Sisa Pakan</p>
                  <p className="font-semibold">
                    {rupiahKg(confirmationData.remainingTotalFeed)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Jumlah yang akan dibuat
                  </p>
                  <p className="font-semibold">
                    {rupiahKg(confirmationData.totalFeed)}
                  </p>
                </div>
              </div>

              {/* Formula Table */}
              <div className="border rounded">
                <div className="px-4 py-3 border-b font-semibold flex justify-between">
                  Formula Pakan
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          className="font-normal bg-orange-300 hover:bg-orange-500 rounded px-3 py-1 cursor-pointer"
                          onClick={() => {
                            setConfirmationData({
                              ...confirmationData,
                              feedDetails: editedFeedDetails,
                            });
                            setIsEditing(false);
                          }}
                        >
                          Simpan
                        </button>
                        <button
                          className="font-normal bg-white hover:bg-orange-100 border-orange-300 border-2 rounded px-3 py-1 cursor-pointer"
                          onClick={() => {
                            setEditedFeedDetails(confirmationData.feedDetails);
                            setIsEditing(false);
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        className="font-normal bg-orange-300 hover:bg-orange-500 rounded px-3 py-1 cursor-pointer"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Jumlah Pakan Hari ini
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm sm:text-base">
                    <thead className="bg-green-700 text-white">
                      <tr>
                        <th className="text-left px-3 py-2">Bahan Baku</th>
                        <th className="text-left px-3 py-2">Persentase</th>
                        <th className="text-left px-3 py-2">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedFeedDetails.map((f, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-3 py-2">{f?.item?.name}</td>
                          <td className="px-3 py-2">{f?.percentage}%</td>
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <input
                                type="number"
                                className="w-24 border rounded px-2 py-1"
                                value={f.quantity}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setEditedFeedDetails((prev) =>
                                    prev.map((d, idx) =>
                                      idx === i
                                        ? { ...d, quantity: newValue }
                                        : d
                                    )
                                  );
                                }}
                              />
                            ) : (
                              rupiahKg(f?.quantity)
                            )}
                          </td>
                        </tr>
                      ))}
                      {editedFeedDetails.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-4 text-center text-gray-500"
                            colSpan={3}
                          >
                            Formula belum diatur untuk kategori ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Select Gudang */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Pilih Gudang
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={gudangId}
                  onChange={(e) => setGudangId(e.target.value)}
                >
                  <option value="" disabled>
                    Pilih gudang
                  </option>
                  {gudangOptions?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 p-5 border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={submitConfirm}
                disabled={!gudangId || isEditing}
                className={`px-4 py-2 rounded text-white ${
                  gudangId && !isEditing
                    ? "bg-green-700 hover:bg-green-900 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
