import React from "react";
import { useEffect } from "react";
import { getListStaff } from "../services/staff";
import { useState } from "react";
import { RiDeleteBin6Line, RiEdit2Fill } from "react-icons/ri";
import {
  FaChartLine,
  FaClock,
  FaLocationDot,
  FaMoneyBillWave,
} from "react-icons/fa6";
import { GiBirdCage, GiChicken } from "react-icons/gi";
import { PiCalendarBlank } from "react-icons/pi";
import { LuWheat } from "react-icons/lu";
import { MdEgg } from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiMaximize2 } from "react-icons/fi";
import { formatRupiah } from "../utils/moneyFormat";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { getListUser, getOverviewUser, getUserById } from "../services/user";
import MonthYearSelector from "../components/MonthYearSelector";
import { deleteAccount } from "../services/authServices";

const Profile = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const photoProfile = localStorage.getItem("photoProfile");
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("role");
  const userId = mode == "MyProfile" ? localStorage.getItem("userId") : id;
  const [note, setNote] = useState("Lebih di perhatikan kesehatan ayamnya ya!");

  const [userInformation, setUserInformation] = useState([]);
  const [userPresenceInformation, setUserPresenceInformation] = useState([]);
  const [userSalaryInformation, setUserSalaryInformation] = useState([]);
  const [userWorkInformation, setUserWorkInformation] = useState([]);
  const [kpiPerformances, setKpiPerformances] = useState([]);

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showSection =
    mode === "StaffDetail" || (mode === "MyProfile" && userRole !== "Owner");

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthName, setMonthName] = useState(
    new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date())
  );
  const detailPages = [
    "tambah-pegawai",
    "detail-absensi",
    "detail-penyelesaian-pekerjaan",
  ];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const [userData, setUserData] = useState([]);
  const [userPlacements, setUserPlacements] = useState([]);

  const fetchOverviewData = async () => {
    try {
      // console.log("monthName: ", monthName);
      const overviewResponse = await getOverviewUser(userId, year, monthName);
      // console.log("overviewResponse: ", overviewResponse);
      if (overviewResponse.status == 200) {
        const data = overviewResponse.data.data;
        setUserInformation(data.userInformation);
        setUserPresenceInformation(data.userPresenceInformation);
        setUserSalaryInformation(data.userSalaryInformation);
        setUserWorkInformation(data.userWorkInformation);
        setKpiPerformances(data.kpiPerformances);
        setUserData(data.user);
        setUserPlacements(data.placements);
        console.log("data.placements: ", data.placements);
      }
    } catch (error) {
      alert(
        "❌ Detail kinerja pengguna tidak ditemukan untuk bulan yang dipilih!"
      );
      console.log("error :", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const deleteResponse = await deleteAccount(id);
      console.log("deleteResponse: ", deleteResponse);
      if (deleteResponse.status == 204) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleEditPegawai = () => {
    const newPath = location?.pathname.replace("profile", "tambah-pegawai");
    navigate(newPath);
  };

  useEffect(() => {
    // fetchMyData();
    fetchOverviewData();
  }, [userId, year, month]);

  const detailAbsensiHandle = () => {
    navigate(`${location.pathname}/detail-absensi/${userId}`);
  };

  const detailPenyelesaianPekerjaan = (userId) => {
    navigate(`${location.pathname}/detail-penyelesaian-pekerjaan/${userId}`);
  };

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-3 py-3 gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <MonthYearSelector
          month={month}
          year={year}
          setMonth={setMonth}
          setMonthName={setMonthName}
          setYear={setYear}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* LEFT COLUMN */}
        <div className="w-full md:w-2/6 flex flex-col gap-4">
          {/* Profile Card */}
          <div className="w-full rounded-md border border-gray-300 flex flex-col items-center px-4 py-5">
            <img
              className="w-[100px] sm:w-[125px] h-[100px] sm:h-[125px] rounded-full mb-3"
              src={photoProfile}
              alt="Profile"
            />
            <h1 className="text-lg font-bold text-center">{userData.name}</h1>

            <div className="text-sm sm:text-base w-full space-y-2 mt-3">
              <div className="flex justify-between px-3">
                <p>ID:</p>
                <p>{userData.id}</p>
              </div>
              <div className="flex justify-between px-3">
                <p className="font-medium">Username</p>
                <p className="text-gray-600 text-right break-words">
                  {userData.username}
                </p>
              </div>
              <div className="flex justify-between px-3">
                <p className="font-medium">Email</p>
                <p className="text-gray-600 text-right break-words">
                  {userData.email}
                </p>
              </div>
              <div className="flex justify-between px-3">
                <p className="font-medium">Nomor Telepon</p>
                <p className="max-w-[150px] text-gray-600 text-right break-words">
                  {userData.phoneNumber}
                </p>
              </div>
              <div className="flex justify-between px-3">
                <p className="font-medium">Alamat</p>
                <p className="max-w-[150px] text-gray-600 text-right break-words">
                  {userData.address}
                </p>
              </div>
              <div className="flex justify-between px-3">
                <p className="font-medium">Bergabung</p>
                <p className="text-gray-600">{userData.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Role & Site */}
          <div className="w-full py-5 rounded-md border border-gray-300 flex flex-col items-center px-4">
            <div className="flex justify-between w-full px-3 mb-2">
              <p className="font-medium">Jabatan</p>
              <p className="text-gray-600">{userData.role?.name}</p>
            </div>
            <div className="flex justify-between w-full px-3 mb-2">
              <p className="font-medium">Site</p>
              <p className="text-gray-600 text-right">
                {userData.location?.name}
              </p>
            </div>
            <div className="flex justify-between w-full px-3">
              <p className="font-medium">PIC</p>
              <div className="text-gray-600 text-right">
                {userPlacements.map((item, i) => (
                  <p key={i} className="break-words">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {mode === "StaffDetail" && (
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button
                onClick={handleEditPegawai}
                className="flex items-center justify-center gap-2 px-4 py-2 
              rounded-md cursor-pointer 
              bg-orange-200 hover:bg-orange-500 w-full sm:w-auto"
              >
                <RiEdit2Fill size={20} />
                <span className="text-base sm:text-lg font-medium">
                  Edit Pegawai
                </span>
              </button>

              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 
              rounded-md cursor-pointer 
              bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
              >
                <RiDeleteBin6Line size={20} />
                <span className="text-base sm:text-lg font-medium">
                  Hapus Pegawai
                </span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        {showSection && (
          <div className="w-full md:w-4/6 flex flex-col gap-4">
            {/* Catatan Kinerja */}
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                Catatan Kinerja
              </h2>
              <div className="bg-amber-100/60 p-3 rounded-lg">
                <p className="text-gray-700 text-sm sm:text-base">{note}</p>
              </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Total Jam Kerja */}
              <div className="p-4 rounded-md bg-green-100">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Total Jam Kerja</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-700">
                    <FaClock size={24} color="white" />
                  </div>
                  <p className="text-3xl font-semibold">
                    {userInformation?.totalWorkHour ?? "-"}
                    <span className="text-lg ml-1">jam</span>
                  </p>
                </div>
              </div>

              {/* KPI Skor */}
              <div className="p-4 rounded-md bg-green-100">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Skor KPI</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-700">
                    <FaChartLine size={24} color="white" />
                  </div>
                  <p className="text-3xl font-semibold">
                    {userInformation?.workKpiScore ?? "-"}
                    <span className="text-lg ml-1">%</span>
                  </p>
                </div>
              </div>

              {/* KPI Ayam (conditional) */}
              {userData?.role?.name === "Pekerja Kandang" && (
                <div className="p-4 rounded-md bg-green-100">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Skor KPI Ayam</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-700">
                      <FaChartLine size={24} color="white" />
                    </div>
                    <p className="text-3xl font-semibold">
                      {userInformation?.chickenKpiScore ?? "-"}
                      <span className="text-lg ml-1">%</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="p-4 border border-gray-300 bg-white rounded-md">
              <h2 className="text-lg font-semibold mb-3">Performa KPI</h2>

              {/* Scrollable container */}
              <div className="w-full overflow-x-auto">
                {/* Inner wrapper with minimum width to trigger scroll */}
                <div className="min-w-[600px]">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={kpiPerformances}>
                      <XAxis dataKey="key" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="workKpiScore"
                        stroke="#FF0000"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="chickenKpiScore"
                        stroke="#FFD700"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* PRESENSI & TUGAS */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Presensi */}
              <div className="bg-white flex-1 p-4 border border-gray-300 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Total Presensi</h2>
                  <button
                    onClick={detailAbsensiHandle}
                    className="px-4 py-2 rounded-md bg-orange-400 hover:bg-orange-600 text-black text-sm"
                  >
                    Detail
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <div className="border border-gray-300 rounded-md bg-white shadow px-6 py-4 flex-1">
                    <div className="flex flex-col items-center">
                      <p className="text-[36px] font-bold">
                        {userPresenceInformation?.totalPresent}
                      </p>
                      <p className="text-base">Kali</p>
                      <div className="rounded bg-[#87FF8B] px-3 mt-2">
                        <p className="text-center">Hadir</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-300 rounded-md bg-white shadow px-6 py-4 flex-1">
                    <div className="flex flex-col items-center">
                      <p className="text-[36px] font-bold">
                        {userPresenceInformation?.totalNotPresent}
                      </p>
                      <p className="text-base">Kali</p>
                      <div className="rounded bg-[#FF5E5E] px-3 mt-2">
                        <p className="text-center text-kritis-text-color">
                          Tidak Hadir
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Penyelesaian Tugas */}
              <div className="bg-white flex-1 p-4 border border-gray-300 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Penyelesaian Tugas</h2>
                  <button
                    onClick={() => detailPenyelesaianPekerjaan(userData.id)}
                    className="px-4 py-2 rounded-md bg-orange-400 hover:bg-orange-600 text-black text-sm"
                  >
                    Detail
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <div className="border border-gray-300 rounded-md bg-white shadow px-6 py-4 flex-1">
                    <div className="flex flex-col items-center">
                      <p className="text-[36px] font-bold">
                        {userWorkInformation?.totalWorkDone}
                      </p>
                      <p className="text-base">Tugas</p>
                      <div className="rounded bg-[#87FF8B] px-3 mt-2">
                        <p className="text-center">Selesai</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-300 rounded-md bg-white shadow px-6 py-4 flex-1">
                    <div className="flex flex-col items-center">
                      <p className="text-[36px] font-bold">
                        {userWorkInformation?.totalWorkNotDone}
                      </p>
                      <p className="text-base">Tugas</p>
                      <div className="rounded bg-[#FF5E5E] px-3 mt-2">
                        <p className="text-center text-kritis-text-color">Tidak Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaji */}
            <div className="p-4 border border-gray-300 mt-4 rounded-md bg-white">
              <h2 className="text-lg font-semibold mb-3">Rincian Gaji</h2>
              <div className="space-y-2 text-sm sm:text-base">
                {userSalaryInformation?.baseSalary && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Gaji Pokok</span>
                    <span>
                      {formatRupiah(userSalaryInformation.baseSalary)}
                    </span>
                  </div>
                )}
                {userSalaryInformation?.additionalWorkSalary !== 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Gaji Tambahan</span>
                    <span>
                      {formatRupiah(userSalaryInformation.additionalWorkSalary)}
                    </span>
                  </div>
                )}
                {userSalaryInformation?.bonusSalary && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Bonus</span>
                    <span>
                      {formatRupiah(userSalaryInformation.bonusSalary)}
                    </span>
                  </div>
                )}
                {userSalaryInformation?.compentationSalary !== 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Kompensasi</span>
                    <span>
                      {formatRupiah(userSalaryInformation.compentationSalary)}
                    </span>
                  </div>
                )}
                {(userSalaryInformation?.cashBond ?? 0) !== 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Kasbon</span>
                    <span className="text-red-600 font-semibold">
                      -{formatRupiah(userSalaryInformation.cashBond)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2">
                  <span>Total</span>
                  <span>{formatRupiah(userSalaryInformation.totalSalary)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => !isDeleting && setShowDelete(false)}
          />
          <div className="relative w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-1">Hapus Pegawai?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pegawai <span className="font-medium">{userData?.name}</span> akan
              dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-200 disabled:opacity-60"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
