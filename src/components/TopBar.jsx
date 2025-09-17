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
import { getNotifications } from "../services/notifications";
import { useDispatch } from "react-redux";
import { setNotifications } from "../store/notificationsSlice";
import { useSelector } from "react-redux";

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

      const notificationResponse = await getNotifications(params);
      if (notificationResponse?.status === 200) {
        const notificationsData =
          notificationResponse.data?.data || notificationResponse.data || [];
        dispatch(setNotifications(notificationsData));
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOptionExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getNotificationsState();
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
              {notifications?.filter((n) => !n.done).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter((n) => !n.done).length}
                </span>
              )}
              {isNotifOpen && (
                <div className="absolute border right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b flex justify-between items-center ${
                            notif.done ? "opacity-50" : ""
                          }`}
                        >
                          <span>{notif.description}</span>
                          {!notif.done && (
                            <button
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() =>
                                dispatch(markNotificationDone(notif.id))
                              }
                            >
                              Mark as done
                            </button>
                          )}
                        </div>
                      ))
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
