// DoctorAppointmentList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaEdit, FaTrash, FaEye, FaUpload, FaCalendarAlt, FaFilter, FaDownload  } from "react-icons/fa";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const DoctorAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [editAppointment, setEditAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset file input
  const navigate = useNavigate();

  // Date filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);


  const [showDownloadModal, setShowDownloadModal] = useState(false);
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [downloadType, setDownloadType] = useState(""); // "reports" or "prescriptions"
const [isDownloading, setIsDownloading] = useState(false);

  // Download states
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ done: 0, total: 0, currentFile: "" });

  // Create refs for file inputs
  const reportFileInputRef = React.useRef(null);
  const prescriptionFileInputRef = React.useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("https://api.credenthealth.com/api/admin/alldoctorbookings");
      console.log("API RESPONSE:", res.data);

      if (res.data && res.data.appointments) {
        const formattedAppointments = res.data.appointments.map(appt => ({
          ...appt,
          formattedDate: formatDate(appt.appointment_date)
        }));
        setAppointments(formattedAppointments);
      } else {
        console.warn("No appointments key in response:", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctor appointments:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updatestatus/${editAppointment.appointmentId}`,
        { newStatus: newStatus }
      );

      if (res.status === 200) {
        fetchAppointments();
        setEditAppointment(null);
        setNewStatus("");
      }
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://api.credenthealth.com/api/admin/deleteappointments/${id}`);
      setAppointments(appointments.filter((a) => a.appointmentId !== id));
      alert("Appointment deleted successfully.");
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadReport = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("report", selectedFile);

    try {
      const res = await axios.post(
        `https://api.credenthealth.com/api/admin/upload-doctor-report/${currentAppointmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        alert("Report uploaded successfully");
        fetchAppointments();
        setShowReportModal(false);
        setSelectedFile(null);
        setFileInputKey(Date.now()); // Reset file input
      }
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadPrescription = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("prescription", selectedFile);

    try {
      const res = await axios.post(
        `https://api.credenthealth.com/api/admin/upload-doctor-prescription/${currentAppointmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        alert("Prescription uploaded successfully");
        fetchAppointments();
        setShowPrescriptionModal(false);
        setSelectedFile(null);
        setFileInputKey(Date.now()); // Reset file input
      }
    } catch (error) {
      console.error("Error uploading prescription:", error);
      alert("Failed to upload prescription");
    } finally {
      setUploading(false);
    }
  };

  // Date helper functions
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
  const filterByDate = (appt) => {
    if (dateFilter === "all") return true;
    if (dateFilter === "today") return isToday(appt.appointment_date);
    if (dateFilter === "yesterday") return isYesterday(appt.appointment_date);
    if (dateFilter === "thisMonth") return isThisMonth(appt.appointment_date);
    if (dateFilter === "custom") {
      return isInDateRange(appt.appointment_date, customStartDate, customEndDate);
    }
    return true;
  };

  const filteredAppointments = appointments
    .filter(filterByDate)
    .filter((appt) => {
      const searchTerm = search.toLowerCase();
      return (
        (appt.doctor_name?.toLowerCase()?.includes(searchTerm)) ||
        (appt.staff_name?.toLowerCase()?.includes(searchTerm)) ||
        (appt.doctorConsultationBookingId?.toLowerCase()?.includes(searchTerm)) ||
        (appt.patient_name?.toLowerCase()?.includes(searchTerm))
      );
    });

  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const exportToExcel = () => {
    const dataToExport = filteredAppointments.map(appt => ({
      "Booking ID": appt.doctorConsultationBookingId || 'N/A',
      "Doctor": appt.doctor_name || 'N/A',
      "Specialization": appt.doctor_specialization || 'N/A',
      "User": appt.staff_name || 'N/A',
      "Type": appt.consultation_type || 'N/A',
      "Date": appt.formattedDate || 'N/A',
      "Time": appt.time_slot || 'N/A',
      "Total": `₹${appt.payable_amount || '0'}`,
      "Status": appt.status || 'N/A',
      "Report": appt.doctorReports ? 'Yes' : 'No',
      "Prescription": appt.doctorPrescriptions ? 'Yes' : 'No',
      "Meeting Link": appt.meeting_link ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Set column widths
    const wscols = [
      { wch: 15 }, // Booking ID
      { wch: 20 }, // Doctor
      { wch: 20 }, // Specialization
      { wch: 15 }, // User
      { wch: 10 }, // Type
      { wch: 12 }, // Date
      { wch: 12 }, // Time
      { wch: 10 }, // Total
      { wch: 12 }, // Status
      { wch: 10 }, // Report
      { wch: 12 }, // Prescription
      { wch: 15 }  // Meeting Link
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "doctor_appointments.xlsx");
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const openReportModal = (appointmentId) => {
    setCurrentAppointmentId(appointmentId);
    setShowReportModal(true);
    setSelectedFile(null);
    setFileInputKey(Date.now());
  };

  const openPrescriptionModal = (appointmentId) => {
    setCurrentAppointmentId(appointmentId);
    setShowPrescriptionModal(true);
    setSelectedFile(null);
    setFileInputKey(Date.now());
  };

  const triggerFileInput = (type) => {
    if (type === 'report') {
      reportFileInputRef.current.click();
    } else if (type === 'prescription') {
      prescriptionFileInputRef.current.click();
    }
  };

  // Count appointments by date filter
  const countAppointmentsByDateFilter = (filterType) => {
    if (filterType === "all") return appointments.length;
    if (filterType === "today") return appointments.filter(appt => isToday(appt.appointment_date)).length;
    if (filterType === "yesterday") return appointments.filter(appt => isYesterday(appt.appointment_date)).length;
    if (filterType === "thisMonth") return appointments.filter(appt => isThisMonth(appt.appointment_date)).length;
    if (filterType === "custom") {
      return appointments.filter(appt =>
        isInDateRange(appt.appointment_date, customStartDate, customEndDate)
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

  // Meeting link modal state
  const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [newMeetingLink, setNewMeetingLink] = useState("");

  const openMeetingLinkModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setNewMeetingLink("");
    setShowMeetingLinkModal(true);
  };

  const closeMeetingLinkModal = () => {
    setShowMeetingLinkModal(false);
    setSelectedAppointmentId(null);
    setNewMeetingLink("");
  };

  const handleMeetingLinkSubmit = async () => {
    if (!newMeetingLink.trim()) {
      alert("Please enter a valid meeting link.");
      return;
    }

    try {
      const response = await fetch(`https://api.credenthealth.com/api/admin/updatemeetinglink/${selectedAppointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_link: newMeetingLink.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update meeting link");
      }

      alert("Meeting link updated successfully!");
      closeMeetingLinkModal();
      fetchAppointments(); // refresh so UI shows link
    } catch (error) {
      alert("Error updating meeting link: " + error.message);
    }
  };

  /**
   * BULK DOWNLOAD (reports/prescriptions/both) as ZIP using JSZip
   * - type: "report" | "prescription" | "both"
   * Notes:
   * - Expects appointment objects to contain either:
   *    appt.doctorReports -> string URL, OR array of strings / array of objects with .url
   *    appt.doctorPrescriptions -> same shape
   * - If server requires auth to fetch files, you must include credentials or token in headers and server must allow CORS.
   */
  const bulkDownload = async (type) => {
    if (!customStartDate || !customEndDate) {
      alert("Please select a start and end date for the booking date range first.");
      return;
    }

    // select appointments in the selected booking date range
    const apptsInRange = appointments.filter(a =>
      isInDateRange(a.appointment_date, customStartDate, customEndDate)
    );

    if (!apptsInRange.length) {
      alert("No appointments found in the selected date range.");
      return;
    }

    const zip = new JSZip();
    let totalFiles = 0;
    const filesToFetch = [];

    // Helper: extract URLs from a field which may be string, array, or array of objects
    const extractUrls = (field) => {
      if (!field) return [];
      if (typeof field === "string") return [field];
      if (Array.isArray(field)) {
        return field.flatMap(item => {
          if (!item) return [];
          if (typeof item === "string") return [item];
          if (typeof item === "object") {
            // try common keys
            return [item.url || item.file || item.path || item.location].filter(Boolean);
          }
          return [];
        });
      }
      if (typeof field === "object") {
        return [field.url || field.file || field.path || field.location].filter(Boolean);
      }
      return [];
    };

    // Build list of (url, filename) to fetch
    for (const appt of apptsInRange) {
      const bookingId = appt.doctorConsultationBookingId || appt.appointmentId || "booking";
      if (type === "report" || type === "both") {
        const reportUrls = extractUrls(appt.doctorReports);
        reportUrls.forEach((url, idx) => {
          filesToFetch.push({
            url,
            filename: `${bookingId}_report_${idx + 1}${getFileExtensionFromUrl(url)}`,
            appt
          });
        });
      }
      if (type === "prescription" || type === "both") {
        const presUrls = extractUrls(appt.doctorPrescriptions);
        presUrls.forEach((url, idx) => {
          filesToFetch.push({
            url,
            filename: `${bookingId}_prescription_${idx + 1}${getFileExtensionFromUrl(url)}`,
            appt
          });
        });
      }
    }

    totalFiles = filesToFetch.length;
    if (!totalFiles) {
      alert("No files found for the selected type(s) in this date range.");
      return;
    }

    setDownloading(true);
    setDownloadProgress({ done: 0, total: totalFiles, currentFile: "" });

    // fetch each file as blob and add to zip
    let done = 0;
    for (const fileObj of filesToFetch) {
      const { url, filename } = fileObj;
      setDownloadProgress(p => ({ ...p, currentFile: filename }));
      try {
        // Attempt to fetch the file
        // If your API requires auth header you can add `headers: { Authorization: 'Bearer ...' }` here.
        const response = await fetch(url, {
          method: "GET",
          // mode: "cors", // default; server must allow CORS
          // credentials: "include" // if cookies needed
        });

        if (!response.ok) {
          console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
          // add a small text file describing the error
          zip.file(`${filename}.ERROR.txt`, `Failed to fetch file: ${url}\nStatus: ${response.status} ${response.statusText}`);
        } else {
          const blob = await response.blob();
          zip.file(filename, blob);
        }
      } catch (err) {
        console.error("Error fetching file", url, err);
        zip.file(`${filename}.ERROR.txt`, `Error fetching file: ${url}\nError: ${err.message}`);
      } finally {
        done++;
        setDownloadProgress(p => ({ ...p, done }));
      }
    }

    try {
      const outName = `appointments_${type}_${customStartDate}_to_${customEndDate}.zip`;
      const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
        // metadata.percent available but we'll use our own counts
        // optional: could update a percentage progress UI
      });
      saveAs(content, outName);
    } catch (err) {
      console.error("Error generating zip:", err);
      alert("Failed to create ZIP file: " + err.message);
    } finally {
      setDownloading(false);
      setDownloadProgress({ done: 0, total: 0, currentFile: "" });
    }
  };

  // Utility: get extension hint from URL or fallback to .bin
  function getFileExtensionFromUrl(url) {
    try {
      const parsed = url.split("?")[0].split("#")[0];
      const lastDot = parsed.lastIndexOf(".");
      if (lastDot === -1) return ".bin";
      const ext = parsed.slice(lastDot);
      // sanitize ext
      if (ext.length > 1 && ext.length <= 6) return ext;
      return ".bin";
    } catch {
      return ".bin";
    }
  }



  const handleBulkDownload = async () => {
  if (!downloadType || !startDate || !endDate) return;

  setIsDownloading(true);
  
  try {
    const zip = new JSZip();
    const filteredAppointments = appointments.filter(appt => {
      const appointmentDate = new Date(appt.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // End of the day
      
      return appointmentDate >= start && appointmentDate <= end;
    });

    let fileCount = 0;

    for (const appt of filteredAppointments) {
      const files = downloadType === "reports" ? appt.doctorReports : appt.doctorPrescriptions;
      
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          try {
            const response = await axios.get(
              `https://api.credenthealth.com${files[i]}`,
              { responseType: 'blob' }
            );
            
            const fileName = `${appt.staff_name}_${downloadType.slice(0, -1)}_${i+1}_${appt.date}.pdf`;
            zip.file(fileName, response.data);
            fileCount++;
          } catch (error) {
            console.error(`Failed to download file: ${files[i]}`, error);
          }
        }
      }
    }

    if (fileCount > 0) {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${downloadType}_${startDate}_to_${endDate}.zip`);
      alert(`✅ ${fileCount} files downloaded successfully!`);
    } else {
      alert("❌ No files found in the selected date range");
    }

  } catch (error) {
    console.error("Download failed:", error);
    alert("❌ Download failed. Please try again.");
  } finally {
    setIsDownloading(false);
    setShowDownloadModal(false);
  }
};

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Doctor Appointments</h2>
      </div>

      {/* Date Filter Section */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <FaFilter className="text-blue-500" /> Filter Appointments by Date
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
              <div className="text-sm text-gray-600">{countAppointmentsByDateFilter("all")} appointments</div>
            </div>

            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "today" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("today")}
            >
              <div className="font-semibold">Today</div>
              <div className="text-sm text-gray-600">{countAppointmentsByDateFilter("today")} appointments</div>
            </div>

            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "yesterday" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("yesterday")}
            >
              <div className="font-semibold">Yesterday</div>
              <div className="text-sm text-gray-600">{countAppointmentsByDateFilter("yesterday")} appointments</div>
            </div>

            <div
              className={`p-3 rounded cursor-pointer text-center ${dateFilter === "thisMonth" ? "bg-blue-100 border border-blue-300" : "bg-white border"}`}
              onClick={() => setDateFilter("thisMonth")}
            >
              <div className="font-semibold">This Month</div>
              <div className="text-sm text-gray-600">{countAppointmentsByDateFilter("thisMonth")} appointments</div>
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
                <div className="flex gap-2">
                  <button
                    className="text-xs bg-blue-500 text-white py-1 rounded"
                    onClick={handleCustomDateSelect}
                  >
                    Apply
                  </button>
                  <button
                    className="text-xs bg-gray-200 text-gray-800 py-1 rounded"
                    onClick={() => {
                      // Quick action: bulk download buttons require range - keep them here
                      setCustomStartDate("");
                      setCustomEndDate("");
                      setDateFilter("all");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {dateFilter === "custom" && customStartDate && customEndDate && (
          <div className="mt-3 text-sm text-blue-600">
            Showing appointments from {customStartDate} to {customEndDate}: {countAppointmentsByDateFilter("custom")} appointments
          </div>
        )}

        {/* Bulk download buttons for reports / prescriptions / both */}
        <div className="mt-3 flex gap-2 items-center">
          <button
            onClick={() => bulkDownload("report")}
            className="px-3 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-2"
            disabled={downloading || !customStartDate || !customEndDate}
            title="Download all reports in selected booking date range as zip"
          >
            Download Reports (ZIP)
          </button>

          <button
            onClick={() => bulkDownload("prescription")}
            className="px-3 py-2 bg-indigo-600 text-white rounded text-sm flex items-center gap-2"
            disabled={downloading || !customStartDate || !customEndDate}
            title="Download all prescriptions in selected booking date range as zip"
          >
            Download Prescriptions (ZIP)
          </button>

          <button
            onClick={() => bulkDownload("both")}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2"
            disabled={downloading || !customStartDate || !customEndDate}
            title="Download both reports and prescriptions in selected booking date range as zip"
          >
            Download Reports + Prescriptions (ZIP)
          </button>

          {downloading && (
            <div className="ml-4 text-sm text-gray-700">
              Downloading {downloadProgress.done}/{downloadProgress.total} — {downloadProgress.currentFile}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm flex-grow"
          placeholder="Search by doctor name, ID or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Existing buttons ke saath add karo */}
<button
  onClick={() => setShowDownloadModal(true)}
  className="px-4 py-2 bg-purple-500 text-white rounded text-sm flex items-center gap-1 hover:bg-purple-600"
>
  <FaDownload /> Bulk Download
</button>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-1"
        >
          <FaFileExcel /> Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">Booking ID</th>
              <th className="p-3 border text-left">Doctor</th>
              <th className="p-3 border text-left">Specialization</th>
              <th className="p-3 border text-left">User</th>
              <th className="p-3 border text-left">Type</th>
              <th className="p-3 border text-left">Date</th>
              <th className="p-3 border text-left">Time</th>
              <th className="p-3 border text-left">Total</th>
              <th className="p-3 border text-left">Status</th>
              <th className="p-3 border text-left">Actions</th>
              <th className="p-3 border text-left">Report</th>
              <th className="p-3 border text-left">Prescription</th>
              <th className="p-3 border text-left">Meeting Link</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appt) => (
                <tr key={appt.appointmentId} className="hover:bg-gray-50 border-b">
                  <td className="p-3 border">{appt.doctorConsultationBookingId || 'N/A'}</td>
                  <td className="p-3 border">
                    {appt.doctor_name || 'Doctor'}
                  </td>

                  <td className="p-3 border">{appt.doctor_specialization || 'N/A'}</td>
                  <td className="p-2 border">
                    {appt.staffId?.name} ({appt.staffId?._id?.slice(-4)})
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded text-xs ${appt.consultation_type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {appt.consultation_type || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 border">{appt.formattedDate}</td>
                  <td className="p-3 border">{appt.time_slot || 'N/A'}</td>
                  <td className="p-3 border font-medium">₹{appt.payable_amount || '0'}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${appt.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                      appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {appt.status || 'N/A'}
                    </span>
                  </td>

                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => navigate(`/appointment/${appt.appointmentId}`)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => {
                        setEditAppointment(appt);
                        setNewStatus(appt.status);
                      }}
                      className="text-yellow-600 hover:text-yellow-800 p-1"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(appt.appointmentId)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => openReportModal(appt.appointmentId)}
                      className="text-green-600 hover:text-green-800 p-1 flex items-center gap-1"
                      title="Upload Report"
                    >
                      <FaUpload />
                    </button>
                    {/* If there is a report URL, show download link (first one) */}
                    {(() => {
                      const r = appt.doctorReports;
                      if (!r) return null;
                      const url = Array.isArray(r) ? (r[0]?.url || r[0]) : (typeof r === 'object' ? r.url : r);
                      return url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-blue-600 hover:underline">Download</a>
                      ) : null;
                    })()}
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => openPrescriptionModal(appt.appointmentId)}
                      className="text-indigo-600 hover:text-indigo-800 p-1 flex items-center gap-1"
                      title="Upload Prescription"
                    >
                      <FaUpload />
                    </button>
                    {(() => {
                      const p = appt.doctorPrescriptions;
                      if (!p) return null;
                      const url = Array.isArray(p) ? (p[0]?.url || p[0]) : (typeof p === 'object' ? p.url : p);
                      return url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-blue-600 hover:underline">Download</a>
                      ) : null;
                    })()}
                  </td>
                  {/* New Meeting Link cell */}
                  <td className="p-3 border">
                    {appt.consultation_type === "Online" ? (
                      appt.meeting_link && appt.meeting_link.trim() !== "" ? (
                        <a
                          href={appt.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Consultation
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openMeetingLinkModal(appt.appointmentId)}
                            className="text-green-600 hover:text-green-800 p-1 border rounded text-xs"
                            title="Add Meeting Link"
                          >
                            Add Link
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="p-4 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredAppointments.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstAppointment + 1} to {Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {editAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Update Appointment Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Current Status:</label>
              <div className="p-2 bg-gray-100 rounded">{editAppointment.status}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Status:</label>
              <select
                className="w-full p-2 border rounded"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditAppointment(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Upload Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Upload Doctor Report</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Report File:</label>
              <div
                onClick={() => triggerFileInput('report')}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {selectedFile ? (
                  <div className="relative w-full h-full p-4">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFileInputKey(Date.now());
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
                    >
                      <FiX className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  key={`report-${fileInputKey}`}
                  type="file"
                  ref={reportFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedFile(null);
                  setFileInputKey(Date.now());
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading..." : "Upload"}
                {uploading && <span className="animate-spin">⏳</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeetingLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Add Meeting Link</h2>
            <input
              type="text"
              value={newMeetingLink}
              onChange={(e) => setNewMeetingLink(e.target.value)}
              placeholder="Enter meeting link URL"
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeMeetingLinkModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleMeetingLinkSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}





      {/* Download Modal */}
{showDownloadModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-96">
      <h3 className="text-lg font-semibold mb-4">Download Files by Date Range</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Type:</label>
        <select 
          className="w-full p-2 border rounded"
          value={downloadType}
          onChange={(e) => setDownloadType(e.target.value)}
        >
          <option value="">Select File Type</option>
          <option value="reports">Medical Reports</option>
          <option value="prescriptions">Prescriptions</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Start Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">End Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowDownloadModal(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleBulkDownload}
          disabled={!downloadType || !startDate || !endDate || isDownloading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
        >
          {isDownloading ? "Downloading..." : "Download Zip"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Prescription Upload Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Upload Doctor Prescription</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Prescription File:</label>
              <div
                onClick={() => triggerFileInput('prescription')}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {selectedFile ? (
                  <div className="relative w-full h-full p-4">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFileInputKey(Date.now());
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
                    >
                      <FiX className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  key={`prescription-${fileInputKey}`}
                  type="file"
                  ref={prescriptionFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setSelectedFile(null);
                  setFileInputKey(Date.now());
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadPrescription}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading..." : "Upload"}
                {uploading && <span className="animate-spin">⏳</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentList;
