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
import { useState, useEffect } from "react";
import axios from "axios";
import Blogs from "./Blog";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    companies: 0,
    diagnostics: 0,
    appointments: 0,
    bookings: 0,
    staff: 0,
    doctors: 0,
    hra: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "https://api.credenthealth.com/api/admin/getdashboardcount"
        );

        if (response.data.success && response.data.data) {
          const { counts, chart } = response.data.data;
          setDashboardData(counts || {});
          setChartData(chart || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-100">
      {/* Stat Cards */}
      <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Companies" value={dashboardData.companies} />
        <StatCard title="Diagnostics" value={dashboardData.diagnostics} />
        <StatCard title="Doctor Appointments" value={dashboardData.appointments} />
        <StatCard title="HRA" value={dashboardData.hra} />
        <StatCard title="User" value={dashboardData.staff} />
        <StatCard title="Doctors" value={dashboardData.doctors} />
        <StatCard title="Diagnostic Booking" value={dashboardData.bookings} />
      </div>

      {/* Charts */}
      <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Doctor Appointments (Last 5 Months)"
          data={chartData}
          dataKey="doctor"
          barColor="#4CAF50"
          legend="Doctor Appointments"
        />
        <ChartCard
          title="Diagnostic Bookings (Last 5 Months)"
          data={chartData}
          dataKey="diagnostic"
          barColor="#2196F3"
          legend="Diagnostic Bookings"
        />
      </div>

      {/* Blogs */}
      <div className="md:col-span-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Latest Blogs</h3>
          <Blogs />
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value }) => (
  <div className="bg-white shadow-lg rounded-lg p-4 text-center">
    <div className="text-3xl font-bold text-blue-900">{value ?? 0}</div>
    <h4 className="text-lg font-semibold text-[#188753]">{title}</h4>
  </div>
);

// Reusable Chart Card Component
const ChartCard = ({ title, data, dataKey, barColor, legend }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={barColor} name={legend} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default Dashboard;
