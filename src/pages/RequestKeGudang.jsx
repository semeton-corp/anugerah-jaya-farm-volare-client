import React, { useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlank } from "react-icons/pi";
import { BiSolidEditAlt } from "react-icons/bi";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import KonfirmasiBarangSampaiModal from "../components/KonfirmasiBarangSampaiModal";
import SortirTelurModal from "../components/SortirTelurModal";
import BatalModal from "../components/BatalModal";
import { getCurrentUserStorePlacement } from "../services/placement";
import { useEffect } from "react";
import {
  getStoreRequestItems,
  getStores,
  storeConfirmationStoreRequestItem,
  updateStoreRequestItem,
} from "../services/stores";
import { formatDate, formatDateToDDMMYYYY } from "../utils/dateFormat";
import { MdStore } from "react-icons/md";

const getStatusStyle = (status) => {
  switch (status) {
    case "Sedang Dikirim":
      return "bg-orange-200 text-yellow-800";
    case "Menunggu":
      return "bg-green-200 text-green-900";
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

const RequestKeGudang = () => {
  const userRole = localStorage.getItem("role");
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [requestData, setRequestData] = useState([]);

  const [storePlacement, setStorePlacement] = useState();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [showBarangSampaiModal, setShowBarangSampaiModal] = useState(false);
  const [showSortirModal, setShowSortirModal] = useState(false);
  const [showBatalModal, setShowBatalModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const detailPages = ["pesan-barang"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const pesanBarangHandle = () => {
    const currentPath = location.pathname;
    const inputPath = currentPath + "/pesan-barang";
    navigate(inputPath);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleBarangSampai = async (data) => {
    // console.log("Payload dikirim:", data);
    // console.log("selectedItem: ", selectedItem);
    const payload = {
      quantity: parseInt(data.jumlah),
    };

    try {
      const sampaiResponse = await storeConfirmationStoreRequestItem(
        payload,
        selectedItem.id
      );
      // console.log("sampaiResponse: ", sampaiResponse);
      if (sampaiResponse.status == 200) {
        fetchRequestItemsData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPlacementData = async () => {
    try {
      const placementResponse = await getCurrentUserStorePlacement();
      console.log("placementResponse: ", placementResponse);
      if (placementResponse.status == 200) {
        setStorePlacement(placementResponse.data.data[0].store);
        setSelectedStore(placementResponse.data.data[0].store.id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchAllStores = async () => {
    try {
      console.log("selectedSite: ", selectedSite);
      const response = await getStores(selectedSite);
      if (response.status == 200) {
        setStores(response.data.data);
        setSelectedStore(response.data.data[0].id);
      }
    } catch (error) {
      alert("Gagal memuat data toko: ", error);
      console.log("error: ", error);
    }
  };

  const fetchRequestItemsData = async () => {
    try {
      const date = formatDateToDDMMYYYY(selectedDate);
      const requestReponse = await getStoreRequestItems(
        date,
        page,
        undefined,
        selectedStore
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
      console.log("requestReponse: ", requestReponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const batalHandle = async () => {
    try {
      const payload = {
        status: "Dibatalkan",
      };
      console.log("payload: ", payload);
      console.log("selectedItem: ", selectedItem);

      const cancelResponse = await updateStoreRequestItem(
        payload,
        selectedItem.id
      );

      if (cancelResponse.status == 200) {
        setShowBatalModal(false);
        fetchRequestItemsData();
      }
    } catch (error) {
      alert("Terjadi kesalahan dalam melakukan konfirmasi: ", error);
      console.log("error :", error);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    console.log("date: ", date);
    setSelectedDate(date);
  };

  useEffect(() => {
    if (userRole == "Owner") {
      fetchAllStores();
    } else {
      fetchPlacementData();
    }
    if (location.state?.refetch) {
      fetchDataAyam();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (selectedStore) {
      fetchRequestItemsData();
    }
  }, [selectedStore, page, selectedDate]);

  return (
    <>
      {isDetailPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col px-4 py-3 gap-4 ">
          {/* header */}
          <div className="flex justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Pesan ke Gudang</h1>

            <div className="flex gap-4">
              {userRole != "Pekerja Toko" && (
                <div className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
                  <MdStore size={18} />
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="ml-2 bg-transparent text-base font-medium outline-none"
                  >
                    {stores.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
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

          {/* entire box */}
          <div className="p-6 rounded-[4px] border border-black-6">
            <div className="flex justify-end">
              <button
                onClick={pesanBarangHandle}
                className="px-5 py-3 bg-orange-300 rounded-[4px] text-black hover:bg-orange-500 cursor-pointer font-medium mb-3"
              >
                Pesan Barang
              </button>
            </div>
            {/* pegawai table */}
            <div className="p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="px-4 py-2">Nama barang</th>
                    <th className="px-4 py-2">Jumlah Pesan (ikat)</th>
                    <th className="px-4 py-2">Gudang Pemesanan</th>
                    <th className="px-4 py-2">Keterangan</th>
                    <th className="px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {requestData?.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.item.name}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{item.warehouse.name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {getSecondAction(item.status) &&
                          (getSecondAction(item.status).label !==
                            "Sortir Telur" ||
                            item.item.name === "Telur Retak") && (
                            <button
                              onClick={() => {
                                const label = getSecondAction(
                                  item.status
                                ).label;
                                if (label === "Barang Sampai") {
                                  setSelectedItem(item);
                                  setShowBarangSampaiModal(true);
                                } else if (
                                  item.item.name === "Telur Retak" &&
                                  label === "Sortir Telur"
                                ) {
                                  setSelectedItem(item);
                                  setShowSortirModal(true);
                                } else if (label === "Batal Pesan") {
                                  setSelectedItem(item);
                                  setShowBatalModal(true);
                                }
                              }}
                              className={`${
                                getSecondAction(item.status).color
                              } px-3 py-1 mx-2 text-sm rounded`}
                            >
                              {getSecondAction(item.status).label}
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requestData.length < 1 && (
                <>
                  <p className="p-3 w-full flex justify-center italic text-gray-500">
                    Belum ada data pesanan ke gudang
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-between mt-16 px-6">
              {requestData?.length > 0 ? (
                <p className="text-sm text-[#CCCCCC]">{`Menampilkan halaman ${page} dari ${totalPages} halaman. Total ${totalData} data riwayat`}</p>
              ) : (
                <p></p>
              )}

              <div className="flex gap-3">
                <div
                  className={`rounded-[4px] py-2 px-6 ${
                    page === 1
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-green-100 hover:bg-green-200 cursor-pointer"
                  } flex items-center justify-center text-black text-base font-medium `}
                  onClick={() => page > 1 && setPage(page - 1)}
                >
                  <p>Previous</p>
                </div>
                <div
                  className={`rounded-[4px] py-2 px-6 ${
                    page === totalPages
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800 cursor-pointer"
                  } flex items-center justify-center text-white text-base font-medium `}
                  onClick={() => page < totalPages && setPage(page + 1)}
                >
                  <p>Next</p>
                </div>
              </div>
            </div>
          </div>

          {showBarangSampaiModal && selectedItem && (
            <KonfirmasiBarangSampaiModal
              isOpen={showBarangSampaiModal}
              onClose={() => setShowBarangSampaiModal(false)}
              namaBarang={selectedItem.item.name}
              satuan="Ikat"
              defaultJumlah={selectedItem.quantity}
              onSubmit={(data) => {
                handleBarangSampai({
                  ...data,
                });
                setShowBarangSampaiModal(false);
              }}
            />
          )}

          {showSortirModal && selectedItem && (
            <SortirTelurModal
              isOpen={showSortirModal}
              onClose={() => setShowSortirModal(false)}
              defaultKarpet={2}
              defaultButirSisa={4}
              defaultTelurBonyok={20}
              onSubmit={(payload) => {
                console.log("Data sortir:", payload);
                setShowSortirModal(false);
              }}
            />
          )}

          {showBatalModal && selectedItem && (
            <BatalModal
              isOpen={showBatalModal}
              onCancel={() => setShowBatalModal(false)}
              onConfirm={() => {
                console.log("Item dibatalkan:", selectedItem);
                batalHandle();
                setShowBatalModal(false);
              }}
              item={selectedItem}
            />
          )}

          <button
            onClick={() => {
              console.log("storePlacement: ", storePlacement);
              console.log("totalPages: ", totalPages);
              console.log("page: ", page);
              console.log("requestData: ", requestData);
            }}
          >
            CHECK
          </button>
        </div>
      )}
    </>
  );
};

export default RequestKeGudang;
