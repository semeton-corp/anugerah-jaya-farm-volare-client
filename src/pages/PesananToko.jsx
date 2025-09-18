import React, { useEffect, useRef } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { MdEgg, MdShoppingCart, MdStore } from "react-icons/md";
import { TbEggCrackedFilled } from "react-icons/tb";
import { FaWarehouse, FaTruck } from "react-icons/fa";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import { formatDate, formatDateToDDMMYYYY } from "../utils/dateFormat";
import { getCurrentUserWarehousePlacement } from "../services/placement";
import {
  getEggWarehouseItemSummary,
  getWarehousesByLocation,
} from "../services/warehouses";
import {
  getStoreRequestItems,
  getStores,
  updateStoreRequestItem,
  warehouseConfirmationStoreRequestItem,
} from "../services/stores";
import KonfirmasiPemenuhanPesananTokoTelurOk from "../components/KonfirmasiPemenuhanPesananTokoTelurOk ";
import KonfirmasiPemenuhanPesananTokoTelurRetak from "../components/KonfirmasiPemenuhanPesananTokoTelurRetak";
import { e } from "mathjs";
import { GoAlertFill } from "react-icons/go";

const getStatusStyle = (status) => {
  switch (status) {
    case "Sedang Dikirim":
      return "bg-orange-200 text-yellow-800";
    case "Menunggu":
      return "bg-kritis-box-surface-color text-kritis-text-color";
    case "Ditolak":
    case "Dibatalkan":
      return "bg-kritis-box-surface-color text-kritis-text-color";
    case "Sampai - Sesuai":
      return "bg-aman-box-surface-color text-aman-text-color";
    case "Sampai - Tidak Sesuai":
      return "bg-aman-box-surface-color text-aman-text-color";
    default:
      return "bg-gray-100 text-black";
  }
};

const getSecondAction = (status) => {
  switch (status) {
    case "Sedang Dikirim":
      return {
        label: "Barang Sampai",
        color: "bg-orange-300 hover:bg-orange-500 cursor-pointer",
      };
    case "Menunggu":
      return {
        label: "Batal Pesan",
        color:
          "bg-kritis-box-surface-color text-kritis-text-color hover:bg-red-500 cursor-pointer",
      };
    case "Sampai - Sesuai":
      return {
        label: "Sortir Telur",
        color: "bg-orange-300 hover:bg-orange-500 cursor-pointer",
      };
    default:
      return null;
  }
};

const PesananToko = () => {
  const userRole = localStorage.getItem("role");
  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState();
  const [warehousePlacement, setWarehousePlacement] = useState([]);
  const [requestData, setRequestData] = useState([]);

  const [telurOkKg, setTelurOkKg] = useState(0);
  const [telurOkIkat, setTelurOkIkat] = useState(0);
  const [telurRetakKg, setTelurRetakKg] = useState(0);
  const [telurRetakIkat, setTelurRetakIkat] = useState(0);

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);

  const [showConfirmationTelurOk, setShowConfirmationTelurOk] = useState(false);
  const [showConfirmationTelurRetak, setShowConfirmationTelurRetak] =
    useState(false);
  const [stores, setStores] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);

  const [showBatalModal, setShowBatalModal] = useState(false);
  const [selectedItemToCancel, setSelectedItemToCancel] = useState(null);

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;

    setSelectedDate(date);
  };

  const fetchWarehouseData = async () => {
    try {
      const warehouseResponse = await getWarehousesByLocation(selectedSite);
      // console.log("warehouseResponse: ", warehouseResponse);
      if (warehouseResponse.status == 200) {
        setWarehouses(warehouseResponse.data.data);
        setSelectedWarehouse(warehouseResponse.data.data[0].id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchRequestItemsData = async () => {
    try {
      const date = formatDateToDDMMYYYY(selectedDate);
      const requestReponse = await getStoreRequestItems(
        date,
        page,
        selectedWarehouse,
        undefined
      );
      console.log("requestReponse: ", requestReponse);
      if (requestReponse.status == 200) {
        setRequestData(requestReponse.data.data.storeRequestItems);
        if (requestReponse.data.data.totalPage) {
          setTotalPages(requestReponse.data.data.totalPage);
        }
        if (requestReponse.data.data.totalData) {
          setTotalData(requestReponse.data.data.totalData);
        }
      }
      // console.log("requestReponse: ", requestReponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const confirmTelurOkHandle = async (payload) => {
    try {
      const confirmResponse = await warehouseConfirmationStoreRequestItem(
        payload,
        selectedItem.id
      );
      console.log("confirmResponse: ", confirmResponse);
      if (confirmResponse.status == 200) {
        setShowConfirmationTelurOk(false);
        fetchRequestItemsData();
      }
    } catch (error) {
      alert("Terjadi kesalahan dalam melakukan konfirmasi: ", error);
      console.log("error :", error);
    }
  };

  const confirmTelurRetakHandle = async (payload) => {
    try {
      console.log("payload: ", payload);
      console.log("selectedItem.id: ", selectedItem.id);
      const confirmResponse = await warehouseConfirmationStoreRequestItem(
        payload,
        selectedItem.id
      );
      console.log("confirmResponse: ", confirmResponse);
      if (confirmResponse.status == 200) {
        setShowConfirmationTelurOk(false);
        fetchRequestItemsData();
      }
    } catch (error) {
      if (error.response.data.error.Quantity == "Quantity is required") {
        alert("❌Telur retak yang ingin dikirim masih kosong");
      } else {
        alert("❌Terjadi kesalahan dalam melakukan konfirmasi: ", error);
      }
      console.log("error :", error);
    }
  };

  const tolakHandle = async () => {
    try {
      const payload = {
        status: "Ditolak",
      };
      console.log("payload: ", payload);
      console.log("selectedItemToCancel: ", selectedItemToCancel);

      const cancelResponse = await updateStoreRequestItem(
        payload,
        selectedItemToCancel
      );

      if (cancelResponse.status == 200) {
        setShowBatalModal(false);
        fetchRequestItemsData();
      }
      // console.log("cancelResponse: ", cancelResponse);
      // console.log("confirmResponse: ", confirmResponse);
    } catch (error) {
      alert("Terjadi kesalahan dalam melakukan konfirmasi: ", error);
      console.log("error :", error);
    }
  };

  const fetchStore = async () => {
    try {
      const storeResponse = await getStores(selectedSite);
      // console.log("storeResponse: ", storeResponse);
      if (storeResponse.status == 200) {
        setStores(storeResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchWarehousePlacement = async () => {
    try {
      const placementResponse = await getCurrentUserWarehousePlacement();
      console.log("placementResponse: ", placementResponse);
      if (placementResponse.status == 200) {
        setSelectedWarehouse(placementResponse?.data?.data[0].warehouse?.id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchEggWarehouseSummary = async () => {
    try {
      console.log("selectedWarehouse: ", selectedWarehouse);
      const eggResponse = await getEggWarehouseItemSummary(selectedWarehouse);
      console.log("eggResponse: ", eggResponse);
      if (eggResponse.status == 200) {
        const telurOkKg = eggResponse.data.data.find(
          (item) => item.name === "Telur OK" && item.unit === "Kg"
        );
        const telurRetakKg = eggResponse.data.data.find(
          (item) => item.name === "Telur Retak" && item.unit === "Kg"
        );
        const telurOkIkat = eggResponse.data.data.find(
          (item) => item.name === "Telur OK" && item.unit === "Ikat"
        );
        const telurRetakIkat = eggResponse.data.data.find(
          (item) => item.name === "Telur Retak" && item.unit === "Ikat"
        );
        setTelurOkKg(telurOkKg ? telurOkKg.quantity : 0);
        setTelurOkIkat(telurOkIkat ? telurOkIkat.quantity : 0);
        setTelurRetakKg(telurRetakKg ? telurRetakKg.quantity : 0);
        setTelurRetakIkat(telurRetakIkat ? telurRetakIkat.quantity : 0);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    if (userRole == "Pekerja Gudang") {
      fetchWarehousePlacement();
    } else {
      fetchWarehouseData();
    }
    fetchStore();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchRequestItemsData();
      fetchEggWarehouseSummary();
    }
  }, [selectedWarehouse, page, selectedDate]);

  return (
    <div className="flex flex-col px-4 py-3 gap-3 ">
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Pesanan Toko</h1>

        <div className="flex gap-2">
          {(userRole == "Owner" || userRole == "Kepala Kandang") && (
            <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
              <MdStore size={18} />
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="ml-2 bg-transparent text-base font-medium outline-none"
              >
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

      {!selectedWarehouse && (
        <div className="flex items-center p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 border border-yellow-300">
          <GoAlertFill className="w-5 h-5 mr-2 text-yellow-600" />
          <span>
            Anda tidak memiliki akses ke gudang manapun, silahkan hubungi Owner
          </span>
        </div>
      )}
      <div className="flex  items-center">
        <h2 className="text-xl font-medium">Stok Telur Tersedia : </h2>
      </div>

      <div className="flex md:grid-cols-2 gap-4 justify-between">
        {/* telur OK */}
        <div className="p-4 w-full rounded-md border-2 border-black-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Telur OK</h2>
            <div className="p-2 rounded-xl bg-green-700">
              <MdEgg size={24} color="white" />
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-4">
            {/* item ikat */}
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-3xl font-bold text-center">{telurOkIkat}</p>
              <p className="text-xl text-center">Ikat</p>
            </div>

            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-3xl font-bold text-center">{telurOkKg}</p>
              <p className="text-xl text-center">Kg</p>
            </div>
          </div>
        </div>

        {/* penjualan telur */}
        <div className="p-4 w-full rounded-md border-2 border-black-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Telur Retak</h2>
            <div className="p-2 rounded-xl bg-green-700">
              <TbEggCrackedFilled size={24} color="white" />
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-4">
            {/* item butir */}
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-3xl font-bold text-center">{telurRetakIkat}</p>
              <p className="text-xl text-center">Ikat</p>
            </div>

            <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
              <p className="text-3xl font-bold text-center">{telurRetakKg}</p>
              <p className="text-xl text-center">Kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* tabel */}
      <div className="bg-white p-6 border rounded-lg w-full border-black-6">
        <div className="flex  items-center mb-4">
          <h2 className="text-lg font-semibold">Pesanan Toko</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-center">
                <th className="py-2 px-4">Nama Barang</th>
                <th className="py-2 px-4">Jumlah (Ikat)</th>
                <th className="py-2 px-4">Toko Pemesan</th>
                <th className="py-2 px-4">Keterangan</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requestData.map((data, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-4">{data.item.name}</td>
                  <td className="py-2 px-4">{data.quantity}</td>
                  <td className="py-2 px-4">
                    {data.store.name && data.store.name.trim() !== ""
                      ? data.store.name
                      : "-"}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`${getStatusStyle(
                        data.status
                      )} px-3 py-1 text-sm rounded`}
                    >
                      {data.status == "Menunggu"
                        ? "Belum Dikirim"
                        : data.status}
                    </span>
                  </td>

                  <td className="py-2 px-4 flex justify-center gap-4">
                    {data.status == "Menunggu" && (
                      <>
                        <span
                          className="px-6 py-1 rounded bg-green-700 hover:bg-green-900 text-white cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setSelectedItem(data);
                            // console.log("data: ", data);
                            if (data.item.name == "Telur OK") {
                              setShowConfirmationTelurOk(true);
                            } else if (data.item.name == "Telur Retak") {
                              setShowConfirmationTelurRetak(true);
                            }
                          }}
                        >
                          Kirim Barang
                        </span>

                        {data.item.name !== "Telur Retak" && (
                          <span
                            onClick={() => {
                              setSelectedItemToCancel(data.id);
                              setShowBatalModal(true);
                            }}
                            className="px-6 py-1 rounded bg-kritis-box-surface-color hover:bg-kritis-text-color cursor-pointer flex items-center gap-2 text-white"
                          >
                            Tolak
                          </span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showConfirmationTelurOk && selectedItem && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/10 bg-opacity-50 z-50">
          <KonfirmasiPemenuhanPesananTokoTelurOk
            item={selectedItem}
            onSubmit={(payload) => {
              confirmTelurOkHandle(payload);
              setShowConfirmationTelurOk(false);
            }}
            onCancel={() => setShowConfirmationTelurOk(false)}
          />
        </div>
      )}

      {showConfirmationTelurRetak && selectedItem && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/10 bg-opacity-50 z-50">
          <KonfirmasiPemenuhanPesananTokoTelurRetak
            item={selectedItem}
            stores={stores}
            onSubmit={(payload) => {
              confirmTelurRetakHandle(payload);
              setShowConfirmationTelurRetak(false);
            }}
            onCancel={() => setShowConfirmationTelurRetak(false)}
          />
        </div>
      )}
      {showBatalModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/10 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <h2 className="text-lg font-semibold mb-4">
              Apakah anda yakin untuk menolak pesanan ini?
            </h2>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setShowBatalModal(false);
                }}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Tidak
              </button>
              <button
                onClick={tolakHandle}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          console.log("selectedWarehouse: ", selectedWarehouse);
          console.log("page: ", page);
          console.log("requestData: ", requestData);
          console.log("showBatalModal: ", showBatalModal);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default PesananToko;
