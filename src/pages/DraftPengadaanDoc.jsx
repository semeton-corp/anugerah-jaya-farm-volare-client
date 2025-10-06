import React from "react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  confirmationChickenProcurementDraft,
  deleteChickenProcurementDraft,
  getChickenProcurementDrafts,
} from "../services/chickenMonitorings";
import { useEffect } from "react";
import KonfirmasiPemesananDocModal from "../components/KonfirmasiPemesananDocModal";
import { getCage, getChickenCage } from "../services/cages";
import { TbBatteryEco } from "react-icons/tb";

const DraftPengadaanDoc = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showBatalModal, setShowBatalModal] = useState(false);
  const [showAlokasiModal, setShowAlokasiModal] = useState(false);
  const [kandangOptions, setKandangOptions] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [draftData, setDraftData] = useState([]);

  const detailPages = ["input-draft-pesan-doc"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const inputDraftPesanDocHandle = () => {
    navigate(`${location.pathname}/input-draft-pesan-doc`);
  };

  const fetchDraftData = async () => {
    try {
      const draftResponse = await getChickenProcurementDrafts();
      console.log("draftResponse: ", draftResponse);
      if (draftResponse.status == 200) {
        setDraftData(draftResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchCages = async () => {
    try {
      const chickenCageResponse = await getCage();
      // console.log("chickenCageResponse: ", chickenCageResponse);
      if (chickenCageResponse.status === 200) {
        setKandangOptions(chickenCageResponse.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data kandang:", error);
    }
  };

  const handleSubmit = async (payload) => {
    try {
      const submitResponse = await confirmationChickenProcurementDraft(
        payload,
        selectedItem.id
      );
      console.log("submitResponse: ", submitResponse);
      if (submitResponse.status === 201) {
        alert("✅ Berhasil mengonfirmasi pesanan");
        setShowAlokasiModal(false);
        fetchDraftData();
        const newPath = location.pathname.replace("/draft-pesan-doc", "");
        navigate(newPath, { state: { refetch: true } });
      }
    } catch (error) {
      if (
        (error.response.data.message = "cage is in used by another chicken")
      ) {
        alert("❌Kandang sudah digunakan, silahkan pilih kandang lain.");
      } else {
        alert("Gagal mengonfirmasi pesanan: " + error.response.data.message);
      }
      console.log("error :", error);
    }
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await deleteChickenProcurementDraft(
        selectedItem.id
      );
      if (deleteResponse.status === 204) {
        alert("✅ Berhasil membatalkan pesanan");
        setSelectedItem(null);
        setShowBatalModal(false);
        fetchDraftData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchCages();
    fetchDraftData();
    if (location.state?.refetch) {
      fetchDraftData();
      window.history.replace({}, document.title);
    }
  }, [location]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Draft Pengadaan DOC</h2>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow">
        <div className="flex justify-end items-center mb-3">
          <button
            onClick={inputDraftPesanDocHandle}
            className="bg-orange-300 hover:bg-yellow-500 py-2 px-4 rounded-lg cursor-pointer text-sm sm:text-base"
          >
            + Draft Pemesanan DOC
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="p-2 sm:p-3">Tanggal Input</th>
                <th className="p-2 sm:p-3">Kandang</th>
                <th className="p-2 sm:p-3">Suplier</th>
                <th className="p-2 sm:p-3">Jumlah</th>
                <th className="p-2 sm:p-3">Harga</th>
                <th className="p-2 sm:p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {draftData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 sm:p-3">{item.inputDate}</td>
                  <td className="p-2 sm:p-3">{item.cage.name}</td>
                  <td className="p-2 sm:p-3">{item.supplier.name}</td>
                  <td className="p-2 sm:p-3">{`${item.quantity} Ekor`}</td>
                  <td className="p-2 sm:p-3">
                    {`Rp ${Number(item.totalPrice).toLocaleString("id-ID")}`}
                  </td>
                  <td className="p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <button
                      onClick={() => {
                        const localNumber = "081246087972";
                        const waNumber = localNumber.replace(/^0/, "62");

                        const namaSupplier = item?.supplier?.name || "";
                        const namaBarang =
                          item?.item?.name ||
                          item?.supplier?.supplierType ||
                          "";

                        const jumlah = item?.quantity || "";

                        const rawMessage = `
Halo ${namaSupplier}, kami dari *Anugerah Jaya Farm* ingin memastikan ketersediaan pesanan ayam berikut:

🐔 *Nama Barang:* ${namaBarang}
📦 *Jumlah:* ${jumlah} ekor

Apakah ayam dengan jumlah tersebut tersedia dan siap dipesan?
`;

                        const message = encodeURIComponent(rawMessage.trim());
                        const waURL = `https://api.whatsapp.com/send?phone=${waNumber}&text=${message}`;
                        window.open(waURL, "_blank");
                      }}
                      className="px-3 py-1 bg-green-700 rounded text-white hover:bg-green-900 cursor-pointer flex items-center justify-center"
                    >
                      <IoLogoWhatsapp size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowAlokasiModal(true);
                      }}
                      className="px-3 py-1 bg-green-700 rounded text-white hover:bg-green-900 cursor-pointer"
                    >
                      Konfirmasi
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowBatalModal(true);
                      }}
                      className="px-3 py-1 bg-kritis-box-surface-color rounded text-white hover:bg-kritis-text-color cursor-pointer"
                    >
                      Batalkan
                    </button>
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
      {showAlokasiModal && (
        <KonfirmasiPemesananDocModal
          onClose={() => setShowAlokasiModal(false)}
          onConfirm={(payload) => {
            handleSubmit(payload);
          }}
          order={{
            orderDate: selectedItem.inputDate,
            supplier: selectedItem.supplier.name,
            kandang: selectedItem.cage,
            kandangOptions: kandangOptions,
            quantity: selectedItem.quantity,
            price: selectedItem.totalPrice,
          }}
        />
      )}
    </div>
  );
};

export default DraftPengadaanDoc;
