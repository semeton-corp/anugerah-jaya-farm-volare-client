import React from "react";
import { IoSearch } from "react-icons/io5";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiCalendarBlank } from "react-icons/pi";
import profileAvatar from "../assets/profile_avatar.svg";
import { useEffect } from "react";
import { getListStaff } from "../services/staff";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getListUser, getUserOverviewList } from "../services/user";
import { getRoles } from "../services/roles";
import { MdStore } from "react-icons/md";
import { getLocations } from "../services/location";

const DaftarPegawai = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const [keyword, setQuery] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [pageSize, setPageSize] = useState(0);

  const detailPages = ["tambah-pegawai", "profile"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const [pegawaiAktifData, setPegawaiAktifData] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleId, setRoleId] = useState("");

  const fetchPegawaiAktifData = async () => {
    try {
      const filteredRoleId = !roleId ? undefined : roleId;
      const filteredKeyword = !keyword ? undefined : keyword;
      const fetchResponse = await getUserOverviewList(
        page,
        filteredKeyword,
        filteredRoleId
      );
      console.log("fetchResponse:", fetchResponse);
      if (fetchResponse.status == 200) {
        const {
          users = [],
          totalData = 0,
          totalPage = 1,
        } = fetchResponse.data.data || {};
        setPegawaiAktifData(users);
        setTotalData(totalData);
        setTotalPage(totalPage);
        setPageSize(users.length);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await getLocations();
      if (res.status === 200) {
        setSiteOptions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      console.log("roles res: ", res);
      if (res?.status === 200) {
        setRoleOptions(res.data.data);
      }
    } catch (e) {
      console.log("summary error:", e);
      setSummary((s) => ({ ...s, totalUser: 0 }));
    }
  };

  const handleDetail = (userId) => {
    navigate(`${location.pathname}/profile/${userId}`);
  };

  const tambahPegawaiHandle = () => {
    navigate(`${location.pathname}/tambah-pegawai`);
  };

  useEffect(() => {
    fetchPegawaiAktifData();
    fetchRoles();
    fetchSites();
    if (location.state?.refetch) {
      fetchPegawaiAktifData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  useEffect(() => {
    fetchPegawaiAktifData();
  }, [debouncedKeyword, roleId, page]);

  if (isDetailPage) {
    return <Outlet />;
  }
  return (
    <div className="flex flex-col px-4 py-3 gap-4 ">
      {/* header */}
      <div className="flex justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Daftar Pegawai</h1>
      </div>

      {/* entire box */}
      <div className=" rounded-[4px] border border-black-6">
        <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b ">
          <p className="text-lg font-bold">Pegawai Aktif</p>
          <div
            onClick={tambahPegawaiHandle}
            className="rounded-[4px] py-2 px-6 bg-green-700 flex items-center justify-center text-white text-base font-medium hover:bg-green-900 cursor-pointer"
          >
            + Tambah pegawai
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 py-2 px-6 w-full md:justify-between">
          <div className="flex w-full md:w-1/2">
            <div className="w-full flex border py-1 px-4 me-4 border-black-6 rounded-[4px]">
              <IoSearch size={24} className="me-2" />
              <input
                type="text"
                placeholder="Cari Pegawai...."
                value={keyword}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full focus:outline-none"
              />
            </div>
            <div className="hidden md:flex rounded-[4px] py-2 px-4 bg-orange-400 items-center justify-center text-black text-base font-medium hover:bg-orange-500 cursor-pointer">
              Cari
            </div>
          </div>

          <div className="flex md:ml-auto">
            <div className="flex items-center rounded px-3 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer w-full md:w-auto">
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="bg-transparent outline-none font-medium w-full"
              >
                <option value="">Semua jabatan</option>
                {roleOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* pegawai table */}
        <div className="px-6 py-2">
          <table className="w-full ">
            <thead className="px-8 rounded-[4px] bg-green-700 text-white text-left">
              <tr>
                <th className="py-2 px-4">Pegawai</th>
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Jabatan</th>
                <th className="py-2 px-4">Status Kinerja</th>
                <th className="py-2 px-4"></th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody className="">
              {pegawaiAktifData?.map((item, index) => (
                <tr key={index} className="border-b border-black-6">
                  <td className="py-3 px-4">
                    <div className="flex gap-6">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <img src={item?.photoProfile} alt="Profile Avatar" />
                      </div>

                      <div className="">
                        <p className="text-base font-me leading-tight">
                          {item?.name}
                        </p>
                        <p className="text-sm text-gray-500">{item?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4">{item?.id}</td>
                  <td className="py-2 px-4">{item?.role?.name}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block px-6 py-2 rounded-lg font-medium text-center
                        ${
                          ((item.kpiStatus || "").toLowerCase() === "baik" &&
                            "bg-[#87FF8B] text-black") ||
                          ((item.kpiStatus || "").toLowerCase() === "buruk" &&
                            "bg-[#FF5E5E] text-black") ||
                          "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {item.kpiStatus ?? "-"}
                    </span>
                  </td>
                  <td className="py-2 px-4">{item.salary}</td>
                  <td
                    onClick={() => {
                      handleDetail(item.id);
                    }}
                    className="py-2 px-4 underline text-black hover:text-black-6 cursor-pointer"
                  >
                    Detail
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 px-6 gap-3">
            <p className="text-sm text-[#777]">
              {pageSize > 0
                ? `Menampilkan ${(page - 1) * pageSize + 1}-${Math.min(
                    page * pageSize,
                    totalData
                  )} dari ${totalData} pegawai`
                : "Tidak ada data"}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`rounded-[4px] py-2 px-4 ${
                  page <= 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-100 hover:bg-green-200 cursor-pointer"
                }`}
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page >= totalPage}
                className={`rounded-[4px] py-2 px-4 ${
                  page >= totalPage
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-white cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaftarPegawai;
