import logo from "../assets/logo_ajf.svg";
import { IoIosNotificationsOutline, IoIosArrowDown } from "react-icons/io";
import profileAvatar from "../assets/profile_avatar.svg";
import { useState } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useEffect } from "react";

export default function TopBar({ isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("role") || "";
  const photoProfile = localStorage.getItem("photoProfile") || "";

  const [isOptionExpanded, setIsOptionExpanded] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
    const rolePath = role.toLowerCase().replace(/\s+/g, "-");
    setIsOptionExpanded(false);
    if (typeof setIsMobileOpen === "function") {
      setIsMobileOpen(false);
    }
    navigate(`/${rolePath}/profile`);
  };

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
            <IoIosNotificationsOutline
              size={28}
              className="text-black cursor-pointer"
            />
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
                <p className="text-sm text-gray-500">{role}</p>
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
