import React, { useState } from "react";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { useEffect } from "react";
import { getCage, getChickenCage } from "../services/cages";
import { getSuppliers } from "../services/supplier";
import { createChickenProcurementDraft } from "../services/chickenMonitorings";
import { useNavigate } from "react-router-dom";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";

const InputDraftPemesananDoc = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [cages, setCages] = useState([]);
  const [selectedCage, setSelectedCage] = useState(null);

  const fetchCages = async () => {
    try {
      const chickenCageResponse = await getCage(selectedSite);
      if (chickenCageResponse.status === 200) {
        const allCages = chickenCageResponse.data.data;
        const filteredCages = allCages.filter(
          (cage) => !cage.isUsed && cage.chickenCategory == "DOC"
        );
        setCages(filteredCages);
        if (filteredCages.length > 0) {
          setSelectedCage(filteredCages[0]);
        }
        console.log("allCages: ", allCages);
        console.log("filteredCages: ", filteredCages);
      }
    } catch (error) {
      console.error("Gagal memuat data kandang:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const suppliersResponse = await getSuppliers("Ayam DOC");
      // console.log("suppliersResponse: ", suppliersResponse);
      if (suppliersResponse.status === 200) {
        setSuppliers(suppliersResponse.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data kandang:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCage || !selectedSupplier || !quantity || !price) {
      alert("❌ Semua field harus diisi!");
      return;
    }

    const payload = {
      cageId: selectedCage?.id,
      supplierId: selectedSupplier.id,
      quantity: parseInt(quantity),
      totalPrice: price,
    };

    try {
      const submitResponse = await createChickenProcurementDraft(payload);
      console.log("submitResponse: ", submitResponse);
      if (submitResponse.status === 201) {
        alert("✅ Draft pemesanan berhasil disimpan!");
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchCages();
    fetchSuppliers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Input Draft Pemesanan DOC</h2>

      <div className="bg-white p-6 rounded border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-600">Tanggal Input</label>
            <p className="font-semibold mt-1">{getTodayDateInBahasa()}</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block mb-2">Kandang</label>
              {cages && cages.length > 0 ? (
                <select
                  className="w-full border rounded px-4 py-2"
                  value={selectedCage?.id ?? ""}
                  onChange={(e) =>
                    setSelectedCage(
                      cages.find((k) => k.id === parseInt(e.target.value))
                    )
                  }
                >
                  {cages.map((k) => (
                    <option key={k?.id} value={k?.id}>
                      {k?.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-2 bg-orange-100 text-yellow-800 rounded border border-orange-300">
                  ⚠️ Tidak ada Kandang Doc yang tersedia
                </div>
              )}
            </div>

            <div className="w-1/2 text-left flex flex-col justify-center">
              <p className=" text-gray-600 mb-2">Kapasitas Maksimum Kandang</p>
              <p className="font-bold">{selectedCage?.capacity ?? "-"} ekor</p>
            </div>
          </div>

          <div>
            <label className="block mb-1">Supplier DOC</label>
            <select
              className="w-full border rounded px-4 py-2 bg-gray-100"
              value={selectedSupplier?.id ?? ""}
              onChange={(e) => {
                const selectedSupplier = suppliers.find(
                  (supplier) => supplier?.id === parseInt(e.target.value)
                );
                setSelectedSupplier(selectedSupplier);
              }}
            >
              <option value="">Pilih nama suplier</option>
              {suppliers?.map((supplier) => (
                <option key={supplier?.id} value={supplier?.id}>
                  {supplier?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Jumlah Pemesanan</label>
            <input
              type="number"
              placeholder="Masukkan jumlah barang..."
              className="w-full border rounded px-4 py-2"
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (selectedCage?.capacity && val > selectedCage.capacity) {
                  setQuantity(selectedCage.capacity);
                } else {
                  setQuantity(val);
                }
              }}
              min={0}
            />
          </div>

          <div>
            <label className="block mb-1">Total Harga</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Masukkan jumlah barang..."
              className="w-full border rounded px-4 py-2"
              value={formatThousand(price)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setPrice(raw);
              }}
            />
          </div>

          <div className="text-right">
            <button
              // onClick={handleSubmit}
              className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-900 cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* <button
        onClick={() => {
          console.log("selectedSupplier: ", selectedSupplier);
        }}
      >
        CHECK
      </button> */}
    </div>
  );
};

export default InputDraftPemesananDoc;
