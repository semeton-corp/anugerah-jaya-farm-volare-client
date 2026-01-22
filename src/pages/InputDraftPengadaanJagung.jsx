import React, { useEffect, useState } from "react";
import { IoHome, IoLogoWhatsapp } from "react-icons/io5";
import { GiChicken } from "react-icons/gi";
import { GoAlertFill } from "react-icons/go";
import { useNavigate, useParams } from "react-router-dom";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import {
  createWarehouseItemCornProcurementDraft,
  getCornWarehouseItemSummary,
  getWarehouseItemCornPrice,
  getWarehouseItemCornProcurementDraft,
  getWarehouses,
  updateWarehouseItemCornProcurementDraft,
} from "../services/warehouses";
import { getSuppliers } from "../services/supplier";
import { getItems } from "../services/item";

const discountDataInit = [
  { range: [0, 15.0], discount: 0 },
  { range: [15.01, 16.0], discount: 0 },
  { range: [16.01, 17.0], discount: 0 },
  { range: [17.01, 18.0], discount: 0.6 },
  { range: [18.01, 19.0], discount: 1.8 },
  { range: [19.01, 20.0], discount: 3.0 },
  { range: [20.01, 21.0], discount: 4.2 },
  { range: [21.01, 22.0], discount: 5.4 },
  { range: [22.01, 23.0], discount: 6.6 },
  { range: [23.01, 24.0], discount: 7.8 },
  { range: [24.01, 25.0], discount: 9.0 },
  { range: [25.01, 26.0], discount: 10.2 },
  { range: [26.01, 27.0], discount: 11.4 },
  { range: [27.01, 28.0], discount: 12.6 },
  { range: [28.01, 29.0], discount: 13.8 },
  { range: [29.01, 30.0], discount: 15.0 },
  { range: [30.01, 31.0], discount: 16.2 },
  { range: [31.01, 32.0], discount: 17.4 },
  { range: [32.01, 33.0], discount: 18.6 },
  { range: [33.01, 34.0], discount: 19.8 },
  { range: [34.01, 35.0], discount: 21.0 },
  { range: [35.01, 36.0], discount: 22.2 },
  { range: [36.01, 37.0], discount: 23.4 },
  { range: [37.01, 38.0], discount: 24.6 },
  { range: [38.01, 39.0], discount: 25.8 },
  { range: [39.01, 40.0], discount: 27.0 },
  { range: [40.01, 41.0], discount: 28.2 },
  { range: [41.01, 42.0], discount: 29.4 },
  { range: [42.01, 43.0], discount: 30.6 },
  { range: [43.01, 44.0], discount: 31.8 },
];

const computeDefaultBasePrice = (moisture) => {
  const m = parseFloat(moisture);
  if (Number.isNaN(m)) return 5800;
  return m < 17 ? 5800 : 5450;
};

const InputDraftPengadaanJagung = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userRole = localStorage.getItem("role");
  const locationId = localStorage.getItem("locationId");

  const [discountData, setDiscountData] = useState(discountDataInit);
  const [inputDate, setInputDate] = useState(getTodayDateInBahasa());
  const [formData, setFormData] = useState({
    warehouse: "",
    moistureLevel: "",
    ovenCondition: "",
    ovenCanOperate: "",
    supplier: "",
    quantity: "",
  });

  const [jagungItemIds, setJagungItemIds] = useState([]);

  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState();
  const [supplierOptions, setsupplierOptions] = useState([]);

  const [currentCornStock, setCurrentCornStock] = useState(0);
  const isCanBuyCorn = !(
    (formData.ovenCondition === "Hidup" &&
      formData.ovenCanOperate === "Tidak") ||
    formData.moistureLevel > 44
  );

  const [basePrice, setBasePrice] = useState(
    computeDefaultBasePrice(formData.moistureLevel),
  );
  const [basePriceEdited, setBasePriceEdited] = useState(false);

  useEffect(() => {
    if (!basePriceEdited) {
      setBasePrice(computeDefaultBasePrice(formData.moistureLevel));
    }
  }, [formData.moistureLevel, basePriceEdited]);

  const maxOrderQuantity =
    selectedWarehouse?.cornCapacity - currentCornStock?.quantity || 0;

  const discountRate =
    discountData.find(
      (d) =>
        parseFloat(formData.moistureLevel) > d.range[0] &&
        parseFloat(formData.moistureLevel) <= d.range[1],
    )?.discount || 0;

  const discountedPricePerKg = basePrice - (basePrice * discountRate) / 100;
  const totalPurchasePrice =
    Number(formData.quantity || 0) * discountedPricePerKg || 0;
  const isQuantityOverMax =
    Number.parseInt(formData.quantity || 0, 10) > maxOrderQuantity;

  const moisture = parseFloat(formData.moistureLevel);
  const isOvenConditionDisabled = isNaN(moisture) || moisture < 17;
  const isOvenCanOperateDisabled =
    isOvenConditionDisabled || formData.ovenCondition !== "Hidup";

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name !== "moistureLevel") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      value = Number(value);
      if (value > 100) value = 100;

      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();

    if (
      !selectedWarehouse ||
      !formData.moistureLevel ||
      !formData.supplier ||
      !formData.quantity
    ) {
      alert("❌ Mohon isi semua field dengan benar!");
      return;
    }

    if (isQuantityOverMax) {
      alert(
        "❌ Jumlah barang yang anda masukkan melebihi jumlah maksimum pesan!",
      );
      return;
    }

    let payload = {
      warehouseId: selectedWarehouse.id,
      supplierId: parseInt(formData.supplier),
      cornWaterLevel: formData.moistureLevel,
      quantity: parseInt(formData.quantity),
      price: basePrice.toString(),
      discount: discountRate,
    };

    if (formData.ovenCondition !== "") {
      payload.ovenCondition = formData.ovenCondition;
    }

    if (formData.ovenCanOperate !== "") {
      payload.isOvenCanOperateInNearDay =
        formData.ovenCanOperate === "Tidak" ? false : true;
    }

    console.log("payload:", payload);

    if (id) {
      try {
        const updateResponse = await updateWarehouseItemCornProcurementDraft(
          payload,
          id,
        );
        if (updateResponse.status == 200) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        alert("❌ Gagal memperbaharui data pengadaan!");
        console.log("error :", error);
      }
    } else {
      try {
        const createResponse =
          await createWarehouseItemCornProcurementDraft(payload);
        if (createResponse.status == 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        console.log("error :", error);
      }
    }
  };

  const getInputClass = (isDisabled) =>
    `w-full px-4 py-2 rounded-md border border-gray-300 
   ${
     isDisabled
       ? "w-full bg-gray-100 text-gray-400 cursor-not-allowed"
       : "w-full bg-white text-gray-700 "
   }`;

  const fetchWarehouses = async () => {
    try {
      const warehouseResponse = await getWarehouses();
      if (warehouseResponse.status === 200) {
        const warehouses = warehouseResponse.data.data;
        let filteredWarehouse;
        if (userRole != "Owner") {
          filteredWarehouse = warehouses.filter(
            (item) => item.location.id == locationId,
          );
        } else {
          filteredWarehouse = warehouses;
        }
        setWarehouseOptions(filteredWarehouse);
        setSelectedWarehouse(filteredWarehouse[0]);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const supplierResponse = await getSuppliers();
      if (supplierResponse.status === 200) {
        const allSupplier = supplierResponse.data.data;
        const filteredSupplier = allSupplier.filter((item) =>
          item.itemIds.some((id) => jagungItemIds.includes(id)),
        );
        setsupplierOptions(filteredSupplier);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchCornSummary = async () => {
    try {
      if (!selectedWarehouse?.id) return;
      const cornResponse = await getCornWarehouseItemSummary(
        selectedWarehouse.id,
      );
      if (cornResponse.status === 200) {
        setCurrentCornStock(cornResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDiscountData = async () => {
    try {
      const res = await getWarehouseItemCornPrice();
      console.log("res: ", res);
      if (res.status == 200 && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          const mapped = res.data.data?.map((item) => ({
            range: [item.bottomLimit, item.upperLimit],
            discount: item.discount,
          }));
          setDiscountData(mapped);
        }
      }
    } catch (err) {
      console.error("Error fetching discount data:", err);
    }
  };

  const fetchDetailData = async () => {
    try {
      const detailResponse = await getWarehouseItemCornProcurementDraft(id);
      if (detailResponse.status == 200) {
        const data = detailResponse.data.data;
        console.log("data: ", data);
        setInputDate(data.inputDate);
        setSelectedWarehouse(data.warehouse);
        setFormData({
          moistureLevel: data.cornWaterLevel,
          ovenCondition: data.oveCondition,
          ovenCanOperate: data.isOvenCanOperateInNearDay ? "Ya" : "Tidak",
          supplier: data.supplier.id,
          quantity: data.quantity,
        });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchItems = async () => {
    try {
      const jagungItemsResponse = await getItems("Bahan Baku Adukan - Jagung");
      if (jagungItemsResponse.status == 200) {
        const itemIds = jagungItemsResponse.data.data.map((item) => item.id);
        setJagungItemIds(itemIds);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const tambahSupplierHandle = () => {
    const basePath = location.pathname.split("pengadaan-jagung")[0];
    const newPath = `${basePath}daftar-suplier/tambah-supplier`;
    navigate(newPath);
  };

  useEffect(() => {
    if (isOvenConditionDisabled && formData.ovenCondition !== "") {
      setFormData((prev) => ({ ...prev, ovenCondition: "" }));
    }
  }, [isOvenConditionDisabled]);

  useEffect(() => {
    if (isOvenCanOperateDisabled && formData.ovenCanOperate !== "") {
      setFormData((prev) => ({ ...prev, ovenCanOperate: "" }));
    }
  }, [isOvenCanOperateDisabled]);

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
    fetchDiscountData();
    if (id) {
      fetchDetailData();
    }
    console.log("id: ", id);
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [jagungItemIds]);

  useEffect(() => {
    fetchCornSummary();
  }, [selectedWarehouse]);

  useEffect(() => {
    setBasePrice(computeDefaultBasePrice(formData.moistureLevel));
  }, [formData.moistureLevel]);

  return (
    <div className="flex flex-col px-4 py-3 gap-6 font-sans">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Input Draft Pengadaan Jagung</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center bg-green-100 rounded-lg p-4 gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                Stok Jagung Saat ini
              </span>
              <span className="text-2xl font-bold">
                {currentCornStock?.quantity} Kg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-green-700">
              <GiChicken size={24} color="white" />
            </div>
          </div>
        </div>
        <div className="flex items-center bg-green-100 rounded-lg p-4 gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                Kapasitas Maksimum Gudang
              </span>
              <span className="text-2xl font-bold">
                {selectedWarehouse?.cornCapacity} Kg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-green-700">
              <IoHome size={24} color="white" />
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSimpan}
        className="bg-white p-6 border rounded-lg w-full border-black-6 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Tanggal Input
          </label>
          <input
            type="text"
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
            value={inputDate}
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="warehouse"
            className="text-sm font-semibold text-gray-700"
          >
            Gudang Penyimpanan
          </label>
          <select
            id="warehouse"
            name="warehouse"
            value={selectedWarehouse?.id}
            onChange={(e) => {
              const w = warehouseOptions.find((it) => it.id == e.target.value);
              setSelectedWarehouse(w);
            }}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white"
          >
            <option value="" disabled>
              Pilih Gudang
            </option>
            {warehouseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Nama Barang
          </label>
          <p className="text-xl font-bold">Jagung</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="moistureLevel"
              className="text-sm font-semibold text-gray-700"
            >
              Kadar Air Jagung
            </label>
            <div className="relative">
              <input
                type="number"
                id="moistureLevel"
                name="moistureLevel"
                max={100}
                value={formData.moistureLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300"
              />
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="ovenCondition"
              className="text-sm font-semibold text-gray-700"
            >
              Kondisi Oven
            </label>
            <select
              id="ovenCondition"
              name="ovenCondition"
              value={formData.ovenCondition}
              onChange={handleInputChange}
              disabled={isOvenConditionDisabled}
              className={`px-4 py-2 rounded-md border border-gray-300 
                ${
                  isOvenConditionDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 cursor-pointer"
                }`}
            >
              <option value="" disabled>
                Pilih Kondisi
              </option>
              {["Hidup", "Mati"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="ovenCanOperate"
              className="text-sm font-semibold text-gray-700"
            >
              Oven jagung dapat hidup 1-2 hari?
            </label>
            <select
              id="ovenCanOperate"
              name="ovenCanOperate"
              value={formData.ovenCanOperate}
              onChange={handleInputChange}
              disabled={isOvenCanOperateDisabled}
              className={`px-4 py-2 rounded-md border border-gray-300 
                ${
                  isOvenCanOperateDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 cursor-pointer"
                }`}
            >
              <option value="" disabled>
                Pilih Ya/Tidak
              </option>
              {["Ya", "Tidak"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Harga Jagung Normal/Kg
          </label>
          <input
            type="text"
            className={getInputClass(!isCanBuyCorn)}
            disabled={!isCanBuyCorn}
            value={`Rp ${Number(basePrice || 0).toLocaleString("id-ID")}`}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setBasePrice(Number(raw || 0));
              setBasePriceEdited(true);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="supplier"
            className="text-sm font-semibold text-gray-700"
          >
            Supplier
          </label>
          <select
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            className={getInputClass(!isCanBuyCorn)}
            disabled={!isCanBuyCorn}
          >
            <option value="" disabled>
              Pilih Supplier
            </option>
            {supplierOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Jumlah Pesan & Maksimum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quantity"
              className="text-sm font-semibold text-gray-700"
            >
              Jumlah Pesan
            </label>
            <div className="relative">
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className={getInputClass(!isCanBuyCorn)}
                disabled={!isCanBuyCorn}
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                Kg
              </span>
            </div>
            {isQuantityOverMax && (
              <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
                <GoAlertFill />
                Jumlah barang yang anda masukkan melebihi jumlah maksimum pesan
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Jumlah Maksimum Pesan
            </label>
            <div
              className={getInputClass(!isCanBuyCorn)}
              disabled={!isCanBuyCorn}
            >
              <span className="font-bold">{maxOrderQuantity} Kg</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div
            onClick={tambahSupplierHandle}
            className="flex items-center justify-center sm:justify-start rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer w-full sm:w-auto transition-all duration-200"
          >
            <span className="text-base font-medium">+ Tambah Supplier</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const selectedSupplier = supplierOptions.find(
                (item) => item.id == formData.supplier,
              );
              const localNumber = selectedSupplier?.phoneNumber;
              const waNumber = localNumber.replace(/^0/, "62");
              const namaSupplier = selectedSupplier.name || "Supplier";
              const namaBarang = "Jagung";
              const unit = "Kg";
              const rencanaPembelian = `${formData.quantity} ${unit}`;
              const rawMessage = `Halo ${namaSupplier} 🙏🙏🙏

Kami dari *Anugerah Jaya Farm* ingin menanyakan harga barang *PER ${unit.toUpperCase()}* berikut:

━━━━━━━━━━━━━━━
📦 *Nama Barang*: ${namaBarang}
📝 *Rencana Pembelian*: ${rencanaPembelian} ${unit}
━━━━━━━━━━━━━━━

✅ Mohon konfirmasi, terima kasih.`;

              const message = encodeURIComponent(rawMessage);
              const waURL = `https://api.whatsapp.com/send/?phone=${waNumber}&text=${message}`;

              window.open(waURL, "_blank");
            }}
            disabled={!formData.supplier || !formData.quantity}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              !formData.supplier || !formData.quantity || isQuantityOverMax
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-800 text-white"
            }`}
          >
            <IoLogoWhatsapp size={20} />
            Tanya Harga
          </button>
        </div>

        {/* Hasil harga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Hasil Harga Beli / Kg
            </label>
            <div
              className={getInputClass(!isCanBuyCorn)}
              disabled={!isCanBuyCorn}
            >
              <span className="font-bold">
                Rp {Number(discountedPricePerKg || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Harga Beli Total
            </label>
            <div
              className={getInputClass(!isCanBuyCorn)}
              disabled={!isCanBuyCorn}
            >
              <span className="font-bold">
                Rp {Number(totalPurchasePrice || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg  text-white font-medium 
              ${
                isCanBuyCorn
                  ? "bg-green-700 hover:bg-green-800 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }
              `}
            disabled={!isCanBuyCorn && !isQuantityOverMax}
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputDraftPengadaanJagung;
