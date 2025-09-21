import { useEffect, useRef } from "react";
import { useState } from "react";
import { PiCalendarBlank } from "react-icons/pi";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  formatDate,
  formatDateToDDMMYYYY,
  getTodayDateInBahasa,
} from "../utils/dateFormat";
import {
  confirmationWarehouseItemCornProcurementDraft,
  deleteWarehouseItemCornProcurementDraft,
  getWarehouseItemCornProcurementDrafts,
} from "../services/warehouses";
import KonfirmasiPemesananJagungModal from "../components/KonfirmasiPemesananJagungModal";
import { getSuppliers } from "../services/supplier";

const DraftPengadaanJagung = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [daftarDrafts, setDaftarDrafts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showBatalModal, setShowBatalModal] = useState(false);

  const [supplierOptions, setSupplierOptions] = useState([]);

  const [selectedDraft, setSelectedDraft] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const detailPages = ["input-draft-pengadaan-jagung"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  };

  const fetchDraftsData = async () => {
    try {
      const date = formatDateToDDMMYYYY(selectedDate);
      const dataResponse = await getWarehouseItemCornProcurementDrafts(date);
      console.log("draftResponse: ", dataResponse);
      if (dataResponse.status === 200) {
        setDaftarDrafts(dataResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching draft data:", error);
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

  const handleEdit = (item) => {
    console.log("Edit clicked for:", item);
    navigate(`${location.pathname}/input-draft-pengadaan-jagung/${item.id}`);
  };

  const handlePesan = (item) => {
    console.log("item: ", item);
    setSelectedDraft(item);
    setOpenModal(true);
  };

  const handleConfirmOrder = async (payload) => {
    console.log("Konfirmasi pesanan:", payload);

    try {
      const confirmResponse =
        await confirmationWarehouseItemCornProcurementDraft(
          payload,
          selectedDraft.id
        );
      // console.log("confirmResponse: ", confirmResponse);
      if (confirmResponse.status == 201) {
        const newPath = location.pathname.replace(
          "/draft-pengadaan-jagung",
          ""
        );
        navigate(newPath, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDraft(null);
  };

  const handleTambahDraft = () => {
    navigate(`${location.pathname}/input-draft-pengadaan-jagung`);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await deleteWarehouseItemCornProcurementDraft(
        selectedItem.id
      );
      console.log("deleteResponse: ", deleteResponse);
      if (deleteResponse.status === 204) {
        alert("✅ Berhasil membatalkan pesanan");
        setSelectedItem(null);
        setShowBatalModal(false);
        fetchDraftsData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDraftsData();
    fetchSupplier();

    if (location.state?.refetch) {
      fetchDraftsData();
      window.history.replaceState({}, document.title);
    }
  }, [location, selectedDate]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-6">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Draft Pengadaan Jagung</h1>
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

      <div className="bg-white p-4 border rounded-lg w-full border-black-6">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={handleTambahDraft}
            className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer text-black font-medium"
          >
            + Tambah Draft Pengadaan Jagung
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="px-4 py-3">Tanggal Input</th>
                <th className="px-4 py-3">Nama barang</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Satuan</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Harga Total</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftarDrafts?.map((item, idx) => (
                <tr key={item.id || idx} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{item.inputDate}</td>
                  <td className="px-4 py-3">{item.item.name}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{item.item.unit}</td>
                  <td className="px-4 py-3">{item.supplier.name}</td>
                  <td className="px-4 py-3">
                    Rp {parseInt(item.totalPrice).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePesan(item)}
                        className="bg-orange-300 hover:bg-orange-500 text-black px-3 py-1 rounded"
                      >
                        Pesan
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-green-700 hover:bg-green-900 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowBatalModal(true);
                        }}
                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Batalkan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {daftarDrafts?.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data draft.
                  </td>
                </tr>
              )}
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
      <KonfirmasiPemesananJagungModal
        open={openModal}
        data={selectedDraft}
        onClose={handleCloseModal}
        onConfirm={handleConfirmOrder}
        supplierOptions={supplierOptions}
      />
    </div>
  );
};

export default DraftPengadaanJagung;
