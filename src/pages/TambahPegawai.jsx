import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { generatePassword } from "../utils/passwordUtils";
import { copyToClipboard } from "../utils/copy";
import { MdContentCopy } from "react-icons/md";
import { signUp } from "../services/authServices";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getStores } from "../services/stores";
import { getWarehouses } from "../services/warehouses";
import { getCage, getChickenCage } from "../services/cages";
import { useParams } from "react-router-dom";
import {
  createAdditionalWorks,
  getAdditionalWorkById,
} from "../services/dailyWorks";
import {
  translateDateToBahasa,
  formatDateToDDMMYYYY,
} from "../utils/dateFormat";
import { deleteAdditionalWorkById } from "../services/dailyWorks";
import { updateAdditionalWorkById } from "../services/dailyWorks";
import { formatRupiah, formatThousand, onlyDigits } from "../utils/moneyFormat";
import { getRoles } from "../services/roles";
import { getLocations } from "../services/location";
import { getUserById, updateUser } from "../services/user";

const TambahPegawai = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState("profil");

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const [locationOptions, setLocationOptions] = useState([
    "Sidodadi",
    "Sukamaju",
    "Karanganyar",
    "Ciputat",
  ]);
  const [locationId, setLocationId] = useState("");

  const [salaryInterval, setSalaryInterval] = useState(["Harian", "Bulanan"]);
  const [selectedSalaryInterval, setSelectedSalaryInterval] =
    useState("Harian");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [salary, setSalary] = useState("");
  const [username, setUsername] = useState("");
  const [photoProfile, setPhotoProfile] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [password, setPassword] = useState("");

  const [pics, setPics] = useState([]);
  const [selectedPic, setSelectedPic] = useState([]);

  const roleToApiMap = {
    "Pekerja Telur": getChickenCage,
    "Pekerja Kandang": getChickenCage,
    "Kepala Kandang": getWarehouses,
    "Pekerja Toko": getStores,
    "Pekerja Gudang": getWarehouses,
    Owner: getWarehouses,
    Lainnya: getWarehouses,
  };

  const getDisplay = (value) => (value === 0 ? "" : value);

  const fetchRoles = async () => {
    try {
      const rolesResponse = await getRoles();
      if (rolesResponse.status == 200) {
        console.log("rolesResponse.data.data: ", rolesResponse.data.data);
        setRoles(rolesResponse.data.data);
        if (!userId) {
          setSelectedRole(rolesResponse.data.data[0].id);
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchLocationOptions = async () => {
    try {
      const locationsResponse = await getLocations();
      // console.log("locationsResponse: ", locationsResponse);

      if (locationsResponse.status === 200) {
        const allLocations = locationsResponse.data.data;
        const role = localStorage.getItem("role");
        const locationId = parseInt(localStorage.getItem("locationId"), 10);
        console.log("allLocations: ", allLocations);
        if (role !== "Owner") {
          const filteredLocations = allLocations.filter(
            (item) => item.id === locationId
          );
          setLocationOptions(filteredLocations);
        } else {
          setLocationOptions(allLocations);
        }
      }
    } catch (error) {
      alert("Terjadi Kesalahan :", error);
    }
  };

  const fetchUserDetail = async () => {
    try {
      const userDetailResponse = await getUserById(userId);
      console.log("userDetailResponse: ", userDetailResponse);
      if (userDetailResponse.status === 200) {
        const userData = userDetailResponse.data.data;
        setName(userData.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phoneNumber || "");
        setAddress(userData.address || "");
        setUsername(userData.username || "");
        setSelectedRole(userData.role.id || "");
        setLocationId(userData.location.id || "");
        setSalary(userData.salary || 0);
        setSelectedSalaryInterval(userData.salaryInterval || "Harian");
        const placementIds = userData.placements.map((placement) =>
          placement.placeId.toString()
        );
        setSelectedPic(placementIds || []);
        setPhotoProfile(userData.photoProfile);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPics = async () => {
    if (!selectedRole || !locationId) return;

    const roleName = roles.find((r) => r.id === parseInt(selectedRole))?.name;

    const apiFn = roleToApiMap[roleName];
    if (!apiFn) {
      setPics([]);
      setSelectedPic("");
      return;
    }

    try {
      const res = await apiFn(locationId);
      console.log("pic res: ", res);
      if (res.status === 200) {
        const allData = res.data.data;
        let filteredData;
        console.log("selectedRole: ", selectedRole);
        if (selectedRole == 1) {
          filteredData = allData.filter((item) => item.eggPic == "");
        } else if (selectedRole == 2) {
          filteredData = allData.filter((item) => item.chickenPic == "");
        } else {
          filteredData = allData;
        }
        if (userId) {
          setPics(allData);
        } else {
          setPics(filteredData);
        }
      }
    } catch (err) {
      console.error(err);
      setPics([]);
      setSelectedPic("");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchLocationOptions();
    if (userId) {
      fetchUserDetail();
    }
  }, []);

  useEffect(() => {
    fetchPics();
  }, [selectedRole, locationId, roles]);

  const handleSave = async () => {
    const payload = {
      email: email,
      name: name,
      username: username,
      password: username,
      roleId: parseInt(selectedRole),
      locationId: parseInt(locationId),
      placementIds: selectedPic.map((id) => parseInt(id)),
      address: address,
      phoneNumber: phone,
      salary: salary,
      photoProfile: photoProfile,
      salaryInterval: selectedSalaryInterval,
    };
    console.log("payload: ", payload);
    if (userId) {
      try {
        const updateResponse = await updateUser(payload, userId);
        if (updateResponse.status == 200) {
          // const basePath =
          //   location.pathname.split("/tambah-pegawai")[0] + "/tambah-pegawai";
          // navigate(basePath.replace("/tambah-pegawai", ""), {
          //   state: { refetch: true },
          // });
          navigate(-1, { state: { refetch: true } });
        }
      } catch (error) {
        var customMessage =
          "❌Terjadi kesalahan dalam memperbaharui data pengguna!";
        alert(customMessage);
        console.log("error :", error);
      }
    } else {
      try {
        const signUpResponse = await signUp(payload);
        if (signUpResponse.status == 201 || signUpResponse.status == 200) {
          setShowPopup(true);
        }
      } catch (error) {
        var customMessage = "❌Terjadi kesalahan dalam membuat akun!";
        if (error.response.data.message == "email already exists") {
          customMessage =
            "❌Email sudah terdaftar, coba gunakan alamat email lain!";
        }
        console.log("error: ", error);
        alert(customMessage);
      }
    }
  };
  return (
    <div className="flex flex-col px-4 py-3 gap-4 ">
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">
          {userId ? "Edit Pegawai" : "Tambah Pegawai"}
        </h1>
      </div>

      {/* Tab Header */}
      <div className="flex border-t mb-6 items-stretch">
        <button
          className={`w-1/2 px-4 py-5 text-xl font-medium ${
            tab === "profil"
              ? "border-t-4 border-green-700 text-green-900"
              : "text-gray-500"
          }`}
          onClick={() => setTab("profil")}
        >
          Profil Pegawai
        </button>
        <button
          className={`w-1/2 px-4 py-5 text-xl font-medium ${
            tab === "gaji"
              ? "border-t-4 border-green-700 text-green-900"
              : "text-gray-500"
          }`}
          onClick={() => setTab("gaji")}
        >
          Gaji Pokok
        </button>
      </div>

      {/* Tab Content */}
      {tab === "profil" ? (
        <ProfilPegawaiForm
          roles={roles}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          setTab={setTab}
          locationId={locationId}
          setLocationId={setLocationId}
          locationOptions={locationOptions}
          pics={pics}
          selectedPic={selectedPic}
          setSelectedPic={setSelectedPic}
          username={username}
          setUsername={setUsername}
        />
      ) : (
        <GajiPokokForm
          salary={salary}
          setSalary={setSalary}
          getDisplay={getDisplay}
          onSave={handleSave}
          salaryInterval={salaryInterval}
          setSalaryInterval={setSalaryInterval}
          selectedSalaryInterval={selectedSalaryInterval}
          setSelectedSalaryInterval={setSelectedSalaryInterval}
        />
      )}
      {/* <button
        onClick={() => {
          const payload = {
            email: email,
            name: name,
            username: username,
            password: username,
            roleId: parseInt(selectedRole),
            locationId: parseInt(locationId),
            placementIds: selectedPic,
            address: address,
            phoneNumber: phone,
            salary: salary,
            salaryInterval: selectedSalaryInterval,
          };
          console.log("payload: ", payload);
          console.log("pics: ", pics);
          console.log("selectedPic: ", selectedPic);
        }}
        className="bg-green-700"
      >
        CHECK
      </button> */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 w-28 h-28 rounded-full flex items-center justify-center">
                <span className="text-green-700 text-[64px]">✔</span>
              </div>
            </div>
            <h2 className="text-center text-xl font-bold mb-2">
              Tambah Pegawai Berhasil!
            </h2>
            <p className="text-center mb-4 text-gray-600">
              Pegawai dapat masuk menggunakan email dan password default di
              bawah ini. Jangan lupa untuk segera mengubah password.
            </p>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <label className="w-32">Username:</label>
                <div className="flex items-center border border-[#606060] rounded px-3 py-2 w-full">
                  <span className="flex-grow break-all text-sm leading-none text-[#606060]">
                    {username}
                  </span>
                  <button
                    className="text-blue-600 hover:text-blue-800 cursor-pointer text-xl p-1"
                    onClick={() => copyToClipboard(username)}
                  >
                    <MdContentCopy />
                  </button>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="w-32">Password:</label>
                <div className="flex items-center border border-[#606060] rounded px-3 py-2 w-full">
                  <span className="flex-grow break-all text-sm leading-none text-[#606060]">
                    {username}
                  </span>
                  <button
                    className="text-blue-600 hover:text-blue-800 cursor-pointer text-xl p-1"
                    onClick={() => copyToClipboard(username)}
                  >
                    <MdContentCopy />
                  </button>
                </div>
              </div>
            </div>
            <button
              className="bg-green-700 hover:bg-green-900 cursor-pointer text-white w-full py-2 rounded"
              onClick={() => {
                setShowPopup(false);
                navigate(-1, { state: { refetch: true } });
              }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function ProfilPegawaiForm({
  roles,
  selectedRole,
  setSelectedRole,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  setTab,
  locationId,
  setLocationId,
  locationOptions,
  pics,
  selectedPic,
  setSelectedPic,
  username,
  setUsername,
}) {
  const { userId } = useParams();
  const [placeHolderLokasi, setPlaceHolderLokasi] = useState(
    "Pilih site lokasi gudang"
  );
  const [labelLokasi, setLabelLokasi] = useState("Lokasi Bekerja");
  const [isShowLocationIdField, setIsShowLocationIdField] = useState(true);
  const [isShowPicField, setIsShowPicField] = useState(true);

  useEffect(() => {
    const roleName = roles.find((r) => r.id === parseInt(selectedRole))?.name;
    console.log("roleName: ", roleName);

    if (!roleName) return;

    if (roleName === "Pekerja Gudang") {
      setLabelLokasi("Lokasi Gudang");
      setPlaceHolderLokasi("Pilih lokasi gudang");
      setIsShowLocationIdField(true);
      setIsShowPicField(true);
    } else if (roleName === "Kepala Kandang") {
      setIsShowLocationIdField(true);
      setIsShowPicField(false);
    } else if (roleName === "Pekerja Toko") {
      setLabelLokasi("Lokasi Toko");
      setPlaceHolderLokasi("Pilih lokasi toko");
      setIsShowLocationIdField(true);
      setIsShowPicField(true);
    } else if (roleName === "Pekerja Telur" || roleName === "Pekerja Kandang") {
      setLabelLokasi("Lokasi Kandang");
      setPlaceHolderLokasi("Pilih kandang");
      setIsShowLocationIdField(true);
      setIsShowPicField(true);
    } else if (roleName === "Owner") {
      setIsShowLocationIdField(false);
      setIsShowPicField(false);
    } else if (roleName === "Lainnya") {
      setIsShowLocationIdField(true);
      setIsShowPicField(false);
    } else {
      setIsShowLocationIdField(true);
      setIsShowPicField(true);
      setLabelLokasi("Lokasi Bekerja");
      setPlaceHolderLokasi("Pilih lokasi bekerja");
    }

    if (userId) {
      setIsShowPicField(false);
    }
  }, [selectedRole, roles]);

  return (
    <div className="border border-black-6 p-6 rounded-md shadow-sm">
      <h2 className="font-bold text-xl mb-4">Profil Pegawai</h2>

      <div className="grid gap-4 mb-4">
        <label className="mb-1">Foto Profil Pegawai</label>
        <div className="hover:bg-black-6 cursor-pointer rounded-full size-25 bg-black-8 flex justify-center items-center">
          <IoMdAdd size={24} className="text-white hover:text-black-9" />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-col">
          <label className="mb-1">Jabatan Pegawai</label>
          <select
            className="border rounded p-4 mb-3"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        {isShowLocationIdField && (
          <>
            <label className="block font-medium mb-1">{labelLokasi}</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full border rounded p-4  focus:outline-none focus:ring"
              required
            >
              <option value="text-gray-100">{placeHolderLokasi}</option>
              {locationOptions.map((lokasi, idx) => (
                <option key={idx} value={lokasi.id}>
                  {lokasi.name}
                </option>
              ))}
            </select>
          </>
        )}

        {isShowPicField && (
          <>
            <label className="mb-1">PIC</label>
            {selectedRole == 1 || selectedRole == 2 ? (
              <div className="flex flex-col gap-2 mb-3">
                {pics?.length === 0 && (
                  <span className="text-gray-400">No PICs available</span>
                )}
                {pics?.map((pic) => (
                  <label
                    key={pic.id}
                    className="inline-flex items-center gap-2 mx-8"
                  >
                    <input
                      type="checkbox"
                      value={pic?.cage?.id}
                      checked={selectedPic?.includes(String(pic?.cage?.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPic((prev) => [...prev, e.target.value]);
                        } else {
                          setSelectedPic((prev) =>
                            prev.filter((id) => id !== e.target.value)
                          );
                        }
                      }}
                      className="scale-150 mr-2 cursor-pointer accent-green-700"
                    />
                    <span className="text-lg">{pic?.cage?.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <select
                className="border rounded p-4 mb-3"
                value={selectedPic}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions).map(
                    (opt) => opt.value
                  );
                  setSelectedPic(options);
                }}
              >
                <option value="">
                  <p className="text-gray-200">Pilih lokasi pic...</p>
                </option>
                {pics?.length === 0 && (
                  <option disabled>No PICs available</option>
                )}
                {pics?.map((pic) => (
                  <option key={pic.id} value={pic.id}>
                    {pic.name}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <label className="mb-1">Nama Pegawai</label>
        <input
          type="text"
          placeholder="Nama Pegawai"
          className="border rounded p-4 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mb-1">Email Pegawai</label>
        <input
          type="email"
          placeholder="Masukkan email pegawai"
          className="border rounded p-4 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-1">Username Pegawai</label>
        <input
          type="text"
          placeholder="Masukkan username pegawai"
          className="border rounded p-4 mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="mb-1">Nomor Telepon Pegawai</label>
        <input
          type="number"
          placeholder="Masukkan nomor telepon pegawai"
          className="border rounded p-4 mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label className="mb-1">Alamat Pegawai</label>
        <input
          type="text"
          placeholder="Masukkan alamat tinggal pegawai"
          className="border rounded p-4 mb-3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            className="w-36 items-center bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded"
            onClick={() => setTab("gaji")}
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}

function GajiPokokForm({
  salary,
  setSalary,
  salaryInterval,
  setSalaryInterval,
  selectedSalaryInterval,
  setSelectedSalaryInterval,
  getDisplay,
  onSave,
}) {
  return (
    <div className="flex flex-col border p-6 rounded-md shadow-sm">
      <h2 className="font-bold text-xl mb-4">Profil Pegawai</h2>
      <label className="mb-1">Gaji Pegawai</label>
      <select
        className="border rounded p-4 mb-3"
        value={selectedSalaryInterval}
        onChange={(e) => setSelectedSalaryInterval(e.target.value)}
      >
        {salaryInterval.map((salaryInterval, index) => (
          <option key={index} value={salaryInterval}>
            {salaryInterval}
          </option>
        ))}
      </select>

      <label className="mb-1">Gaji Pegawai</label>
      <div className="relative">
        <span className="absolute inset-y-0 -top-3 left-4 flex items-center  text-gray-500">
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Masukkan gaji pokok"
          className="border rounded p-4 mb-3 pl-12 w-full"
          value={formatThousand(salary)}
          onChange={(e) => {
            const raw = onlyDigits(e.target.value);
            setSalary(raw);
          }}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="w-24 items-center bg-green-700 hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded"
          onClick={onSave}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
export default TambahPegawai;
