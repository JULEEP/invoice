import { FaCalendar, FaFileMedical, FaXRay, FaFileAlt, FaBoxOpen, FaListUl, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DiagnosticDashboard = () => {
  const navigate = useNavigate();

  const diagnosticMetrics = [
    {
      name: "Bookings",
      icon: <FaCalendar size={24} />,
      path: "/diagnostic/mybookings",
    },
    {
      name: "Add Test List",
      icon: <FaFileMedical size={24} />,
      path: "/diagnostic/createlabtest",
    },
    {
      name: "Add Scan & X-ray",
      icon: <FaXRay size={24} />,
      path: "/diagnostic/add-scan-xray",
    },
    {
      name: "Get Scan & X-ray",
      icon: <FaFileAlt size={24} />,
      path: "/diagnostic/getscanxray",
    },
    {
      name: "Add Packages",
      icon: <FaBoxOpen size={24} />,
      path: "/diagnostic/add-packages",
    },
    {
      name: "Package List",
      icon: <FaListUl size={24} />,
      path: "/diagnostic/getpackages",
    },
    {
      name: "Profile",
      icon: <FaUserCircle size={24} />,
      path: "/diagnostic/mydiagnostic",
    },
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {diagnosticMetrics.map((metric, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(metric.path)}
            className="bg-white rounded-lg shadow-md p-5 text-center cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="text-4xl mb-3 text-blue-600 mx-auto">{metric.icon}</div>
            <h4 className="text-lg font-semibold text-[#188753]">{metric.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticDashboard;
