import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const DoctorSidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    const storedDoctorName = localStorage.getItem("doctorName");
    if (storedDoctorName) {
      setDoctorName(storedDoctorName);
    }
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://api.credenthealth.com/api/admin/logout-doctor", {}, { withCredentials: true });

      localStorage.removeItem("authToken");
      localStorage.removeItem("doctorId");
      localStorage.removeItem("doctorName");

      alert("Logout successful");
      window.location.href = "/doctor-login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-home-2-fill text-white" />,
      name: "Dashboard",
      path: "/doctor/doctordashboard",
    },
    {
      icon: <i className="ri-profile-fill text-white" />,
      name: "Profile",
      dropdown: [{ name: "View Profile", path: "/doctor/doctorprofile" }],
    },
    {
      icon: <i className="ri-calendar-check-fill text-white" />,
      name: "Appointments",
      path: "/doctor/appointments",
    },
    {
      icon: <i className="ri-article-fill text-white" />,
      name: "Blogs",
      dropdown: [
        { name: "Add Blog", path: "/doctor/createblogs" },
        { name: "All Blogs", path: "/doctor/doctorblogs" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white" />,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 overflow-y-scroll no-scrollbar h-full flex flex-col 
        ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"} 
        bg-gradient-to-r from-blue-500 to-purple-600`}
    >
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl bg-blue-700 bg-opacity-20 backdrop-blur-md">
        {doctorName ? doctorName : "Doctor Panel"}
      </div>

      <nav className={`flex flex-col ${isCollapsed && !isMobile && "items-center"} mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-white/10 duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform transition-transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-white/90">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium hover:text-white hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-white">•</span>
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
                className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-white/10 duration-300 cursor-pointer"
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

export default DoctorSidebar;
