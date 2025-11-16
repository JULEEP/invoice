import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const DiagnosticSidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [diagnosticName, setDiagnosticName] = useState("");

  useEffect(() => {
    const storedDiagnosticName = localStorage.getItem("diagnosticName");
    if (storedDiagnosticName) {
      setDiagnosticName(storedDiagnosticName);
    }
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://api.credenthealth.com/api/admin/logout-diagnostic", {}, { withCredentials: true });

      localStorage.removeItem("authToken");
      localStorage.removeItem("diagnosticId");
      localStorage.removeItem("diagnosticName");

      alert("Logout successful");
      window.location.href = "/diagnostic-login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-home-2-fill text-gray-700"></i>,
      name: "Dashboard",
      path: "/diagnostic/dashboard",
    },
    {
      icon: <i className="ri-profile-fill text-gray-700"></i>,
      name: "My Diagnostic",
      dropdown: [{ name: "View Diagnostic", path: "/diagnostic/mydiagnostic" }],
    },
    {
      icon: <i className="ri-add-line text-gray-700"></i>,
      name: "Add",
      dropdown: [
        { name: "Add Tests", path: "/diagnostic/createlabtest" },
        { name: "Get Tests", path: "/diagnostic/getlabtest" },
        { name: "Add Scan & Xray", path: "/diagnostic/add-scan-xray" },
        { name: "Get Scan&Xrays", path: "/diagnostic/getscanxray" },
        { name: "Add Packages", path: "/diagnostic/add-packages" },
        { name: "Get Packages", path: "/diagnostic/getpackages" },
      ],
    },
    {
      icon: <i className="ri-calendar-check-fill text-gray-700"></i>,
      name: "Booking",
      dropdown: [{ name: "All Bookings", path: "/diagnostic/mybookings" }],
    },
    {
      icon: <i className="ri-logout-box-fill text-gray-700"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 overflow-y-scroll no-scrollbar h-full flex flex-col
        ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"}
        bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100`}
    >
      <div className="sticky top-0 p-4 font-bold text-gray-800 flex justify-center text-xl bg-white shadow-md">
        {diagnosticName ? diagnosticName : "Diagnostic Panel"}
      </div>

      <nav className={`flex flex-col ${isCollapsed && !isMobile ? "items-center" : ""} mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-gray-700 mx-4 rounded-lg hover:bg-purple-200 duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform transition-transform ${
                      openDropdown === item.name ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-gray-700">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium hover:text-purple-700 hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-purple-700">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-semibold text-sm text-gray-700 mx-4 rounded-lg hover:bg-purple-200 duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default DiagnosticSidebar;
