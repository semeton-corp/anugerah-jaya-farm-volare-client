import logo from "../assets/logo_ajf.svg";
import { IoIosNotificationsOutline, IoIosArrowDown } from "react-icons/io";
import profileAvatar from "../assets/profile_avatar.svg";
import { useState } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useEffect } from "react";
import { getNotificationContextsByRole } from "../data/NotificationsMap";
import getNotificationsPlacementsIds from "../utils/getNotificationsPlacementIds";
import { getNotifications, markNotification } from "../services/notifications";
import { useDispatch } from "react-redux";
import {
  clearAllNotifications,
  markAllNotificationsDone,
  markNotificationDone,
  removeNotification,
  setNotifications,
} from "../store/notificationsSlice";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

export default function TopBar({ isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role") || "";
  const photoProfile = localStorage.getItem("photoProfile") || "";

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOptionExpanded, setIsOptionExpanded] = useState(false);
  const notifications = useSelector((state) => state?.notifications);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const dispatch = useDispatch();

  const profileHandle = () => {
    setIsOptionExpanded((s) => !s);
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("photoProfile");

    setIsOptionExpanded(false);

    if (typeof setIsMobileOpen === "function") {
      setIsMobileOpen(false);
    }

    navigate("/auth/login", { replace: true });
  };

  const onProfile = () => {
    const rolePath = userRole.toLowerCase().replace(/\s+/g, "-");
    setIsOptionExpanded(false);
    if (typeof setIsMobileOpen === "function") {
      setIsMobileOpen(false);
    }
    navigate(`/${rolePath}/profile`);
  };

  const getNotificationsState = async () => {
    try {
      let params;

      params = await getNotificationsPlacementsIds(userId, userRole);
      const notificationsContexs = getNotificationContextsByRole(userRole);
      params.notificationsContexs = notificationsContexs;
      params.isMarked = false;

      console.log("params: ", params);
      const notificationResponse = await getNotifications(params);
      if (notificationResponse?.status === 200) {
        const notificationsData =
          notificationResponse.data?.data || notificationResponse.data || [];
        console.log("notificationsData: ", notificationsData);
        dispatch(setNotifications(notificationsData));
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setIsOptionExpanded(false);
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkNotification = async (id) => {
    try {
      const payload = {
        ids: [id],
      };
      const markResponse = await markNotification(payload);
      console.log("markResponse: ", markResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  const handleMarkAllNotification = async () => {
    try {
      const ids = notifications.map((item) => item.id);
      const payload = {
        ids,
      };
      const markResponse = await markNotification(payload);
      console.log("markResponse: ", markResponse);
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    getNotificationsState();

    const interval = setInterval(() => {
      getNotificationsState();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 w-full z-40">
      <nav className="bg-white p-4 shadow-sm">
        <div className="px-6 lg:px-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={!!isMobileOpen}
              onClick={() =>
                typeof setIsMobileOpen === "function"
                  ? setIsMobileOpen((s) => !s)
                  : null
              }
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md shadow-sm bg-white ring-1 ring-black/5"
            >
              {isMobileOpen ? (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              )}
            </button>

            <img
              src={logo}
              alt="AJF Logo"
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold whitespace-nowrap">
                Anugerah Jaya Farm
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Platform Monitoring Digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <IoIosNotificationsOutline
                size={28}
                className="text-black cursor-pointer"
                onClick={() => setIsNotifOpen((prev) => !prev)}
              />
              {notifications?.filter((n) => !n.isMarked).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter((n) => !n.isMarked).length}
                </span>
              )}
              {isNotifOpen && (
                <div
                  ref={notifRef}
                  className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-lg z-50 border border-gray-200"
                >
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                    <button
                      onClick={() => {
                        dispatch(markAllNotificationsDone());

                        setTimeout(() => {
                          dispatch(clearAllNotifications());
                          handleMarkAllNotification();
                        }, 2000);
                      }}
                      className="text-sm text-gray-600 hover:text-black-5 cursor-pointer"
                    >
                      Tandai Baca semua
                    </button>
                  </div>

                  <div className="max-h-110 overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        Tidak ada notifikasi
                      </p>
                    ) : (
                      <AnimatePresence>
                        {notifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                            className={`flex items-start gap-3 p-4 mb-2 border border-black-5 last:border-none ${
                              notif.isMarked
                                ? "bg-gray-50 text-gray-400"
                                : "bg-orange-50 hover:bg-orange-100"
                            } transition rounded-md`}
                          >
                            <div
                              className={`flex-shrink-0 mt-1 ${
                                notif.isMarked
                                  ? "text-gray-400"
                                  : "text-orange-300"
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.366-.756 1.42-.756 1.786 0l6.516 13.463c.334.69-.197 1.438-.993 1.438H2.734c-.796 0-1.327-.748-.993-1.438L8.257 3.1zM11 15a1 1 0 10-2 0 1 1 0zm-1-2a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v3.5A.75.75 0 0110 13z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>

                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  notif.isMarked
                                    ? "text-gray-400"
                                    : "text-gray-800 font-medium"
                                }`}
                              >
                                {notif.description}
                              </p>
                            </div>

                            <div>
                              <input
                                type="checkbox"
                                checked={notif.isMarked}
                                onChange={() => {
                                  dispatch(markNotificationDone(notif.id));

                                  setTimeout(() => {
                                    dispatch(removeNotification(notif.id));
                                    handleMarkNotification(notif.id);
                                  }, 2000);
                                }}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-6 w-[1px] bg-gray-400 rounded-full" />

            <div className="flex items-center gap-6 relative" ref={dropdownRef}>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden">
                <img
                  src={photoProfile || profileAvatar}
                  alt="Profile Avatar"
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-base font-bold leading-tight">{userName}</p>
                <p className="text-sm text-gray-500">{userRole}</p>
              </div>

              <div>
                <div
                  onClick={profileHandle}
                  className="h-8 w-8 border border-gray-300 rounded-full flex justify-center items-center hover:bg-gray-200 cursor-pointer"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={isOptionExpanded}
                >
                  <IoIosArrowDown />
                </div>
              </div>

              {isOptionExpanded && (
                <div className="absolute right-0 top-full mt-3 z-50">
                  <div className="absolute -top-2 right-4">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg w-48 px-3 py-4">
                    <button
                      onClick={onProfile}
                      className="w-full flex items-center gap-2 px-4 py-2 mb-2 border rounded-md hover:bg-gray-100 font-semibold cursor-pointer"
                    >
                      <FiUser /> Profil
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 font-semibold cursor-pointer"
                    >
                      <FiLogOut /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
