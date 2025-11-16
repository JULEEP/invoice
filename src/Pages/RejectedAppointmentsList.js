import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf, FaRupeeSign, FaChevronLeft, FaChevronRight, FaVideo } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";

const RejectedAppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchRejectedAppointments();
  }, []);

  const fetchRejectedAppointments = async () => {
    try {
      const res = await axios.get("https://api.credenthealth.com/api/admin/rejectedappointments");
      if (res.data && res.data.appointments) {
        setAppointments(res.data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch rejected appointments:", error);
    }
  };

  const filteredAppointments = appointments.filter(appt =>
    (appt.staff_name && appt.staff_name.toLowerCase().includes(search.toLowerCase())) ||
    (appt.consultation_type && appt.consultation_type.toLowerCase().includes(search.toLowerCase())) ||
    (appt.doctor?.name && appt.doctor.name.toLowerCase().includes(search.toLowerCase())) ||
    (appt.doctor?.specialization && appt.doctor.specialization.toLowerCase().includes(search.toLowerCase()))
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

  const headers = [
    { label: "SI No", key: "siNo" },
    { label: "Doctor Name", key: "doctor.name" },
    { label: "Specialization", key: "doctor.specialization" },
    { label: "Staff Name", key: "staff_name" },
    { label: "Consultation Type", key: "consultation_type" },
    { label: "Status", key: "status" },
    { label: "Date", key: "appointment_date" },
    { label: "Time Slot", key: "time_slot" },
    { label: "Meeting Link", key: "meeting_link" },
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
        "User Name": appt.staff_name || "N/A",
        "Consultation Type": appt.consultation_type,
        "Status": appt.status,
        "Date": formatDate(appt.appointment_date),
        "Time Slot": appt.time_slot,
        "Meeting Link": appt.consultation_type === "Online" ? appt.meeting_link : "N/A",
        "Total Price (₹)": appt.total_price,
        "Discount (₹)": appt.discount,
        "Payable Amount (₹)": appt.payable_amount
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RejectedAppointments");
    XLSX.writeFile(wb, "rejected_appointments.xlsx");
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
        <h2 className="text-xl font-semibold">Rejected Appointments</h2>
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
          <CSVLink
            data={filteredAppointments.map((appt, idx) => ({
              siNo: idx + 1,
              ...appt,
              "doctor.name": appt.doctor?.name || "N/A",
              "doctor.specialization": appt.doctor?.specialization || "N/A",
              appointment_date: formatDate(appt.appointment_date),
              meeting_link: appt.consultation_type === "Online" ? appt.meeting_link : "N/A"
            }))}
            headers={headers}
            filename="rejected_appointments.csv"
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
                    {appt.status === 'Rejected' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 capitalize">
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
                <td colSpan="12" className="p-4 border text-center text-gray-500">
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

export default RejectedAppointmentsList;