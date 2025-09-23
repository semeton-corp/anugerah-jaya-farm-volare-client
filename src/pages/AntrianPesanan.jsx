import React from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { MdStore } from "react-icons/md";
import { TbEggCrackedFilled } from "react-icons/tb";
import { FiMaximize2 } from "react-icons/fi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { useState } from "react";
import {
  allocateStoreSaleQueue,
  createStoreSale,
  deleteStoreSaleQueue,
  getEggStoreItemSummary,
  getListStoreSale,
  getStores,
  getStoreSaleQueues,
} from "../services/stores";
import { useEffect } from "react";
import { updateStoreSale } from "../services/stores";
import { formatDateToDDMMYYYY } from "../utils/dateFormat";
import { IoLogoWhatsapp } from "react-icons/io";
import { getItemPrices, getItemPricesDiscount } from "../services/item";
import AlokasiAntrianModal from "./AlokasiAntrianModal";
import {
  getCurrentUserStorePlacement,
  getCurrentUserWarehousePlacement,
} from "../services/placement";
import { getCustomers } from "../services/costumer";
import DeleteModal from "../components/DeleteModal";
import {
  allocateWarehouseSaleQueue,
  getEggWarehouseItemSummary,
  getWarehouses,
  getWarehouseSaleQueues,
} from "../services/warehouses";

const AntrianPesanan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const detailPages = ["input-data-pesanan"];

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [dataAntrianPesanan, setDataAntrianPesanan] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [telurOkKg, setTelurOkKg] = useState(0);
  const [telurOkIkat, setTelurOkIkat] = useState(0);
  const [telurRetakKg, setTelurRetakKg] = useState(0);
  const [telurRetakIkat, setTelurRetakIkat] = useState(0);
  const [telurBonyokPlastik, setTelurBonyokPlastik] = useState(0);

  const [selectedItem, setSelectedItem] = useState("");
  const [itemName, setItemName] = useState("");

  const [placeOptions, setPlaceOptions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState([]);

  const [customers, setCustomers] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("Pelanggan Lama");
  const [selectedCustomerId, setSelectedCustomerId] = useState(0);

  const [quantity, setQuantity] = useState(0);
  const [units, setUnits] = useState(["Ikat", "Kg"]);
  const [unit, setUnit] = useState("Ikat");

  const [nominal, setNominal] = useState(0);
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const [transactionCount, setTransactionCount] = useState(0);

  const [itemPrices, setItemPrices] = useState([]);
  const [itemPrice, setItemPrice] = useState([]);
  const [itemTotalPrice, setItemTotalPrice] = useState([]);
  const [itemPriceDiscounts, setItemPriceDiscounts] = useState([]);
  const [itemPriceDiscount, setItemPriceDiscount] = useState([]);
  const [discount, setDiscount] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const [sendDate, setSendDate] = useState(today);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentStatus, setPaymentStatus] = useState("Belum Lunas");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentType, setPaymentType] = useState("Cicil");
  const [paymentProof, setPaymentProof] = useState("https://example.com");

  const [showAlokasiModal, setShowAlokasiModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeletedId, setSelectedDeletedId] = useState("");

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const fetchDataAntrianPesanan = async () => {
    try {
      let antrianResponse;
      if (selectedPlace.type == "store") {
        antrianResponse = await getStoreSaleQueues(selectedPlace.id);
      } else if (selectedPlace.type == "warehouse") {
        antrianResponse = await getWarehouseSaleQueues(selectedPlace.id);
      } else {
        alert("❌ Terjadi kesalahan saat memuat data!");
        return;
      }

      console.log("antrianResponse: ", antrianResponse);
      if (antrianResponse.status == 200) {
        setDataAntrianPesanan(antrianResponse.data.data);
      }
    } catch (error) {
      console.log("error: ", error);
      alert("Gagal memuat data antrian pesanan: ", error);
    }
  };

  const fetchAllPlaces = async () => {
    try {
      const storesResponse = await getStores();
      const warehousesResponse = await getWarehouses();

      if (storesResponse.status == 200 && warehousesResponse.status == 200) {
        const stores = storesResponse?.data?.data ?? [];
        const warehouses = warehousesResponse?.data?.data ?? [];

        const options = [
          ...stores.map((store) => ({
            id: store.id,
            name: store.name,
            type: "store",
          })),
          ...warehouses.map((wh) => ({
            id: wh.id,
            name: wh.name,
            type: "warehouse",
          })),
        ];

        setPlaceOptions(options);
        if (options.length > 0) {
          setSelectedPlace(options[0]);
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchAllWarehouses = async () => {
    try {
      const siteWarehousesResponse = await getWarehouses(selectedSite);
      if (siteWarehousesResponse.status == 200) {
        const warehouses = siteWarehousesResponse?.data?.data ?? [];
        const options = [
          ...warehouses.map((warehouse) => ({
            id: warehouse.id,
            name: warehouse.name,
            type: "warehouse",
          })),
        ];
        setPlaceOptions(options);
        setSelectedPlace(options[0]);
      }
    } catch (error) {
      alert("Gagal memuat data gudang: ", error);
      console.log("error: ", error);
    }
  };

  const fetchCurentStore = async () => {
    try {
      const placementResponse = await getCurrentUserStorePlacement();
      if (placementResponse.status == 200) {
        const store = placementResponse.data.data[0].store;
        const selectedStore = {
          id: store.id,
          name: store.name,
          type: "store",
        };
        setSelectedPlace(selectedStore);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchCurentWarehouse = async () => {
    try {
      const placementResponse = await getCurrentUserWarehousePlacement();
      if (placementResponse.status == 200) {
        console.log("placementResponse: ", placementResponse);
        const warehouse = placementResponse.data.data[0].warehouse;
        const selectedWarehouse = {
          id: warehouse.id,
          name: warehouse.name,
          type: "warehouse",
        };
        setSelectedPlace(selectedWarehouse);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const customerResponse = await getCustomers();
      if (customerResponse.status == 200) {
        setCustomers(customerResponse.data.data);
      }
    } catch (error) {
      alert("Gagal memuat data toko: ", error);
      console.log("error: ", error);
    }
  };

  const fetchItemPrices = async () => {
    try {
      const priceResponse = await getItemPrices();
      const discountResponse = await getItemPricesDiscount();
      if (priceResponse.status == 200 && discountResponse.status == 200) {
        setItemPrices(priceResponse.data.data);
        setItemPriceDiscounts(discountResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const setSelectedItemHandle = (item) => {
    setSelectedItem(item);
    setCustomerName(item.customer.name);
    setItemName(item.item.name);
    setQuantity(item.quantity);
    setUnit(item.saleUnit);
  };

  const getItemSummary = async () => {
    try {
      let summaryResponse;
      if (selectedPlace.type == "store") {
        summaryResponse = await getEggStoreItemSummary(selectedPlace.id);
      } else if (selectedPlace.type == "warehouse") {
        summaryResponse = await getEggWarehouseItemSummary(selectedPlace.id);
      } else {
        alert("❌ Terjadi kesalahan saat memuat data!");
        return;
      }
      console.log("summaryResponse: ", summaryResponse);
      if (summaryResponse.status == 200) {
        const eggSummaries = summaryResponse.data.data;
        const okKg =
          eggSummaries.find(
            (item) => item.name === "Telur OK" && item.unit === "Kg"
          )?.quantity ?? 0;
        const okIkat =
          eggSummaries.find(
            (item) => item.name === "Telur OK" && item.unit === "Ikat"
          )?.quantity ?? 0;
        const retakKg =
          eggSummaries.find(
            (item) => item.name === "Telur Retak" && item.unit === "Kg"
          )?.quantity ?? 0;
        const retakIkat =
          eggSummaries.find(
            (item) => item.name === "Telur Retak" && item.unit === "Ikat"
          )?.quantity ?? 0;
        const bonyokPlastik =
          eggSummaries.find(
            (item) => item.name === "Telur Bonyok" && item.unit === "Plastik"
          )?.quantity ?? 0;
        setTelurOkKg(okKg);
        setTelurOkIkat(okIkat);
        setTelurRetakKg(retakKg);
        setTelurRetakIkat(retakIkat);
        setTelurBonyokPlastik(bonyokPlastik);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const getPrice = () => {
    const priceItem = itemPrices.find(
      (price) =>
        price.item.name == selectedItem.item.name && price.saleUnit == unit
    );
    console.log("itemPrices: ", itemPrices);
    console.log("selectedItem: ", selectedItem);
    console.log("priceItem: ", priceItem);

    const applicableDiscounts = itemPriceDiscounts.filter(
      (discount) => transactionCount >= discount.minimumTransactionUser
    );

    const selectedDiscount = applicableDiscounts.length
      ? applicableDiscounts.reduce((prev, curr) =>
          curr.minimumTransactionUser > prev.minimumTransactionUser
            ? curr
            : prev
        )
      : 0;

    const price = priceItem?.price;
    const discountPercent = selectedDiscount.totalDiscount / 100;

    if (!price) {
      alert("❌ Harga barang yang dipilih belum ditentukan oleh pusat!");
    }

    const totalitemPrice = price * quantity;
    const totalDiscount = totalitemPrice * discountPercent;

    setDiscount(selectedDiscount.totalDiscount);
    setItemPrice(price);
    setItemTotalPrice(totalitemPrice);
    setItemPriceDiscount(totalDiscount);
    setTotal(totalitemPrice - totalDiscount);
  };

  const submitHandle = async () => {
    const totalInvoice =
      Number(itemTotalPrice || 0) - Number(itemPriceDiscount || 0);

    if (!selectedItem || !selectedItem.id) {
      alert("❌ Pilih item yang akan dialokasikan terlebih dahulu.");
      return;
    }

    const cleanedPayments = (paymentHistory || []).map((p) => {
      const paymentDate = p.paymentDate || p.date || "";

      const nominalNum = (() => {
        if (p.nominal == null) return 0;
        const cleaned = String(p.nominal).replace(/[^\d.-]/g, "");
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
      })();

      return {
        paymentDate: paymentDate,
        nominal: String(nominalNum),
        paymentProof: p.paymentProof || p.proof || "",
        paymentMethod: p.paymentMethod || p.method || "Tunai",
      };
    });

    const sumPayments = cleanedPayments.reduce(
      (acc, cur) => acc + Number(cur.nominal || 0),
      0
    );

    if (paymentType === "Penuh") {
      if (sumPayments === 0) {
        alert(
          "❌ Untuk pembayaran penuh, harus ada pembayaran yang melunasi tagihan."
        );
        return;
      }
      if (Number(sumPayments) !== Number(totalInvoice)) {
        alert(
          "❌ Untuk pembayaran penuh, total nominal pembayaran harus sama dengan total tagihan."
        );
        return;
      }
    }

    const payload = {
      itemId:
        selectedItem?.item?.id ?? selectedItem?.itemId ?? selectedItem?.id,
      saleUnit: unit,
      ...(selectedPlace.type == "store"
        ? { storeId: parseInt(selectedPlace.id) }
        : { warehouseId: parseInt(selectedPlace.id) }),
      quantity: parseInt(quantity),
      price: String(itemPrice),
      discount: discount,
      sendDate: formatDateToDDMMYYYY(sendDate),
      paymentType: paymentType,
      payments: cleanedPayments.length ? cleanedPayments : undefined,
      customerType: customerType,
      ...(customerType === "Pelanggan Baru"
        ? {
            customerName: customerName,
            customerPhoneNumber: phone?.toString() ?? "",
          }
        : {
            customerId: selectedItem?.customer?.id ?? selectedCustomerId,
          }),
    };

    try {
      let allocateResponse;
      if (selectedPlace.type == "store") {
        allocateResponse = await allocateStoreSaleQueue(
          payload,
          selectedItem.id
        );
      } else if (selectedPlace.type == "warehouse") {
        allocateResponse = await allocateWarehouseSaleQueue(
          payload,
          selectedItem.id
        );
      }

      if (allocateResponse.status == 200 || allocateResponse.status == 201) {
        const newPath = location.pathname.replace(
          "antrian-pesanan",
          "daftar-pesanan"
        );
        navigate(newPath);
      }
    } catch (error) {
      console.log("response error: ", error);
      const msg = error?.response?.data?.message ?? "";
      if (msg === "nominal is not equal to total price") {
        alert(
          "❌Jumlah pembayaran penuh harus memiliki nominal yang sama dengan tagihan total"
        );
      } else if (msg === "customer phone number must be in valid format 08") {
        alert("❌Masukkan format nomor telepon dengan 08XXXXXX");
      } else if (msg === "customer already exist") {
        alert("❌Pelanggan sudah terdaftar, gunakan nomor telepon lain");
      } else if (msg === "stock item is insuficcient") {
        alert(
          "❌Stok tidak mencukupi untuk pesanan ini, silahkan check pada bagian atas halaman ini"
        );
      } else {
        alert(
          "❌Gagal menyimpan data pesanan, periksa kembali data input anda"
        );
      }
    }
  };

  async function deleteDataHandle() {
    try {
      const response = await deleteStoreSaleQueue(selectedDeletedId);
      if (response.status === 204) {
        alert("✅ Data berhasil dihapus!");
        fetchDataAntrianPesanan();
      } else {
        alert("⚠️ Gagal menghapus data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal menghapus data ayam:", error);
      alert("❌ Terjadi kesalahan saat menghapus data.");
    } finally {
      setShowDeleteModal(false);
    }
  }

  useEffect(() => {
    fetchItemPrices();
    fetchCustomerData();
    if (userRole == "Owner") {
      fetchAllPlaces();
    } else if (userRole == "Kepala Kandang") {
      fetchAllWarehouses();
    } else if (userRole == "Pekerja Toko") {
      fetchCurentStore();
    } else {
      fetchCurentWarehouse();
    }
  }, []);

  useEffect(() => {
    if (selectedPlace.type) {
      fetchDataAntrianPesanan();
      getItemSummary();
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (location.state?.refetch) {
      fetchDataAntrianPesanan();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (quantity && selectedItem) {
      getPrice();
    }
  }, [selectedItem, transactionCount, quantity, unit]);

  useEffect(() => {
    setRemaining(itemTotalPrice - itemPriceDiscount - nominal);
  }, [total, nominal]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-4 py-3 gap-4 ">
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Antrian Pesanan</h1>
            <div className="flex gap-3 items-center">
              {(userRole == "Owner" || userRole == "Kepala Kandang") && (
                <div className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <MdStore size={18} />
                  <select
                    value={
                      selectedPlace
                        ? `${selectedPlace.type}-${selectedPlace.id}`
                        : ""
                    }
                    onChange={(e) => {
                      const [type, id] = e.target.value.split("-");
                      const selected = placeOptions.find(
                        (item) => item.type === type && String(item.id) === id
                      );
                      console.log("selectedPlace: ", selected);
                      setSelectedPlace(selected);
                    }}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
                  >
                    {placeOptions.map((place) => (
                      <option
                        key={`${place.type}-${place.id}`}
                        value={`${place.type}-${place.id}`}
                      >
                        {place.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* <div className="text-base flex gap-2">
                <p>{`Hari ini (${getTodayDateInBahasa()})`}</p>
              </div> */}
            </div>
          </div>

          <div className="flex md:grid-cols-2 gap-4 justify-between">
            <div className="p-4 w-full rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur OK</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdEgg size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center flex-wrap gap-4">
                <div className="flex flex-col items-center justify-center min-w-32 px-4  py-4 bg-green-200 rounded-md">
                  <p className="text-3xl font-bold text-center">
                    {parseInt(telurOkIkat)}
                  </p>
                  <p className="text-xl text-center">Ikat</p>
                </div>
                <div className="flex flex-col items-center justify-center min-w-32 px-4  py-4 bg-green-200 rounded-md">
                  <p className="text-3xl font-bold text-center">
                    {parseInt(telurOkKg)}
                  </p>
                  <p className="text-xl text-center">Kg</p>
                </div>
              </div>
            </div>

            <div className="p-4 w-full rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Retak</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <TbEggCrackedFilled size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center flex-wrap gap-4">
                <div className="flex flex-col items-center justify-center min-w-32 px-4 py-4 bg-green-200 rounded-md">
                  <p className="text-3xl font-bold text-center">
                    {parseInt(telurRetakIkat)}
                  </p>
                  <p className="text-xl text-center">Ikat</p>
                </div>
                <div className="flex flex-col items-center justify-center min-w-32 px-4  py-4 bg-green-200 rounded-md">
                  <p className="text-3xl font-bold text-center">
                    {parseInt(telurRetakKg)}
                  </p>
                  <p className="text-xl text-center">Kg</p>
                </div>
              </div>
            </div>
            <div className="p-4 w-full rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Bonyok</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <TbEggCrackedFilled size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center flex-wrap gap-4">
                <div className="flex flex-col items-center justify-center min-w-32 px-4 py-4 bg-green-200 rounded-md">
                  <p className="text-3xl font-bold text-center">
                    {parseInt(telurBonyokPlastik)}
                  </p>
                  <p className="text-xl text-center">Plastik</p>
                </div>
              </div>
            </div>
          </div>

          <div className=" flex gap-4 ">
            <div className=" w-full bg-white px-8 py-6 rounded-lg border border-black-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-700 text-white text-center">
                    <th className="py-2 px-4">Antrian</th>
                    <th className="py-2 px-4">Nama Barang</th>
                    <th className="py-2 px-4">Satuan</th>
                    <th className="py-2 px-4">Jumlah</th>
                    <th className="py-2 px-4">Customer</th>
                    <th className="py-2 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {dataAntrianPesanan?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">
                        <div className="flex justify-center">
                          <p>#</p>
                          <p>{index + 1}</p>
                        </div>
                      </td>
                      <td className="py-2 px-4">{item?.item?.name}</td>
                      <td className="py-2 px-4">{item?.saleUnit}</td>
                      <td className="py-2 px-4">{item?.quantity}</td>
                      <td className="py-2 px-4">{item?.customer?.name}</td>

                      <td className="py-2 px-4">
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => {
                              const localNumber = "081246087972"; // nanti bisa ganti ke item?.customer?.phone
                              const waNumber = localNumber.replace(/^0/, "62");

                              const namaCustomer = item?.customer?.name || "";
                              const namaBarang = item?.item?.name || "";
                              const satuan = item?.item?.unit || "";
                              const jumlah = item?.quantity || "";
                              const message = `Halo ${namaCustomer}, kami dari Anugerah Jaya Farm ingin mengonfirmasi pesanan Anda:%0A%0A🧺 Nama Barang: ${namaBarang}%0A📦 Jumlah: ${jumlah} ${satuan}%0A%0AApakah jadi untuk memesan?`;
                              const waURL = `https://wa.me/${waNumber}?text=${message}`;

                              window.open(waURL, "_blank");
                            }}
                            className="px-3 py-1 bg-green-700 rounded-[4px] text-white hover:bg-green-900 cursor-pointer"
                          >
                            <IoLogoWhatsapp />
                          </button>
                          <button
                            onClick={() => {
                              console.log("item: ", item);
                              setSelectedItemHandle(item);
                              setShowAlokasiModal(true);
                            }}
                            className="px-3 py-1 bg-green-700 rounded-[4px] text-white hover:bg-green-900 cursor-pointer"
                          >
                            Alokasikan
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setSelectedDeletedId(item?.id);
                            }}
                            className="px-3 py-1 bg-kritis-box-surface-color rounded-[4px] text-white hover:bg-kritis-text-color cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {showAlokasiModal && (
            <AlokasiAntrianModal
              customerName={customerName}
              itemName={itemName}
              quantity={quantity}
              setQuantity={setQuantity}
              units={units}
              unit={unit}
              setUnit={setUnit}
              setShowAlokasiModal={setShowAlokasiModal}
              paymentHistory={paymentHistory}
              setPaymentHistory={setPaymentHistory}
              paymentDate={paymentDate}
              setPaymentDate={setPaymentDate}
              paymentStatus={paymentStatus}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              nominal={nominal}
              setNominal={setNominal}
              remaining={remaining}
              itemTotalPrice={itemTotalPrice}
              itemPriceDiscount={itemPriceDiscount}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              paymentProof={paymentProof}
              submitHandle={submitHandle}
              sendDate={sendDate}
              setSendDate={setSendDate}
            />
          )}
        </div>
      )}
      <DeleteModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={deleteDataHandle}
      />
    </>
  );
};

export default AntrianPesanan;
