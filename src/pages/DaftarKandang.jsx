import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { MdStore } from "react-icons/md";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getChickenCage } from "../services/cages";
import { getLocations } from "../services/location";

const DaftarKandang = () => {
  const userRole = localStorage.getItem("role");

  const [kandangData, setKandangData] = useState([]);

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const location = useLocation();
  const navigate = useNavigate();

  const detailPages = [
    "tambah-kandang",
    "detail-kandang",
    "pindah-ayam",
    "edit-kandang",
    "edit-pic",
  ];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const tambahKandangHandle = () => {
    navigate(`${location.pathname}/tambah-kandang`);
  };

  const detailKandangHandle = (id) => {
    navigate(`${location.pathname}/detail-kandang/${id}`);
  };

  const pindahAyamHandle = () => {
    navigate(`${location.pathname}/pindah-ayam`);
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

  const fetchKandangData = async () => {
    try {
      const kandangResponse = await getChickenCage(selectedSite);
      console.log("kandangResponse: ", kandangResponse);
      if (kandangResponse.status === 200) {
        const allKandang = kandangResponse.data.data;
        setKandangData(allKandang);
        console.log("allKandang: ", allKandang);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchKandangData();
    if (location?.state?.refetch) {
      fetchKandangData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    fetchKandangData();
  }, [selectedSite]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Kandang</h1>
        {userRole == "Owner" && (
          <div className="flex items-center rounded-lg px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
            <MdStore size={18} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="ml-2 bg-transparent text-base font-medium outline-none"
            >
              <option value="">Semua Site</option>
              {siteOptions.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded border border-black p-4 md:p-8">
        <div className="flex flex-wrap justify-end mb-4 gap-2">
          <div
            onClick={pindahAyamHandle}
            className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
          >
            <div className="text-base font-medium ms-2">Pindah Ayam</div>
          </div>
          <div
            onClick={tambahKandangHandle}
            className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer"
          >
            <div className="text-base font-medium ms-2">+ Tambah Kandang</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full table-auto border-gray-200">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Kandang
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  ID Batch
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Kategori
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Usia (minggu)
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  Kapasitas Maksimum (Ekor)
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  PIC Ayam
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">
                  PIC Telur
                </th>
                <th className="px-4 py-2 text-left whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kandangData.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.batchId ? (
                      <span className="px-3 py-1 bg-aman-box-surface-color text-aman-text-color font-semibold rounded shadow-sm">
                        Kandang Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-kritis-box-surface-color text-kritis-text-color rounded shadow-sm">
                        Kandang Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.cage.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.batchId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.chickenCategory}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.chickenAge}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.cage.capacity}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.chickenPic}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.eggPic}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => detailKandangHandle(row.id)}
                      className="bg-green-700 hover:bg-green-900 hover:cursor-pointer text-white px-3 py-1 rounded whitespace-nowrap"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DaftarKandang;
