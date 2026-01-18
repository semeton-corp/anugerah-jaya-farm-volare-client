import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getStores } from "../services/stores";
import { getWarehouses } from "../services/warehouses";
import { getCage } from "../services/cages";
import { useParams } from "react-router-dom";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { getRoles } from "../services/roles";
import { deleteDailyWork, getDailyWorkByRoleId } from "../services/dailyWorks";
import {
  createUpdateDailyWorkByRoleId,
  deleteDailyWorkByRoleId,
} from "../services/dailyWorks";
import { RiDeleteBinFill } from "react-icons/ri";
import DeleteModal from "../components/DeleteModal";

const TambahTugasRutin = () => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  const { id } = useParams();

  const [deletedTasks, setDeletedTasks] = useState([]);

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState();
  const [tasks, setTasks] = useState([]);

  const [isEditMode, setIsEditMode] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteTask, setSelectedDeleteTask] = useState();
  const [selectedDeleteTaskIndex, setSelectedDeleteTaskIndex] = useState();

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        description: "",
        startTime: "00.00",
        endTime: "00.00",
        isExpanded: true,
      },
    ]);
  };

  const handleTasksChange = (index, field, value) => {
    const newList = [...tasks];
    newList[index][field] = value;
    setTasks(newList);
  };

  const changeExpandTaskItem = (index) => {
    const isExpandTemp = tasks[index]["isExpanded"];
    const newList = [...tasks];
    newList[index]["isExpanded"] = !isExpandTemp;
    setTasks(newList);
  };

  const tambahTugasHarianHandle = () => {
    addTask();
  };

  const fetchRoles = async () => {
    try {
      const rolesResponse = await getRoles();
      // console.log("rolesResponse.data.data: ", rolesResponse.data.data);
      if (rolesResponse.status === 200) {
        setRoles(rolesResponse.data.data);
        fetchDailyWork(rolesResponse.data.data[0].id);
        if (id) {
          setIsEditMode(false);
          const targetId = id;
          const role = rolesResponse.data.data.find((role) => {
            return role.id == targetId;
          });
          console.log("role: ", role);
          setSelectedRole(role);
        } else {
          // console.log("rolesResponse.data.data[0]", rolesResponse.data.data[0]);
          setSelectedRole(rolesResponse.data.data[0]);
        }
      }
      //   console.log("response: ", response);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const fetchDailyWork = async (roleId) => {
    try {
      const dailyWorkResponse = await getDailyWorkByRoleId(roleId);
      console.log("dailyWorkResponse.data.data: ", dailyWorkResponse.data.data);
      if (dailyWorkResponse.status === 200) {
        setTasks(dailyWorkResponse.data.data.dailyWorks);
      }
      //   console.log("response: ", response);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const deleteTaskHandle = async (id, indexToRemove) => {
    setTasks((prevTasks) =>
      prevTasks.filter((_, index) => index !== indexToRemove),
    );

    if (!id) {
      setShowDeleteModal(false);
      return;
    }

    try {
      await deleteDailyWork(id);
      setShowDeleteModal(false);
      alert("✅Tugas harian berhasil dihapus");
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole?.id) {
      fetchDailyWork(selectedRole.id);
    }
  }, [selectedRole]);

  const getDisplayValue = (val) => {
    if (val === 0 || val === undefined || val === null) return "";
    return val;
  };

  const simpanHandle = async () => {
    const payload = {
      roleId: selectedRole.id,
      dailyWorkDetail: tasks,
    };

    try {
      const createResponse = await createUpdateDailyWorkByRoleId(payload);
      // console.log("createResponse: ", createResponse);
      if (createResponse.status == 201) {
        navigate(-1, { state: { refetch: true } });
      }
    } catch (error) {
      console.log("error :", error);
    }

    console.log("payload: ", payload);
  };

  return (
    <div className="flex flex-col px-4 py-3 gap-4">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Tambah Tugas Rutin</h1>
      </div>

      <div className="w-full mx-auto p-6 bg-white shadow rounded border border-black-6">
        <label className="block font-medium  mt-4">Jabatan</label>
        {isEditMode ? (
          <>
            <select
              className="w-full border border-black-6 bg-black-4 cursor-pointer rounded p-2"
              value={selectedRole?.name}
              onChange={(e) => {
                // const selected = locations.find(
                //   (location) => location.name == e.target.value
                // );
                const selected = roles.find(
                  (role) => role.name == e.target.value,
                );
                console.log("selected: ", selected);
                setSelectedRole(selected);
              }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">{selectedRole?.name}</p>
          </>
        )}

        {/* nama tugas tambahan */}
        <div className="mt-4">
          <label className="block font-medium mt-6 ">Daftar Tugas Harian</label>
          <div className="flex gap-4 mb-4">
            {/* tambah tugas button */}
            <div
              onClick={() => {
                tambahTugasHarianHandle();
                setIsEditMode(true);
              }}
              className="rounded-[4px] py-2 px-6 bg-orange-300 flex items-center justify-center  text-base font-medium hover:bg-orange-500 cursor-pointer"
            >
              + Tambah tugas
            </div>
          </div>

          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div
                key={index}
                className="p-6 border flex flex-col gap-1 border-black-6 rounded-[4px] bg-black-4 mb-4 text-sm sm:text-base"
              >
                {isEditMode ? (
                  <>
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        className="w-full border rounded p-2 bg-white"
                        placeholder={`Nama Tugas ${index + 1}`}
                        value={task.description || ""}
                        onChange={(e) =>
                          handleTasksChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                      <button
                        className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setSelectedDeleteTask(task);
                          setSelectedDeleteTaskIndex(index);
                        }}
                      >
                        <RiDeleteBinFill size={32} />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="time"
                        step="60"
                        lang="en-GB"
                        className="border rounded p-2 bg-white"
                        value={task.startTime || "00:00"}
                        onChange={(e) =>
                          handleTasksChange(index, "startTime", e.target.value)
                        }
                      />
                      <span>sampai</span>
                      <input
                        type="time"
                        step="60"
                        lang="en-GB"
                        className="border rounded p-2 bg-white"
                        value={task.startTime || "00:00"}
                        onChange={(e) =>
                          handleTasksChange(index, "endTime", e.target.value)
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{task.description}</p>
                    <p className="text-sm">
                      {task.startTime} - {task.endTime}
                    </p>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-lg text-black-6">Belum ada tugas harian</p>
          )}
        </div>

        {/* Simpan Button */}
        <div className="mt-6 text-right flex gap-2 justify-end">
          {id && !isEditMode && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`${
                isEditMode
                  ? "bg-white border hover:bg-green-200 border-green-700 text-green700"
                  : "bg-green-700 hover:bg-green-900 text-white "
              } py-4 px-8 rounded  cursor-pointer`}
            >
              {isEditMode ? "Batal Edit" : "Edit"}
            </button>
          )}
          {isEditMode && (
            <button
              onClick={simpanHandle}
              className="bg-green-700 text-white py-2 px-6 rounded hover:bg-green-900 cursor-pointer"
            >
              Simpan
            </button>
          )}
        </div>

        {/* Simpan Button */}
        <div className="mt-6 text-right ">
          <button
            onClick={() => {
              console.log("tasks: ", tasks);
            }}
            className="bg-green-700 text-white py-2 px-6 rounded hover:bg-green-900 cursor-pointer"
          >
            Check
          </button>
        </div>
      </div>
      <DeleteModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteTaskHandle(selectedDeleteTask.id, selectedDeleteTaskIndex);
        }}
      />
    </div>
  );
};

export default TambahTugasRutin;
