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
    navigate(`${location.pathname}/detail-absensi`);
  };

  const detailPenyelesaianPekerjaan = (userId) => {
    navigate(`${location.pathname}/detail-penyelesaian-pekerjaan/${userId}`);
  };

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <MonthYearSelector
          month={month}
          year={year}
          setMonth={setMonth}
          setMonthName={setMonthName}
          setYear={setYear}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-2/8">
          <div className="w-full rounded-[4px] border border-black-6 flex flex-col items-center px-4 mb-4">
            <img
              className="mt-[30px] w-[125px] h-[125px] rounded-full mb-4"
              src={photoProfile}
            />
            <h1 className="text-lg font-bold">{userData.name}</h1>
            <div className="flex gap-3 mb-4">
              <p className="text-base">ID: </p>
              <p className="text-base">{userData.id} </p>
            </div>
            <div className="flex justify-between w-full px-4 mb-2"></div>
            <div className="flex justify-between w-full px-4 mb-2">
              <div>
                <p className="text-base font-medium">Username </p>
              </div>
              <div>
                <p className=" text-base text-[#565656] break-words text-right">
                  {userData?.username}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full px-4 mb-2">
              <div>
                <p className="text-base font-medium">Email </p>
              </div>
              <div>
                <p className=" text-base text-[#565656] break-words text-right">
                  {userData?.email}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full px-4 mb-2">
              <div>
                <p className="text-base font-medium">Nomor Telepon </p>
              </div>
              <div>
                <p className="max-w-60 text-base text-[#565656] break-words text-right">
                  {userData?.phoneNumber}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full px-4 mb-2">
              <div>
                <p className="text-base font-medium">Alamat Tinggal </p>
              </div>
              <div>
                <p className="max-w-60 text-base text-[#565656] break-words text-right">
                  {userData?.address}{" "}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full px-4 mb-8">
              <div>
                <p className="text-base font-medium">Bergabung </p>
              </div>
              <div>
                <p className="max-w-60 text-base text-[#565656] break-words text-right">
                  {userData?.createdAt}{" "}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full py-8 rounded-[4px] border border-black-6 flex flex-col items-center px-4">
            <div className="flex justify-between w-full px-4 mb-2">
              <div>
                <p className="text-base font-medium">Jabatan </p>
              </div>
              <div>
                <p className="text-base text-[#565656]">
                  {userData.role?.name}{" "}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full px-4 mb-2">
              <div>
                <p className="text-base font-medium">Site </p>
              </div>
              <div>
                <p className="max-w-60 text-base text-[#565656] break-words text-right">
                  {userData?.location?.name}{" "}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full px-4 ">
              <div>
                <p className="text-base font-medium">PIC </p>
              </div>
              <div>
                {userPlacements.map((item) => (
                  <p className="max-w-90text-base text-[#565656] break-words text-right">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 w-full">
            <div className="flex mt-2 w-full gap-3">
              {mode === "StaffDetail" && (
                <>
                  <button
                    onClick={handleEditPegawai}
                    className="w-full rounded-[4px] cursor-pointer h-[40px] bg-orange-200 hover:bg-orange-500 flex items-center justify-center"
                  >
                    <div className="flex gap-4">
                      <RiEdit2Fill size={24} />
                      <p className="text-lg font-medium">Edit Pegawai</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowDelete(true)}
                    className="w-full rounded-[4px] h-[40px] bg-red-600 text-red-100 hover:bg-red-300 cursor-pointer hover:text-white flex items-center justify-center gap-2"
                  >
                    <RiDeleteBin6Line size={20} />
                    <span className="text-lg font-medium">Hapus Pegawai</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              console.log("myData: ", userData);
              console.log("userInformation: ", userInformation);
              console.log("userPresenceInformation: ", userPresenceInformation);
              console.log("userSalaryInformation: ", userSalaryInformation);
              console.log("kpiPerformances: ", kpiPerformances);
              console.log("userData: ", userData);
              console.log("userPlacements: ", userPlacements);
            }}
          >
            CHECK
          </button>
        </div>

        {showSection && (
          <div className="w-6/8">
            <div className="bg-white p-6 rounded border border-black-6 w-full mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Catatan Kinerja
              </h2>
              <div className="bg-amber-100/60 p-4 rounded-lg">
                <p className="text-gray-700">{note}</p>
              </div>
            </div>
            <div className="flex md:grid-cols-2 gap-4 justify-between">
              <div className="p-4 w-full rounded-md bg-green-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Total jam kerja</h2>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="p-2 rounded-xl bg-green-700">
                    <FaClock size={24} color="white" />
                  </div>
                  <div className="flex items-center">
                    <p className="text-3xl font-semibold me-3">
                      {userInformation?.totalWorkHour != null
                        ? new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(Number(userInformation?.totalWorkHour))
                        : "-"}
                    </p>
                    <p className="text-lg font-semibold">jam</p>
                  </div>
                </div>
              </div>
              <div className="p-4 w-full rounded-md bg-green-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Skor KPI</h2>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="p-2 rounded-xl bg-green-700">
                      <FaChartLine size={24} color="white" />
                    </div>
                    <div className="flex items-center">
                      <p className="text-3xl font-semibold pe-2">
                        {userInformation?.workKpiScore != null
                          ? new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(Number(userInformation?.workKpiScore))
                          : "-"}
                      </p>
                      <p className="text-xl font-semibold">%</p>
                    </div>
                  </div>
                </div>
              </div>
              {userData?.role?.name == "Pekerja Kandang" && (
                <div className="p-4 w-full rounded-md bg-green-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Skor KPI Ayam</h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="p-2 rounded-xl bg-green-700">
                        <FaChartLine size={24} color="white" />
                      </div>
                      <div className="flex items-center">
                        <p className="text-3xl font-semibold pe-2">
                          {userInformation?.chickenKpiScore}
                        </p>
                        <p className="text-xl font-semibold">%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border border-black-6 bg-white rounded-md mt-4 ">
              <h2 className="text-lg font-semibold mb-4">Performa KPI</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ResponsiveContainer width="100%" height={300}>
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
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="bg-white flex-1 p-4 border border-black-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Total Presensi</h2>
                  <button
                    onClick={detailAbsensiHandle}
                    className="px-4 py-2 rounded-[4px] bg-orange-400 hover:bg-orange-600 cursor-pointer"
                  >
                    Detail
                  </button>
                </div>
                <div className="flex w-full gap-4 px-4 justify-center">
                  <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex flex-col items-center">
                        <p className="text-[40px] font-bold">
                          {userPresenceInformation?.totalPresent}
                        </p>
                        <p className="text-xl">Kali</p>
                      </div>
                      <div className="rounded-[4px] bg-[#87FF8B] flex items-center">
                        <p className="w-full text-center px-3">Hadir</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex flex-col items-center">
                        <p className="text-[40px] font-bold">
                          {userPresenceInformation?.totalNotPresent}
                        </p>
                        <p className="text-xl">Kali</p>
                      </div>
                      <div className="rounded-[4px] bg-[#FF5E5E] flex items-center">
                        <p className="w-full text-center px-3">Tidak Hadir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white flex-1 p-4 border border-black-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Penyelesaian Tugas</h2>
                  <button
                    onClick={() => {
                      detailPenyelesaianPekerjaan(userData.id);
                    }}
                    className="px-4 py-2 rounded-[4px] bg-orange-400 hover:bg-orange-600 cursor-pointer"
                  >
                    Detail
                  </button>
                </div>
                <div className="flex w-full gap-4 px-4 justify-center">
                  <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex flex-col items-center">
                        <p className="text-[40px] font-bold">
                          {userWorkInformation?.totalWorkDone}
                        </p>
                        <p className="text-xl">Tugas</p>
                      </div>
                      <div className="rounded-[4px] bg-[#87FF8B] flex items-center">
                        <p className="w-full text-center px-3">Selesai</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-black-6 rounded-[4px] bg-white shadow-lg px-[32px] py-[18px]">
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex flex-col items-center">
                        <p className="text-[40px] font-bold">
                          {" "}
                          {userWorkInformation?.totalWorkNotDone}
                        </p>
                        <p className="text-xl">Tugas</p>
                      </div>
                      <div className="rounded-[4px] bg-[#FF5E5E] flex items-center">
                        <p className="w-full text-center px-3">Tidak Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border border-black-6 mt-4 rounded-[4px] w-full bg-white">
              <h2 className="text-lg font-semibold mb-4">Rincian gaji</h2>
              <div className="space-y-2 text-sm">
                {userSalaryInformation?.baseSalary && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Gaji Pokok</span>
                    <span>
                      {formatRupiah(userSalaryInformation?.baseSalary)}
                    </span>
                  </div>
                )}

                {userSalaryInformation?.additionalWorkSalary != 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Gaji Pekerjaaan Tambahan</span>
                    <span>
                      {formatRupiah(
                        userSalaryInformation?.additionalWorkSalary
                      )}
                    </span>
                  </div>
                )}

                {userSalaryInformation?.bonusSalary && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Bonus</span>
                    <span>
                      {formatRupiah(userSalaryInformation?.bonusSalary)}
                    </span>
                  </div>
                )}

                {userSalaryInformation?.compentationSalary != 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Kompensasi</span>
                    <span>
                      {formatRupiah(userSalaryInformation?.compentationSalary)}
                    </span>
                  </div>
                )}

                {(userSalaryInformation?.cashBond ?? 0) !== 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Kasbon</span>
                    <span className="font-semibold text-red-600">
                      -{formatRupiah(userSalaryInformation.cashBond)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold pt-2">
                  <span>Total</span>
                  <span>
                    {formatRupiah(userSalaryInformation?.totalSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => !isDeleting && setShowDelete(false)}
          />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-1">Hapus Pegawai?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pegawai <span className="font-medium">{userData?.name}</span> akan
              dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-200 disabled:opacity-60 cursor-pointer"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
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
