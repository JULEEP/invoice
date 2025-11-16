import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRupeeSign, FaFileExcel, FaFileCsv, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";

const DiagnosticsAcceptedBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchAcceptedBookings();
  }, []);

  const fetchAcceptedBookings = async () => {
    try {
      const response = await axios.get("https://api.credenthealth.com/api/admin/accepteddiagnosticbooking");
      if (response.data && response.data.appointments) {
        setBookings(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching accepted diagnostic bookings:", error);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    (booking.staff_name && booking.staff_name.toLowerCase().includes(search.toLowerCase())) ||
    (booking.service_type && booking.service_type.toLowerCase().includes(search.toLowerCase())) ||
    (booking.diagnostic?.name && booking.diagnostic.name.toLowerCase().includes(search.toLowerCase())) ||
    (booking.diagnostic?.specialization && booking.diagnostic.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredBookings.length / pageSize)) {
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
    { label: "Diagnostic Name", key: "diagnostic.name" },
    { label: "Specialization", key: "diagnostic.specialization" },
    { label: "User Name", key: "staff_name" },
    { label: "Service Type", key: "service_type" },
    { label: "Date", key: "date" },
    { label: "Time Slot", key: "time_slot" },
    { label: "Total Price (₹)", key: "total_price" },
    { label: "Discount (₹)", key: "discount" },
    { label: "Payable Amount (₹)", key: "payable_amount" },
    { label: "Status", key: "status" }
  ];

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredBookings.map((booking, idx) => ({
        "SI No": idx + 1,
        "Diagnostic Name": booking.diagnostic?.name || "N/A",
        "Specialization": booking.diagnostic?.specialization || "N/A",
        "Staff Name": booking.staff_name || "N/A",
        "Service Type": booking.service_type || "N/A",
        "Date": formatDate(booking.date),
        "Time Slot": booking.time_slot || "N/A",
        "Total Price (₹)": booking.total_price,
        "Discount (₹)": booking.discount,
        "Payable Amount (₹)": booking.payable_amount,
        "Status": booking.status
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AcceptedDiagnosticBookings");
    XLSX.writeFile(wb, "accepted_diagnostic_bookings.xlsx");
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString || dateString === "Invalid date") return "N/A";
      const date = new Date(dateString);
      return isNaN(date) ? dateString : date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (e) {
      return dateString || "N/A";
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Diagnostics Accepted Bookings</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search bookings..."
            className="px-3 py-2 border rounded text-sm w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <CSVLink
            data={filteredBookings.map((booking, idx) => ({
              siNo: idx + 1,
              ...booking,
              "diagnostic.name": booking.diagnostic?.name || "N/A",
              "diagnostic.specialization": booking.diagnostic?.specialization || "N/A",
              date: formatDate(booking.date)
            }))}
            headers={headers}
            filename="accepted_diagnostic_bookings.csv"
            className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
          >
            <FaFileCsv /> CSV
          </CSVLink>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm flex items-center gap-2"
          >
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">SI No</th>
              <th className="p-2 border text-left">Diagnostic Name</th>
              <th className="p-2 border text-left">User Name</th>
              <th className="p-2 border text-left">Service Type</th>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Time</th>
              <th className="p-2 border text-left">Total</th>
              <th className="p-2 border text-left">Discount</th>
              <th className="p-2 border text-left">Payable</th>
              <th className="p-2 border text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking, index) => (
                <tr key={booking.appointmentId} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="p-2 border">{booking.diagnostic?.name || "N/A"}</td>
                  <td className="p-2 border">{booking.staff_name || "N/A"}</td>
                  <td className="p-2 border capitalize">{booking.service_type || "N/A"}</td>
                  <td className="p-2 border">{formatDate(booking.date)}</td>
                  <td className="p-2 border">{booking.time_slot || "N/A"}</td>
                  <td className="p-2 border">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-sm" />
                      {booking.total_price}
                    </div>
                  </td>
                  <td className="p-2 border">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-sm" />
                      {booking.discount}
                    </div>
                  </td>
                  <td className="p-2 border font-medium">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1 text-sm" />
                      {booking.payable_amount}
                    </div>
                  </td>
                  <td className="p-2 border">
                    {booking.status?.toLowerCase() === 'accepted' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 capitalize">
                        {booking.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600 capitalize">{booking.status || 'N/A'}</span>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="p-4 border text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filteredBookings.length > pageSize && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <FaChevronLeft className="mr-1" /> Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {Math.ceil(filteredBookings.length / pageSize)}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === Math.ceil(filteredBookings.length / pageSize)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsAcceptedBooking;