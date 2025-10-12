import React from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { MdStore } from "react-icons/md";
import { TbEggCrackedFilled } from "react-icons/tb";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  createStoreSaleQueue,
  deleteStoreSale,
  deleteStoreSalePayment,
  getEggStoreItemSummary,
  getStores,
} from "../services/stores";
import {
  getTodayDateInBahasa,
  formatDateToDDMMYYYY,
  formatTanggalIndonesia,
  toISODate,
} from "../utils/dateFormat";
import { useState, useRef } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { createStoreSale } from "../services/stores";
import { getStoreSaleById } from "../services/stores";
import { convertToInputDateFormat } from "../utils/dateFormat";
import { createStoreSalePayment } from "../services/stores";
import { updateStoreSalePayment } from "../services/stores";
import { updateStoreSale } from "../services/stores";
import InformasiPembeli from "../components/InformasiPembeli";
import {
  getItemPrices,
  getItemPricesDiscount,
  getItems,
} from "../services/item";
import { getCustomers } from "../services/costumer";
import {
  getCurrentUserStorePlacement,
  getCurrentUserWarehousePlacement,
} from "../services/placement";
import ReceiptModal from "../components/Receipt";
import { GoAlertFill } from "react-icons/go";
import {
  createWarehouseSale,
  createWarehouseSalePayment,
  createWarehouseSaleQueue,
  deleteWarehouseSale,
  deleteWarehouseSalePayment,
  getEggWarehouseItemSummary,
  getWarehouses,
  getWarehouseSaleById,
  updateWarehouseSalePayment,
} from "../services/warehouses";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";
import { IoInformationCircleOutline, IoLogoWhatsapp } from "react-icons/io5";
import { uploadFile } from "../services/file";
import ImagePopUp from "../components/ImagePopUp";

const InputDataPesanan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const detailPages = ["input-data-pesanan"];
  const dateInputRef = useRef(null);
  const receiptRef = useRef();

  const { id } = useParams();
  const { state } = useLocation();

  const [isEditable, setEditable] = useState(true);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);

  const [placeOptions, setPlaceOptions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState([]);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const [customers, setCustomers] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("Pelanggan Lama");
  const [selectedCustomerId, setSelectedCustomerId] = useState(0);

  const [phone, setPhone] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("Ikat");

  const [price, setPrice] = useState(0);
  const [nominal, setNominal] = useState(0);
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const [payments, setPayments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const tablePayments = id ? paymentHistory : payments;

  const today = new Date().toISOString().split("T")[0];

  const [isSend, setIsSend] = useState(false);
  const [sendDate, setSendDate] = useState(today);
  const [deadlinePaymentDate, setDeadlinePaymentDate] = useState(today);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentType, setPaymentType] = useState("Penuh");
  const [paymentStatus, setPaymentStatus] = useState("Belum Lunas");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentProof, setPaymentProof] = useState();

  const [popupImage, setPopupImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isMoreThanDeadlinePaymentDate, setIsMoreThanDeadlinePaymentDate] =
    useState(false);

  const [telurOkKg, setTelurOkKg] = useState(0);
  const [telurOkIkat, setTelurOkIkat] = useState(0);
  const [telurRetakKg, setTelurRetakKg] = useState(0);
  const [telurRetakIkat, setTelurRetakIkat] = useState(0);
  const [telurBonyokPlastik, setTelurBonyokPlastik] = useState(0);

  const [itemPrices, setItemPrices] = useState([]);
  const [itemPrice, setItemPrice] = useState([]);
  const [itemTotalPrice, setItemTotalPrice] = useState([]);
  const [itemPriceDiscounts, setItemPriceDiscounts] = useState([]);
  const [itemPriceDiscount, setItemPriceDiscount] = useState([]);
  const [discount, setDiscount] = useState([]);

  const [transactionCount, setTransactionCount] = useState(0);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [paymentId, setPaymentId] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [selectedDeletePaymentId, setSelectedDeletePaymentId] = useState("");

  function getAvailableStock(name, unit) {
    if (name === "Telur OK" && unit === "Kg") return telurOkKg;
    if (name === "Telur OK" && unit === "Ikat") return telurOkIkat;
    if (name === "Telur Retak" && unit === "Kg") return telurRetakKg;
    if (name === "Telur Retak" && unit === "Ikat") return telurRetakIkat;
    if (name === "Telur Bonyok" && unit === "Plastik")
      return telurBonyokPlastik;
    return 0;
  }

  const fetchItemPrices = async () => {
    try {
      const priceResponse = await getItemPrices();
      const discountResponse = await getItemPricesDiscount();

      if (priceResponse.status == 200 && discountResponse.status == 200) {
        setItemPrices(priceResponse.data.data);
        setItemPriceDiscounts(discountResponse.data.data);
        if (id) {
          fetchEditSaleStoreData(id);
          setEditable(false);
        }
      }
    } catch (error) {
      console.log("error :", error);
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
        console.log("options: ", options);

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
        console.log("selectedStore: ", selectedStore);
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

  const fetchStorePlacement = async () => {
    try {
      const response = await getCurrentUserStorePlacement();
      if (response.status == 200) {
        setSelectedStore(response.data.data[0].store.id);
      }
    } catch (error) {
      alert("Gagal memuat data toko: ", error);
      console.log("error: ", error);
    }
  };

  const fetchItemsData = async () => {
    try {
      const response = await getItems("Telur", {
        // storeId
      });

      console.log("response: ", response);

      if (response.status == 200) {
        const filterData = response.data.data.filter(
          (item) => item.name != "Telur Reject"
        );
        setItems(filterData);

        setSelectedItem(filterData[0]);
      }
    } catch (error) {}
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

  const fetchEditSaleStoreData = async (id) => {
    try {
      let detailResponse;
      if (state?.selectedPlace?.type === "store") {
        detailResponse = await getStoreSaleById(id);
      } else if (state?.selectedPlace?.type === "warehouse") {
        detailResponse = await getWarehouseSaleById(id);
      } else {
        console.log("state kosong atau tipe tidak dikenal");
      }
      console.log("detailResponse: ", detailResponse);

      if (detailResponse.status == 200) {
        // setSelectedStore(detailResponse.data.data.store.id);
        setCustomerName(detailResponse.data.data.customer.name);
        setPhone(detailResponse.data.data.customer.phoneNumber);
        setSelectedItem(detailResponse.data.data.item);
        setQuantity(detailResponse.data.data.quantity);
        setUnit(detailResponse.data.data.saleUnit);
        setPrice(detailResponse.data.data.price);
        setSendDate(detailResponse.data.data.sentDate);
        setTotal(detailResponse.data.data.totalPrice);
        setPaymentHistory(detailResponse.data.data.payments);
        setRemaining(detailResponse.data.data.remainingPayment);
        setPaymentStatus(detailResponse.data.data.paymentStatus);
        setIsSend(detailResponse.data.data.isSend);
        setDeadlinePaymentDate(detailResponse.data.data.deadlinePaymentDate);
        setIsMoreThanDeadlinePaymentDate(
          detailResponse.data.data.isMoreThanDeadlinePaymentDate
        );
        const phoneNumber = detailResponse.data.data.customer.phoneNumber;
        const selectedCustomer = customers.find(
          (item) => item.phoneNumber == phoneNumber
        );
        setTransactionCount(selectedCustomer?.totalTransaction);
      }
    } catch (error) {}
  };

  const getPrice = () => {
    const priceItem = itemPrices.find(
      (price) => price.item.name == selectedItem.name && price.saleUnit == unit
    );

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

    if (!price && !id) {
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

  const submitHandle = async () => {
    const payload = {
      itemId: selectedItem.id,
      saleUnit: unit,
      ...(selectedPlace.type == "store"
        ? { storeId: parseInt(selectedPlace.id) }
        : { warehouseId: parseInt(selectedPlace.id) }),
      quantity,
      price: itemPrice.toString(),
      discount: parseInt(discount),
      sendDate: formatDateToDDMMYYYY(sendDate),
      paymentType,
      payments: payments.map((p) => ({
        ...p,
        nominal: p.nominal.toString(),
      })),
      customerType,
      ...(customerType === "Pelanggan Baru"
        ? { customerName, customerPhoneNumber: phone.toString() }
        : { customerId: selectedCustomerId }),
    };

    console.log("create payload is ready: ", payload);

    try {
      let submitResponse;
      if (selectedPlace.type == "store") {
        submitResponse = await createStoreSale(payload);
      } else if (selectedPlace.type == "warehouse") {
        submitResponse = await createWarehouseSale(payload);
      } else {
        alert("❌ Terjadi kesalahan saat membuat data antrian!");
        return;
      }

      if (submitResponse.status == 201) {
        const previousUrl =
          location.pathname.replace(/\/input-data-pesanan(\/.*)?$/, "") || "/";
        navigate(previousUrl, {
          state: { selectedPlace },
        });
      }
    } catch (error) {
      console.log("error: ", error);
      if (
        error.response.data.message == "nominal is not equal to total price"
      ) {
        alert(
          "❌Jumlah pembayaran penuh harus memiliki nominal yang sama dengan tagihan total dikarenakan pembayaran PENUH"
        );
      } else if (
        error.response.data.message ==
        "customer phone number must be in valid format 08"
      ) {
        alert("❌Masukkan format nomor telepon dengan 08XXXXXX");
      } else if (error.response.data.message == "customer already exist") {
        alert("❌Pelanggan sudah terdaftar, gunakan nomor telepon lain");
      } else if (error.response.data.message == "customer id is required") {
        alert("❌Silahkan pastikan anda memilih NOMOR PEMBELI dengan benar!");
      } else {
        alert(
          "❌Gagal menyimpan data pesanan, periksa kembali data input anda"
        );
      }
    }
  };

  const queueHandle = async () => {
    if (
      !customerType ||
      !selectedItem.id ||
      !selectedPlace ||
      !quantity ||
      !unit ||
      !sendDate
    ) {
      alert("❌Mohon isi field dengan benar!");
      return;
    }

    try {
      const payload = {
        customerType: customerType,
        ...(customerType === "Pelanggan Baru"
          ? {
              customerName: customerName,
              customerPhoneNumber: phone.toString(),
            }
          : {
              customerId: selectedCustomerId,
            }),
        itemId: selectedItem.id,
        ...(selectedPlace.type == "store"
          ? { storeId: parseInt(selectedPlace.id) }
          : { warehouseId: parseInt(selectedPlace.id) }),
        quantity: quantity,
        saleUnit: unit,
        sendDate: formatDateToDDMMYYYY(sendDate),
      };

      let queueResponse;

      if (selectedPlace.type == "store") {
        queueResponse = await createStoreSaleQueue(payload);
      } else if (selectedPlace.type == "warehouse") {
        queueResponse = await createWarehouseSaleQueue(payload);
      } else {
        alert("❌ Terjadi kesalahan saat membuat data antrian!");
        return;
      }

      if (queueResponse.status === 201) {
        const newPath = location.pathname.replace(
          "daftar-pesanan/input-data-pesanan",
          "antrian-pesanan"
        );
        navigate(newPath, { state: { selectedPlace } });
      }
    } catch (error) {
      if (error.response.data.message == "customer id is required") {
        alert("❌Masukkan nomor pelanggan terlebih dahulu!");
      } else {
        alert("❌Terjadi kesalahan dalam menambahkan data antrian!");
      }
      console.log("error :", error);
    }
  };

  const editSubmitHandle = async () => {
    const payload = {
      quantity: quantity,
      sendDate: formatDateToDDMMYYYY(toISODate(sendDate)),
      discount: discount,
      price: price,
      saleUnit: unit,
    };

    try {
      const response = await updateStoreSale(id, payload);
      if (response.status == 200) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("response: ", error);
      if (
        error.response.data.message == "nominal is not equal to total price"
      ) {
        alert(
          "Jumlah pembayaran penuh harus memiliki nominal yang sama dengan tagihan total"
        );
      } else {
        alert("Gagal menyimpan data pesanan");
      }
    }
  };

  const handleDelete = async () => {
    try {
      let deleteResponse;

      if (state?.selectedPlace.type == "store") {
        console.log("MASUK A:");
        deleteResponse = await deleteStoreSale(id);
      } else if (state?.selectedPlace.type == "warehouse") {
        console.log("MASUK B:");
        deleteResponse = await deleteWarehouseSale(id);
      } else {
        alert("❌ Terjadi kesalahan saat membuat data antrian!");
        return;
      }

      console.log("deleteResponse: ", deleteResponse);

      if (deleteResponse.status === 204) {
        setShowDeleteModal(false);
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
    setShowDeleteModal(false);
  };

  const handleDeletePayment = async () => {
    try {
      let deleteResponse;
      console.log("state?.selectedPlace?.type: ", state?.selectedPlace?.type);
      if (state?.selectedPlace?.type == "store") {
        deleteResponse = await deleteStoreSalePayment(
          id,
          selectedDeletePaymentId
        );
      } else if (state?.selectedPlace?.type == "warehouse") {
        deleteResponse = await deleteWarehouseSalePayment(
          id,
          selectedDeletePaymentId
        );
      } else {
        alert("❌ Terjadi kesalahan saat membuat data antrian!");
        return;
      }
      console.log("deleteResponse: ", deleteResponse);

      if (deleteResponse.status === 204) {
        setShowDeletePaymentModal(false);
        fetchEditSaleStoreData(id);
      }
    } catch (error) {
      console.log("error :", error);
    }
    setShowDeleteModal(false);
  };

  const createSalePaymentHandle = async (id) => {
    if (!nominal) {
      alert("❌Pastikan nominal pembayaran tidak kosong!");
      return;
    }

    const payload = {
      paymentDate: formatDateToDDMMYYYY(paymentDate),
      nominal: nominal.toString(),
      paymentProof: paymentProof,
      paymentMethod: paymentMethod,
    };

    try {
      let paymentResponse;
      if (state?.selectedPlace.type == "store") {
        paymentResponse = await createStoreSalePayment(payload, id);
      } else if (state?.selectedPlace.type == "warehouse") {
        paymentResponse = await createWarehouseSalePayment(payload, id);
      } else {
        alert("❌ Terjadi kesalahan saat membuat data antrian!");
        return;
      }

      console.log("paymentResponse: ", paymentResponse);

      if (paymentResponse.status == 201) {
        fetchEditSaleStoreData(id);
        setShowPaymentModal(false);
        setPaymentType("Cicil");
        setPaymentMethod("Tunai");
        setNominal(0);
        setPaymentDate(today);
        setShowPaymentModal(false);
      }
    } catch (error) {
      // console.log("error:", error.response.data.message);
      if (
        error?.response?.data?.message ==
        "total payment is greater than total price"
      ) {
        alert(
          "Pembayaran yang dilakukan melebihi total tagihan, periksa kembali nominal bayar! "
        );
      } else if (
        error?.response?.data?.message == "store sale is already sent"
      ) {
        alert(
          "Pembayaran yang dilakukan melebihi total tagihan, periksa kembali nominal bayar! "
        );
      } else {
        alert("Gagal menambahkan pembayaran ");
      }
      console.log("error: ", error);
    }
  };

  const updateStoreSalePaymentHandle = async () => {
    const payload = {
      paymentMethod: paymentMethod,
      paymentDate: formatDateToDDMMYYYY(paymentDate),
      nominal: nominal.toString(),
      paymentProof: paymentProof,
    };

    try {
      let updateResponse;
      if (state?.selectedPlace.type == "store") {
        updateResponse = await updateStoreSalePayment(id, paymentId, payload);
      } else if (state?.selectedPlace.type == "warehouse") {
        updateResponse = await updateWarehouseSalePayment(
          id,
          paymentId,
          payload
        );
      } else {
        alert("❌ Terjadi kesalahan saat membuat data antrian!");
        return;
      }

      console.log("updateResponse: ", updateResponse);

      if (updateResponse.status == 200) {
        fetchEditSaleStoreData(id);
        setPaymentType("Cicil");
        setPaymentMethod("Tunai");
        setNominal(0);
        setPaymentDate(today);
        setPaymentId(0);
        setShowEditModal(false);
      }
    } catch (error) {
      // console.log("error:", error.response.data.message);
      if (
        error.response.data.message ==
        "total payment is greater than total price"
      ) {
        alert(
          "Pembayaran yang dilakukan melebihi total tagihan, periksa kembali nominal bayar! "
        );
      } else {
        alert("Gagal menambahkan pembayaran ");
      }
    }
  };

  useEffect(() => {
    const subtotal = Math.max(
      Number(itemTotalPrice || 0) - Number(itemPriceDiscount || 0),
      0
    );

    const paid = (tablePayments || []).reduce((sum, payment) => {
      return sum + Number(payment.nominal || 0);
    }, 0);

    const remainingAmount = Math.max(subtotal - paid, 0);

    console.log({ subtotal, paid, remainingAmount, tablePayments });

    setRemaining(remainingAmount);
  }, [itemTotalPrice, itemPriceDiscount, tablePayments]);

  useEffect(() => {
    if (userRole == "Owner") {
      fetchAllPlaces();
    } else if (userRole == "Kepala Kandang") {
      fetchAllWarehouses();
    } else if (userRole == "Pekerja Toko") {
      fetchCurentStore();
    } else {
      fetchCurentWarehouse();
    }
    fetchCustomerData();
    fetchItemPrices();
    fetchItemsData(selectedStore);
  }, []);

  useEffect(() => {
    if (selectedPlace.type) {
      fetchItemsData();
      getItemSummary();
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (id) {
      fetchEditSaleStoreData(id);
    }
  }, [customers]);

  useEffect(() => {
    const totalitemPrice = itemPrice * quantity;
    const totalDiscount = totalitemPrice * (discount / 100);

    setItemTotalPrice(totalitemPrice);
    setItemPriceDiscount(totalDiscount);
    setTotal(totalitemPrice - totalDiscount);
  }, [itemPrice, discount]);

  useEffect(() => {
    if (!selectedItem) return;

    const name = selectedItem.name;
    const selectedUnit = unit;
    const available = getAvailableStock(name, selectedUnit);

    if (quantity > available) {
      setIsOutOfStock(true);
    } else {
      setIsOutOfStock(false);
    }
  }, [
    quantity,
    selectedItem,
    unit,
    selectedPlace,
    telurOkIkat,
    telurRetakIkat,
    telurBonyokPlastik,
  ]);

  useEffect(() => {
    if (quantity) {
      getPrice();
    }
  }, [selectedItem, transactionCount, quantity, unit]);

  return (
    <div className="flex flex-col px-4 py-3 gap-4 ">
      {/* header section */}
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">
          {id ? "Detail Pesanan" : "Input Data Pesanan"}
        </h1>
        <div className="text-base flex gap-2">
          <p>{`Hari ini (${getTodayDateInBahasa()})`}</p>
        </div>
      </div>

      {id ? (
        <></>
      ) : (
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
      )}

      <div className="p-4 border border-black-6 rounded-[4px]">
        <h1 className="text-lg font-bold">
          {id ? "Detail Data Pesanan" : "Input Data Pesanan"}
        </h1>

        <InformasiPembeli
          id={id}
          phone={phone}
          setPhone={setPhone}
          name={customerName}
          setName={setCustomerName}
          customerType={customerType}
          setCustomerType={setCustomerType}
          customers={customers}
          setTransactionCount={setTransactionCount}
          setSelectedCustomerId={setSelectedCustomerId}
        />

        <div className="flex justify-between gap-4">
          {userRole != "Pekerja Toko" && userRole != "Pekerja Gudang" && (
            <div className="w-full">
              <label className="block font-medium  mt-4">
                {id ? "Lokasi" : "Pilih Lokasi"}
              </label>
              {isEditable && !id && userRole != "Pekerja Toko" ? (
                <select
                  className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-4"
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
                    setSelectedPlace(selected);
                  }}
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
              ) : (
                <p className="text-lg font-bold">{selectedItem.name}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          <div className="w-full">
            <label className="block font-medium  mt-4">Nama Barang</label>
            {isEditable && !id ? (
              <select
                className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-4"
                value={selectedItem?.id}
                onChange={(e) => {
                  const selected = items.find(
                    (item) => item.id == e.target.value
                  );
                  setUnit(selected.unit);
                  setSelectedItem(selected);
                }}
              >
                {items.map((item) => (
                  <option value={item.id} key={item.id}>
                    {`${item.name}`}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-bold">{selectedItem.name}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mt-4">Jumlah Barang</label>
            {isEditable ? (
              <input
                className="w-full border bg-black-4 cursor-text rounded p-2 mb-4"
                type="number"
                placeholder="Masukkan jumlah barang"
                value={quantity === 0 ? "" : quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            ) : (
              <p className="text-lg font-bold">{quantity}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block font-medium mt-4">Satuan</label>
            {isEditable ? (
              <>
                {selectedItem?.name !== "Telur Bonyok" ? (
                  <select
                    className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-4"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="Ikat">Ikat</option>
                    <option value="Kg">Kg</option>
                  </select>
                ) : (
                  <p className="text-lg font-bold items-center mt-2">
                    {selectedItem?.unit}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-bold items-center mt-2">{unit}</p>
              </>
            )}
          </div>
        </div>

        {isOutOfStock && !id && (
          <p className="text-red-600">
            *Jumlah barang yang anda masukkan tidak mencukupi, maka pesanan akan
            masuk antrian
          </p>
        )}

        {!id && (
          <div>
            <button
              onClick={() => {
                const localNumber = "081246087972";
                const waNumber = localNumber.replace(/^0/, "62");
                const namaPelanggan = customerName;
                const namaBarang = selectedItem.name;
                console.log("selectedItem: ", selectedItem);
                const unit = selectedItem.unit;
                const rencanaPembelian = `${quantity} ${unit}`;
                const hargaPerUnit = itemPrice;
                const jumlahTransaksiTotal = transactionCount;
                const diskon = `${discount}%`;
                const hargaSemuaBarang = itemTotalPrice;
                const potonganHarga = itemPriceDiscount;
                const totalHarga = itemTotalPrice - itemPriceDiscount;

                const rawMessage = `Halo ${namaPelanggan} 🙏🙏🙏
Kami dari *Anugerah Jaya Farm* ingin mengkonfirmasi harga barang *PER ${unit.toUpperCase()}* berikut:

━━━━━━━━━━━━━━━
📦 *Nama Barang*: ${namaBarang}
━━━━━━━━━━━━━━━
💵 *Harga Per ${unit}*: Rp ${formatThousand(hargaPerUnit)}
🎁 *Rencana Pembelian*: ${rencanaPembelian}
📝 *Jumlah Transaksi Total Anda*: ${jumlahTransaksiTotal} Kali Belanja
🎀 *Persentase potongan harga berdasar jumlah Transaksi*: ${diskon} 
━━━━━━━━━━━━━━━
*Harga Semua Barang*: Rp ${formatThousand(hargaSemuaBarang)}
*Potongan Harga*: - Rp ${formatThousand(potonganHarga)}
*Total Harga Akhir*: Rp ${formatThousand(totalHarga)}

✅ Mohon konfirmasi, terima kasih.`;

                const message = encodeURIComponent(rawMessage);
                const waURL = `https://api.whatsapp.com/send/?phone=${waNumber}&text=${message}`;

                window.open(waURL, "_blank");
              }}
              disabled={
                !customerName || !selectedItem || !quantity || isOutOfStock
              }
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                !customerName || !selectedItem || !quantity || isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-800 text-white"
              }`}
            >
              <IoLogoWhatsapp size={20} />
              Tawarkan Harga
            </button>
          </div>
        )}

        <div>
          <label
            className={`block font-medium mt-4 ${
              isOutOfStock && !id ? " text-gray-400/40" : "text-black"
            }`}
          >
            {`Harga per ${unit}`}
          </label>
          {id ? (
            <p className="text-lg font-bold">Rp {formatThousand(itemPrice)}</p>
          ) : (
            <input
              disabled={isOutOfStock}
              className={`w-full border bg-black-4  rounded p-2 mb-4 ${
                isOutOfStock
                  ? "bg-gray-400/10 cursor-not-allowed text-gray-400/20"
                  : ""
              }`}
              type="text"
              inputMode="numeric"
              value={formatThousand(itemPrice)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setItemPrice(raw);
              }}
            />
          )}
        </div>

        <div>
          <label
            className={`block font-medium mt-4 flex items-center gap-1 ${
              isOutOfStock && !id ? "text-gray-400/40" : "text-black"
            }`}
          >
            <div className="relative group">
              <IoInformationCircleOutline
                size={24}
                className="text-gray-500 cursor-pointer"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-md rounded-md px-2 py-1 w-56 shadow-md z-10">
                Persentase diskon dihitung berdasarkan total pembelian pelanggan
                dari toko ini.
              </div>
            </div>
            {`Diskon (%)`}
          </label>
          {id ? (
            <p className="text-lg font-bold">{discount}%</p>
          ) : (
            <input
              disabled={isOutOfStock}
              className={`w-full border bg-black-4  rounded p-2 mb-4 ${
                isOutOfStock
                  ? "bg-gray-400/10 cursor-not-allowed text-gray-400/20"
                  : ""
              }`}
              type="text"
              inputMode="numeric"
              value={discount}
              onChange={(e) => {
                setDiscount(e.target.value);
              }}
            />
          )}
        </div>

        <div className="flex justify-between gap-4">
          <div className="w-full">
            <label
              className={`block font-medium mt-4 ${
                isOutOfStock && !id ? " text-gray-400/40" : "text-black"
              }`}
            >
              Tanggal Kirim
            </label>
            {isEditable ? (
              <input
                disabled={isOutOfStock}
                ref={dateInputRef}
                className={`w-full border bg-black-4  rounded p-2 mb-4 ${
                  isOutOfStock
                    ? "bg-gray-400/10 cursor-not-allowed text-gray-400/20"
                    : "cursor-pointer"
                }`}
                type="date"
                value={sendDate}
                onClick={() => {
                  if (dateInputRef.current?.showPicker) {
                    dateInputRef.current.showPicker();
                  }
                }}
                onChange={(e) => setSendDate(e.target.value)}
              />
            ) : (
              <p className="text-lg font-bold">{sendDate}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <div className="p-4 max-w-4xl">
            <div className="grid grid-cols-2 mb-2">
              <span
                className={`text-lg ${
                  isOutOfStock && !id ? " text-gray-400/30" : "text-black"
                }`}
              >
                Harga Barang :
              </span>
              <span
                className={`font-bold text-lg text-right ${
                  isOutOfStock && !id ? " text-gray-400/30" : "text-black"
                }`}
              >
                Rp{" "}
                {isOutOfStock && !id
                  ? "0"
                  : itemTotalPrice.toLocaleString("id-ID") ?? "0"}
              </span>
            </div>

            <div className="grid grid-cols-2 mb-4">
              <span
                className={`text-lg ${
                  isOutOfStock && !id ? " text-gray-400/30" : "text-black"
                }`}
              >
                Potongan Harga :
              </span>
              <span
                className={`font-bold text-lg text-right ${
                  isOutOfStock && !id ? " text-gray-400/30" : "text-black"
                }`}
              >
                Rp -
                {isOutOfStock && !id
                  ? "0"
                  : itemPriceDiscount.toLocaleString("id-ID")}
              </span>
            </div>
            <hr className="my-2 " />
            <div className="grid grid-cols-2 mt-4">
              <span
                className={`text-lg ${
                  isOutOfStock && !id ? " text-gray-400/30" : "text-black"
                }`}
              >
                Total :
              </span>
              <span
                className={`font-bold text-lg text-right ${
                  isOutOfStock && !id ? " text-gray-400/30" : "text-black"
                }`}
              >
                Rp{" "}
                {isOutOfStock && !id
                  ? "0"
                  : (itemTotalPrice - itemPriceDiscount).toLocaleString(
                      "id-ID"
                    )}
              </span>
            </div>
          </div>
        </div>

        {!isSend && id && (
          <div className="flex gap-6 justify-end mt-4">
            <div
              onClick={() => {
                setEditable(!isEditable);
                setSendDate(toISODate(sendDate));
              }}
              className="px-5 py-3 bg-green-700 rounded-[4px] hover:bg-green-900 cursor-pointer text-white"
            >
              Edit data pesanan
            </div>
            <div
              onClick={() => {
                setShowDeleteModal(true);
              }}
              className="px-5 py-3 bg-kritis-box-surface-color rounded-[4px] hover:bg-kritis-text-color cursor-pointer text-white"
            >
              Hapus
            </div>
          </div>
        )}
      </div>

      {/* Status Pembayaran */}
      <div className="p-4 border border-black-6 rounded-[4px]">
        <div className="flex justify-between">
          <h1
            className={`text-lg font-bold ${
              isOutOfStock && !id ? " text-gray-400/30" : "text-black"
            }`}
          >
            Pembayaran
          </h1>

          <div
            className={`px-5 py-3  rounded-[4px]  ${
              isOutOfStock && !id
                ? " bg-orange-400/30 cursor-not-allowed"
                : "bg-orange-400 hover:bg-orange-600 cursor-pointer"
            } `}
            onClick={() => {
              if (!isOutOfStock) {
                if (paymentStatus == "Lunas") {
                  alert("Pesanan ini sudah Lunas!");
                } else {
                  setShowPaymentModal(true);
                }
              } else if (isOutOfStock && id) {
                setShowPaymentModal(true);
              }
            }}
          >
            Pilih Pembayaran
          </div>
        </div>

        {!id && (
          <>
            <label
              className={`block font-medium mt-4 ${
                isOutOfStock && !id ? " text-gray-400/40" : "text-black"
              }`}
            >
              Tipe Pembayaran
            </label>
            <select
              disabled={isOutOfStock}
              className={`w-full border bg-black-4  rounded p-2 mb-4 ${
                isOutOfStock
                  ? "bg-gray-400/10 cursor-not-allowed text-gray-400/20"
                  : "cursor-pointer"
              }`}
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              title="Tipe Pembayaran"
            >
              <option value="Penuh">Penuh</option>
              <option value="Cicil">Cicil</option>
            </select>
          </>
        )}

        {/* {paymentType == "Cicil" && (
          <>
            <label
              className={`block font-medium  ${
                isOutOfStock && !id ? " text-gray-400/40" : "text-black"
              }`}
            >
              Tenggat Pembayaran
            </label>
            {isEditable ? (
              <input
                disabled={isOutOfStock}
                ref={dateInputRef}
                className={`w-full border bg-black-4 rounded p-2 mb-4 ${
                  isOutOfStock
                    ? "bg-gray-400/10 cursor-not-allowed text-gray-400/20"
                    : "cursor-pointer"
                }`}
                type="date"
                value={sendDate}
                onClick={() => {
                  if (!isOutOfStock && dateInputRef.current?.showPicker) {
                    dateInputRef.current.showPicker();
                  }
                }}
                onChange={(e) => setSendDate(e.target.value)}
              />
            ) : (
              <div className="flex gap-2 items-center">
                <span
                  className={`text-xl font-semibold ${
                    paymentStatus == "Lunas"
                      ? "text-gray-200"
                      : isMoreThanDeadlinePaymentDate
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {paymentStatus == "Lunas"
                    ? "(Lunas)"
                    : deadlinePaymentDate || "-"}
                </span>
                {isMoreThanDeadlinePaymentDate && (
                  <span title="Terlambat" className="text-red-500">
                    <GoAlertFill size={24} />
                  </span>
                )}
              </div>
            )}
          </>
        )} */}
        {id && (
          <>
            <div>Tenggat Pembayaran</div>
            <div className="flex gap-2 items-center">
              <span
                className={`text-xl font-semibold ${
                  paymentStatus == "Lunas"
                    ? "text-gray-200"
                    : isMoreThanDeadlinePaymentDate
                    ? "text-red-600"
                    : ""
                }`}
              >
                {paymentStatus == "Lunas"
                  ? "(Lunas)"
                  : deadlinePaymentDate || "-"}
              </span>
              {isMoreThanDeadlinePaymentDate && (
                <span title="Terlambat" className="text-red-500">
                  <GoAlertFill size={24} />
                </span>
              )}
            </div>
          </>
        )}

        {/* table */}
        <div className="mt-4">
          <table className="w-full">
            <thead
              className={`w-full  ${
                isOutOfStock && !id
                  ? " bg-green-700/30 text-white"
                  : "bg-green-700 text-white"
              }`}
            >
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Metode Pembayaran</th>
                <th className="px-4 py-2">Nominal Pembayaran</th>
                <th className="px-4 py-2">Sisa Cicilan</th>
                <th className="px-4 py-2">Bukti</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="border-b text-center">
              {tablePayments && tablePayments.length > 0 ? (
                tablePayments.map((payment, index) => {
                  const date = payment.date || payment.paymentDate;

                  const totalPaidSoFar = tablePayments
                    .slice(0, index + 1)
                    .reduce((sum, p) => sum + Number(p.nominal || 0), 0);

                  const remaining =
                    itemTotalPrice - itemPriceDiscount - totalPaidSoFar;

                  return (
                    <tr key={payment.id || index}>
                      <td className="px-4 py-2">{date}</td>
                      <td className="px-4 py-2">{payment.paymentMethod}</td>
                      <td className="px-4 py-2">
                        Rp {Intl.NumberFormat("id-ID").format(payment.nominal)}
                      </td>
                      <td className="px-4 py-2">
                        Rp{" "}
                        {Intl.NumberFormat("id-ID").format(
                          remaining < 0 ? 0 : remaining
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {payment.paymentProof ? (
                          <td
                            className="px-3 py-2 underline text-green-700 hover:text-green-900 cursor-pointer"
                            onClick={() => setPopupImage(payment.paymentProof)}
                          >
                            {payment.paymentProof ? "Bukti Pembayaran" : "-"}
                          </td>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-2 flex gap-3 justify-center">
                        <BiSolidEditAlt
                          onClick={() => {
                            console.log("payment: ", payment);
                            setPaymentMethod(payment.paymentMethod);
                            setNominal(payment.nominal);
                            setPaymentDate(toISODate(payment.date));
                            setPaymentId(payment.id);
                            if (id) {
                              setShowEditModal(true);
                            } else {
                              setEditingIndex(index);
                              setShowEditModal(true);
                            }
                          }}
                          size={24}
                          className="cursor-pointer text-black hover:text-gray-300 transition-colors duration-200"
                        />
                        <MdDelete
                          onClick={() => {
                            if (id) {
                              setShowDeletePaymentModal(true);
                              setSelectedDeletePaymentId(payment.id);
                            } else {
                              setPayments((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }
                          }}
                          size={24}
                          className="cursor-pointer text-black hover:text-gray-300 transition-colors duration-200"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className={`text-center py-4 italic ${
                      isOutOfStock ? "text-gray-500/20" : "text-gray-500"
                    }`}
                  >
                    Belum ada data pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* status pembayaran */}
        <div className="flex mt-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1
              className={`text-lg font-bold ${
                isOutOfStock && !id ? "text-gray-400/50" : "text-black"
              }`}
            >
              Status Pembayaran:{" "}
            </h1>
            <div
              className={`px-5 py-3 text-xl rounded-[4px] ${
                paymentStatus === "Belum Lunas"
                  ? "bg-orange-200 text-kritis-text-color"
                  : "bg-aman-box-surface-color text-aman-text-color"
              }
              ${
                isOutOfStock && !id
                  ? "bg-orange-200/50 text-kritis-text-color/30"
                  : ""
              }
              `}
            >
              {paymentStatus}
            </div>
          </div>

          <div>
            <div
              className={`text-xl font-semibold ${
                isOutOfStock && !id ? "text-gray-500/20" : "text-black"
              }`}
            >
              Sisa Cicilan
            </div>
            <div
              className={`font-semibold text-3xl flex ${
                isOutOfStock && !id ? "text-gray-500/20" : "text-black"
              }`}
            >
              <p className="me-2">Rp</p>
              <p>
                {isOutOfStock && !id
                  ? "0"
                  : Intl.NumberFormat("id-ID").format(remaining || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* simpan button */}
      <div className="flex justify-end mb-8">
        <div className="flex gap-4">
          {id && (
            <div
              onClick={() => {
                setShowReceiptModal(true);
              }}
              className="px-5 py-3 bg-green-200 rounded-[4px] hover:bg-green-400 cursor-pointer text-green-900"
            >
              Cetak Struk
            </div>
          )}

          <div
            onClick={() => {
              if (isOutOfStock && !id) {
                queueHandle();
              } else if (id) {
                editSubmitHandle();
              } else {
                submitHandle();
              }
            }}
            className="px-5 py-3 bg-green-700 rounded-[4px] hover:bg-green-900 cursor-pointer text-white"
          >
            {isOutOfStock && !id ? "Masukkan ke antrian" : "Simpan"}
          </div>
        </div>
      </div>

      {/* simpan button */}
      {/* <div className="flex justify-end mb-8">
        <div
          onClick={() => {
            // const payments = {
            //   paymentDate: formatDateToDDMMYYYY(paymentDate),
            //   nominal: nominal.toString(),
            //   paymentProof: paymentProof,
            //   paymentMethod: paymentMethod,
            // };
            // const payload = {
            //   itemId: selectedItem.id,
            //   saleUnit: unit,
            //   storeId: parseInt(selectedStore),
            //   quantity: quantity,
            //   price: itemTotalPrice.toString(),
            //   discount: discount,
            //   sendDate: formatDateToDDMMYYYY(sendDate),
            //   paymentType: paymentType,
            //   payments: payments,
            //   customerType: customerType,
            // };
            // console.log("===== Form Data =====");
            // console.log("payload: ", payload);
            // console.log("customers: ", customers);
            // console.log("itemPrices: ", itemPrices);
            // console.log("itemPriceDiscounts: ", itemPriceDiscounts);
            // console.log("id: ", id);
            // console.log("paymentHistory: ", paymentHistory);
            // console.log("=====================");
            console.log("selectedStore: ", selectedStore);
          }}
          className="px-5 py-3 bg-green-700 rounded-[4px] hover:bg-green-900 cursor-pointer text-white"
        >
          CHECK
        </div>
      </div> */}

      {showPaymentModal && (
        <div className="fixed w-full inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full bg-white mx-40 p-6 rounded-lg shadow-xl relative">
            <h3 className="text-xl font-bold mb-4">
              {id ? "Tambah Pembayaran" : "Pembayaran"}
            </h3>

            <label className="block mb-2 font-medium">Metode Pembayaran</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
              }}
            >
              <option className="text-black-6" value="" disabled hidden>
                Pilih Metode Pembayaran
              </option>
              <option value="Tunai">Tunai</option>
              <option value="Non Tunai">Non Tunai</option>
            </select>

            <label className="block mb-2 font-medium">Nominal Bayar</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border p-2 rounded mb-4"
              placeholder="Masukkan nominal pembayaran"
              value={nominal == 0 ? "" : formatThousand(nominal)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setNominal(raw);
              }}
            />

            <label className="block font-medium ">Tanggal Bayar</label>
            <input
              ref={dateInputRef}
              className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-4"
              type="date"
              value={paymentDate}
              onClick={() => {
                if (dateInputRef.current?.showPicker) {
                  dateInputRef.current.showPicker();
                }
              }}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <label className="block mb-2 font-medium">Bukti Pembayaran</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded p-2 mb-4"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploading(true);

                try {
                  const fileUrl = await uploadFile(file);
                  setPaymentProof(fileUrl);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsUploading(false);
                }
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingIndex(null);
                  setPaymentType("Cicil");
                  setPaymentMethod("Tunai");
                  setNominal(0);
                  setPaymentDate(today);
                  setShowPaymentModal(false);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-500 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!paymentProof) {
                    alert("❌Silahkan upload bukti pembayaran");
                    return;
                  }

                  if (nominal <= 0) {
                    alert("❌Nominal harus lebih dari 0");
                    return;
                  }

                  if (id) {
                    createSalePaymentHandle(id);
                    return;
                  }

                  const newPayment = {
                    paymentDate: formatDateToDDMMYYYY(paymentDate),
                    nominal: Number(nominal ?? nominal ?? 0),
                    paymentMethod,
                    paymentProof,
                  };

                  setPayments((prev) => {
                    if (editingIndex === null) {
                      return [...prev, newPayment];
                    } else {
                      const copy = [...prev];
                      copy[editingIndex] = newPayment;
                      return copy;
                    }
                  });

                  setEditingIndex(null);
                  setPaymentMethod("Tunai");
                  setPaymentProof(null);
                  setNominal(0);
                  setPaymentDate(today);
                  setShowPaymentModal(false);
                }}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900 cursor-pointer"
                }`}
              >
                {isUploading ? "Mengunggah..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed w-full inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full bg-white mx-40 p-6 rounded-lg shadow-xl relative">
            <h3 className="text-xl font-bold mb-4">
              {id ? "Tambah Pembayaran" : "Pembayaran"}
            </h3>

            <label className="block mb-2 font-medium">Metode Pembayaran</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
              }}
            >
              <option className="text-black-6" value="" disabled hidden>
                Pilih Metode Pembayaran
              </option>
              <option value="Tunai">Tunai</option>
              <option value="Non Tunai">Non Tunai</option>
            </select>

            {/* Nominal Bayar */}
            <label className="block mb-2 font-medium">Nominal Bayar</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border p-2 rounded mb-4"
              placeholder="Masukkan nominal pembayaran"
              value={nominal == 0 ? "" : formatThousand(nominal)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value);
                setNominal(raw);
              }}
            />

            <label className="block font-medium ">Tanggal Bayar</label>
            <input
              ref={dateInputRef}
              className="w-full border bg-black-4 cursor-pointer rounded p-2 mb-4"
              type="date"
              value={paymentDate}
              onClick={() => {
                if (dateInputRef.current?.showPicker) {
                  dateInputRef.current.showPicker();
                }
              }}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <label className="block mb-2 font-medium">Bukti Pembayaran</label>
            <input type="file" className="w-full border p-2 rounded mb-4" />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (id) {
                    setShowEditModal(false);
                    setPaymentType("Cicil");
                    setPaymentMethod("Tunai");
                    setNominal(0);
                    setPaymentDate(today);
                  } else {
                    setPaymentType("Cicil");
                    setPaymentMethod("Tunai");
                    setNominal(0);
                    setPaymentDate(today);
                    setPaymentId(0);
                    setShowEditModal(false);
                  }
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-500 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (id) {
                    updateStoreSalePaymentHandle();
                  } else {
                    const newPayment = {
                      paymentDate: formatDateToDDMMYYYY(paymentDate),
                      nominal: Number(nominal ?? nominal ?? 0),
                      paymentMethod,
                      paymentProof,
                    };

                    setPayments((prev) => {
                      if (editingIndex === null) {
                        return [...prev, newPayment];
                      } else {
                        const copy = [...prev];
                        copy[editingIndex] = newPayment;
                        return copy;
                      }
                    });

                    setEditingIndex(null);
                    setPaymentMethod("Tunai");
                    setNominal(0);
                    setPaymentDate(today);
                    setShowEditModal(false);
                  }
                }}
                className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-center text-lg font-semibold mb-4">
              Apakah anda yakin untuk menghapus data penjualan ini?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Tidak
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-center text-lg font-semibold mb-4">
              Apakah anda yakin untuk menghapus data pembayaran ini?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeletePaymentModal(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Tidak
              </button>
              <button
                onClick={handleDeletePayment}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && (
        <ReceiptModal
          orderId={id}
          customerName={customerName}
          customerPhoneNumber={phone}
          itemName={selectedItem.name}
          quantity={quantity}
          unit={selectedItem.unit}
          itemPrice={itemPrice}
          itemTotalPrice={itemTotalPrice}
          itemPriceDiscount={itemPriceDiscount}
          paymentHistory={paymentHistory}
          remaining={remaining}
          onClose={() => setShowReceiptModal(false)}
          ref={receiptRef}
        />
      )}

      {popupImage && (
        <ImagePopUp imageUrl={popupImage} onClose={() => setPopupImage(null)} />
      )}
    </div>
  );
};

export default InputDataPesanan;
