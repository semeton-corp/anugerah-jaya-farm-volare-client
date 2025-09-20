import React, { useEffect, useMemo, useState } from "react";
import {
  createRawFeed,
  createReadyToEatFeed,
  getWarehouseItems,
  getWarehouses,
} from "../services/warehouses";
import { getItems } from "../services/item";
import { useLocation, useNavigate } from "react-router-dom";
import { use } from "react";
import { getCurrentUserWarehousePlacement } from "../services/placement";

const rupiah = (n) =>
  `Rp ${Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const WAREHOUSES = [
  { id: 1, name: "Gudang Pusat", cornCapacity: 0 },
  { id: 2, name: "Gudang Timur", cornCapacity: 15000 },
  { id: 3, name: "Gudang Barat", cornCapacity: 9000 },
];

export default function PerbandinganPakan() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("role");
  const locationId = localStorage.getItem("locationId");

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(WAREHOUSES[0]);

  const [daysAdukan, setDaysAdukan] = useState("");
  const [jagungKg, setJagungKg] = useState("");
  const [dedakKg, setDedakKg] = useState("");
  const [konsentratKg, setKonsentratKg] = useState("");
  const [premixKg, setPremixKg] = useState("");

  const [dailyDedak, setDailyDedak] = useState(1);
  const [dailyKonsentrat, setDailyKonsentrat] = useState(1);
  const [dailyPremix, setDailyPremix] = useState(1);
  const [dailyJagung, setDailyJagung] = useState(1);
  const [dailyPakanJadi, setdailyPakanJadi] = useState(1);

  const [dedakId, setDedakId] = useState(null);
  const [konsentratId, setKonsentratId] = useState(null);
  const [premixId, setPremixId] = useState(null);
  const [jagungId, setJagungId] = useState(null);

  const [priceJagung, setPriceJagung] = useState("");
  const [priceDedak, setPriceDedak] = useState("");
  const [priceKonsentrat, setpriceKonsentrat] = useState("");
  const [pricePremix, setPricePremix] = useState("");

  const [daysJadi, setDaysJadi] = useState("");
  const [jumlahPakanJadi, setJumlahPakanJadi] = useState(0);
  const [hargaPakanJadi, setHargaPakanJadi] = useState("");
  const [kadaluarsa, setKadaluarsa] = useState(
    new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  );

  const [pakanJadiOptions, setPakanJadiOptions] = useState([]);
  const [selectedPakanJadi, setSelectedPakanJadi] = useState();

  const [totalPrice, settotalPrice] = useState();

  const totalJadi = useMemo(() => {
    return Number(jumlahPakanJadi || 0) * Number(hargaPakanJadi || 0);
  }, [jumlahPakanJadi, hargaPakanJadi]);

  const pesanAdukan = async () => {
    if (!selectedWarehouse?.id) {
      alert("❌ Gudang belum dipilih!");
      return;
    }
    if (!jagungKg || jagungKg <= 0) {
      alert("❌ Jumlah jagung tidak boleh kosong!");
      return;
    }
    if (!priceJagung || Number(priceJagung) <= 0) {
      alert("❌ Harga jagung tidak boleh kosong!");
      return;
    }
    if (!daysAdukan || daysAdukan <= 0) {
      alert("❌ Jumlah hari kebutuhan harus lebih dari 0!");
      return;
    }

    const rawMaterials = [
      {
        itemId: dedakId,
        quantity: Number(dailyDedak || 0) * daysAdukan,
        price: String(priceDedak || 0),
        dailySpending: Number(dailyDedak || 0),
        name: "Dedak",
      },
      {
        itemId: konsentratId,
        quantity: Number(dailyKonsentrat || 0) * daysAdukan,
        price: String(priceKonsentrat || 0),
        dailySpending: Number(dailyKonsentrat || 0),
        name: "Konsentrat",
      },
      {
        itemId: premixId,
        quantity: Number(dailyPremix || 0) * daysAdukan,
        price: String(pricePremix || 0),
        dailySpending: Number(dailyPremix || 0),
        name: "Premix",
      },
    ];

    for (let material of rawMaterials) {
      if (!material.itemId) {
        alert(`❌ Item ${material.name} belum ada ID!`);
        return;
      }
      if (!material.price || Number(material.price) <= 0) {
        alert(`❌ Harga ${material.name} tidak boleh kosong!`);
        return;
      }
    }

    const payload = {
      warehouseId: selectedWarehouse.id,
      cornQuantity: Number(jagungKg || 0),
      cornPrice: String(priceJagung || 0),
      daysNeed: Number(daysAdukan || 0),
      rawMaterials: rawMaterials.map(({ name, ...rest }) => rest),
    };

    try {
      const jadiResponse = await createRawFeed(payload);
      if (jadiResponse.status == 201) {
        const newPath = location.pathname.replace(
          "perbandingan-pakan",
          "pengadaan-barang/draft-pengadaan-barang"
        );
        navigate(newPath, { state: { refetch: true } });
      }
    } catch (error) {
      alert("❌ Gagal memesan pakan!");
      console.log("error :", error);
    }
  };

  const pesanJadi = async () => {
    if (!selectedPakanJadi || !daysJadi || !hargaPakanJadi) {
      alert("❌ Lengkapi semua field yang tersedia");
      return;
    }

    const payload = {
      warehouseId: selectedWarehouse.id,
      itemId: selectedPakanJadi.id,
      daysNeed: daysJadi,
      price: String(hargaPakanJadi),
      dailySpending: selectedPakanJadi.dailySpending,
    };
    try {
      const jadiResponse = await createReadyToEatFeed(payload);
      console.log("jadiResponse: ", jadiResponse);
      if (jadiResponse.status == 201) {
        const newPath = location.pathname.replace(
          "perbandingan-pakan",
          "pengadaan-barang/draft-pengadaan-barang"
        );
        navigate(newPath, { state: { refetch: true } });
      }
    } catch (error) {
      alert("❌ Gagal memesan pakan!");
      console.log("error :", error);
    }
  };

  const fetchWarehouseData = async () => {
    try {
      const warehouseResponse = await getWarehouses(selectedSite);
      console.log("warehouseResponse: ", warehouseResponse);
      if (warehouseResponse.status == 200) {
        setWarehouses(warehouseResponse.data.data);
        setSelectedWarehouse(warehouseResponse.data.data[0].id);
        setCornCapacity(warehouseResponse.data.data[0].cornCapacity);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchWarehousePlacement = async () => {
    try {
      const placementResponse = await getCurrentUserWarehousePlacement();
      if (placementResponse.status == 200) {
        const warehouses = placementResponse.data.data.map(
          (item) => item.warehouse
        );
        setWarehouses(warehouses);
        setSelectedWarehouse(warehouses[0]);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDailySpendingData = async () => {
    try {
      const dailySpendingResponse = await getItems();
      console.log("dailySpendingResponse: ", dailySpendingResponse);
      if (dailySpendingResponse.status == 200) {
        const data = dailySpendingResponse.data.data;
        const dedak = data?.find((item) => item.name == "Dedak");
        const konsentrat = data?.find((item) => item.name == "Konsentrat");
        const premix = data?.find((item) => item.name == "Premix");
        const jagung = data?.find((item) => item.name == "Jagung");

        if (dedak) {
          setDailyDedak(dedak.dailySpending);
          setDedakId(dedak.id);
        }
        if (konsentrat) {
          setDailyKonsentrat(konsentrat.dailySpending);
          setKonsentratId(konsentrat.id);
        }
        if (premix) {
          setDailyPremix(premix.dailySpending);
          setPremixId(premix.id);
        }
        if (jagung) {
          setDailyJagung(jagung.dailySpending);
          setJagungId(jagung.id);
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPakanJadiData = async () => {
    try {
      const itemResponse = await getItems();
      //   console.log("itemResponse: ", itemResponse);
      if (itemResponse.status == 200) {
        const data = itemResponse.data.data;
        const pakanJadiOptions = data.filter(
          (item) => item.category == "Pakan Jadi"
        );
        setPakanJadiOptions(pakanJadiOptions);
        console.log("pakanJadiOptions[0]: ", pakanJadiOptions[0]);
        setSelectedPakanJadi(pakanJadiOptions[0]);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const calculateTotalPriceAdukan = () => {
    const toNumber = (value) => Number(value) || 0;

    const jagungPrice = toNumber(priceJagung) * toNumber(jagungKg);
    const dedakPrice = toNumber(priceDedak) * toNumber(dedakKg);
    const konsentratPrice = toNumber(priceKonsentrat) * toNumber(konsentratKg);
    const premixPrice = toNumber(pricePremix) * toNumber(premixKg);

    const total = jagungPrice + dedakPrice + konsentratPrice + premixPrice;
    settotalPrice(total);
  };

  useEffect(() => {
    if (userRole == "Pekerja Gudang") {
      fetchWarehousePlacement();
    } else {
      fetchWarehouseData();
    }
    fetchPakanJadiData();
  }, []);

  useEffect(() => {
    fetchDailySpendingData();
  }, [selectedWarehouse]);

  useEffect(() => {
    calculateTotalPriceAdukan();
  }, [priceJagung, priceDedak, priceKonsentrat, pricePremix, daysAdukan]);

  useEffect(() => {
    setDedakKg(dailyDedak * daysAdukan);
    setKonsentratKg(dailyKonsentrat * daysAdukan);
    setPremixKg(dailyPremix * daysAdukan);
    setJagungKg(dailyJagung * daysAdukan);
  }, [daysAdukan]);

  useEffect(() => {
    if (selectedPakanJadi?.dailySpending) {
      setJumlahPakanJadi(selectedPakanJadi.dailySpending * daysJadi);
    }
  }, [daysJadi, selectedPakanJadi]);
  return (
    <div className="p-4 md:p-6">
      <div className="text-sm text-gray-500 mb-2">
        Gudang &gt; Pengadaan Barang &gt;{" "}
        <span className="text-gray-800">Input Pengadaan Barang</span>
      </div>

      <h1 className="text-3xl font-bold mb-4">Perbandingan Pakan</h1>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">
          Gudang Penyimpanan
        </label>
        <div className="relative">
          <select
            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
            value={selectedWarehouse?.id}
            onChange={(e) => {
              const next = warehouses.find(
                (w) => w.id === Number(e.target.value)
              );
              setSelectedWarehouse(next || WAREHOUSES[0]);
            }}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Pakan Adukan</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Jumlah Jagung
              </label>
              <div className="relative">
                <div className="w-full px-3 py-2 rounded-md  border-gray-300 bg-gray-100 text-gray-800">
                  {jagungKg}
                </div>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Kg
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Harga Jagung
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-md border border-gray-300"
                    value={priceJagung}
                    onChange={(e) => setPriceJagung(Number(e.target.value))}
                    min={0}
                  />
                  <span className="ml-2 text-gray-600">/ Kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Kebutuhan (Hari)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  value={daysAdukan}
                  onChange={(e) => setDaysAdukan(Number(e.target.value))}
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Hari
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Kapasitas Maksimum Jagung Gudang
              </label>
              <div className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100">
                {selectedWarehouse?.cornCapacity
                  ? selectedWarehouse.cornCapacity
                  : "-"}
                Kg
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Jumlah Dedak
              </label>
              <div className="relative">
                <div className="w-full px-3 py-2 rounded-md  border-gray-300 bg-gray-100 text-gray-800">
                  {dedakKg}
                </div>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Kg
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Harga Dedak
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  value={priceDedak}
                  onChange={(e) => setPriceDedak(Number(e.target.value))}
                />
                <span className="ml-2 text-gray-600">/ Kg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Jumlah Konsentrat
              </label>
              <div className="relative">
                <div className="w-full px-3 py-2 rounded-md  border-gray-300 bg-gray-100 text-gray-800">
                  {konsentratKg}
                </div>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Kg
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Harga Konsentrat
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  value={priceKonsentrat}
                  onChange={(e) => setpriceKonsentrat(Number(e.target.value))}
                  min={0}
                />
                <span className="ml-2 text-gray-600">/ Kg</span>
              </div>
            </div>
          </div>

          {/* Premix */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Jumlah Premix
              </label>
              <div className="relative">
                <div className="w-full px-3 py-2 rounded-md  border-gray-300 bg-gray-100 text-gray-800">
                  {premixKg}
                </div>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Kg
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Harga Premix
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  value={pricePremix}
                  onChange={(e) => setPricePremix(Number(e.target.value))}
                  min={0}
                />
                <span className="ml-2 text-gray-600">/ Kg</span>
              </div>
            </div>
          </div>

          {/* Footer total + button */}
          <div className="mt-4">
            <p className="text-lg font-bold">
              Total Harga : {rupiah(totalPrice)}
            </p>
            <button
              onClick={pesanAdukan}
              className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded"
            >
              Pesan Pakan Adukan
            </button>
          </div>
        </div>

        {/* ====== PAKAN JADI ====== */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Pakan Jadi</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-1">
                Pilih Pakan Jadi
              </label>
              <select
                id="pakanJadi"
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                value={selectedPakanJadi?.id || ""}
                onChange={(e) => {
                  const selected = pakanJadiOptions.find(
                    (opt) => opt.id === Number(e.target.value)
                  );
                  setSelectedPakanJadi(selected || null);
                }}
              >
                {pakanJadiOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-1">
                Kebutuhan (Hari)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  value={daysJadi}
                  onChange={(e) => setDaysJadi(Number(e.target.value))}
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Hari
                </span>
              </div>
            </div>
          </div>

          {/* Jumlah + Harga */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Jumlah Pakan
              </label>
              <div className="relative">
                <div className="w-full px-3 py-2 rounded-md  border-gray-300 bg-gray-100 text-gray-800">
                  {jumlahPakanJadi}
                </div>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500">
                  Kg
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Harga Pakan
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  value={hargaPakanJadi}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setHargaPakanJadi(Number(raw || 0));
                  }}
                />
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500">
                  / Kg
                </span>
              </div>
            </div>
          </div>

          {/* Footer total + button */}
          <div className="mt-4">
            <p className="text-lg font-bold">
              Total Harga : {rupiah(totalJadi)}
            </p>
            <button
              onClick={pesanJadi}
              className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded"
            >
              Pesan Pakan Jadi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
