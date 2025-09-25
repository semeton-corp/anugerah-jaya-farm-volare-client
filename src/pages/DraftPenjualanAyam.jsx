import React from "react";
import { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import KonfirmasiPenjualanAyamModal from "../components/KonfirmasiPenjualanAyamModal";
import {
  confirmationAfkirChickenSaleDraft,
  deleteAfkirChickenSaleDraft,
  getAfkirChickenSaleDrafts,
} from "../services/chickenMonitorings";
import { useEffect } from "react";
import DeleteModal from "../components/DeleteModal";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const DraftPenjualanAyam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [draftSalesData, setDraftSalesData] = useState([]);
  const [selectedConfirmItem, setSelectedConfirmItem] = useState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState();

  const detailPages = ["input-draft-penjualan-ayam"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const inputDraftPesanDocHandle = () => {
    navigate(`${location.pathname}/input-draft-penjualan-ayam`);
  };

  const handleConfirm = async (payload) => {
    // console.log("payload: ", payload);
    try {
      const confirmResponse = await confirmationAfkirChickenSaleDraft(
        payload,
        selectedConfirmItem.id
      );
      // console.log("confirmResponse: ", confirmResponse);
      if (confirmResponse.status == 201) {
        const newPath = location.pathname.replace("/draft-penjualan-ayam", "");
        navigate(newPath, { state: { refetch: true } });
        setSelectedConfirmItem();
        setShowConfirmModal(false);
        fetchDraftData();
      }
    } catch (error) {
      if (
        error?.response?.data?.message ==
        "total sell chicken must be less than total chicken"
      ) {
        alert("❌Jumlah penjualan melebihi jumlah ayam di kandang");
      }
      console.log("error :", error);
    }
  };

  const fetchDraftData = async () => {
    try {
      const draftResponse = await getAfkirChickenSaleDrafts();
      console.log("draftResponse: ", draftResponse);
      if (draftResponse.status == 200) {
        setDraftSalesData(draftResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleBatalDraft = async () => {
    try {
      const deleteResponse = await deleteAfkirChickenSaleDraft(
        selectedDeleteId
      );
      console.log("deleteResponse: ", deleteResponse);
      if (deleteResponse.status == 204) {
        alert("✅Data draft berhasil dihapus!");
        fetchDraftData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDraftData();
    if (location.state?.refetch) {
      fetchDraftData();
    }
  }, [location]);

  if (isDetailPage) {
    return <Outlet />;
  }
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Draft Penjualan Ayam</h2>

      <div className="bg-white p-4 rounded shadow border">
        {/* Button Tambah Draft */}
        <div className="flex justify-end mb-3">
          <button
            onClick={inputDraftPesanDocHandle}
            className="bg-orange-300 hover:bg-orange-500 px-4 py-2 rounded text-sm font-medium cursor-pointer"
          >
            + Draft Penjualan Ayam
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="p-3">Tanggal Input</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Harga / ekor</th>
                <th className="p-3">Harga Total</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {draftSalesData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.inputDate}</td>
                  <td className="p-3">{item.afkirChickenCustomer.name}</td>
                  <td className="p-3">{`${item.totalSellChicken} Ekor`}</td>
                  <td className="p-3">
                    {formatCurrency(item.pricePerChicken)}
                  </td>
                  <td className="p-3">{formatCurrency(item.totalPrice)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const localNumber = "081246087972";
                          const waNumber = localNumber.replace(/^0/, "62");
                          const message = `Halo ${
                            item.afkirChickenCustomer.name
                          }, 
                          Kami dari Anugerah Jaya Farm ingin mengonfirmasi pesanan ayam afkir Anda:

                          🐔 Jumlah: ${item.totalSellChicken} ekor
                          💰 Harga per ekor: ${formatCurrency(
                            item.pricePerChicken
                          )}
                          📦 Total: ${formatCurrency(item.totalPrice)}

                          Apakah pesanan ini jadi diproses?`;
                          const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                            message
                          )}`;
                          window.open(waURL, "_blank");
                        }}
                        className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-900"
                      >
                        <IoLogoWhatsapp />
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmModal(true);
                          setSelectedConfirmItem(item);
                          console.log("item: ", item);
                        }}
                        className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-900 text-sm cursor-pointer"
                      >
                        Konfirmasi
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDeleteId(item.id);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 text-sm cursor-pointer"
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
      {showConfirmModal && (
        <KonfirmasiPenjualanAyamModal
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
          sale={{
            saleDate: "09 Aug 2025",
            chickenCage: selectedConfirmItem.chickenCage,

            customer: selectedConfirmItem.afkirChickenCustomer,
            totalSellChicken: selectedConfirmItem.totalSellChicken,
            pricePerChicken: selectedConfirmItem.pricePerChicken,
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onCancel={() => {
            setShowDeleteModal(false);
          }}
          onConfirm={handleBatalDraft}
        />
      )}
    </div>
  );
};

export default DraftPenjualanAyam;
