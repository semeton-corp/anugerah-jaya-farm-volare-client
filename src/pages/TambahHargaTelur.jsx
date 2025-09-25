import React, { useEffect, useState } from "react";
import {
  createItemPrice,
  getItemPrices,
  getItemPricesById,
  getItems,
  updateItemPrice,
} from "../services/item";
import { useNavigate, useParams } from "react-router-dom";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";

const TambahHargaTelur = () => {
  const navigate = useNavigate();

  const [kategori, setKategori] = useState("");
  const [barang, setBarang] = useState("");
  const [barangName, setBarangName] = useState("");
  const [harga, setHarga] = useState("");
  const [saleUnit, setSaleUnit] = useState("Kg");

  const [items, setItems] = useState([]);

  const { id } = useParams();

  const handleSubmit = async () => {
    if (!kategori || !harga || !saleUnit || !barang) {
      alert("❌ Mohon isi semua field dengan benar!");
      return;
    }

    const payload = {
      itemId: parseInt(barang),
      category: kategori,
      price: harga,
      saleUnit: saleUnit,
    };

    if (id) {
      try {
        const updateResponse = await updateItemPrice(payload, id);
        console.log("updateResponse: ", updateResponse);
        if (updateResponse.status == 200) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        const errorMessage = error.response.data.message;
        alert("error :", errorMessage);
        console.log("error :", error);
      }
    } else {
      try {
        const tambahResponse = await createItemPrice(payload);
        if (tambahResponse.status == 201) {
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        const errorMessage = error.response.data.message;
        if (errorMessage == "Internal Server Error") {
          alert(
            `❌ Telur dengan satuan ini sudah memiliki harga! Silahkan edit harga! `
          );
        }
      }
      // console.log("Submitted:", payload);
    }
  };

  const fetchItemsData = async (storeId) => {
    try {
      const response = await getItems("Telur", {
        // storeId
      });
      console.log("response fetch item data", response);
      if (response.status == 200) {
        const itemData = response.data.data;
        const filterItem = itemData.filter(
          (item) => item?.name != "Telur Reject"
        );
        setItems(filterItem);
        setSelectedItem(filterItem[0].id);
      }
    } catch (error) {}
  };

  const fetchDetailData = async () => {
    try {
      const detailResponse = await getItemPricesById(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status == 200) {
        const data = detailResponse.data.data;
        setKategori(data.category);
        setBarang(data.item.id);
        setHarga(data.price);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetailData();
    }
    fetchItemsData();
  }, []);

  useEffect(() => {
    if (barangName == "Telur Retak" || barangName == "Telur Bonyok") {
      setSaleUnit("Plastik");
    } else {
      setSaleUnit("Kg");
    }
  }, [barangName]);

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <h1 className="text-2xl font-bold">Tambah Harga Telur</h1>

      <div className="bg-white border rounded shadow p-6 w-full ">
        <div className="mb-4">
          <label className="block font-medium mb-1">Nama Kategori Harga</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-100"
            placeholder="Tuliskan nama kategori harga"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Pilih Barang</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={barang}
            onChange={(e) => {
              const selectedItem = items.find(
                (item) => item?.id == e.target.value
              );
              // console.log("selectedItem: ", selectedItem);
              setBarang(e.target.value);
              setBarangName(selectedItem?.name);
            }}
          >
            <option value="">Pilih Barang</option>
            {items.map((item) => (
              <option value={item.id} key={item.id}>
                {`${item.name}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Pilih Satuan</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={saleUnit}
            onChange={(e) => setSaleUnit(e.target.value)}
          >
            <option value="">Pilih Satuan</option>
            {barangName === "Telur Bonyok" ? (
              <>
                <option value="Plastik">Plastik</option>
              </>
            ) : (
              <>
                <option value="Kg">Kg</option>
                <option value="Ikat">Ikat</option>
              </>
            )}
          </select>
        </div>

        {/* <div className="mb-4">
          <label className="block font-medium mb-1">Satuan</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={satuan}
            onChange={(e) => setSatuan(e.target.value)}
          >
            <option value="">Pilih satuan</option>
            {satuanOptions.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div> */}

        <div className="mb-4">
          <label className="block font-medium mb-1">Harga</label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full border rounded px-3 py-2 bg-gray-100"
            placeholder="Rp (Masukkan Harga Barang)"
            value={formatThousand(harga)}
            onChange={(e) => {
              const raw = onlyDigits(e.target.value);
              setHarga(raw);
            }}
          />
        </div>

        <div className="text-right">
          {/* <button
            onClick={() => {
              console.log("kategori: ", kategori);
              console.log("barang: ", barang);
              console.log("harga: ", harga);
              console.log("items: ", items);
              console.log({ barangName });
            }}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 cursor-pointer"
          >
            Check
          </button> */}

          <button
            onClick={handleSubmit}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahHargaTelur;
//
