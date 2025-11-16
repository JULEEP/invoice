import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf, FaRupeeSign, FaChevronLeft, FaChevronRight, FaFilter, FaCalendarAlt } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";

const AcceptedAppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const pageSize = 5;

  useEffect(() => {
    fetchAcceptedAppointments();
  }, []);

  const fetchAcceptedAppointments = async () => {
    try {
      const res = await axios.get("https://api.credenthealth.com/api/admin/acceptedappointments");
      if (res.data && res.data.appointments) {
        setAppointments(res.data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch accepted appointments:", error);
    }
  };

  // Helper function to check if a date is today
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Helper function to check if a date is yesterday
  const isYesterday = (dateString) => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
  };

  // Helper function to check if a date is in this month
  const isThisMonth = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Helper function to check if a date is in custom range
  const isInCustomRange = (dateString) => {
    if (!customStartDate || !customEndDate) return false;
    
    const date = new Date(dateString);
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    end.setHours(23, 59, 59, 999); // Set to end of day
    
    return date >= start && date <= end;
  };

  // Apply date filters
  const filterByDate = (appt) => {
    switch (dateFilter) {
      case "today":
        return isToday(appt.appointment_date);
      case "yesterday":
        return isYesterday(appt.appointment_date);
      case "thisMonth":
        return isThisMonth(appt.appointment_date);
      case "custom":
        return isInCustomRange(appt.appointment_date);
      default:
        return true; // "all" - no date filter
    }
  };

  // Count appointments for each filter
  const countAppointments = (filterType) => {
    return appointments.filter(appt => {
      switch (filterType) {
        case "today":
          return isToday(appt.appointment_date);
        case "yesterday":
          return isYesterday(appt.appointment_date);
        case "thisMonth":
          return isThisMonth(appt.appointment_date);
        case "custom":
          return isInCustomRange(appt.appointment_date);
        default:
          return true;
      }
    }).length;
  };

  const filteredAppointments = appointments.filter(appt =>
    filterByDate(appt) && (
      (appt.staff_name && appt.staff_name.toLowerCase().includes(search.toLowerCase())) ||
      (appt.consultation_type && appt.consultation_type.toLowerCase().includes(search.toLowerCase())) ||
      (appt.doctor?.name && appt.doctor.name.toLowerCase().includes(search.toLowerCase())) ||
      (appt.doctor?.specialization && appt.doctor.specialization.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredAppointments.length / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const applyCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      setDateFilter("custom");
      setCurrentPage(1);
    }
  };

  const resetFilters = () => {
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSearch("");
    setCurrentPage(1);
  };

  const headers = [
    { label: "SI No", key: "siNo" },
    { label: "Doctor Name", key: "doctor.name" },
    { label: "Specialization", key: "doctor.specialization" },
    { label: "User Name", key: "staff_name" },
    { label: "Consultation Type", key: "consultation_type" },
    { label: "Status", key: "status" },
    { label: "Date", key: "appointment_date" },
    { label: "Time Slot", key: "time_slot" },
    { label: "Total Price (₹)", key: "total_price" },
    { label: "Discount (₹)", key: "discount" },
    { label: "Payable Amount (₹)", key: "payable_amount" }
  ];

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredAppointments.map((appt, idx) => ({
        "SI No": idx + 1,
        "Doctor Name": appt.doctor?.name || "N/A",
        "Specialization": appt.doctor?.specialization || "N/A",
        "Staff Name": appt.staff_name || "N/A",
        "Consultation Type": appt.consultation_type,
        "Status": appt.status,
        "Date": formatDate(appt.appointment_date),
        "Time Slot": appt.time_slot,
        "Total Price (₹)": appt.total_price,
        "Discount (₹)": appt.discount,
        "Payable Amount (₹)": appt.payable_amount
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AcceptedAppointments");
    XLSX.writeFile(wb, "accepted_appointments.xlsx");
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) ? "Invalid Date" : date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Accepted Appointments</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search appointments..."
            className="px-3 py-2 border rounded text-sm w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>
          <CSVLink
            data={filteredAppointments.map((appt, idx) => ({
              siNo: idx + 1,
              ...appt,
              "doctor.name": appt.doctor?.name || "N/A",
              "doctor.specialization": appt.doctor?.specialization || "N/A",
              appointment_date: formatDate(appt.appointment_date)
            }))}
            headers={headers}
            filename="accepted_appointments.csv"
            className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
          >
            <FaFilePdf /> CSV
          </CSVLink>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm flex items-center gap-2"
          >
            <FaFilePdf /> Excel
          </button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Filter by Date</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            <button
              onClick={() => { setDateFilter("all"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${dateFilter === "all" ? "bg-blue-500 text-white" : "bg-white border"}`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => { setDateFilter("today"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${dateFilter === "today" ? "bg-blue-500 text-white" : "bg-white border"}`}
            >
              Today ({countAppointments("today")})
            </button>
            <button
              onClick={() => { setDateFilter("yesterday"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${dateFilter === "yesterday" ? "bg-blue-500 text-white" : "bg-white border"}`}
            >
              Yesterday ({countAppointments("yesterday")})
            </button>
            <button
              onClick={() => { setDateFilter("thisMonth"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${dateFilter === "thisMonth" ? "bg-blue-500 text-white" : "bg-white border"}`}
            >
              This Month ({countAppointments("thisMonth")})
            </button>
            <button
              onClick={() => { setDateFilter("custom"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${dateFilter === "custom" ? "bg-blue-500 text-white" : "bg-white border"}`}
            >
              Custom Range
            </button>
          </div>

          {dateFilter === "custom" && (
            <div className="flex flex-col md:flex-row gap-4 items-end p-3 bg-white rounded border">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">From Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">To Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                onClick={applyCustomDateFilter}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}

          {dateFilter === "custom" && customStartDate && customEndDate && (
            <div className="mt-2 text-sm text-gray-600">
              Showing appointments from {new Date(customStartDate).toLocaleDateString()} to {new Date(customEndDate).toLocaleDateString()}
              {countAppointments("custom") > 0 ? ` (${countAppointments("custom")} found)` : " (No appointments found)"}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">SI No</th>
              <th className="p-2 border text-left">Doctor Name</th>
              <th className="p-2 border text-left">Specialization</th>
              <th className="p-2 border text-left">User Name</th>
              <th className="p-2 border text-left">Consultation Type</th>
              <th className="p-2 border text-left">Status</th>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Time Slot</th>
              <th className="p-2 border text-left">Total MRP</th>
              <th className="p-2 border text-left">Discount</th>
              <th className="p-2 border text-left">Payable Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appt, index) => (
                <tr key={appt.appointmentId} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="p-2 border">{appt.doctor?.name || "N/A"}</td>
                  <td className="p-2 border">{appt.doctor?.specialization || "N/A"}</td>
                  <td className="p-2 border">{appt.staff_name || "N/A"}</td>
                  <td className="p-2 border capitalize">{appt.consultation_type}</td>
                  <td className="p-2 border">
                    {appt.status === 'Accepted' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 capitalize">
                        {appt.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600 capitalize">{appt.status || 'N/A'}</span>
                    )}
                  </td>
                  <td className="p-2 border">{formatDate(appt.appointment_date)}</td>
                  <td className="p-2 border">{appt.time_slot}</td>
                  <td className="p-2 border">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-sm" />
                      {appt.total_price}
                    </div>
                  </td>
                  <td className="p-2 border">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-sm" />
                      {appt.discount}
                    </div>
                  </td>
                  <td className="p-2 border font-medium">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-sm" />
                      {appt.payable_amount}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="p-4 border text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filteredAppointments.length > pageSize && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <FaChevronLeft className="mr-1" /> Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {Math.ceil(filteredAppointments.length / pageSize)}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === Math.ceil(filteredAppointments.length / pageSize)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AcceptedAppointmentsList;