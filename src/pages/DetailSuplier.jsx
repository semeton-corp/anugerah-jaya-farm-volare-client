import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteSupplier, getSupplierById } from "../services/supplier";

const DetailSupplier = () => {
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [supplierData, setSupplierData] = useState({});

  const fetchSupplierData = async () => {
    try {
      const detailResponse = await getSupplierById(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        setSupplierData(detailResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await deleteSupplier(id);
      if (deleteResponse.status === 204) {
        setShowModal(false);
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
    setShowModal(false);
  };

  const handleEdit = () => {
    const newPath = location.pathname.replace(
      "detail-supplier",
      "tambah-supplier"
    );
    navigate(newPath);
  };

  useEffect(() => {
    fetchSupplierData();
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Detail Supplier</h1>

      <div className="bg-white border rounded p-4">
        <p className="text-gray-600">Nama Supplier</p>
        <p className="font-bold">{supplierData?.name}</p>

        <p className="text-gray-600 mt-4">Tipe Supplier</p>
        <p className="font-bold">{supplierData?.supplierType}</p>

        <p className="text-gray-600 mt-4">Alamat Supplier</p>
        <p className="font-bold">{supplierData?.address}</p>

        <p className="text-gray-600 mt-4">Nomor Telepon Supplier</p>
        <p className="font-bold">{supplierData?.phoneNumber}</p>
      </div>

      {supplierData?.supplierType == "Barang" && (
        <div className="bg-white border rounded p-4">
          <p className="text font-semibold mb-4">Daftar barang yang disupply</p>

          {supplierData?.items && supplierData.items.length > 0 ? (
            supplierData.items.map((item, index) => (
              <div className="mb-2" key={index}>
                <p className="text text-gray-600">{`Nama Barang ${
                  index + 1
                }.`}</p>
                <p className="font-bold">{item.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">
              Belum ada barang yang disupply
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={handleEdit}
          className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded cursor-pointer"
        >
          Edit Supplier
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Hapus Supplier
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-center text-lg font-semibold mb-4">
              Apakah anda yakin untuk menghapus supplier ini?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
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
    </div>
  );
};

export default DetailSupplier;
