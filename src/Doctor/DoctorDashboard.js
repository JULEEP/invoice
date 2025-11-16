import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaBlog,
  FaEye
} from "react-icons/fa"; // Added FaEye for 'View Blogs'
import { useNavigate } from "react-router-dom";
import DoctorBlogs from "./DoctorBlogs";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [doctorDetails, setDoctorDetails] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        const doctorId = localStorage.getItem("doctorId");

        if (!doctorId) {
          alert("Doctor ID not found in localStorage");
          return;
        }

        const res = await axios.get(
          `https://api.credenthealth.com/api/doctor/stats/${doctorId}`
        );
        const { totalAppointments, doctorInfo } = res.data;

        setAppointmentCount(totalAppointments);
        setDoctorDetails(doctorInfo);
      } catch (error) {
        console.error("Error fetching doctor stats:", error);
        setError("Error fetching doctor data.");
      }
    };

    fetchDoctorStats();
  }, []);

  // Updated doctor metrics array
  const doctorMetrics = [
    {
      name: "Appointments",
      value: appointmentCount,
      icon: <FaCalendarCheck size={40} />,
      path: "/doctor/appointments",
    },
    {
      name: "Profile",
      icon: <FaClipboardList size={40} />,
      path: "/doctor/doctorprofile",
    },
    {
      name: "Add Blogs",
      icon: <FaBlog size={40} />,
      path: "/doctor/createblogs",
    },
    {
      name: "View Blogs",
      icon: <FaEye size={40} />,
      path: "/doctor/doctorblogs",
    },
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {doctorMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleCardClick(metric.path)}
          >
            <div className="flex justify-center items-center mb-4">
              <div className="text-blue-600">{metric.icon}</div>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {metric.value || ""}
            </div>
            <h4 className="text-lg font-semibold text-[#188753]">
              {metric.name}
            </h4>
          </div>
        ))}
      </div>

      {/* Blogs Section */}
      <DoctorBlogs />
    </div>
  );
};

export default DoctorDashboard;
