import React, { useState } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { PiMoneyWavyFill } from "react-icons/pi";
import { TbEggCrackedFilled } from "react-icons/tb";

import { MdStore } from "react-icons/md";
import { FiMaximize2 } from "react-icons/fi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getTodayDateInBahasa } from "../utils/dateFormat";
import { MdEgg, MdShoppingCart } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";
import { useEffect } from "react";
import {
  getStoreItemStocks,
  getStoreOverview,
  getStores,
} from "../services/stores";
import { getCurrentUserStorePlacement } from "../services/placement";
import { useSelector } from "react-redux";
import PageNotificationsSection from "../components/PageNotificationsSection";

const OverviewStok = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  const [telurOkKg, setTelurOkKg] = useState(0);
  const [telurOkIkat, setTelurOkIkat] = useState(0);
  const [telurRetakKg, setTelurRetakKg] = useState(0);
  const [telurRetakIkat, setTelurRetakIkat] = useState(0);
  const [telurBonyokPlastik, setTelurBonyokPlastik] = useState(0);

  const notifications = useSelector((state) => state?.notifications);
  const pageNotifications = notifications.filter((item) =>
    item.notificationContexts.includes("Barang Toko")
  );

  const [storeItems, setStoreItems] = useState([]);

  const detailPages = [
    "detail-stok-toko",
    "riwayat-aktivitas-toko",
    "edit-stok",
  ];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const [stores, setStores] = useState();
  const [selectedStore, setSelectedStore] = useState();

  const detailStokTokoHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/detail-stok-toko";

    navigate(detailPath);
  };

  const riwayatAktivitasTokoHandle = () => {
    const currentPath = location.pathname;
    const detailPath = currentPath + "/riwayat-aktivitas-toko";

    navigate(detailPath);
  };

  const editStokHandle = (storeId, itemId) => {
    const currentPath = location.pathname;
    const detailPath = currentPath + `/edit-stok/${storeId}/${itemId}`;

    navigate(detailPath);
  };

  const fetchStokData = async () => {
    try {
      const stokResponse = await getStoreItemStocks(selectedStore);
      console.log("stokResponse: ", stokResponse);
      if (stokResponse.status == 200) {
        const eggSummaries = stokResponse.data.data.eggStoreItemSummaries;
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
        setStoreItems(stokResponse.data.data.storeItems);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchStores = async () => {
    try {
      const storeResponse = await getStores();
      if (storeResponse.status === 200) {
        setStores(storeResponse.data.data);
        setSelectedStore(storeResponse.data.data[0].id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPlacement = async () => {
    try {
      const placementResponse = await getCurrentUserStorePlacement();
      console.log("placementResponse: ", placementResponse);
      if (placementResponse.status === 200) {
        setSelectedStore(placementResponse.data.data[0].store.id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    if (userRole == "Owner") {
      fetchStores();
    } else {
      fetchPlacement();
    }
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchStokData();
    }
    if (location?.state?.refetch) {
      fetchStokData();
      window.history.replaceState({}, document.title);
    }
  }, [selectedStore, location]);
  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-4 py-3 gap-4 ">
          {/* header section */}
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Stok Toko</h1>
            <div className="flex gap-2">
              {userRole != "Pekerja Toko" && (
                <div className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <MdStore size={18} />
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
                  >
                    {stores?.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <PageNotificationsSection pageNotifications={pageNotifications} />

          <div className="flex md:grid-cols-2 gap-4 justify-between">
            <div className="p-4 w-full rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur OK Ikat</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdEgg size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <div className="flex justify-center flex-wrap gap-4">
                  <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
                    <p className="text-3xl font-bold text-center">
                      {parseInt(telurOkIkat)}
                    </p>
                    <p className="text-xl text-center">Ikat</p>
                  </div>
                </div>

                <div className="flex justify-center flex-wrap gap-4">
                  <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
                    <p className="text-3xl font-bold text-center">
                      {parseInt(telurOkKg)}
                    </p>
                    <p className="text-xl text-center">Kg</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 w-full rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Retak</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <MdEgg size={24} color="white" />
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <div className="flex justify-center flex-wrap gap-4">
                  {/* item ikat */}
                  <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
                    <p className="text-3xl font-bold text-center">
                      {parseInt(telurRetakIkat)}
                    </p>
                    <p className="text-xl text-center">Ikat</p>
                  </div>
                </div>

                <div className="flex justify-center flex-wrap gap-4">
                  {/* item ikat */}
                  <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
                    <p className="text-3xl font-bold text-center">
                      {parseInt(telurRetakKg)}
                    </p>
                    <p className="text-xl text-center">kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* telur Retak */}
            <div className="p-4 w-full rounded-md border-2 border-black-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Telur Bonyok</h2>
                <div className="p-2 rounded-xl bg-green-700">
                  <TbEggCrackedFilled size={24} color="white" />
                </div>
              </div>

              <div className="flex justify-center flex-wrap gap-4">
                {/* item butir */}
                <div className="flex flex-col items-center justify-center w-32 py-4 bg-green-200 rounded-md">
                  <p className="text-3xl font-bold text-center">
                    {parseInt(telurBonyokPlastik)}
                  </p>
                  <p className="text-xl text-center">Plastik</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-120 gap-6">
            <div className="w-full bg-white px-8 py-6 rounded-lg border border-gray-300">
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-green-700 font-medium text-white text-center">
                      <th className="py-2 px-4">Nama Barang</th>
                      <th className="py-2 px-4">Satuan</th>
                      <th className="py-2 px-4">Jumlah</th>
                      <th className="py-2 px-4">Keterangan</th>
                      <th className="py-2 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeItems.map((item, index) => (
                      <tr key={index} className="border-b text-center">
                        <td className="py-2 px-4">{item.item.name}</td>
                        <td className="py-2 px-4">{item.item.unit}</td>
                        <td className="py-2 px-4">{item.quantity}</td>
                        <td className="py-2 px-4 ">
                          <span
                            className={`w-24 py-1 px-5 rounded text-sm font-semibold ${
                              item.description === "aman"
                                ? "bg-aman-box-surface-color text-aman-text-color"
                                : item.description === "-"
                                ? "bg-black-4 text-aman-text-color"
                                : "bg-kritis-box-surface-color text-kritis-text-color"
                            }`}
                          >
                            {item.description}
                          </span>
                        </td>
                        <td className="py-2 px-4 flex justify-center">
                          <button
                            onClick={() =>
                              editStokHandle(item.store.id, item.item.id)
                            }
                            className="px-3 py-1 bg-green-700 rounded-[4px] text-white hover:bg-green-900 cursor-pointer font-medium mb-3"
                          >
                            Edit Stok
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              console.log("selectedStore: ", selectedStore);
              console.log("storeItems: ", storeItems);
            }}
          >
            CHECK
          </button>
        </div>
      )}
    </>
  );
};

export default OverviewStok;
