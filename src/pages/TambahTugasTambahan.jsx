import React, { useState } from "react";
import { useEffect } from "react";
import { getLocations } from "../services/location";
import { getCage } from "../services/cages";
import { getWarehouses } from "../services/warehouses";
import { getStores } from "../services/stores";
import {
  convertToInputDateFormat,
  formatDateToDDMMYYYY,
} from "../utils/dateFormat";
import { RiDeleteBinFill } from "react-icons/ri";
import { getRoles } from "../services/roles";
import { getListUser } from "../services/user";
import {
  createAdditionalWorks,
  getAdditionalWorkById,
} from "../services/dailyWorks";
import { useNavigate, useParams } from "react-router-dom";
import { formatThousand, onlyDigits } from "../utils/moneyFormat";

const TambahTugasTambahan = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [taskName, setTaskName] = useState("");
  const [site, setSite] = useState("");
  const [location, setLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => "08:00");
  const [slot, setSlot] = useState(1);
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [workers, setWorkers] = useState([]);

  const [employeeOptions, setEmployeeOptions] = useState();
  const [employeeOptionsMap, setEmployeeOptionsMap] = useState({});

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const [siteOptions, setSiteOptions] = useState();
  const [lokasiOptions, setLokasiOptions] = useState([
    "Kandang",
    "Gudang",
    "Toko",
  ]);
  const [specificLocationOptions, setSpecificLocationOptions] = useState([]);

  const handleAddWorker = () => {
    setWorkers([...workers, { roleId: "", id: "" }]);
  };

  const handleRemoveWorker = (index) => {
    const newWorkers = [...workers];
    newWorkers.splice(index, 1);
    setWorkers(newWorkers);
  };

  const handleWorkerChange = (index, field, value) => {
    const newWorkers = [...workers];
    newWorkers[index][field] = value;
    if (field === "roleId") {
      newWorkers[index].id = "";
      setWorkers(newWorkers);
      fetchEmployeesForRole(value, index, site);
      return;
    }
    setWorkers(newWorkers);
  };

  const handleSubmit = async () => {
    if (
      !taskName ||
      !site ||
      !location ||
      !specificLocation ||
      !date ||
      !time ||
      !slot ||
      !salary ||
      !description
    ) {
      alert("❌Mohon isi semua data dengan benar!");
      return;
    }

    const userIds = workers
      .map((w) => w.id ?? w.userId ?? w.user?.id ?? "")
      .map((id) => (id === null || id === undefined ? "" : String(id).trim()))
      .filter((id) => id !== "");

    const payload = {
      name: taskName,
      locationId: parseInt(site),
      locationType: location,
      placeId: parseInt(specificLocation),
      workDate: `${formatDateToDDMMYYYY(date)} ${time}`,
      slot: parseInt(slot),
      salary: salary,
      description: description,
      userIds: userIds,
    };

    try {
      const submitResponse = await createAdditionalWorks(payload);
      // console.log("submitResponse: ", submitResponse);
      if (submitResponse.status == 201) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }
    console.log("Submitted data:", payload);
  };

  const fetchSite = async () => {
    // console.log("id: ", id);
    try {
      const siteResponse = await getLocations();
      // console.log("siteResponse: ", siteResponse);
      if (siteResponse.status == 200) {
        setSiteOptions(siteResponse.data.data);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchSpecificLocations = async (
    siteId = site,
    locationType = location
  ) => {
    try {
      let response;
      if (locationType === "Kandang") {
        response = await getCage({ locationId: siteId });
      } else if (locationType === "Gudang") {
        response = await getWarehouses({ locationId: siteId });
      } else if (locationType === "Toko") {
        response = await getStores({ locationId: siteId });
      }

      if (response?.status === 200) {
        setSpecificLocationOptions(response.data.data);
        return response.data.data;
      } else {
        setSpecificLocationOptions([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch specific locations", err);
      setSpecificLocationOptions([]);
      return [];
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesResponse = await getRoles();
      // console.log("rolesResponse: ", rolesResponse);s
      if (rolesResponse.status == 200) {
        // console.log("rolesResponse.data.data: ", rolesResponse.data.data);
        const allRoles = rolesResponse.data.data;
        setRoles(allRoles);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchEmployeesForRole = async (roleId, index, siteId = site) => {
    if (!roleId) return;

    try {
      const response = await getListUser(roleId, siteId);
      if (response && response.status === 200) {
        const payload = response.data?.data;
        const users = payload?.users ?? payload ?? [];
        setEmployeeOptionsMap((prev) => ({
          ...prev,
          [index]: users,
        }));
      } else {
        setEmployeeOptionsMap((prev) => ({ ...prev, [index]: [] }));
      }
    } catch (err) {
      console.error("Failed to fetch employees for role", err);
      setEmployeeOptionsMap((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const fetchEmployees = async () => {
    if (!selectedRole) {
      setEmployeeOptions([]);
      return;
    }
    try {
      const employeeOptionsResponse = await getListUser(selectedRole, site);
      console.log("employeeOptionsResponse: ", employeeOptionsResponse);
      if (employeeOptionsResponse?.status === 200) {
        const payload = employeeOptionsResponse.data?.data;
        const users = payload?.users ?? payload ?? [];
        setEmployeeOptions(users);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDetailData = async (id) => {
    try {
      const detailData = await getAdditionalWorkById(id);
      // console.log("detailData: ", detailData);
      if (detailData.status == 200) {
        const data = detailData.data.data;

        setTaskName(data.name);
        setSite(data.location.id);
        setLocation(data.locationType);
        setDate(convertToInputDateFormat(data.date));
        setTime(data.time);
        setSlot(data.slot);
        setSalary(data.salary);
        setDescription(data.description);

        const transformedWorkers = await Promise.all(
          (data.additionalWorkUserInformation || []).map(
            async (worker, index) => {
              // worker.role.id or worker.roleId — depends on your API
              const roleId = worker.role?.id || worker.roleId;
              const userId = worker.user?.id || worker.userId;

              console.log("roleId: ", roleId);
              // fetch employees for this role + site
              const response = await getListUser(roleId, data.location.id);
              // console.log(`response ${worker} ${roleId}: `, response);
              if (response.status === 200) {
                console.log(
                  `response.data.data: ${roleId} `,
                  response.data.data
                );
                setEmployeeOptionsMap((prev) => ({
                  ...prev,
                  [index]: response.data.data,
                }));
              }

              return {
                roleId: roleId,
                id: userId,
              };
            }
          )
        );

        setWorkers(transformedWorkers);

        // now fetch specific locations after site & location are set
        // console.log("data.location.id: ", data.location.id);
        // console.log("data.locationType: ", data.locationType);
        const specificLists = await fetchSpecificLocations(
          data.location.id,
          data.locationType
        );
        // console.log("specificLists: ", specificLists);

        // then find matching specificLocation
        const matchSpecificLocation = specificLists.find(
          (item) => item.name === data.place
        );

        if (matchSpecificLocation) {
          setSpecificLocation(matchSpecificLocation.id);
        } else {
          setSpecificLocation(""); // fallback
        }
        /// after the location.id and setLocation is already set i want to call fetchSpecificLocations()
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        // run initial fetches in parallel or sequence
        await Promise.all([fetchSite(), fetchRoles()]);

        // then if id exists, fetch detail
        if (id) {
          await fetchDetailData(id);
        }
      } catch (err) {
        console.error("Failed to initialize data", err);
      }
    };

    initFetch();
  }, []);

  useEffect(() => {
    if (!site) {
      setEmployeeOptionsMap({});
      setWorkers((prev) => prev.map((w) => ({ ...w, id: "" })));
      return;
    }

    workers.forEach((worker, idx) => {
      const roleId = worker.roleId || worker.role;
      if (roleId) {
        fetchEmployeesForRole(roleId, idx, site);
      } else {
        setEmployeeOptionsMap((prev) => ({ ...prev, [idx]: [] }));
        setWorkers((prev) => {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], id: "" };
          return copy;
        });
      }
    });
  }, [site]);

  useEffect(() => {
    fetchEmployees();
  }, [selectedRole]);

  useEffect(() => {
    fetchSpecificLocations();
    fetchEmployeesForRole();
  }, [site, location]);

  useEffect(() => {
    fetchEmployeesForRole();
  }, [site]);

  return (
    <div className="mx-6 p-6 bg-white rounded border space-y-4">
      <h1 className="text-2xl font-bold">Tambah Tugas Tambahan</h1>

      <div>
        <label className="block font-medium">Nama Tugas Tambahan</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          placeholder="Masukkan nama tugas tambahan..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium">Site</label>
          <select
            className="w-full border rounded p-2"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          >
            <option value="">Pilih Site</option>
            {siteOptions?.map((site, index) => (
              <option key={index} value={site.id}>
                {site.name}
              </option>
            ))}
            {/* <option value="Sidodadi">Sidodadi</option> */}
          </select>
        </div>
        <div>
          <label className="block font-medium">Lokasi</label>
          <select
            className="w-full border rounded p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Pilih Lokasi</option>
            {lokasiOptions?.map((lokasi, index) => (
              <option key={index} value={lokasi}>
                {lokasi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Lokasi Spesifik</label>
          <select
            className="w-full border rounded p-2"
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
          >
            <option value="">Pilih Lokasi Spesifik</option>
            {specificLocationOptions?.map((specific, index) => (
              <option key={index} value={specific.id}>
                {specific.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Tanggal Pelaksanaan</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Waktu Pelaksanaan</label>
          <input
            type="time"
            className="w-full border rounded p-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block font-medium">Slot Pekerja</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Pilih Pekerja (optional)</label>
        {workers.map((worker, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              className="flex-1 border rounded p-2"
              value={worker.roleId}
              onChange={(e) =>
                handleWorkerChange(index, "roleId", e.target.value)
              }
            >
              <option value="">Pilih Jabatan Pekerja</option>
              {roles?.map((role, index) => (
                <option key={index} value={role.id}>
                  {role.name}
                </option>
              ))}
              {/* <option value="Mandor">Mandor</option>
              <option value="Pekerja">Pekerja</option> */}
            </select>
            <select
              className="flex-1 border rounded p-2"
              value={worker.id}
              onChange={(e) => handleWorkerChange(index, "id", e.target.value)}
            >
              <option value="">Pilih Nama Pekerja</option>
              {employeeOptionsMap[index]?.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleRemoveWorker(index)}
              className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
            >
              <RiDeleteBinFill size={32} />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddWorker}
          className="mt-2 bg-yellow-500 text-black py-1 px-4 rounded hover:bg-yellow-600"
        >
          Tambah pekerja
        </button>
      </div>

      <div>
        <label className="block font-medium">Gaji Tambahan / Pekerja</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={formatThousand(salary)}
          onChange={(e) => {
            const raw = onlyDigits(e.target.value);
            setSalary(raw);
          }}
          placeholder="Rp 300.000"
        />
      </div>

      <div>
        <label className="block font-medium">Deskripsi Pekerjaan</label>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="text-right">
        <button
          onClick={handleSubmit}
          className="bg-green-700 text-white py-2 px-6 rounded hover:bg-green-900"
        >
          Simpan
        </button>
      </div>
      <button
        onClick={() => {
          // console.log("taskName:", taskName);
          // console.log("site:", site);
          // console.log("location:", location);
          // console.log("specificLocation:", specificLocation);
          // console.log("date:", formatDateToDDMMYYYY(date));
          // console.log("time:", time);
          // console.log("slot:", slot);
          // console.log("salary:", salary);
          // console.log("description:", description);
          // console.log("workers:", workers);
          // console.log("roles: ", roles);
          // console.log("specificLocationOptions: ", specificLocationOptions);
          // console.log("employeeOptionsMap: ", employeeOptionsMap);

          const userIds = workers
            .map((w) => w.id ?? w.userId ?? w.user?.id ?? "")
            .map((id) =>
              id === null || id === undefined ? "" : String(id).trim()
            )
            .filter((id) => id !== "");

          console.log("workers:", workers);
          console.log("userIds (strings):", userIds);
        }}
      >
        CHECK
      </button>
    </div>
  );
};

export default TambahTugasTambahan;
