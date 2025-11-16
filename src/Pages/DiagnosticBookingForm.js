import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaEdit, FaTrash, FaEye, FaFileMedical, FaFilePdf, FaCalendarAlt, FaFilter, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";

const DiagnosticsBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [editBooking, setEditBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [uploadModal, setUploadModal] = useState({
    show: false,
    type: null, // 'report' or 'prescription'
    bookingId: null,
    file: null,
    loading: false
  });

  // Date filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Checkbox states
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [downloadType, setDownloadType] = useState("both"); // 'reports', 'prescriptions', 'both'
  const [downloadLoading, setDownloadLoading] = useState(false);

  const navigate = useNavigate();

  const handleViewBooking = (booking) => {
    navigate(`/booking/${booking.appointmentId}`);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("https://api.credenthealth.com/api/admin/diagnostic-bookings");
      setBookings(res.data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const lowercaseStatus = newStatus.toLowerCase();

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/update/${editBooking.appointmentId}`,
        { newStatus: lowercaseStatus }
      );

      if (res.status === 200) {
        const updatedBookings = bookings.map(booking =>
          booking.appointmentId === editBooking.appointmentId
            ? { ...booking, status: lowercaseStatus }
            : booking
        );
        setBookings(updatedBookings);
        setEditBooking(null);
        setNewStatus("");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      const res = await axios.delete(
        `https://api.credenthealth.com/api/admin/deleteappointments/${appointmentId}`
      );

      if (res.status === 200) {
        alert('Booking deleted successfully');
        setBookings(prevBookings =>
          prevBookings.filter(booking => booking.appointmentId !== appointmentId)
        );
      } else {
        alert(res.data.message || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Server error');
    }
  };

  const handleFileChange = (e) => {
    setUploadModal({
      ...uploadModal,
      file: e.target.files[0]
    });
  };

  const openUploadModal = (type, bookingId) => {
    setUploadModal({
      show: true,
      type,
      bookingId,
      file: null,
      loading: false
    });
  };

  const closeUploadModal = () => {
    setUploadModal({
      show: false,
      type: null,
      bookingId: null,
      file: null,
      loading: false
    });
  };

  const handleFileUpload = async () => {
    if (!uploadModal.file) {
      alert('Please select a file first');
      return;
    }

    try {
      setUploadModal(prev => ({ ...prev, loading: true }));

      const formData = new FormData();
      const fieldName = uploadModal.type === 'report' ? 'report' : 'prescription';
      formData.append(fieldName, uploadModal.file);

      const endpoint =
        uploadModal.type === 'report'
          ? `https://api.credenthealth.com/api/admin/upload-report-diagnostic/${uploadModal.bookingId}`
          : `https://api.credenthealth.com/api/admin/upload-prescription-diagnostic/${uploadModal.bookingId}`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert(`${uploadModal.type === 'report' ? 'Report' : 'Prescription'} uploaded successfully`);
        fetchBookings();
        closeUploadModal();
      } else {
        alert(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploadModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Date filter functions
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (dateString) => {
    if (!dateString) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(dateString);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isInDateRange = (dateString, startDate, endDate) => {
    if (!dateString || !startDate || !endDate) return false;
    const date = new Date(dateString);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    return date >= start && date <= end;
  };

  // Apply date filter
  const filterByDate = (booking) => {
    if (dateFilter === "all") return true;
    if (dateFilter === "today") return isToday(booking.appointment_date);
    if (dateFilter === "yesterday") return isYesterday(booking.appointment_date);
    if (dateFilter === "thisMonth") return isThisMonth(booking.appointment_date);
    if (dateFilter === "custom") {
      return isInDateRange(booking.appointment_date, customStartDate, customEndDate);
    }
    return true;
  };

  const filteredBookings = bookings
    .filter(filterByDate)
    .filter((booking) =>
      booking.diagnostic_name?.toLowerCase().includes(search.toLowerCase()) ||
      (booking.diagnosticBookingId && booking.diagnosticBookingId.toLowerCase().includes(search.toLowerCase())) ||
      (booking.packageId && `PKG${booking.packageId.slice(-2)}`.toLowerCase().includes(search.toLowerCase())) ||
      booking.staff_name?.toLowerCase().includes(search.toLowerCase())
    );

  const getBookingId = (booking) => {
    if (booking.diagnosticBookingId) {
      return booking.diagnosticBookingId;
    } else if (booking.packageId) {
      return `PKG${booking.packageId.slice(-2)}`;
    }
    return "N/A";
  };

  // Checkbox handling functions
  const handleSelectBooking = (appointmentId) => {
    setSelectedBookings(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.appointmentId));
    }
    setSelectAll(!selectAll);
  };

  // Reset select all when filtered bookings change
  useEffect(() => {
    setSelectAll(false);
    setSelectedBookings([]);
  }, [filteredBookings, currentPage]);

  // Download functions
  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return { blob, filename };
    } catch (error) {
      console.error(`Error downloading file: ${filename}`, error);
      return null;
    }
  };

  const handleBulkDownload = async () => {
    if (selectedBookings.length === 0) {
      alert("Please select at least one booking to download files.");
      return;
    }

    setDownloadLoading(true);

    try {
      const zip = new JSZip();
      let fileCount = 0;

      // Get selected bookings data
      const selectedBookingData = filteredBookings.filter(booking =>
        selectedBookings.includes(booking.appointmentId)
      );

      for (const booking of selectedBookingData) {
        const bookingId = getBookingId(booking);
        const folder = zip.folder(bookingId);

        // Download report if available and requested
        if ((downloadType === "reports" || downloadType === "both") && booking.report_file) {
          const reportUrl = `https://api.credenthealth.com${booking.report_file}`;
          const reportFile = await downloadFile(reportUrl, `report_${bookingId}.pdf`);
          if (reportFile) {
            folder.file(`report_${bookingId}.pdf`, reportFile.blob);
            fileCount++;
          }
        }

        // Download prescription if available and requested
        if ((downloadType === "prescriptions" || downloadType === "both") && booking.diagPrescription) {
          const prescriptionUrl = `https://api.credenthealth.com${booking.diagPrescription}`;
          const prescriptionFile = await downloadFile(prescriptionUrl, `prescription_${bookingId}.pdf`);
          if (prescriptionFile) {
            folder.file(`prescription_${bookingId}.pdf`, prescriptionFile.blob);
            fileCount++;
          }
        }
      }

      if (fileCount === 0) {
        alert("No files available for download for the selected bookings.");
        setDownloadLoading(false);
        return;
      }

      // Generate and download zip file
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `diagnostic_files_${new Date().toISOString().split('T')[0]}.zip`);

      alert(`Successfully downloaded ${fileCount} file(s) in zip format.`);
    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("Error downloading files. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDateWiseDownload = async () => {
    if (filteredBookings.length === 0) {
      alert("No bookings found for the selected date range.");
      return;
    }

    setDownloadLoading(true);

    try {
      const zip = new JSZip();
      let fileCount = 0;

      for (const booking of filteredBookings) {
        const bookingId = getBookingId(booking);
        const folder = zip.folder(bookingId);

        // Download report if available
        if (booking.report_file) {
          const reportUrl = `https://api.credenthealth.com${booking.report_file}`;
          const reportFile = await downloadFile(reportUrl, `report_${bookingId}.pdf`);
          if (reportFile) {
            folder.file(`report_${bookingId}.pdf`, reportFile.blob);
            fileCount++;
          }
        }

        // Download prescription if available
        if (booking.diagPrescription) {
          const prescriptionUrl = `https://api.credenthealth.com${booking.diagPrescription}`;
          const prescriptionFile = await downloadFile(prescriptionUrl, `prescription_${bookingId}.pdf`);
          if (prescriptionFile) {
            folder.file(`prescription_${bookingId}.pdf`, prescriptionFile.blob);
            fileCount++;
          }
        }
      }

      if (fileCount === 0) {
        alert("No files available for download for the selected date range.");
        setDownloadLoading(false);
        return;
      }

      // Generate and download zip file
      const content = await zip.generateAsync({ type: "blob" });
      
      let filename = "diagnostic_files";
      if (dateFilter === "custom" && customStartDate && customEndDate) {
        filename = `diagnostic_files_${customStartDate}_to_${customEndDate}`;
      } else if (dateFilter !== "all") {
        filename = `diagnostic_files_${dateFilter}`;
      }
      
      saveAs(content, `${filename}.zip`);

      alert(`Successfully downloaded ${fileCount} file(s) for ${filteredBookings.length} booking(s).`);
    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("Error downloading files. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredBookings.map(booking => ({
      "Booking ID": getBookingId(booking),
      "Diagnostic": booking.diagnostic_name || "N/A",
      "User": booking.staff_name || "N/A",
      "Service Type": booking.service_type || "N/A",
      "Date": booking.appointment_date || "N/A",
      "Time": booking.time_slot === "null" ? "-" : booking.time_slot || "N/A",
      "Total": `₹${booking.total_price || "0"}`,
      "Payable": `₹${booking.payable_amount || "0"}`,
      "Status": booking.status || "N/A",
      "Report": booking.report_file ? "Yes" : "No",
      "Prescription": booking.diagPrescription ? "Yes" : "No"
    }));

    // Set column widths
    const wscols = [
      { wch: 15 }, // Booking ID
      { wch: 20 }, // Diagnostic
      { wch: 15 }, // User
      { wch: 15 }, // Service Type
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 10 }, // Total
      { wch: 10 }, // Payable
      { wch: 12 }, // Status
      { wch: 8 },  // Report
      { wch: 12 }  // Prescription
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diagnostic Bookings");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "diagnostic_bookings.xlsx");
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Count bookings by date filter
  const countBookingsByDateFilter = (filterType) => {
    if (filterType === "all") return bookings.length;
    if (filterType === "today") return bookings.filter(booking => isToday(booking.appointment_date)).length;
    if (filterType === "yesterday") return bookings.filter(booking => isYesterday(booking.appointment_date)).length;
    if (filterType === "thisMonth") return bookings.filter(booking => isThisMonth(booking.appointment_date)).length;
    if (filterType === "custom") {
      return bookings.filter(booking =>
        isInDateRange(booking.appointment_date, customStartDate, customEndDate)
      ).length;
    }
    return 0;
  };

  // Apply custom filter when dates are selected
  const handleCustomDateSelect = () => {
    if (customStartDate && customEndDate) {
      setDateFilter("custom");
    }
  };

  // Reset custom dates when switching to another filter
  useEffect(() => {
    if (dateFilter !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  }, [dateFilter]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Diagnostics Booking List</h2>
      </div>

      {/* Bulk Download Section */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
          <FaDownload /> Bulk File Download
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Download Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Download Type</label>
            <select 
              className="w-full p-2 border rounded text-sm"
              value={downloadType}
              onChange={(e) => setDownloadType(e.target.value)}
            >
              <option value="both">Reports & Prescriptions</option>
              <option value="reports">Reports Only</option>
              <option value="prescriptions">Prescriptions Only</option>
            </select>
          </div>

          {/* Selected Bookings Download */}
          <div>
            <label className="block text-sm font-medium mb-1">Download Selected ({selectedBookings.length})</label>
            <button
              onClick={handleBulkDownload}
              disabled={selectedBookings.length === 0 || downloadLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center justify-center gap-2 disabled:bg-blue-300"
            >
              <FaDownload /> 
              {downloadLoading ? 'Downloading...' : 'Download Selected'}
            </button>
          </div>

          {/* Date-wise Download */}
          <div>
            <label className="block text-sm font-medium mb-1">Date-wise Download</label>
            <button
              onClick={handleDateWiseDownload}
              disabled={filteredBookings.length === 0 || downloadLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded text-sm flex items-center justify-center gap-2 disabled:bg-green-300"
            >
              <FaDownload /> 
              {downloadLoading ? 'Downloading...' : `Download All (${filteredBookings.length})`}
            </button>
          </div>

          {/* Selection Info */}
          <div className="bg-white p-3 rounded border">
            <div className="text-sm">
              <div><strong>Selected:</strong> {selectedBookings.length} bookings</div>
              <div><strong>Filtered:</strong> {filteredBookings.length} bookings</div>
              <div><strong>Total:</strong> {bookings.length} bookings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <FaFilter className="text-blue-500" /> Filter Bookings by Date
          </h3>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="px-3 py-1 bg-gray-200 rounded text-sm flex items-center gap-1"
          >
            <FaCalendarAlt /> {showDateFilter ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showDateFilter && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "all" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("all")}
            >
              <div className="font-semibold">All</div>
              <div className="text-sm text-gray-600">{countBookingsByDateFilter("all")} bookings</div>
            </div>

            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "today" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("today")}
            >
              <div className="font-semibold">Today</div>
              <div className="text-sm text-gray-600">{countBookingsByDateFilter("today")} bookings</div>
            </div>

            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "yesterday" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("yesterday")}
            >
              <div className="font-semibold">Yesterday</div>
              <div className="text-sm text-gray-600">{countBookingsByDateFilter("yesterday")} bookings</div>
            </div>

            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "thisMonth" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("thisMonth")}
            >
              <div className="font-semibold">This Month</div>
              <div className="text-sm text-gray-600">{countBookingsByDateFilter("thisMonth")} bookings</div>
            </div>

            <div
              className={`p-3 rounded text-center ${dateFilter === "custom" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
            >
              <div className="font-semibold mb-2">Custom Range</div>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  className="text-sm p-1 border rounded"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFilter("custom");
                  }}
                />
                <input
                  type="date"
                  className="text-sm p-1 border rounded"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFilter("custom");
                  }}
                />
                <button
                  className="text-xs bg-blue-500 text-white py-1 rounded"
                  onClick={handleCustomDateSelect}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {dateFilter === "custom" && customStartDate && customEndDate && (
          <div className="mt-3 text-sm text-blue-600">
            Showing bookings from {customStartDate} to {customEndDate}: {countBookingsByDateFilter("custom")} bookings
          </div>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm flex-grow"
          placeholder="Search by diagnostic name, ID or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-1"
        >
          <FaFileExcel /> Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4"
                />
              </th>
              <th className="p-2 border">Booking ID</th>
              <th className="p-2 border">Diagnostic</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Service Type</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Payable</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Report</th>
              <th className="p-2 border">Prescription</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <tr key={booking.appointmentId} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.appointmentId)}
                      onChange={() => handleSelectBooking(booking.appointmentId)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="p-2 border">{getBookingId(booking)}</td>
                  <td className="p-2 border">{booking.diagnostic_name}</td>
                  <td className="p-2 border">
                    {booking.staffId?.name} ({booking.staffId?._id?.slice(-4)})
                  </td>
                  <td className="p-2 border">{booking.service_type}</td>
                  <td className="p-2 border">{booking.appointment_date}</td>
                  <td className="p-2 border">{booking.time_slot === "null" ? "-" : booking.time_slot}</td>
                  <td className="p-2 border">₹{booking.total_price}</td>
                  <td className="p-2 border">₹{booking.payable_amount}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${booking.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {booking.status || 'N/A'}
                    </span>
                  </td>

                  <td className="p-2 border text-center">
                    {booking.report_file ? (
                      <a
                        href={`https://api.credenthealth.com${booking.report_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaFilePdf />
                      </a>
                    ) : (
                      <button
                        onClick={() => openUploadModal('report', booking.appointmentId)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Upload Report"
                      >
                        <FaFileMedical />
                      </button>
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {booking.diagPrescription ? (
                      <a
                        href={`https://api.credenthealth.com${booking.diagPrescription}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaFilePdf />
                      </a>
                    ) : (
                      <button
                        onClick={() => openUploadModal('prescription', booking.appointmentId)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Upload Prescription"
                      >
                        <FaFileMedical />
                      </button>
                    )}
                  </td>
                  <td className="p-2 border text-center flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditBooking(booking);
                        setNewStatus(booking.status);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(booking.appointmentId)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="text-green-600 hover:text-green-800"
                      title="View"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="p-4 text-center text-gray-500">
                  No bookings found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          className="px-4 py-2 bg-gray-300 rounded-l"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-100">
          Page {currentPage} of {Math.ceil(filteredBookings.length / itemsPerPage)}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          className="px-4 py-2 bg-gray-300 rounded-r"
          disabled={currentPage * itemsPerPage >= filteredBookings.length}
        >
          Next
        </button>
      </div>

      {/* Modal for status update */}
      {editBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Update Booking Status</h3>
            <div className="mb-4">
              <label className="block text-sm">Booking ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={getBookingId(editBooking)}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Diagnostic Center</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editBooking.diagnostic_name}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditBooking(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for file upload */}
      {uploadModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">
              Upload {uploadModal.type === 'report' ? 'Report' : 'Prescription'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm mb-2">Select File (PDF, DOC, JPG, PNG)</label>
              <input
                type="file"
                className="w-full p-2 border rounded"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeUploadModal}
                className="px-4 py-2 bg-gray-300 rounded"
                disabled={uploadModal.loading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={uploadModal.loading || !uploadModal.file}
              >
                {uploadModal.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsBookingList;