import { RiMenu2Line, RiMenu3Line, RiFullscreenLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const CompanyNavbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 w-full p-4 flex items-center shadow-lg z-50">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2 text-white">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl" />
        ) : (
          <RiMenu3Line className="text-2xl" />
        )}
      </button>

      <div className="flex justify-between items-center w-full">
        {/* Left side empty for future buttons if needed */}
        <div></div>

        <div className="flex gap-3 items-center">
          <button className="px-2 py-1 rounded-full bg-white text-blue-700 cursor-pointer hover:bg-gray-100 hover:text-blue-800 duration-300">
            <RiFullscreenLine />
          </button>

          <div className="flex flex-col justify-center items-center">
            <img
              className="rounded-full w-[2vw] min-w-[35px] max-w-[45px]"
              src="/CompanyLogo.png"
              alt="Company Logo"
            />
            <h1 className="text-xs font-medium text-white">Company</h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CompanyNavbar;
