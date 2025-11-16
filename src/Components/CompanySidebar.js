import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const CompanySidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const storedCompanyName = localStorage.getItem("companyName");
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://api.credenthealth.com/api/admin/logout-company", {}, { withCredentials: true });

      localStorage.removeItem("authToken");
      localStorage.removeItem("companyId");
      localStorage.removeItem("companyName");

      alert("Logout successful");
      window.location.href = "/company-login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-home-2-fill text-white"></i>,
      name: "Dashboard",
      path: "/company/companydashboard",
    },
    {
      icon: <i className="ri-profile-fill text-white"></i>,
      name: "Profile",
      dropdown: [{ name: "View Profile", path: "/company/profile" }],
    },
    {
      icon: <i className="ri-hand-heart-fill text-white"></i>,
      name: "Beneficiary",
      dropdown: [
        { name: "Add Beneficiary", path: "/company/add-benificary" },
        { name: "All Beneficiaries", path: "/company/all-benificary" },
      ],
    },
    {
      icon: <i className="ri-stethoscope-fill text-white"></i>,
      name: "Diagnostics",
      dropdown: [
        { name: "All Diagnostics", path: "/company/alldiagnostic" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
        } overflow-y-scroll no-scrollbar h-full flex flex-col bg-gradient-to-b from-blue-600 to-purple-700`}
    >
      <div className="sticky top-0 p-4 font-bold flex justify-center text-xl text-white bg-opacity-90">
        <span>{companyName ? `${companyName}` : "Company Panel"}</span>
      </div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-white hover:text-[#00B074] duration-300 cursor-pointer"
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
                  <ul className="ml-10 text-sm text-white">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
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
                className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-white hover:text-[#00B074] duration-300 cursor-pointer"
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

export default CompanySidebar;
