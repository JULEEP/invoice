import { useState, useEffect } from "react";
import { MdCleaningServices } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line, RiFullscreenLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  const [diagnosticRequests, setDiagnosticRequests] = useState(0);
  const [doctorRequests, setDoctorRequests] = useState(0);

  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');

  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get("https://api.credenthealth.com/api/admin/getcount");
        setDiagnosticRequests(response.data.totalDiagnosticBookings || 0);
        setDoctorRequests(response.data.totalDoctorAppointments || 0);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    if (storedRole === "employee") {
      const storedEmployeeId = localStorage.getItem("employeeId");
      if (storedEmployeeId) {
        axios.get(`https://api.credenthealth.com/api/employee/${storedEmployeeId}`)
        .then(response => {
          setUserName(response.data.name || 'Employee');
        });
      }
    } else if (storedRole === "admin") {
      fetchCounts();
    }
  }, []);

  const handleClick = () => {
    navigate("/diagnosticslist");
  };

  const handleNavigation = () => {
    navigate("/appintmentlist");
  };

  const handleClearCache = () => {
    localStorage.clear();
    setCacheCleared(true);

    setTimeout(() => {
      setCacheCleared(false);
    }, 3000);
  };

  return (
    <nav className="bg-[#FFFFFF] text-black sticky top-0 w-full p-4 flex items-center shadow-lg z-50">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-2xl text-[#AAAAAA]" />
        )}
      </button>

      <div className="flex justify-between items-center w-full">
        <div className="flex gap-3 ml-4">
          {role === "admin" && <></>}

          {role === "employee" && (
            <button
              onClick={handleClick}
              className="font-semibold bg-[#F8FAF8] text-[#188753] p-3 rounded-md hover:bg-[#D9F3EA] duration-300"
            >
              View Diagnostics
            </button>
          )}
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex flex-col justify-center items-center">
            <img
              className="rounded-full w-[2vw]"
              src="https://tse2.mm.bing.net/th/id/OIP.Gfp0lwE6h7139625a-r3aAHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Company Logo"
            />
            <h1 className="text-xs">{role === "admin" ? "Admin" : userName || "Employee"}</h1>
          </div>
        </div>
      </div>

      {cacheCleared && (
        <div className="absolute top-4 right-4 p-4 bg-green-500 text-white rounded-md shadow-lg">
          Cache cleared successfully!
        </div>
      )}
    </nav>
  );
};

export default Navbar;
