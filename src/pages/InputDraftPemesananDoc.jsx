import React, { useState } from "react";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { useEffect } from "react";
import { getCage, getChickenCage } from "../services/cages";
import { getSuppliers } from "../services/supplier";
import { createChickenProcurementDraft } from "../services/chickenMonitorings";
import { useNavigate } from "react-router-dom";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { IoLogoWhatsapp } from "react-icons/io5";

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
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">
        Input Draft Pemesanan DOC
      </h2>

      <div className="bg-white p-4 sm:p-6 rounded-lg border shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal Input */}
          <div>
            <label className="block text-gray-600 text-sm sm:text-base">
              Tanggal Input
            </label>
            <p className="font-semibold mt-1">{getTodayDateInBahasa()}</p>
          </div>

          {/* Kandang & Kapasitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
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
                  <option value="">Pilih kandang</option>
                  {cages.map((k) => (
                    <option key={k?.id} value={k?.id}>
                      {k?.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-2 bg-orange-100 text-yellow-800 rounded border border-orange-300">
                  ⚠️ Tidak ada Kandang DOC yang tersedia
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-gray-600 mb-2 text-sm sm:text-base">
                Kapasitas Maksimum Kandang
              </p>
              <p className="font-bold">{selectedCage?.capacity ?? "-"} ekor</p>
            </div>
          </div>

          {/* Supplier */}
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
              <option value="">Pilih nama supplier</option>
              {suppliers?.map((supplier) => (
                <option key={supplier?.id} value={supplier?.id}>
                  {supplier?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Jumlah Pemesanan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Masukkan jumlah barang..."
                className="w-full border rounded px-4 py-2"
                value={formatThousand(quantity)}
                onChange={(e) => {
                  const raw = e.target.value;

                  const digits = onlyDigits(raw);

                  const val = parseInt(digits || "0", 10);

                  if (selectedCage?.capacity && val > selectedCage.capacity) {
                    setQuantity(selectedCage.capacity);
                  } else {
                    setQuantity(val);
                  }
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!selectedSupplier || !quantity) {
                alert("Mohon isi semua field dengan benar");
                return;
              }

              const localNumber = selectedSupplier.phoneNumber;
              const waNumber = localNumber.replace(/^0/, "62");
              const namaSupplier = selectedSupplier.name || "Supplier";
              const namaBarang = "Ayam DOC";
              const unit = "ekor";
              const rencanaPembelian = `${quantity} ${unit}`;
              const rawMessage = `Halo ${namaSupplier} 🙏🙏🙏

Kami dari *Anugerah Jaya Farm* ingin menanyakan harga berikut:

━━━━━━━━━━━━━━━
📦 *Nama Barang*: ${namaBarang}
📝 *Rencana Pembelian*: ${rencanaPembelian}
━━━━━━━━━━━━━━━

✅ Mohon konfirmasi harga, terima kasih.`;

              const message = encodeURIComponent(rawMessage);
              const waURL = `https://api.whatsapp.com/send/?phone=${waNumber}&text=${message}`;

              window.open(waURL, "_blank");
            }}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900"
          >
            <IoLogoWhatsapp size={20} />
            Tanya Harga
          </button>

          <div>
            <label className="block mb-1">Total Harga</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Masukkan total harga..."
              className="w-full border rounded px-4 py-2"
              value={formatThousand(price)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setPrice(raw);
              }}
            />
          </div>

          {/* Button */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-900 cursor-pointer text-sm sm:text-base"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputDraftPemesananDoc;
