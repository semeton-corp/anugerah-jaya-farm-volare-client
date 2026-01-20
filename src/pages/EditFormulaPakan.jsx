import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCageFeed, updateCageFeed } from "../services/cages";
import { getItems } from "../services/item";
import { MdDelete } from "react-icons/md";

const normalizeNumber = (value) => {
  if (value === null || value === undefined) return NaN;
  const normalized = value.toString().replace(",", ".");
  return Number(normalized);
};

const EditFormulaPakan = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [cageData, setCageData] = useState(null);
  const [allItems, setAllItems] = useState();
  const [itemList, setItemList] = useState([]);
  const [feedTypeList] = useState(["Pakan Jadi", "Pakan Adukan"]);
  const [feedType, setFeedType] = useState("Pakan Jadi");
  const [jumlahPakan, setJumlahPakan] = useState("");
  const [komposisi, setKomposisi] = useState([]);

  const selectedIds = useMemo(
    () => komposisi.map((k) => k.itemId).filter(Boolean),
    [komposisi],
  );

  const getAvailableItems = (currentId) =>
    (itemList || []).filter(
      (item) => item.id === currentId || !selectedIds.includes(item.id),
    );

  const handleChange = (index, field, value) => {
    const updated = [...komposisi];
    if (field === "itemId") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else if (field === "percentage") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }
    setKomposisi(updated);
  };

  const addBahan = () => {
    setKomposisi((prev) => [...prev, { itemId: "", percentage: "" }]);
  };

  const removeBahan = (index) => {
    setKomposisi((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async () => {
  if (!feedType) {
    alert("Pilih jenis pakan terlebih dahulu.");
    return;
  }

  const totalFeed = normalizeNumber(jumlahPakan);
  if (jumlahPakan === "" || isNaN(totalFeed)) {
    alert("Isi jumlah pakan dengan angka.");
    return;
  }

  for (const row of komposisi) {
    const pct = normalizeNumber(row.percentage);

    if (!row.itemId) {
      alert("Pilih item pakan untuk semua baris komposisi.");
      return;
    }

    if (row.percentage === "" || isNaN(pct)) {
      alert("Isi persentase komposisi dengan angka.");
      return;
    }
  }

  const totalPct = komposisi.reduce(
    (sum, r) => sum + normalizeNumber(r.percentage || 0),
    0
  );

  // Allow floating-point tolerance
  if (Math.abs(totalPct - 100) > 0.0001) {
    if (
      !confirm(
        `Total persentase saat ini ${totalPct.toFixed(
          2
        )}%. Lanjutkan tetap simpan?`
      )
    ) {
      return;
    }
  }

  const payload = {
    chickenCategory: cageData?.chickenCategory,
    feedType,
    totalFeed,
    cageFeedDetails: komposisi.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      itemId: r.itemId,
      percentage: normalizeNumber(r.percentage || 0),
    })),
  };

  console.log("payload:", payload);

  try {
    const updateResponse = await updateCageFeed(payload, id);
    if (updateResponse.status === 200) {
      navigate(-1, { state: { refetch: true } });
    }
  } catch (error) {
    console.log("error:", error);
  }
};


  const fetchDetailData = async () => {
    try {
      const res = await getCageFeed(id);
      console.log("detailResponse: ", res);
      if (res?.status === 200) {
        const d = res.data.data;
        console.log("d: ", d);
        setCageData(d);
        setFeedType(d?.feedType || "");
        setJumlahPakan(d?.totalFeed !== undefined ? String(d.totalFeed) : "");
        if (!d?.cageFeedDetails || d.cageFeedDetails.length === 0) {
        } else {
          setKomposisi(
            d.cageFeedDetails.map((r) => ({
              id: r.id,
              itemId: r.item.id ?? "",
              percentage:
                r.percentage !== undefined ? Number(r.percentage) : "",
            })),
          );
        }
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchItemList = async () => {
    try {
      const itemListResponse = await getItems();
      console.log("itemListResponse: ", itemListResponse);
      if (itemListResponse.status == 200) {
        setAllItems(itemListResponse.data.data);
        // console.log("itemListResponse.data.data: ", itemListResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const filterItemList = (items, type) => {
    let selectedItem = [];
    console.log("type?.trim().toLowerCase(): ", type?.trim().toLowerCase());
    if (type?.trim().toLowerCase() == "pakan jadi") {
      selectedItem = items?.filter(
        (item) => item.category?.trim().toLowerCase() === "pakan jadi",
      );
    } else if (type?.trim().toLowerCase() === "pakan adukan") {
      selectedItem = items?.filter((item) =>
        item.category?.trim().toLowerCase().includes("bahan baku adukan"),
      );
    }
    setItemList(selectedItem);
  };

  useEffect(() => {
    fetchDetailData();
    fetchItemList();
  }, []);

  useEffect(() => {
    if (allItems && feedType) {
      filterItemList(allItems, feedType);
    }
  }, [feedType, allItems]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-3">Edit Formula Pakan</h2>

      <div className="p-6 border rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Kategori ayam</p>
            <p className="text-lg font-semibold">
              {cageData?.chickenCategory || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Usia ayam</p>
            <p className="text-lg font-semibold">
              {cageData?.chickenAgeInterval || "-"}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Pilih Jenis Pakan
            </label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value)}
              className="w-full border px-3 py-2 rounded "
            >
              {feedTypeList.map((feed, i) => (
                <option key={i} value={feed}>
                  {feed}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Jumlah Pakan</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="border px-3 py-2 rounded w-60"
              value={jumlahPakan}
              onChange={(e) => setJumlahPakan(e.target.value)}
              min={0}
              placeholder="0"
            />
            <span className="text-sm font-medium text-gray-700">gr/ekor</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Komposisi</p>

          {komposisi.map((k, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center gap-3 mb-2 border p-3 rounded"
            >
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* Select */}
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={k.itemId}
                  onChange={(e) =>
                    handleChange(index, "itemId", e.target.value)
                  }
                >
                  <option value="">Pilih Pakan</option>
                  {getAvailableItems(k.itemId).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border px-3 py-2 rounded"
                    value={k.percentage}
                    onChange={(e) =>
                      handleChange(index, "percentage", e.target.value)
                    }
                    min={0}
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-700">%</span>
                </div>
              </div>

              <button
                onClick={() => removeBahan(index)}
                className="bg-red-500 text-white px-3 py-2 rounded self-start md:self-center"
                title="Hapus bahan"
              >
                <MdDelete size={24} />
              </button>
            </div>
          ))}

          <button
            onClick={addBahan}
            className="bg-orange-300 hover:bg-orange-500 text-black px-4 py-2 rounded mb-3 cursor-pointer"
          >
            Tambah Bahan Pakan
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-green-700 hover:bg-green-900 cursor-pointer text-white px-5 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* <button
        onClick={() => {
          console.log("feedTypeList: ", feedTypeList);
          console.log("itemList: ", itemList);
          console.log("allItems: ", allItems);
          console.log("komposisi: ", komposisi);
          console.log("feedType: ", feedType);

          const payload = {
            chickenCategory: cageData?.chickenCategory,
            feedType,
            totalFeed: Number(jumlahPakan || 0),
            cageFeedDetails: komposisi.map((r) => ({
              ...(r.id ? { id: r.id } : {}),
              itemId: r.itemId,
              percentage: Number(r.percentage || 0),
            })),
          };
          console.log("payload: ", payload);
        }}
      >
        CHECK
      </button> */}
    </div>
  );
};

export default EditFormulaPakan;
