import { useState } from "react";
import { RiMenu2Line, RiMenu3Line, RiFullscreenLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const DoctorNavbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate("/doctor/profile");
  };

  const handleAppointments = () => {
    navigate("/doctor/appointments");
  };

  return (
    <nav className="sticky top-0 w-full p-4 flex items-center justify-between shadow-md z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-white" />
        ) : (
          <RiMenu3Line className="text-2xl text-white" />
        )}
      </button>

      <div className="flex items-center gap-3">
        <button className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 duration-300">
          <RiFullscreenLine className="text-white" />
        </button>

        <div className="flex flex-col justify-center items-center">
          <img
            className="rounded-full w-[2vw] min-w-[35px] max-w-[45px] border border-white"
            src="/CompanyLogo.png"
            alt="Company Logo"
          />
          <h1 className="text-xs font-medium text-white">Doctor</h1>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;
