import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import SideNavbar from "../components/SideNavbar";
import Breadcrumbs from "../components/Breadcrumbs";

const MainLayout = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [isMobileOpen]);

  const drawerVariants = {
    hidden: { x: "-100%", transition: { stiffness: 300 } },
    visible: { x: 0, transition: { stiffness: 300 } },
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="hidden md:block absolute top-0 left-0 h-full z-10">
        <SideNavbar
          role={role}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-20 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />

            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-30 w-72 bg-white shadow-lg p-4 md:hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={drawerVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">Menu</div>
                <button
                  aria-label="Close menu"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-md"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <SideNavbar
                role={role}
                isExpanded={true}
                setIsExpanded={() => {}}
                setIsMobileOpen={setIsMobileOpen}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-h-screen">
        <div className="z-20 w-full">
          <TopBar
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </div>

        <main
          className={`mt-4 me-2 transition-all duration-300 ease-in-out ml-0 ${
            isExpanded ? "md:ml-[17rem]" : "md:ml-[7rem]"
          }`}
        >
          <div className="pt-18 pb-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
