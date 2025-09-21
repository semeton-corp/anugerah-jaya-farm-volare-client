// src/pages/InputDraftPengadaanBarang.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  createWarehouseItemProcurementDraft,
  getWarehouseItemProcurementDraft,
  getWarehouses,
  updateWarehouseItemProcurementDraft,
} from "../services/warehouses";
import { getItems } from "../services/item";
import { getSuppliers } from "../services/supplier";
import { useNavigate, useParams } from "react-router-dom";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";

const fmtIDR = (n) =>
  n == null || n === "" ? "-" : `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function InputDraftPengadaanBarang() {
  const { id } = useParams();
  const userRole = localStorage.getItem("role");
  const locationId = localStorage.getItem("locationId");
  const navigate = useNavigate();

  const allowedCategories = ["Pakan Jadi", "Barang", "Bahan Baku Adukan"];

  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [warehouse, setWarehouse] = useState(null);

  const [dailySpending, setDailySpending] = useState(0);

  const [itemOptions, setItemOptions] = useState([]);
  const [item, setItem] = useState(null);

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [filteredSupplierOptions, setFilteredSupplierOptions] = useState([]);

  const [supplier, setSupplier] = useState(null);

  const [days, setDays] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const perHari = useMemo(() => Number(item?.dailyNeed || 0), [item]);
  const totalOrder = useMemo(() => {
    const d = Number(days || 0);
    return dailySpending * d;
  }, [perHari, days]);
  const totalPrice = useMemo(() => {
    const p = Number(pricePerUnit || 0);
    return totalOrder * p;
  }, [totalOrder, pricePerUnit]);

  const todayLabel = useMemo(() => {
    const d = new Date("2025-03-20");
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const saveDraft = async () => {
    if (!warehouse || !item || !supplier || !pricePerUnit || !days) {
      alert("❌ Mohon isi semua field dengan benar");
      return;
    }

    const payload = {
      warehouseId: warehouse?.id,
      itemId: item?.id,
      supplierId: supplier?.id,
      dailySpending: dailySpending,
      daysNeed: Number(days || 0),
      price: String(pricePerUnit || "0"),
    };

    console.log("payload: ", payload);

    if (id) {
      try {
        const updateResponse = await updateWarehouseItemProcurementDraft(
          payload,
          id
        );
        console.log("updateResponse: ", updateResponse);
        if (updateResponse.status == 200) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    } else {
      try {
        const createResponse = await createWarehouseItemProcurementDraft(
          payload
        );
        if (createResponse.status == 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    }
  };

  const fetchWarehouses = async () => {
    try {
      const warehousesResponse = await getWarehouses();
      if (warehousesResponse.status == 200) {
        const warehousesData = warehousesResponse.data.data;
        let filteredWarehouses;
        if (userRole != "Owner") {
          filteredWarehouses = warehousesData.filter(
            (item) => item.location.id == locationId
          );
        } else {
          filteredWarehouses = warehousesData;
        }
        // console.log("filteredWarehouses: ", filteredWarehouses);
        setWarehouseOptions(filteredWarehouses);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchItems = async () => {
    try {
      const itemResponse = await getItems();
      console.log("itemResponse: ", itemResponse);
      if (itemResponse.status == 200) {
        const itemsData = itemResponse.data.data;
        const filteredItem = (itemsData ?? []).filter((item) =>
          allowedCategories.includes(item.category)
        );
        setItemOptions(filteredItem);
        setItem(filteredItem[0]);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchSupplier = async () => {
    try {
      const supplierResponse = await getSuppliers("Barang");
      console.log("supplierResponse: ", supplierResponse);
      if (supplierResponse.status == 200) {
        setSupplierOptions(supplierResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDetail = async () => {
    try {
      const detailResponse = await getWarehouseItemProcurementDraft(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status == 200) {
        const detailData = detailResponse.data.data;
        setWarehouse(detailData.warehouse);
        setItem(detailData.item);
        setSupplier(detailData.supplier);
        setDailySpending(detailData.dailySpending);
        setDays(detailData.daysNeed);
        setPricePerUnit(detailData.price);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const tambahSupplierHandle = () => {
    const newPath = location.pathname.replace(
      "input-draft-pengadaan-barang",
      "tambah-supplier"
    );
    navigate(newPath);
  };

  useEffect(() => {
    fetchWarehouses();
    fetchItems();
    fetchSupplier();
    if (location?.state?.refetch) {
      fetchSupplier();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (warehouseOptions && itemOptions && supplierOptions) {
      fetchDetail();
    }
  }, [id]);

  useEffect(() => {
    setDailySpending(item?.dailySpending);

    const filteredSupplier = supplierOptions.filter((supplier) =>
      supplier.itemIds.includes(item.id)
    );
    setFilteredSupplierOptions(filteredSupplier);
  }, [item]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Input Draft Pengadaan Barang</h1>

      <div className="bg-white border rounded p-6 space-y-6">
        {!id && (
          <div>
            <p className="text-sm text-gray-600">Tanggal Input</p>
            <p className="font-semibold">{todayLabel}</p>
          </div>
        )}
        <div>
          <label className="text-sm text-gray-600 block mb-1">
            Gudang Penyimpanan
          </label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={warehouse?.id || ""}
            onChange={(e) =>
              setWarehouse(
                warehouseOptions.find((g) => g.id === Number(e.target.value))
              )
            }
          >
            <option value="" disabled>
              Pilih gudang tempat penyimpanan barang
            </option>
            {warehouseOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">
            Nama Barang
          </label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={item?.id || ""}
            onChange={(e) =>
              setItem(itemOptions.find((b) => b.id === Number(e.target.value)))
            }
          >
            <option value="" disabled>
              Pilih barang...
            </option>
            {itemOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Supplier</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={supplier?.id || ""}
            onChange={(e) =>
              setSupplier(
                supplierOptions.find((s) => s.id === Number(e.target.value))
              )
            }
          >
            <option value="" disabled>
              Pilih suppplier...
            </option>

            {filteredSupplierOptions.length > 0 ? (
              filteredSupplierOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Tidak ada supplier tersedia untuk barang yang dipilih
              </option>
            )}
          </select>
        </div>
        <div className="flex items-center mb-4">
          <div
            onClick={() => {
              tambahSupplierHandle();
            }}
            className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
          >
            <div className="text-base font-medium ms-2 ">+ Tambah Supplier</div>
          </div>
        </div>

        <div className="flex gap-8">
          <div>
            <p className="text-sm text-gray-600">Kebutuhan per-hari</p>
            <p className="font-semibold">
              {dailySpending
                ? `${dailySpending.toLocaleString("id-ID")} ${
                    item?.unit || "-"
                  }`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Rekomendasi minimum jumlah pembelian
            </p>
            <p className="font-semibold">
              {dailySpending
                ? `${(dailySpending * 3).toLocaleString("id-ID")} ${
                    item?.unit || "-"
                  }`
                : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Kebutuhan (Hari)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                placeholder="Masukkan untuk kebutuhan berapa hari akan dipesan"
                value={formatThousand(days)}
                onChange={(e) => {
                  const raw = onlyDigits(e.target.value);
                  if (raw === "") return setDays("");
                  const num = Math.max(0, Number(raw));
                  setDays(num);
                }}
              />
              <span className="font-medium">Hari</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Total Pesan</p>
            <p className="font-semibold">
              {totalOrder
                ? `${totalOrder.toLocaleString("id-ID")} ${item?.unit || "-"}`
                : "-"}
            </p>
          </div>
        </div>

        {/* Harga / unit & Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Harga Beli / Unit
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={formatThousand(pricePerUnit)}
                onChange={(e) => {
                  const raw = onlyDigits(e.target.value);
                  if (raw === "") return setPricePerUnit("");
                  setPricePerUnit(Math.max(0, Number(raw)));
                }}
                placeholder="Rp 0"
              />
              <span className="font-medium">/ {item?.unit || "-"}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Harga Beli Total</p>
            <p className="font-semibold">
              {totalPrice ? fmtIDR(totalPrice) : "Rp -"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={saveDraft}
            className="bg-green-700 hover:bg-green-900 text-white px-6 py-2 rounded cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
      {/* <button
        onClick={() => {
          console.log("item: ", item);
        }}
      >
        CHECK
      </button> */}
    </div>
  );
}
