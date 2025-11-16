import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
    setOpenSubDropdown(null);
  };

  const toggleSubDropdown = (name) => {
    setOpenSubDropdown(openSubDropdown === name ? null : name);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("adminId");
    localStorage.removeItem("pagesAccess");
    localStorage.removeItem("role");
    alert("Logout successful");
    window.location.href = "/";
  };

  const elements = [
    {
      icon: <i className="ri-home-fill text-white"></i>,
      name: "Home",
      path: "/dashboard",
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
        {elements.map((item, idx) => (
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
              <Link
                to={item.path || "#"}
                className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-[#D9F3EA] hover:text-[#00B074] duration-300 cursor-pointer"
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

export default Sidebar;