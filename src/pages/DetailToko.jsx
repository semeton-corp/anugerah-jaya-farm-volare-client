import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import { deleteStore, getStoreDetail } from "../services/stores";
import TambahPekerjaModal from "../components/TambahPekerjaModal";
import {
  createStorePlacement,
  deleteStorePlacementById,
} from "../services/placement";
import { getRoles } from "../services/roles";
import { getListUser } from "../services/user";

const DetailToko = () => {
  const { id, locationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [toko, setToko] = useState({});
  const [employees, setEmployees] = useState([]);

  const [showTambahPegawaiModal, setShowTambahPegawaiModal] = useState(false);
  const [showDeleteGudangModal, setShowDeleteTokoModal] = useState(false);

  const [employeeOptions, setEmployeeOptions] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const detailPages = ["profil"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const handleEditToko = () => {
    const newPath = location.pathname.replace("detail-toko", "tambah-toko");
    navigate(newPath);
  };

  const fetchRoles = async () => {
    try {
      const rolesResponse = await getRoles();
      if (rolesResponse.status == 200) {
        // console.log("rolesResponse.data.data: ", rolesResponse.data.data);
        const allRoles = rolesResponse.data.data;
        const filterRoles = allRoles.filter(
          (role) => role.name === "Pekerja Toko"
        );
        setRoles(filterRoles);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };
  const handleDeleteToko = async () => {
    try {
      const deleteResponse = await deleteStore(id);
      // console.log("deleteResponse: ", deleteResponse);
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
      const deleteEmployeeResponse = await deleteStorePlacementById(userId);
      if (deleteEmployeeResponse.status === 204) {
        alert(`✅Pegawai Berhasil dihapus`);
        fetchTokoDetail();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchTokoDetail = async () => {
    try {
      const res = await getStoreDetail(id);
      console.log("res: ", res);
      if (res.status === 200) {
        setToko(res.data.data);
        setEmployees(res.data.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPegawai = async () => {
    // alert("pegawai added");
    const payload = {
      userId: selectedEmployee,
      storeId: parseInt(id),
    };
    // console.log("payload: ", payload);

    try {
      const addPegawairesponse = await createStorePlacement(payload);
      console.log("addPegawairesponse: ", addPegawairesponse);
      if (addPegawairesponse.status === 201) {
        setShowTambahPegawaiModal(false);
        fetchTokoDetail();
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchEmployees = async () => {
    if (!selectedRole) {
      setEmployeeOptions([]);
      return;
    }
    try {
      const employeeOptionsResponse = await getListUser(
        selectedRole,
        locationId
      );
      //   console.log("employeeResponse: ", employeeResponse.data.data.users);
      if (employeeOptionsResponse.status) {
        setEmployeeOptions(employeeOptionsResponse.data.data.users);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchTokoDetail();
    fetchRoles();
    fetchEmployees();
  }, [selectedRole]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Detail Toko */}
      <div className="border p-4 rounded">
        <h2 className="font-bold text-lg mb-4">Detail Toko</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm">Nama Toko</p>
            <p className="font-bold">{toko?.name}</p>
          </div>
          <div>
            <p className="text-sm">Lokasi Toko</p>
            <p className="font-bold">{toko?.location?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded"
            onClick={handleEditToko}
          >
            Edit Toko
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={() => {
              setShowDeleteTokoModal(true);
            }}
          >
            Hapus Toko
          </button>
        </div>
      </div>

      {/* Pegawai */}
      <div className="border p-4 rounded">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">Pegawai</h2>
          <button
            className="bg-orange-300 hover:bg-orange-500  px-4 py-2 rounded"
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
                  <td className="px-4 py-2">{emp.role?.name}</td>
                  <td className="px-4 py-2">{emp.phoneNumber}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-green-700 hover:bg-green-900 text-white px-3 py-1 rounded"
                      onClick={() => handleViewProfile(emp.id)}
                    >
                      Lihat Profil
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Belum ada pegawai.
                  </td>
                </tr>
              )}
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
            <h2 className="text-xl font-bold mb-4">Hapus Toko</h2>
            <p className="mb-4">
              Apakah anda yakin menghapus Toko ini dari Daftar Toko?
            </p>

            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              <strong>⚠️ Peringatan</strong>
              <br />
              Menghapus toko ini akan menghilangkan dan menghapus data toko dari
              semua tabel terkait. Tindakan ini tidak dapat dipulihkan.
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteTokoModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // Call your delete logic here
                  //   alert("Deleting gudang…");
                  handleDeleteToko();
                  setShowDeleteTokoModal(false);
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

export default DetailToko;
