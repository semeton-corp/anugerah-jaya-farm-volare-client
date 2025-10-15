import React from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getStores } from "../services/stores";
import { useEffect } from "react";
import { MdStore } from "react-icons/md";
import { getLocations } from "../services/location";

const DaftarToko = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);

  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(
    userRole === "Owner" ? 0 : localStorage.getItem("locationId")
  );

  const detailPages = ["tambah-toko", "detail-toko"];

  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const handleLihatDetail = (id, locationId) => {
    navigate(`${location.pathname}/detail-toko/${id}/${locationId}`);
  };

  const handleTambahToko = (id) => {
    navigate(`${location.pathname}/tambah-toko`);
  };

  const fetchStores = async () => {
    try {
      const storeResponse = await getStores(selectedSite);
      // console.log("storeResponse: ", storeResponse);
      if (storeResponse.status === 200) {
        setStores(storeResponse.data.data);
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

  useEffect(() => {
    fetchStores();
    fetchSites();

    if (location?.state?.refetch) {
      fetchStores();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchStores();
  }, [selectedSite]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Toko</h1>

        {userRole == "Owner" && (
          <div className="flex items-center rounded px-4 py-2 bg-orange-300 hover:bg-orange-500 cursor-pointer">
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

      <div className="border rounded p-4">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleTambahToko}
            className="bg-orange-300 hover:bg-orange-500 cursor-pointer px-4 py-2 rounded font-medium"
          >
            + Tambah Toko
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="px-4 py-2 whitespace-nowrap">Nama Toko</th>
                <th className="px-4 py-2 whitespace-nowrap">Lokasi</th>
                <th className="px-4 py-2 whitespace-nowrap">Jumlah Pekerja</th>
                <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stores?.map((toko) => (
                <tr key={toko.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{toko?.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {toko?.location?.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {toko?.totalEmployee}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleLihatDetail(toko.id, toko.location.id)
                      }
                      className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-3 py-1 rounded whitespace-nowrap"
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

export default DaftarToko;
