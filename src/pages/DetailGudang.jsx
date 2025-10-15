import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteWarehouse, getWarehousesDetail } from "../services/warehouses";
import TambahPekerjaModal from "../components/TambahPekerjaModal";
import { getRoles } from "../services/roles";
import { getListUser } from "../services/user";
import { Warehouse } from "lucide-react";
import {
  createWarehousePlacement,
  deleteWarehousePlacementById,
} from "../services/placement";

const DetailGudang = () => {
  const { id, locationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [gudang, SetGudang] = useState({});

  const [showTambahPegawaiModal, setShowTambahPegawaiModal] = useState(false);
  const [showDeleteGudangModal, setShowDeleteGudangModal] = useState(false);

  const [employeeOptions, setEmployeeOptions] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const [employees, setEmployees] = useState([]);

  const detailPages = ["profile"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const handleEditGudang = () => {
    const newPath = location.pathname.replace("detail-gudang", "tambah-gudang");
    navigate(newPath);
  };

  const handleDeleteGudang = async () => {
    try {
      const deleteResponse = await deleteWarehouse(id);
      if (deleteResponse.status === 204) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleViewProfile = (empId) => {
    navigate(`${location.pathname}/profile/${empId}`);
  };

  const handleDeleteEmployee = async (userId) => {
    try {
      const deleteEmployeeResponse = await deleteWarehousePlacementById(
        id,
        userId
      );
      // console.log("deleteEmployeeResponse: ", deleteEmployeeResponse);
      if (deleteEmployeeResponse.status === 204) {
        alert(`✅Pegawai Berhasil dihapus`);
        fetchDetailData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDetailData = async () => {
    try {
      const detailResponse = await getWarehousesDetail(id);
      console.log("detailResponse: ", detailResponse);
      if (detailResponse.status === 200) {
        SetGudang(detailResponse.data.data);
        setEmployees(detailResponse.data.data.users);
        // console.log("detailResponse.data.data: ", detailResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesResponse = await getRoles();
      if (rolesResponse.status == 200) {
        // console.log("rolesResponse.data.data: ", rolesResponse.data.data);
        const allRoles = rolesResponse.data.data;
        const filterRoles = allRoles.filter(
          (role) => role.name === "Pekerja Gudang"
        );
        setRoles(filterRoles);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeeOptionsResponse = await getListUser(
        selectedRole,
        locationId
      );
      // console.log("employeeOptionsResponse: ", employeeOptionsResponse);
      if (employeeOptionsResponse.status) {
        setEmployeeOptions(employeeOptionsResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleAddPegawai = async () => {
    // alert("pegawai added");
    const payload = {
      userId: selectedEmployee,
      warehouseId: parseInt(id),
    };
    console.log("payload: ", payload);

    try {
      const addPegawairesponse = await createWarehousePlacement(payload);
      console.log("addPegawairesponse: ", addPegawairesponse);
      if (addPegawairesponse.status === 201) {
        setShowTambahPegawaiModal(false);
        fetchDetailData();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchDetailData();
    fetchRoles();
    fetchEmployees();
  }, [selectedRole]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Detail Gudang */}
      <div className="border p-4 rounded">
        <h2 className="font-bold text-lg mb-4">Detail Gudang</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm">Nama Gudang</p>
            <p className="font-bold">{gudang?.name}</p>
          </div>
          <div>
            <p className="text-sm">Lokasi Gudang</p>
            <p className="font-bold">{gudang?.location?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded"
            onClick={handleEditGudang}
          >
            Edit Gudang
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded"
            onClick={() => {
              setShowDeleteGudangModal(true);
            }}
          >
            Hapus Gudang
          </button>
        </div>
      </div>

      {/* Pegawai */}
      <div className="border p-4 rounded">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">Pegawai</h2>
          <button
            className="bg-orange-500 hover:bg-orange-700 cursor-pointer px-4 py-2 rounded"
            onClick={() => setShowTambahPegawaiModal(true)}
          >
            + Tambahkan Pegawai
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Jabatan</th>
                <th className="px-4 py-2">Nomor Telepon</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b">
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2">{emp.role.name}</td>
                  <td className="px-4 py-2">{emp.phoneNumber}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      className="bg-green-700 hover:bg-green-900 text-white px-3 py-1 rounded"
                      onClick={() => handleViewProfile(emp.id)}
                    >
                      Lihat Profil
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 cursor-pointer text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TambahPekerjaModal
        isOpen={showTambahPegawaiModal}
        onClose={() => setShowTambahPegawaiModal(false)}
        onSave={handleAddPegawai}
        jabatanOptions={roles}
        pekerjaOptions={employeeOptions}
        selectedJabatan={selectedRole}
        setSelectedJabatan={setSelectedRole}
        selectedPekerja={selectedEmployee}
        setSelectedPekerja={setSelectedEmployee}
      />

      {showDeleteGudangModal && (
        <div className="fixed inset-0 bg-black/15 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4">Hapus Kandang</h2>
            <p className="mb-4">
              Apakah anda yakin menghapus Kandang ini dari Daftar Kandang?
            </p>

            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              <strong>⚠️ Peringatan</strong>
              <br />
              Menghapus kandang ini akan menghilangkan dan menghapus data
              kandang, ayam, dan telur dari semua tabel terkait. Tindakan ini
              tidak dapat dipulihkan.
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteGudangModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // Call your delete logic here
                  //   alert("Deleting gudang…");
                  handleDeleteGudang();
                  setShowDeleteGudangModal(false);
                }}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white flex items-center gap-1 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                  />
                </svg>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailGudang;
