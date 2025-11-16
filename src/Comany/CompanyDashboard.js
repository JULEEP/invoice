import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaUserPlus, FaUserAlt, FaHospital } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    const fetchCompanyStats = async () => {
      try {
        const companyId = localStorage.getItem("companyId");

        if (!companyId) {
          alert("Company ID not found in localStorage");
          return;
        }

        const res = await axios.get(
          `https://api.credenthealth.com/api/admin/staffscount/${companyId}`
        );
        const { totalStaff } = res.data;

        setStaffCount(totalStaff);
      } catch (error) {
        console.error("Error fetching company stats:", error);
      }
    };

    fetchCompanyStats();
  }, []);

  const companyMetrics = [
     {
    name: "Beneficiaries",
    value: staffCount,
    path: "/company/alldiagnostic", // ✅ Fixed path
  },
    {
      name: "Add Beneficiaries",
      icon: <FaUserPlus size={30} />,
      path: "/company/add-benificary",
    },
    {
      name: "View Profile",
      icon: <FaUserAlt size={30} />,
      path: "/company/profile",
    },
    {
      name: "View Diagnostics",
      icon: <FaHospital size={30} />,
      path: "/company/alldiagnostic",
    },
  ];

  const revenueData = [
    { name: "Jan", revenue: 20000 },
    { name: "Feb", revenue: 22000 },
    { name: "Mar", revenue: 24000 },
    { name: "Apr", revenue: 28000 },
    { name: "May", revenue: 30000 },
  ];

  const handleCardClick = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-100">
      {/* Stats Cards */}
      <div className="md:col-span-4 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {companyMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200 flex flex-col items-center justify-center"
            onClick={() => handleCardClick(metric.path)}
          >
            {metric.icon && (
              <div className="text-blue-600 mb-2 flex justify-center">
                {metric.icon}
              </div>
            )}
            {metric.value !== undefined && (
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {metric.value}
              </div>
            )}
            <h4 className="text-lg font-semibold text-[#188753]">{metric.name}</h4>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Monthly Revenue (Last 5 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
