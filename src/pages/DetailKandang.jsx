import React from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import HapusKandangModal from "./HapusKandangModal";
import { useEffect } from "react";
import { deleteCage, getChickenCageById } from "../services/cages";

const DetailKandang = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const detailPages = ["edit-pic", "edit-kandang"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const { id } = useParams();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [data, setData] = useState({});

  const handleEditPic = (locationId, cageId) => {
    const newPath = location.pathname.replace("detail-kandang", "edit-pic");
    navigate(`${newPath}/${locationId}/${cageId}`);
  };

  const handleEditKandang = (cageId) => {
    const newPath = location.pathname.replace("detail-kandang", "edit-kandang");
    navigate(`${newPath}/${cageId}`);
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await deleteCage(data.cage.id);
      console.log("deleteResponse: ", deleteResponse);
      if (deleteResponse.status == 204) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
    setShowDeleteModal(false);
  };

  const fetchDetailKandang = async () => {
    try {
      const detailResponse = await getChickenCageById(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        setData(detailResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDetailKandang();
  }, []);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Informasi Ayam */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-bold mb-4">Informasi ayam dalam kandang</h2>
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <p className="text-sm text-gray-500">ID Batch</p>
            <p className="font-semibold">{data.batchId ? data.batchId : "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kategori ayam</p>
            <p className="font-bold">
              {data.chickenCategory ? data.chickenCategory : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Usia ayam (Minggu)</p>
            <p className="font-bold">{data.chickenAge}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jumlah ayam dalam kandang</p>
            <p className="font-bold">{data.totalChicken}</p>
          </div>
        </div>
      </div>

      {/* Detail Kandang */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-bold mb-4">Detail Kandang</h2>
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <p className="text-sm text-gray-500">Nama Kandang</p>
            <p className="font-bold">
              {data?.cage?.name ? data?.cage?.name : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jenis Kandang</p>
            <p className="font-bold">{`Kandang ${
              data?.cage?.chickenCategory ? data?.cage?.chickenCategory : "-"
            }`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lokasi Kandang</p>
            <p className="font-bold">
              {data?.cage?.location?.name ? data?.cage?.location?.name : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kapasitas Maksimum</p>
            <p className="font-bold">
              {data?.cage?.capacity ? data?.cage?.capacity : "-"}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              handleEditKandang(data.cage.id);
            }}
            className="bg-green-700 hover:bg-green-900 hover:cursor-pointer text-white px-4 py-2 rounded"
          >
            Edit Kandang
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(true);
            }}
            className="bg-red-500 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded"
          >
            Hapus Kandang
          </button>
        </div>
      </div>

      {/* PIC */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-bold mb-4">PIC</h2>
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <p className="text-sm text-gray-500">PIC Ayam</p>
            <p className="font-bold">
              {data.chickenPic ? data.chickenPic : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">PIC Telur</p>
            <p className="font-bold">{data.eggPic ? data.eggPic : "-"}</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              handleEditPic(data.cage.location.id, data.cage.id);
              console.log("data.cage.location.id: ", data.cage.location.id);
            }}
            className="bg-green-700 hover:bg-green-900 hover:cursor-pointer text-white px-4 py-2 rounded"
          >
            Edit PIC
          </button>
        </div>
      </div>

      <HapusKandangModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
      <button
        onClick={() => {
          console.log("data: ", data);
        }}
      >
        Check
      </button>
    </div>
  );
};

export default DetailKandang;
