import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaEye, FaUpload, FaFilePrescription, FaFileMedical, FaEdit, FaFilter, FaSearch, FaCalendarAlt, FaFileArchive } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";

const SingleDiagnosticBookings = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Counts for filter options
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    today: 0,
    yesterday: 0,
    thisMonth: 0,
    custom: 0
  });

  const [uploadModal, setUploadModal] = useState({
    show: false,
    type: "prescription",
    bookingId: null,
    file: null,
    loading: false,
  });

  const [editBooking, setEditBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Bulk download states
  const [bulkDownloadModal, setBulkDownloadModal] = useState({
    show: false,
    downloadType: "both", // "reports", "prescriptions", "both"
    startDate: "",
    endDate: "",
    loading: false,
    selectedAppointments: [] // For selective download
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Calculate filter counts whenever appointments change
    calculateFilterCounts();
    applyFilters();
  }, [appointments, searchTerm, dateFilter, customStartDate, customEndDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const diagnosticId = localStorage.getItem("diagnosticId");
    if (!diagnosticId) {
      alert("Diagnostic ID not found in localStorage");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.credenthealth.com/api/admin/diagnostic-bookings/${diagnosticId}`
      );
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts for each filter option
  const calculateFilterCounts = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const todayCount = appointments.filter(appt => 
      isSameDay(new Date(appt.appointment_date), today)
    ).length;
    
    const yesterdayCount = appointments.filter(appt => 
      isSameDay(new Date(appt.appointment_date), yesterday)
    ).length;
    
    const thisMonthCount = appointments.filter(appt => {
      const apptDate = new Date(appt.appointment_date);
      return apptDate >= firstDayOfMonth && apptDate <= lastDayOfMonth;
    }).length;
    
    setFilterCounts({
      all: appointments.length,
      today: todayCount,
      yesterday: yesterdayCount,
      thisMonth: thisMonthCount,
      custom: 0 // This will be calculated when custom dates are selected
    });
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Apply all filters (search and date)
  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appt => 
        appt.diagnosticBookingId?.toLowerCase().includes(term) ||
        appt.diagnostic_name?.toLowerCase().includes(term) ||
        appt.staff_name?.toLowerCase().includes(term) ||
        appt.service_type?.toLowerCase().includes(term) ||
        appt.status?.toLowerCase().includes(term)
      );
    }
    
    // Apply date filter
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    switch(dateFilter) {
      case "today":
        filtered = filtered.filter(appt => 
          isSameDay(new Date(appt.appointment_date), today)
        );
        break;
      case "yesterday":
        filtered = filtered.filter(appt => 
          isSameDay(new Date(appt.appointment_date), yesterday)
        );
        break;
      case "thisMonth":
        filtered = filtered.filter(appt => {
          const apptDate = new Date(appt.appointment_date);
          return apptDate >= firstDayOfMonth && apptDate <= lastDayOfMonth;
        });
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          
          filtered = filtered.filter(appt => {
            const apptDate = new Date(appt.appointment_date);
            return apptDate >= start && apptDate <= end;
          });
          
          // Update custom filter count
          setFilterCounts(prev => ({
            ...prev,
            custom: filtered.length
          }));
        }
        break;
      default:
        // "all" - no date filtering needed
        break;
    }
    
    setFilteredAppointments(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Upload Modal handlers
  const openUploadModal = (type, bookingId) => {
    setUploadModal({
      show: true,
      type,
      bookingId,
      file: null,
      loading: false,
    });
  };

  const closeUploadModal = () => {
    setUploadModal({
      show: false,
      type: "prescription",
      bookingId: null,
      file: null,
      loading: false,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUploadModal((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleFileUpload = async () => {
    if (!uploadModal.file) {
      alert("Please select a file first");
      return;
    }
    try {
      setUploadModal((prev) => ({ ...prev, loading: true }));

      const formData = new FormData();
      const fieldName = uploadModal.type === "report" ? "report" : "prescription";
      formData.append(fieldName, uploadModal.file);

      const endpoint =
        uploadModal.type === "report"
          ? `https://api.credenthealth.com/api/admin/upload-report-diagnostic/${uploadModal.bookingId}`
          : `https://api.credenthealth.com/api/admin/upload-prescription-diagnostic/${uploadModal.bookingId}`;

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert(`${uploadModal.type === "report" ? "Report" : "Prescription"} uploaded successfully`);
        await fetchAppointments();
        closeUploadModal();
      } else {
        alert(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploadModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const dataToExport = filteredAppointments.map((appt) => ({
      "Booking ID": appt.diagnosticBookingId,
      "Diagnostic Name": appt.diagnostic_name,
      "Patient Name": appt.staff_name,
      "Service Type": appt.service_type,
      "Appointment Date": new Date(appt.appointment_date).toLocaleDateString(),
      "Time Slot": appt.time_slot,
      "Total MRP": `₹${appt.total_price}`,
      Discount: `₹${appt.discount}`,
      "Payable Amount": `₹${appt.payable_amount}`,
      Status: appt.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appointments");
    XLSX.writeFile(wb, "Diagnostic_Appointments.xlsx");
  };

  // Status update handler
  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert("Please select a status");
      return;
    }
    try {
      const lowercaseStatus = newStatus.toLowerCase();

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/update/${editBooking.appointmentId}`,
        { newStatus: lowercaseStatus }
      );

      if (res.status === 200) {
        // Update locally
        const updatedAppointments = appointments.map((appt) =>
          appt.appointmentId === editBooking.appointmentId
            ? { ...appt, status: lowercaseStatus }
            : appt
        );
        setAppointments(updatedAppointments);
        setEditBooking(null);
        setNewStatus("");
        alert("Status updated successfully");
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating status");
    }
  };

  // Bulk Download Functions
  const openBulkDownloadModal = () => {
    setBulkDownloadModal({
      show: true,
      downloadType: "both",
      startDate: "",
      endDate: "",
      loading: false,
      selectedAppointments: filteredAppointments.map(appt => ({
        id: appt.appointmentId,
        bookingId: appt.diagnosticBookingId,
        selected: true
      }))
    });
  };

  const closeBulkDownloadModal = () => {
    setBulkDownloadModal({
      show: false,
      downloadType: "both",
      startDate: "",
      endDate: "",
      loading: false,
      selectedAppointments: []
    });
  };

  const handleBulkDownload = async () => {
    const { downloadType, startDate, endDate, selectedAppointments } = bulkDownloadModal;
    
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const selectedIds = selectedAppointments
      .filter(appt => appt.selected)
      .map(appt => appt.id);

    if (selectedIds.length === 0) {
      alert("Please select at least one appointment to download");
      return;
    }

    setBulkDownloadModal(prev => ({ ...prev, loading: true }));

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Filter appointments based on date range and selection
      const appointmentsToDownload = appointments.filter(appt => {
        const apptDate = new Date(appt.appointment_date);
        return apptDate >= start && apptDate <= end && selectedIds.includes(appt.appointmentId);
      });

      if (appointmentsToDownload.length === 0) {
        alert("No appointments found for the selected date range and criteria");
        return;
      }

      const zip = new JSZip();
      let fileCount = 0;

      // Create folders for better organization
      const reportsFolder = zip.folder("Reports");
      const prescriptionsFolder = zip.folder("Prescriptions");

      // Download files and add to zip
      for (const appt of appointmentsToDownload) {
        const baseName = `${appt.diagnosticBookingId}_${appt.staff_name}`;

        // Download report if available and requested
        if ((downloadType === "reports" || downloadType === "both") && appt.report_file) {
          try {
            const reportResponse = await fetch(`https://api.credenthealth.com${appt.report_file}`);
            if (reportResponse.ok) {
              const reportBlob = await reportResponse.blob();
              const fileExtension = getFileExtension(appt.report_file);
              reportsFolder.file(`${baseName}_report.${fileExtension}`, reportBlob);
              fileCount++;
            }
          } catch (error) {
            console.error(`Error downloading report for ${appt.diagnosticBookingId}:`, error);
          }
        }

        // Download prescription if available and requested
        if ((downloadType === "prescriptions" || downloadType === "both") && appt.diagPrescription) {
          try {
            const prescriptionResponse = await fetch(`https://api.credenthealth.com${appt.diagPrescription}`);
            if (prescriptionResponse.ok) {
              const prescriptionBlob = await prescriptionResponse.blob();
              const fileExtension = getFileExtension(appt.diagPrescription);
              prescriptionsFolder.file(`${baseName}_prescription.${fileExtension}`, prescriptionBlob);
              fileCount++;
            }
          } catch (error) {
            console.error(`Error downloading prescription for ${appt.diagnosticBookingId}:`, error);
          }
        }
      }

      if (fileCount === 0) {
        alert("No files available for download based on your selection");
        return;
      }

      // Generate and download zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diagnostic_files_${startDate}_to_${endDate}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Successfully downloaded ${fileCount} files`);
      closeBulkDownloadModal();

    } catch (error) {
      console.error("Error during bulk download:", error);
      alert("Error downloading files. Please try again.");
    } finally {
      setBulkDownloadModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Helper function to get file extension from URL
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // Toggle selection for individual appointments
  const toggleAppointmentSelection = (appointmentId) => {
    setBulkDownloadModal(prev => ({
      ...prev,
      selectedAppointments: prev.selectedAppointments.map(appt =>
        appt.id === appointmentId ? { ...appt, selected: !appt.selected } : appt
      )
    }));
  };

  // Select all/deselect all appointments
  const toggleSelectAll = (select) => {
    setBulkDownloadModal(prev => ({
      ...prev,
      selectedAppointments: prev.selectedAppointments.map(appt => ({
        ...appt,
        selected: select
      }))
    }));
  };

  if (loading) return <div className="p-4">Loading appointments...</div>;
  if (appointments.length === 0) return <div className="p-4">No appointments found.</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Diagnostic Center Appointments</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 text-sm"
          >
            <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={openBulkDownloadModal}
            className="px-4 py-2 bg-purple-500 text-white rounded flex items-center gap-2 text-sm"
            title="Bulk Download Files"
          >
            <FaFileArchive /> Bulk Download
          </button>
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2 text-sm"
            title="Download Excel"
          >
            <FaDownload /> Download Excel
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-4">
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, service, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded w-full"
          />
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FaCalendarAlt /> Filter by Date
              </h3>
              <button 
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
              <button
                onClick={() => setDateFilter("all")}
                className={`p-2 rounded border text-sm ${dateFilter === "all" ? "bg-blue-100 border-blue-500" : "bg-white"}`}
              >
                All Appointments ({filterCounts.all})
              </button>
              <button
                onClick={() => setDateFilter("today")}
                className={`p-2 rounded border text-sm ${dateFilter === "today" ? "bg-blue-100 border-blue-500" : "bg-white"}`}
              >
                Today ({filterCounts.today})
              </button>
              <button
                onClick={() => setDateFilter("yesterday")}
                className={`p-2 rounded border text-sm ${dateFilter === "yesterday" ? "bg-blue-100 border-blue-500" : "bg-white"}`}
              >
                Yesterday ({filterCounts.yesterday})
              </button>
              <button
                onClick={() => setDateFilter("thisMonth")}
                className={`p-2 rounded border text-sm ${dateFilter === "thisMonth" ? "bg-blue-100 border-blue-500" : "bg-white"}`}
              >
                This Month ({filterCounts.thisMonth})
              </button>
              <button
                onClick={() => setDateFilter("custom")}
                className={`p-2 rounded border text-sm ${dateFilter === "custom" ? "bg-blue-100 border-blue-500" : "bg-white"}`}
              >
                Custom Range {customStartDate && customEndDate && `(${filterCounts.custom})`}
              </button>
            </div>
            
            {dateFilter === "custom" && (
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
                >
                  Apply Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Showing {filteredAppointments.length} of {appointments.length} appointments
        {dateFilter !== "all" && (
          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Filtered by {dateFilter === "today" ? "Today" : 
                        dateFilter === "yesterday" ? "Yesterday" : 
                        dateFilter === "thisMonth" ? "This Month" : 
                        "Custom Range"}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Booking ID</th>
              <th className="p-2 border">Diagnostic Name</th>
              <th className="p-2 border">User Name</th>
              <th className="p-2 border">Service Type</th>
              <th className="p-2 border">Appointment Date</th>
              <th className="p-2 border">Time Slot</th>
              <th className="p-2 border">Total MRP</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">Payable Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Prescription</th>
              <th className="p-2 border">Report</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appt) => (
              <tr key={appt.appointmentId} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{appt.diagnosticBookingId}</td>
                <td className="p-2 border">{appt.diagnostic_name}</td>
                <td className="p-2 border">{appt.staff_name}</td>
                <td className="p-2 border">{appt.service_type}</td>
                <td className="p-2 border">{new Date(appt.appointment_date).toLocaleDateString()}</td>
                <td className="p-2 border">{appt.time_slot}</td>
                <td className="p-2 border">₹{appt.total_price}</td>
                <td className="p-2 border">₹{appt.discount}</td>
                <td className="p-2 border font-semibold">₹{appt.payable_amount}</td>
                <td className="p-2 border">{appt.status}</td>

                <td className="p-2 border text-center">
                  {appt.diagPrescription ? (
                    <a
                      href={`https://api.credenthealth.com${appt.diagPrescription}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Prescription"
                      className="text-blue-600 hover:underline inline-flex justify-center"
                    >
                      <FaFilePrescription size={18} />
                    </a>
                  ) : (
                    <FaFilePrescription className="text-gray-400 inline-block" size={18} title="No Prescription" />
                  )}
                </td>

                <td className="p-2 border text-center">
                  {appt.report_file ? (
                    <a
                      href={`https://api.credenthealth.com${appt.report_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Report"
                      className="text-blue-600 hover:underline inline-flex justify-center"
                    >
                      <FaFileMedical size={18} />
                    </a>
                  ) : (
                    <FaFileMedical className="text-gray-400 inline-block" size={18} title="No Report" />
                  )}
                </td>

                <td className="p-2 border text-center space-x-2">
                  {/* View booking - navigates to single booking page */}
                  <button
                    title="View Booking"
                    onClick={() => navigate(`/diagnostic/diagbooking/${appt.appointmentId}`)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEye size={16} />
                  </button>

                  {/* Update Status */}
                  <button
                    title="Update Status"
                    onClick={() => {
                      setEditBooking(appt);
                      setNewStatus(appt.status.charAt(0).toUpperCase() + appt.status.slice(1));
                    }}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <FaEdit size={16} />
                  </button>

                  {/* Upload Prescription */}
                  <button
                    title="Add Prescription"
                    onClick={() => openUploadModal("prescription", appt.appointmentId)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaFilePrescription size={16} />
                  </button>

                  {/* Upload Report */}
                  <button
                    title="Upload Report"
                    onClick={() => openUploadModal("report", appt.appointmentId)}
                    className="p-1 text-purple-600 hover:text-purple-800"
                  >
                    <FaUpload size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAppointments.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No appointments match your current filters.
          </div>
        )}
      </div>

      {/* Modal for file upload */}
      {uploadModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">
              Upload {uploadModal.type === "report" ? "Report" : "Prescription"}
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
                {uploadModal.loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                value={editBooking.diagnosticBookingId}
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

      {/* Bulk Download Modal */}
      {bulkDownloadModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaFileArchive /> Bulk Download Files
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={bulkDownloadModal.startDate}
                  onChange={(e) => setBulkDownloadModal(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={bulkDownloadModal.endDate}
                  onChange={(e) => setBulkDownloadModal(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2">Download Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="both"
                    checked={bulkDownloadModal.downloadType === "both"}
                    onChange={(e) => setBulkDownloadModal(prev => ({ ...prev, downloadType: e.target.value }))}
                    className="mr-2"
                  />
                  Both Reports & Prescriptions
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reports"
                    checked={bulkDownloadModal.downloadType === "reports"}
                    onChange={(e) => setBulkDownloadModal(prev => ({ ...prev, downloadType: e.target.value }))}
                    className="mr-2"
                  />
                  Reports Only
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="prescriptions"
                    checked={bulkDownloadModal.downloadType === "prescriptions"}
                    onChange={(e) => setBulkDownloadModal(prev => ({ ...prev, downloadType: e.target.value }))}
                    className="mr-2"
                  />
                  Prescriptions Only
                </label>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm">Select Appointments ({bulkDownloadModal.selectedAppointments.filter(a => a.selected).length} selected)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSelectAll(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => toggleSelectAll(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="border rounded max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 border text-left">Select</th>
                      <th className="p-2 border text-left">Booking ID</th>
                      <th className="p-2 border text-left">Patient Name</th>
                      <th className="p-2 border text-left">Date</th>
                      <th className="p-2 border text-left">Has Report</th>
                      <th className="p-2 border text-left">Has Prescription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkDownloadModal.selectedAppointments.map((appt) => {
                      const originalAppt = appointments.find(a => a.appointmentId === appt.id);
                      return (
                        <tr key={appt.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 border">
                            <input
                              type="checkbox"
                              checked={appt.selected}
                              onChange={() => toggleAppointmentSelection(appt.id)}
                              className="mr-2"
                            />
                          </td>
                          <td className="p-2 border">{appt.bookingId}</td>
                          <td className="p-2 border">{originalAppt?.staff_name || 'N/A'}</td>
                          <td className="p-2 border">{originalAppt ? new Date(originalAppt.appointment_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-2 border">{originalAppt?.report_file ? '✅' : '❌'}</td>
                          <td className="p-2 border">{originalAppt?.diagPrescription ? '✅' : '❌'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeBulkDownloadModal}
                className="px-4 py-2 bg-gray-300 rounded"
                disabled={bulkDownloadModal.loading}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDownload}
                className="px-4 py-2 bg-purple-600 text-white rounded flex items-center gap-2"
                disabled={bulkDownloadModal.loading}
              >
                {bulkDownloadModal.loading ? (
                  <>Downloading...</>
                ) : (
                  <>
                    <FaDownload /> Download Selected Files as ZIP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDiagnosticBookings;