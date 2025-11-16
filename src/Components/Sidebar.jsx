import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);
  const [pagesAccess, setPagesAccess] = useState([]);
  const [userId, setUserId] = useState(null); // This will hold either employeeId or adminId
  const [role, setRole] = useState(null); // To hold the role (admin/employee)

  useEffect(() => {
    const storedPagesAccess = JSON.parse(localStorage.getItem("pagesAccess"));
    const storedAdminId = localStorage.getItem("adminId"); // Getting adminId from localStorage
    const storedEmployeeId = localStorage.getItem("employeeId"); // Getting employeeId from localStorage
    const storedRole = localStorage.getItem("role"); // Get role from localStorage

    // If no role or IDs are found, redirect to login
    if (!storedRole || (!storedAdminId && !storedEmployeeId)) {
      window.location.href = "/";
      return;
    }

    // Set the role
    setRole(storedRole);
    if (storedPagesAccess) {
      setPagesAccess(storedPagesAccess);
    }

    // Set the userId based on the role
    if (storedAdminId) {
      setUserId(storedAdminId); // Admin ID
    } else if (storedEmployeeId) {
      setUserId(storedEmployeeId); // Employee ID
    }
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
    setOpenSubDropdown(null);
  };

  const toggleSubDropdown = (name) => {
    setOpenSubDropdown(openSubDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://api.credenthealth.com/api/admin/logout", {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("adminId");
      localStorage.removeItem("pagesAccess");
      localStorage.removeItem("role"); // Remove role from localStorage
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-home-fill text-white"></i>,
      name: "Home",
      path: "/",
    },

    {
      icon: <i className="ri-building-fill text-white"></i>,
      name: "Invoice",
      dropdown: [
        { name: "Add Invoice", path: "/generateinvoice" },
        { name: "Invoice List", path: "/companylist" },
      ],
    },

    {
      icon: <i className="ri-settings-3-line text-white"></i>,
      name: "Settings",
      path: "/setting",
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  // Filter elements based on role (admin or employee) and pagesAccess
  const filteredElements = elements.filter(item => {
    if (role === "admin") {
      return true; // Admin sees everything
    }

    if (role === "employee") {
      if (item.path && pagesAccess.includes(item.path)) {
        return true; // Employee sees only pages they're allowed to access
      }

      if (item.dropdown) {
        item.dropdown = item.dropdown.filter(subItem => pagesAccess.includes(subItem.path));
        return item.dropdown.length > 0;
      }
    }

    return false;
  });

  return (
    <div
      className={`transition-all duration-300 ${
        isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
      } h-screen overflow-y-scroll no-scrollbar flex flex-col bg-gradient-to-r from-purple-700 to-purple-400`}
    >
      <div className="sticky top-0 p-4 font-bold bg-purple-600 flex justify-center text-xl text-white">
        <span>DASHBOARD</span>
      </div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {filteredElements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-[#D9F3EA] hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                  />
                </div>

                {openDropdown === item.name && (
                  <ul className="ml-8 text-sm text-white">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center py-2 font-semibold hover:text-[#00B074]"
                          onClick={() => {
                            setOpenDropdown(null);
                            setOpenSubDropdown(null);
                          }}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div
                className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-[#D9F3EA] hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
