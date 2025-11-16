import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaFileExcel, FaEdit, FaTrash, FaVideo,
  FaFilePdf, FaFileMedical, FaUpload, FaComments
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiX } from "react-icons/fi";
import moment from "moment";
import { io } from "socket.io-client";
import { FaPaperPlane } from "react-icons/fa";

// Chat Modal Component
const ChatModal = ({ appointment, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://api.credenthealth.com", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);
  // Fetch initial messages and set up socket listeners
  useEffect(() => {
    if (!socket || !appointment) return;

    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://api.credenthealth.com/api/staff/getchat/${appointment.staffId}/${appointment.doctor_id}`
        );
        setMessages(response.data.messages || []);

        // Join the chat room
        const roomId = `${appointment.staffId}_${appointment.doctor_id}`;
        socket.emit("joinRoom", roomId);

      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (appointment.type === 'Online') {
      fetchChatHistory();
    }

    // Set up message listener
    socket.on("receiveMessage", (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, appointment]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/staff/sendchat/${appointment.staffId}/${appointment.doctor_id}`,
        {
          message: newMessage,
          senderType: "doctor" // This matches the controller's expected field
        }
      );

      // The socket emission is handled by the server after saving the message
      setNewMessage("");
    } catch (error) {
      console.error("❌ Failed to send message:", error.response?.data || error.message);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Chat with {appointment.staff_name || "Staff"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 bg-gray-50 rounded">
          {isLoading ? (
            <div className="text-center py-4">Loading chat history...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No messages yet</div>
          ) : (
            messages.map((msg, index) => {
              const isDoctor = msg.sender === "doctor" || String(msg.senderId) === String(appointment.doctor_id);
              const alignment = isDoctor ? 'items-end' : 'items-start';
              const bubbleColor = isDoctor ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
              const senderLabel = isDoctor ? "You" : appointment.staff_name || "Staff";

              return (
                <div key={index} className={`flex flex-col ${alignment}`}>
                  <div className="text-xs text-gray-500 mb-1">
                    {senderLabel} • {moment(msg.timestamp).format('hh:mm A')}
                  </div>
                  <div className={`max-w-[80%] px-4 py-2 rounded-lg ${bubbleColor}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-300"
            disabled={!newMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

const SingleDoctorAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [editAppointment, setEditAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Upload modals
  const [showReportUploadModal, setShowReportUploadModal] = useState(false);
  const [showPrescriptionUploadModal, setShowPrescriptionUploadModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatAppointment, setSelectedChatAppointment] = useState(null);

  // Create refs for file inputs
  const reportFileInputRef = React.useRef(null);
  const prescriptionFileInputRef = React.useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const doctorId = localStorage.getItem("doctorId");
    if (doctorId) {
      fetchAppointments(doctorId);
    }
  }, []);

  const fetchAppointments = async (doctorId) => {
    try {
      const res = await axios.get(
        `https://api.credenthealth.com/api/admin/alldoctorappointments/${doctorId}`
      );

      if (res.data && res.data.appointments) {
        const appointments = res.data.appointments;

        // 🔍 Log only appointmentId from each appointment
        const appointmentIds = appointments.map(item => item.appointmentId);
        console.log("📋 All appointmentIds:", appointmentIds);

        setAppointments(appointments);
      } else {
        console.warn("⚠️ No appointments found in response:", res.data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch doctor appointments:", error);
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


   // Inside your component
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
  


  const handleDelete = async (id) => {
    try {
      console.log("🗑️ Deleting appointmentId:", id); // 🔍 Log ID
      await axios.delete(`https://api.credenthealth.com/api/admin/deleteappointments/${id}`);
      setAppointments(appointments.filter((a) => a.appointmentId !== id)); // ✅ Fixed here
      alert("✅ Appointment deleted successfully!");
    } catch (error) {
      console.error("❌ Failed to delete appointment:", error);
      alert("❌ Failed to delete appointment. Please try again.");
    }
  };


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const triggerFileInput = (type) => {
    if (type === 'report') {
      reportFileInputRef.current.click();
    } else if (type === 'prescription') {
      prescriptionFileInputRef.current.click();
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    if (!selectedAppointment || !selectedAppointment.appointmentId) {
      alert("No appointment selected or appointment ID missing");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    const fieldName = uploadType === "report" ? "report" : "prescription";
    formData.append(fieldName, selectedFile);

    try {
      const endpoint = uploadType === "report"
        ? `https://api.credenthealth.com/api/admin/upload-doctor-report/${selectedAppointment.appointmentId}`
        : `https://api.credenthealth.com/api/admin/upload-doctor-prescription/${selectedAppointment.appointmentId}`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        alert(`${uploadType === "report" ? "Report" : "Prescription"} uploaded successfully!`);
        fetchAppointments(localStorage.getItem("doctorId"));
      } else {
        alert(`Upload failed: ${response.data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
      closeUploadModal();
    }
  };


  const handleMeetingLinkSubmit = async () => {
  if (!newMeetingLink.trim()) {
    alert("Please enter a valid meeting link");
    return;
  }

  try {
    const response = await axios.put(
      `https://api.credenthealth.com/api/admin/updatemeetinglink/${selectedAppointmentId}`,
      { meeting_link: newMeetingLink }
    );

    if (response.status === 200) {
      // Update the local state to reflect the change
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.appointmentId === selectedAppointmentId 
            ? { ...appt, meetingLink: newMeetingLink } 
            : appt
        )
      );
      closeMeetingLinkModal();
      alert("Meeting link updated successfully!");
    }
  } catch (error) {
    console.error("Failed to update meeting link:", error);
    alert(`Failed to update meeting link: ${error.response?.data?.message || error.message}`);
  }
};


  

  const closeUploadModal = () => {
    setShowReportUploadModal(false);
    setShowPrescriptionUploadModal(false);
    setSelectedAppointment(null);
    setSelectedFile(null);
    setUploadType("");
    setFileInputKey(Date.now());
  };

  const filteredAppointments = appointments.filter((appt) =>
    appt.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    appt.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
    appt.status?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const exportToExcel = () => {
  const dataToExport = filteredAppointments.map(appt => ({
    "Doctor Name": appt.doctor_name,
    "User": appt.staff_name || "N/A",
    "Date": appt.date ? new Date(appt.date).toLocaleDateString() : "N/A",
    "Type": appt.type || "N/A",
    "Meeting": appt.meetingLink || "N/A",
    "Booking ID": appt.doctorConsultationBookingId || "N/A",
    "Status": appt.status,
    "Reports": appt.doctorReports?.length || 0,
    "Prescriptions": appt.doctorPrescriptions?.length || 0,
    "Payment Status": appt.paymentStatus || "N/A",
    "Total Amount": appt.totalPrice || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
  
  // Auto-size columns
  const wscols = [
    {wch: 15}, // Doctor Name
    {wch: 15}, // User
    {wch: 10}, // Date
    {wch: 10}, // Type
    {wch: 30}, // Meeting
    {wch: 15}, // Booking ID
    {wch: 12}, // Status
    {wch: 8},  // Reports
    {wch: 12}, // Prescriptions
    {wch: 15}, // Payment Status
    {wch: 12}  // Total Amount
  ];
  worksheet["!cols"] = wscols;

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });
  saveAs(blob, "doctor_appointments.xlsx");
};
  const renderMeetingLink = (link) => {
    if (!link) return <span className="text-gray-400">N/A</span>;
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
      >
        <FaVideo /> Join Meeting
      </a>
    );
  };

  const renderReports = (reports) => {
    if (!reports || reports.length === 0) return <span className="text-gray-400">No reports</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {reports.map((report, index) => (
          <a
            key={index}
            href={`https://api.credenthealth.com${report}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            <FaFilePdf /> Report {index + 1}
          </a>
        ))}
      </div>
    );
  };

  const renderPrescriptions = (prescriptions) => {
    if (!prescriptions || prescriptions.length === 0) return <span className="text-gray-400">No prescriptions</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {prescriptions.map((prescription, index) => (
          <a
            key={index}
            href={`https://api.credenthealth.com${prescription}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            <FaFileMedical /> Prescription {index + 1}
          </a>
        ))}
      </div>
    );
  };

  const renderActions = (appt) => (
    <div className="flex flex-col gap-2">
      {appt.type === 'Online' && (
        <button
          onClick={() => navigate(`/doctor/doctor/chat/${appt.staffId}/${appt.doctor_id}`)}
          className="text-green-500 hover:text-green-700 p-1 flex items-center gap-1 justify-center text-xs"
          title="Chat"
        >
          <FaComments /> Chat
        </button>
      )}
      <button
        onClick={() => {
          setEditAppointment(appt);
          setNewStatus(appt.status);
        }}
        className="text-blue-500 hover:text-blue-700 p-1 flex items-center gap-1 justify-center text-xs"
        title="Edit Status"
      >
        <FaEdit /> Status
      </button>
      <button
        onClick={() => handleDelete(appt.appointmentId)}
        className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 justify-center text-xs"
        title="Delete"
      >
        <FaTrash /> Delete
      </button>

    </div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Doctor Appointments</h2>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm w-64"
          placeholder="Search by patient, doctor, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-1 hover:bg-green-600 transition-colors"
        >
          <FaFileExcel /> Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Doctor</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Meeting</th>
              <th className="p-2 border">Booking ID</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Reports</th>
              <th className="p-2 border">Prescriptions</th>
              <th className="p-2 border">Actions</th>
              <th className="p-2 border">Upload meetingLink</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map((appt) => (
              <tr key={appt._id} className="hover:bg-gray-50 border-b">
                <td className="p-2 border flex items-center gap-2">
                  {appt.doctor_image ? (
                    <img
                      src={`https://api.credenthealth.com${appt.doctor_image}`}
                      alt={appt.doctor_name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/32?text=No+Img";
                      }}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">No Image</span>
                  )}
                  <div>
                    <div className="font-medium">{appt.doctor_name}</div>
                    <div className="text-xs text-gray-500">{appt.doctor_specialization}</div>
                    {appt.doctor_id && (
                      <div className="text-xs text-gray-400">
                        DOCID: {appt.doctor_id.slice(-2)}
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-2 border">
                  <div className="font-medium">{appt.staff_name || "N/A"}</div>
                  {appt.staffId && (
                    <div className="text-xs text-gray-400">UserID: {appt.staffId.slice(-2)}</div>
                  )}
                  <div className="text-xs text-gray-500">₹{appt.totalPrice || 0}</div>
                </td>

                <td className="p-2 border">
                  <div>{appt.date ? new Date(appt.date).toLocaleDateString() : "N/A"}</div>
                  <div className="text-xs text-gray-500">{appt.timeSlot || "N/A"}</div>
                </td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded-full text-xs ${appt.type === 'Online' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                    }`}>
                    {appt.type || "N/A"}
                  </span>
                </td>
                <td className="p-2 border">
                  {renderMeetingLink(appt.meetingLink)}
                </td>
                <td className="p-2 border text-xs">
                  {appt.doctorConsultationBookingId || "N/A"}
                </td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded-full text-xs ${appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {appt.status}
                  </span>
                </td>
                <td className="p-2 border text-xs">
                  {renderReports(appt.doctorReports)}
                  <button
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setUploadType("report");
                      setShowReportUploadModal(true);
                    }}
                    className="mt-1 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FaUpload /> Upload
                  </button>
                </td>
                <td className="p-2 border text-xs">
                  {renderPrescriptions(appt.doctorPrescriptions)}
                  <button
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setUploadType("prescription");
                      setShowPrescriptionUploadModal(true);
                    }}
                    className="mt-1 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FaUpload /> Upload
                  </button>
                </td>
                <td className="p-2 border">
                  {renderActions(appt)}
                </td>
         <td className="p-3 border">
  {appt.type === "Online" ? (
    appt.meetingLink ? (
      <a
        href={appt.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Join Meeting
      </a>
    ) : (
      <button
        onClick={() => openMeetingLinkModal(appt.appointmentId)} // Using appointmentId
        className="text-green-600 hover:text-green-800 p-1 border rounded text-xs"
        title="Add Meeting Link"
      >
        Add Link
      </button>
    )
  ) : (
    <span className="text-gray-400">—</span>
  )}
</td>

              </tr>
              
            ))}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages} ({filteredAppointments.length} appointments)
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {filteredAppointments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No appointments found matching your search criteria.
        </div>
      )}

      {editAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Update Appointment Status</h3>
            <select
              className="w-full p-2 border rounded mb-4"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditAppointment(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Upload Modal */}
      {showReportUploadModal && selectedAppointment && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">
              Upload Medical Report for {selectedAppointment.patient_name || "Patient"}
            </h3>
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
                    <p className="text-xs text-gray-500">PDF (MAX. 20MB)</p>
                  </div>
                )}
                <input
                  key={`report-${fileInputKey}`}
                  type="file"
                  ref={reportFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeUploadModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload /> Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Upload Modal */}
      {showPrescriptionUploadModal && selectedAppointment && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">
              Upload Prescription for {selectedAppointment.patient_name || "Patient"}
            </h3>
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
                    <p className="text-xs text-gray-500">PDF (MAX. 20MB)</p>
                  </div>
                )}
                <input
                  key={`prescription-${fileInputKey}`}
                  type="file"
                  ref={prescriptionFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeUploadModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload /> Upload
                  </>
                )}
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
        placeholder="Enter meeting link URL (e.g., https://meet.google.com/abc-xyz)"
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

      {/* Chat Modal */}
      {showChatModal && selectedChatAppointment && (
        <ChatModal
          appointment={selectedChatAppointment}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};

export default SingleDoctorAppointmentList;