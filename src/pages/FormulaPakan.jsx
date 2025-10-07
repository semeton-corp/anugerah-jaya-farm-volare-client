import React from "react";
import { getCageFeeds } from "../services/cages";
import { useEffect } from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const FormulaPakan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedFormulaData, setFeedFormulaData] = useState([]);

  const detailPages = ["edit-formula-pakan"];
  const isDetailPage = detailPages.some((segment) =>
    location.pathname.includes(segment)
  );

  const handleEditFormulaPakan = (id) => {
    navigate(`${location.pathname}/edit-formula-pakan/${id}`);
  };

  const fetchFormulaData = async () => {
    try {
      const formulaResponse = await getCageFeeds();
      console.log("formulaResponse: ", formulaResponse);
      if (formulaResponse.status == 200) {
        setFeedFormulaData(formulaResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchFormulaData();
    if (location?.state?.refetch) {
      fetchFormulaData();
      window?.history?.replaceState({}, document.title);
    }
  }, [location]);

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Formula Pakan</h1>

      <div className="p-8 bg-white rounded-lg border border-gray-200 w-full  mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-bold text-white  tracking-wider"
                >
                  Kategori Ayam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left  font-bold text-white  tracking-wider"
                >
                  Usia Ayam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left  font-bold text-white  tracking-wider"
                >
                  Jenis Pakan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left  font-bold text-white  tracking-wider"
                >
                  Jumlah Pakan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left  font-bold text-white  tracking-wider"
                >
                  Formula Pakan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left  font-bold text-white  tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedFormulaData?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap  font-medium text-gray-900">
                    {item.chickenCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  text-gray-600">
                    {item.chickenAgeInterval}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  text-gray-600">
                    {item.feedType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  text-gray-600">
                    {`${item.totalFeed} gr/ekor`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {item.cageFeedDetails && item.cageFeedDetails.length > 0 ? (
                      item.cageFeedDetails.map((line, i) =>
                        line ? (
                          <span key={i} className="block">
                            {`${line.percentage}% ${line.item.name}`}
                          </span>
                        ) : (
                          <span key={i}>Belum terdapat formula</span>
                        )
                      )
                    ) : (
                      <span className="italic text-gray-300">
                        Belum terdapat formula
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditFormulaPakan(item.id)}
                      className="bg-green-700 hover:bg-green-900 cursor-pointer text-white font-semibold py-2 px-4 rounded transition-colors "
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* <button
        onClick={() => {
          console.log("feedFormulaData: ", feedFormulaData);
        }}
      >
        CHECK
      </button> */}
    </div>
  );
};

export default FormulaPakan;
