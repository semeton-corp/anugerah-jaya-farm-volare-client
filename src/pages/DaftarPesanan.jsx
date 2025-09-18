import React, { useRef } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { MdStore } from "react-icons/md";
import { TbEggCrackedFilled } from "react-icons/tb";
import { FiMaximize2 } from "react-icons/fi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  convertToInputDateFormat,
  formatDate,
  getTodayDateInBahasa,
} from "../utils/dateFormat";
import { useState } from "react";
import { getListStoreSale, getStores, sendStoreSale } from "../services/stores";
import { useEffect } from "react";
import { FaMoneyBillWave } from "react-icons/fa6";
import {
  getListWarehouseSales,
  getWarehouses,
  getWarehouseSaleQueues,
  sendWarehouseSale,
} from "../services/warehouses";
import {
  getCurrentUserStorePlacement,
  getCurrentUserWarehousePlacement,
} from "../services/placement";
import { useSelector } from "react-redux";
import PageNotificationsCard from "../components/PageNotificationsCard";

const DaftarPesanan = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [dataAntrianPesanan, setDataAntrianPesanan] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedSendId, setSelectedSendId] = useState("");

  const notificationContexs =
    userRole === "Owner"
      ? ["Penjualan Toko", "Penjualan Gudang"]
      : userRole == "Pekerja Toko"
      ? ["Penjualan Toko"]
      : ["Penjualan Gudang"];
  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts.some((ctx) => notificationContexs.includes(ctx))
  );
  console.log("pageNotifications: ", pageNotifications);

  const [page, setPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [placeOptions, setPlaceOptions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState([]);

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const detailPages = ["input-data-pesanan"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const editDataPesananHandle = (item) => {
    const currentPath = location.pathname;
    const inputPath = `${currentPath}/input-data-pesanan/${item.id}`;

    navigate(inputPath, {
      state: { selectedPlace },
    });
  };
  const sendSaleHandle = async () => {
    try {
      let sendResponse;
      if (selectedPlace.type == "store") {
        sendResponse = await sendStoreSale(selectedSendId);
      } else if (selectedPlace.type == "warehouse") {
        sendResponse = await sendWarehouseSale(selectedSendId);
      }

      if (sendResponse.status == 200) {
        alert("✅ Pesanan berhasil dikirim!");
        setShowSendModal(false);
        fetchDataAntrianPesanan();
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

  const fetchDataAntrianPesanan = async () => {
    try {
      const date = convertToInputDateFormat(selectedDate);
      let antrianResponse;
      if (selectedPlace.type == "store") {
        antrianResponse = await getListStoreSale(
          date,
          paymentStatus || undefined,
          page,
          selectedPlace.id
        );
      } else if (selectedPlace.type == "warehouse") {
        antrianResponse = await getListWarehouseSales(
          date,
          paymentStatus || undefined,
          page,
          selectedPlace.id
        );
      } else {
        alert("❌ Terjadi kesalahan saat memuat data!");
        return;
      }

      console.log("antrianResponse: ", antrianResponse);
      if (antrianResponse.status == 200) {
        if (selectedPlace.type == "store") {
          setDataAntrianPesanan(antrianResponse.data.data.storeSales);
        } else if (selectedPlace.type == "warehouse") {
          setDataAntrianPesanan(antrianResponse.data.data.warehouseSales);
        }
      }
    } catch (error) {
      console.log("error: ", error);
      alert("Gagal memuat data antrian pesanan: ", error);
    }
  };

  const inputDataPesananHandle = () => {
    const currentPath = location.pathname;
    const inputPath = currentPath + "/input-data-pesanan";

    navigate(inputPath);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

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
  }, []);

  useEffect(() => {
    if (selectedPlace.type) {
      fetchDataAntrianPesanan();
      if (location?.state?.refetch) {
        fetchDataAntrianPesanan();
        window.history.replaceState({}, document.title);
      }
    }
  }, [selectedPlace, location]);

  useEffect(() => {
    if (selectedPlace.type) {
      fetchDataAntrianPesanan();
    }
  }, [selectedDate, page, paymentStatus, selectedPlace]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-4 py-3 gap-4 ">
          {/* header section */}
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Daftar Pesanan</h1>
            <div className="text-base flex gap-2">
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
              <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                <FaMoneyBillWave size={18} />
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="ml-2 bg-transparent text-base font-medium outline-none"
                >
                  <option value="">Semua Status Pembayaran</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>
              <div
                className="flex items-center rounded-lg bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2"
                onClick={openDatePicker}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer gap-2"
                />
              </div>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto flex flex-col gap-3">
            {pageNotifications &&
              pageNotifications.map((item, index) => (
                <PageNotificationsCard
                  key={index}
                  description={item.description}
                />
              ))}
          </div>

          {/* detail penjualan */}
          <div className=" flex gap-4 ">
            <div className=" w-full bg-white px-8 py-6 rounded-lg border border-black-6">
              <div className="flex justify-end">
                <button
                  onClick={inputDataPesananHandle}
                  className="px-5 py-3 bg-orange-300 rounded-[4px] text-black hover:bg-orange-500 cursor-pointer font-medium mb-3"
                >
                  Pesan Barang
                </button>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-700 text-white text-center">
                    <th className="py-2 px-4">Tanggal Pesan</th>
                    <th className="py-2 px-4">Nama Barang</th>
                    <th className="py-2 px-4">Satuan</th>
                    <th className="py-2 px-4">Jumlah</th>
                    <th className="py-2 px-4">Pelanggan</th>
                    <th className="py-2 px-4">Tanggal Kirim</th>
                    <th className="py-2 px-4">Pembayaran</th>
                    <th className="py-2 px-4">Pengiriman</th>
                    <th className="py-2 px-4">Aksi</th>
                    <th className="py-2 px-4"></th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {dataAntrianPesanan?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{item.orderDate}</td>
                      <td className="py-2 px-4">{item.item.name}</td>
                      <td className="py-2 px-4">{item.item.unit}</td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      <td className="py-2 px-4">{item.customer.name}</td>
                      <td className="py-2 px-4">{item.sentDate}</td>
                      <td className="py-2 px-8">
                        <div
                          className={`px-3 py-1 rounded-[4px] ${
                            item.paymentStatus == "Lunas"
                              ? "bg-aman-box-surface-color text-aman-text-color"
                              : "bg-kritis-box-surface-color text-kritis-text-color"
                          }`}
                        >
                          {item.paymentStatus}
                        </div>
                      </td>

                      <td className="py-2 px-8">
                        <div
                          className={`px-3 py-1 rounded-[4px] ${
                            item.isSend
                              ? "bg-aman-box-surface-color text-aman-text-color"
                              : "bg-kritis-box-surface-color text-kritis-text-color"
                          }`}
                        >
                          {item.isSend ? "Terkirim" : "Belum Terkirim"}
                        </div>
                      </td>

                      <td className="py-2 px-4">
                        <div className="flex gap-4">
                          {!item.isSend && (
                            <button
                              onClick={() => {
                                setShowSendModal(true);
                                setSelectedSendId(item.id);
                              }}
                              className="px-3 py-1 bg-orange-300 rounded-[4px]  hover:bg-orange-500 cursor-pointer"
                            >
                              Kirim
                            </button>
                          )}

                          <button
                            onClick={() => {
                              editDataPesananHandle(item);
                            }}
                            className="px-3 py-1 bg-green-700 rounded-[4px] text-white hover:bg-green-900 cursor-pointer"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {showSendModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-center text-lg font-semibold mb-4">
                  Apakah anda yakin untuk mengirim pesanan ini?
                </h2>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded font-semibold cursor-pointer"
                  >
                    Tidak
                  </button>
                  <button
                    onClick={sendSaleHandle}
                    className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded font-semibold cursor-pointer"
                  >
                    Ya, Kirim
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DaftarPesanan;
