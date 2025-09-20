import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListUser } from "../services/user";
import { useEffect } from "react";
import { createCagePlacement } from "../services/placement";
import { getChickenCageById } from "../services/cages";
import { getRoles } from "../services/roles";

const EditPic = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    picKandang: "",
    picTelur: "",
  });

  const [roles, setRoles] = useState([]);
  const [picCageOptions, setPicCageOptions] = useState([]);
  const [picEggOptions, setPicEggOptions] = useState([]);

  const { id, locationId, cageId } = useParams();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const kandangRole = roles.find((item) => item.name == "Pekerja Kandang");
    const kandangRoleId = kandangRole.id;

    const telurRole = roles.find((item) => item.name == "Pekerja Telur");
    const telurRoleId = telurRole.id;

    const payload = {
      cageId: parseInt(cageId, 10),
      users: [
        form.picKandang && { userId: form.picKandang, roleId: kandangRoleId },
        form.picTelur && { userId: form.picTelur, roleId: telurRoleId },
      ].filter(Boolean),
    };

    try {
      const placementResponse = await createCagePlacement(payload);
      if (placementResponse.status == 200) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchPicList = async () => {
    try {
      const [picCageResponse, picEggResponse] = await Promise.all([
        getListUser(2, locationId),
        getListUser(1, locationId),
      ]);

      if (picCageResponse.status == 200) {
        setPicCageOptions(picCageResponse.data.data);
        console.log("picCageResponse: ", picCageResponse);
      }
      if (picEggResponse.status == 200) {
        setPicEggOptions(picEggResponse.data.data);
        console.log("picEggResponse: ", picEggResponse);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };
  const fetchDetailKandang = async () => {
    try {
      const detailResponse = await getChickenCageById(id);

      if (detailResponse.status === 200) {
        const detailData = detailResponse.data.data;

        const matchedCagePic = picCageOptions.find(
          (item) => item.name === detailData.chickenPic
        );

        const matchedEggPic = picEggOptions.find(
          (item) => item.name === detailData.eggPic
        );

        setForm({
          picKandang: matchedCagePic ? matchedCagePic.id : "",
          picTelur: matchedEggPic ? matchedEggPic.id : "",
        });
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const roleResponse = await getRoles();
      if (roleResponse.status == 200) {
        setRoles(roleResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };
  useEffect(() => {
    fetchPicList();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (picCageOptions || picEggOptions) {
      fetchDetailKandang();
    }
  }, [picCageOptions, picEggOptions]);

  return (
    <div className=" m-8 p-8 border rounded shadow bg-white">
      <h2 className="text-lg font-bold mb-6">Edit PIC</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex gap-3 items-center mb-3">
            <label className="block font-medium mb-1">PIC Kandang</label>

            {form.picKandang && (
              <button
                type="button"
                onClick={() => setForm({ ...form, picKandang: "" })}
                className="px-2 py-1 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white cursor-pointer"
              >
                Kosongkan PIC
              </button>
            )}
          </div>
          <select
            name="picKandang"
            value={form.picKandang}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 bg-gray-100"
          >
            <option className="" value="" disabled hidden>
              Pilih PIC Kandang...
            </option>
            {picCageOptions?.map((option, index) => (
              <option key={index} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex gap-3 items-center mb-3">
            <label className="block font-medium mb-1">PIC Telur</label>

            {form.picTelur && (
              <button
                type="button"
                onClick={() => setForm({ ...form, picTelur: "" })}
                className="px-2 py-1 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white cursor-pointer"
              >
                Kosongkan PIC
              </button>
            )}
          </div>
          <select
            name="picTelur"
            value={form.picTelur}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 bg-gray-100"
          >
            <option value="" disabled hidden>
              Pilih PIC Kandang...
            </option>
            {picEggOptions?.map((option, index) => (
              <option key={index} value={option?.id}>
                {option?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-900 cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPic;
