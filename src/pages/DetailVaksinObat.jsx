import { AlertTriangle } from "lucide-react";
import React from "react";
import { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  deleteChickenHealthMonitoring,
  getChickenHealthMonitoringsDetails,
} from "../services/chickenMonitorings";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";

const DetailVaksinObat = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const detailPages = ["input-vaksin-&-obat"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const [chickenCage, setChickenCage] = useState();
  const [chickenHealthMonitorings, setChickenHealthMonitorings] = useState();

  const [deleteItem, setDeleteItem] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const inputHandle = () => {
    const newPath = location.pathname.replace(
      "detail-vaksin-&-obat",
      "input-vaksin-&-obat"
    );
    navigate(newPath);
  };

  const fetchDetailVaksinObat = async () => {
    try {
      const detailResponse = await getChickenHealthMonitoringsDetails(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        setChickenCage(detailResponse.data.data.chickenCage);
        setChickenHealthMonitorings(
          detailResponse.data.data.chickenHealthMonitorings
        );
        console.log(
          "detailResponse.data.data.chickenHealthMonitorings: ",
          detailResponse.data.data.chickenHealthMonitorings
        );
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const editHealthHandle = (monitoringId) => {
    const tempPath = location.pathname.replace(
      "detail-vaksin-&-obat",
      "input-vaksin-&-obat"
    );
    const newPath = `${tempPath}/${monitoringId}`;
    navigate(newPath);
  };

  const deleteHealthHandle = async () => {
    const payload = {
      healthItemName: deleteItem.healthItemName,
      chickenCageId: parseInt(id),
      type: deleteItem.type,
      dose: deleteItem.dose,
      unit: deleteItem.dose,
    };

    try {
      const deleteResponse = await deleteChickenHealthMonitoring(
        payload,
        deleteItem.id
      );
      if (deleteResponse.status == 204) {
        fetchDetailVaksinObat();
        setDeleteItem("");
      }
    } catch (error) {
      console.log("error :", error);
      setDeleteItem("");
    } finally {
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    fetchDetailVaksinObat();

    if (location?.state?.refetch) {
      fetchDetailVaksinObat();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Informasi Ayam */}
      <div className="border border-black-6 rounded p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">Informasi ayam saat ini</h2>
        <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
          <div>
            <p className="text-gray-600">ID Ayam</p>
            <p className="font-bold">{chickenCage?.batchId}</p>
          </div>
          <div>
            <p className="text-gray-600">Usia ayam (Minggu)</p>
            <p className="font-bold">{chickenCage?.chickenAge}</p>
          </div>
          <div>
            <p className="text-gray-600">Kategori ayam</p>
            <p className="font-bold">{chickenCage?.cage?.chickenCategory}</p>
          </div>
          <div>
            <p className="text-gray-600">Lokasi Kandang</p>
            <p className="font-bold">{chickenCage?.cage?.location?.name}</p>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 flex items-center rounded">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span>
          Lakukan vaksin DOC, umur ayam sudah mencapai ketentuan vaksin
        </span>
      </div>

      {/* Riwayat Vaksin & Obat */}
      <div className="bg-white border border-black-6 rounded">
        <div className="flex justify-between items-center px-6 pt-6">
          <h3 className="text-xl font-bold">Riwayat Vaksin & Obat</h3>
          <button
            onClick={inputHandle}
            className="bg-orange-400 hover:bg-orange-500 text-black text-sm font-semibold py-2 px-4 rounded cursor-pointer"
          >
            + Input Data Vaksin/obat
          </button>
        </div>
        <div className="overflow-x-auto px-6 py-4">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="py-2 px-4">Tanggal</th>
                <th className="py-2 px-4">Kategori ayam</th>
                <th className="py-2 px-4">Usia (minggu)</th>
                <th className="py-2 px-4">Jenis</th>
                <th className="py-2 px-4">Nama Vaksin / Obat</th>
                <th className="py-2 px-4">Dosis</th>
                <th className="py-2 px-4">Penyakit</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {chickenHealthMonitorings?.map((row, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-black-3 transition-all"
                >
                  <td className="py-2 px-4">
                    {row.createdAt == "" ? "-" : row.createdAt}
                  </td>
                  <td className="py-2 px-4">{row.chickenCategory}</td>
                  <td className="py-2 px-4">{row.chickenAge}</td>
                  <td className="py-2 px-4">{row.type}</td>
                  <td className="py-2 px-4">{row.healthItemName}</td>
                  <td className="py-2 px-4">{`${row.dose} ${row.unit}`}</td>
                  <td className="py-2 px-4">
                    {row.disease == "" ? "-" : row.disease}
                  </td>
                  <td className="py-2 px-4 flex items-center space-x-2">
                    <button>
                      <MdEdit
                        onClick={() => {
                          editHealthHandle(row.id);
                        }}
                        size={28}
                        className="text-gray-700 hover:text-black cursor-pointer"
                      />
                    </button>
                    <button>
                      <MdDelete
                        onClick={() => {
                          setDeleteItem(row);
                          setShowDeleteModal(true);
                        }}
                        size={28}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Pagination Dummy */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <p>Menampilkan 1–5 dari 10 riwayat</p>
            <div className="space-x-2">
              <button
                disabled
                className="bg-gray-200 text-gray-400 px-4 py-3 rounded cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button className="bg-green-700 text-white px-4 py-3 rounded hover:bg-green-900 cursor-pointer">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/15 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg relative">
            <div className="flex flex-col items-center text-center gap-4">
              <Trash2 size={48} />
              <h2 className="text-lg font-semibold">
                Apakah anda yakin untuk menghapus data ini?
              </h2>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded w-full hover:bg-gray-400 text-black cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={deleteHealthHandle}
                  className="bg-red-500 px-4 py-2 rounded w-full hover:bg-red-600 text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => {
          console.log("chickenCage: ", chickenCage);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default DetailVaksinObat;
