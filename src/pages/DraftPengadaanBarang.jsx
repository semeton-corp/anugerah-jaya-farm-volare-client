// src/pages/DraftPengadaanBarang.jsx
import React, { useMemo, useState } from "react";
import { IoCalendarOutline, IoLogoWhatsapp } from "react-icons/io5";
import KonfirmasiPemesananDocModal from "../components/KonfirmasiPemesananDocModal";
import {
  confirmationWarehouseItemProcurementDraft,
  deleteWarehouseItemProcurementDraft,
  getWarehouseItemProcurementDrafts,
  getWarehouses,
} from "../services/warehouses";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import KonfirmasiPemesananBarangModal from "../components/KonfirmasiPemesananBarangModal";
import { getSuppliers } from "../services/supplier";
import { MdStore } from "react-icons/md";
import { getCurrentUserWarehousePlacement } from "../services/placement";

const toRupiah = (n) =>
  `Rp ${Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const DraftPengadaanBarang = () => {
  const userRole = localStorage.getItem("role");

  const navigate = useNavigate();
  const location = useLocation();

  const [draftData, setDraftData] = useState([]);

  const [selectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [warehouses, setWarehouses] = useState();
  const [selectedWarehouse, setSelectedWarehouse] = useState();

  const [showBatalModal, setShowBatalModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [kandangOptions, setKandangOptions] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);

  const detailPages = ["input-draft-pengadaan-barang", "tambah-supplier"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname?.includes(segment)
  );

  const inputDraftPesanBarangHandle = () => {
    navigate(`${location.pathname}/input-draft-pengadaan-barang`);
  };

  const editDraftPesanBarangHandle = (id) => {
    navigate(`${location.pathname}/input-draft-pengadaan-barang/${id}`);
  };

  const fetchDraftData = async () => {
    try {
      const draftResponse = await getWarehouseItemProcurementDrafts(
        selectedWarehouse
      );
      if (draftResponse.status == 200) {
        setDraftData(draftResponse.data.data);
      }
      console.log("draftResponse: ", draftResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchSupplier = async () => {
    try {
      const supplierResponse = await getSuppliers("Barang");
      console.log("supplierResponse: ", supplierResponse);
      if (supplierResponse.status == 200) {
        setSupplierOptions(supplierResponse.data.data);
      }
    } catch (error) {
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
        setSelectedWarehouse(placementResponse?.data?.data[0]?.warehouse?.id);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleConfirmProcuremnet = async (payload) => {
    console.log("payload: ", payload);
    try {
      const submitResponse = await confirmationWarehouseItemProcurementDraft(
        payload,
        selectedItem.id
      );
      console.log("submitResponse: ", submitResponse);
      if (submitResponse.status == 201) {
        setShowOrderModal(false);
        fetchDraftData();
        const newPath = location.pathname.replace(
          "/draft-pengadaan-barang",
          ""
        );
        navigate(newPath, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await deleteWarehouseItemProcurementDraft(
        selectedItem.id
      );
      console.log("deleteResponse: ", deleteResponse);
      if (deleteResponse.status == 204) {
        fetchDraftData();
        setShowBatalModal(false);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handlePerbandinganPakan = () => {
    const newPath = location.pathname.replace(
      "pengadaan-barang/draft-pengadaan-barang",
      "perbandingan-pakan"
    );
    navigate(newPath);
  };

  useEffect(() => {
    if (userRole == "Pekerja Gudang") {
      fetchWarehousePlacement();
    } else {
      fetchWarehouseData();
    }
    fetchSupplier();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchDraftData();
      if (location?.state?.refetch) {
        fetchDraftData();
        window.history.replaceState({}, document.title);
      }
    }
  }, [selectedWarehouse, location]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between">
        <h2 className="text-3xl font-bold">Draft Pengadaan Barang</h2>
        {(userRole === "Owner" || userRole === "Kepala Kandang") && (
          <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
            <MdStore size={18} />
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                const warehouseId = e.target.value;
                setSelectedWarehouse(warehouseId);

                const selected = warehouses?.find((w) => w.id == warehouseId);
                if (selected) {
                  setCornCapacity(selected.cornCapacity);
                }
              }}
              className="ml-2 bg-transparent text-base font-medium outline-none"
            >
              {warehouses?.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded border shadow">
        <div className="flex justify-end items-center mb-3 gap-4">
          <button
            onClick={() => {
              handlePerbandinganPakan();
            }}
            className="bg-orange-300 hover:bg-yellow-500 py-2 rounded px-4 cursor-pointer"
          >
            Perbandingan Pakan
          </button>
          <button
            onClick={inputDraftPesanBarangHandle}
            className="bg-orange-300 hover:bg-yellow-500 py-2 px-4 rounded cursor-pointer"
          >
            + Tambah Pengadaan Barang
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="p-3">Tanggal Input</th>
                <th className="p-3">Nama Barang</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Satuan</th>
                <th className="p-3">Suplier</th>
                <th className="p-3">Harga total</th>
                {/* <th className="p-3">Status</th> */}
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {draftData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.inputDate}</td>
                  <td className="p-3">{item.item.name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.item.unit}</td>
                  <td className="p-3">{item.supplier.name}</td>
                  <td className="p-3">
                    {`Rp ${Number(item.totalPrice).toLocaleString("id-ID")}`}
                  </td>

                  <td className="p-3 flex items-center gap-2">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          const localNumber = "081246087972";
                          const waNumber = localNumber.replace(/^0/, "62");
                          const namaSupplier = item?.supplier?.name || "";
                          const namaBarang = item?.item?.name || "";
                          const satuan = item?.item?.unit || "";
                          const jumlah = item?.quantity || "";
                          const message = `Halo ${namaSupplier}, kami dari Anugerah Jaya Farm ingin memesan barang berikut:%0A%0A🧺 Nama Barang: ${namaBarang}%0A📦 Jumlah: ${jumlah} ${satuan}%0A%0AMohon konfirmasi ketersediaannya, terima kasih.`;
                          const waURL = `https://wa.me/${waNumber}?text=${message}`;

                          window.open(waURL, "_blank");
                        }}
                        className="px-3 py-1 bg-green-700 rounded-[4px] text-white hover:bg-green-900 cursor-pointer"
                      >
                        <IoLogoWhatsapp />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          console.log("item: ", item);
                          setShowOrderModal(true);
                        }}
                        className="px-3 py-1 bg-orange-300 rounded-[4px] hover:bg-orange-500 cursor-pointer"
                      >
                        Pesan
                      </button>
                      <button
                        onClick={() => {
                          editDraftPesanBarangHandle(item.id);
                        }}
                        className="px-3 py-1 bg-green-700 rounded-[4px] text-white hover:bg-green-900 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowBatalModal(true);
                        }}
                        className="px-3 py-1 bg-kritis-box-surface-color rounded-[4px] text-white hover:bg-kritis-text-color cursor-pointer"
                      >
                        Batalkan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showBatalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-md px-8 py-6 max-w-md text-center">
            <p className="text-lg font-semibold mb-6">
              Apakah anda yakin untuk pengadaan barang ini?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowBatalModal(false)}
                className="bg-gray-300 hover:bg-gray-400 cursor-pointer text-black font-semibold px-6 py-2 rounded-lg"
              >
                Tidak
              </button>
              <button
                onClick={() => {
                  handleDelete();
                }}
                className="bg-red-400 hover:bg-red-500 cursor-pointer text-white font-semibold px-6 py-2 rounded-lg"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && (
        <KonfirmasiPemesananBarangModal
          selectedItem={selectedItem}
          onClose={() => setShowOrderModal(false)}
          onConfirm={(payload) => {
            console.log("ORDER PAYLOAD →", payload);
            handleConfirmProcuremnet(payload);
          }}
          supplierOptions={supplierOptions}
        />
      )}
    </div>
  );
};

export default DraftPengadaanBarang;
