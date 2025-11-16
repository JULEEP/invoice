import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaVideo } from "react-icons/fa";

const SingleAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(
          `https://api.credenthealth.com/api/admin/appointment/${appointmentId}`
        );
        setAppointment(res.data.appointment);
      } catch (err) {
        console.error("Failed to fetch appointment details:", err);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  if (!appointment) return <p className="p-4">Loading appointment details...</p>;

  const baseUrl = "https://api.credenthealth.com";

  // Format date
  const formatDate = (date) => {
    try {
      const d = new Date(date);
      return isNaN(d) ? "Invalid Date" : d.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-900 mb-4">Appointment Details</h2>

      <table className="w-full border rounded mb-6 text-sm">
        <tbody>
          <tr>
            <td className="p-2 font-medium border">Consultation Type</td>
            <td className="p-2 border capitalize">{appointment.consultation_type || "N/A"}</td>
            <td className="p-2 font-medium border">Doctor Booking ID</td>
            <td className="p-2 border">{appointment.doctorConsultationBookingId || "N/A"}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">Appointment Date</td>
            <td className="p-2 border">
              {appointment.appointment_date
                ? formatDate(appointment.appointment_date)
                : "Not Assigned"}
            </td>
            <td className="p-2 font-medium border">Time Slot</td>
            <td className="p-2 border">{appointment.time_slot || "N/A"}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium border">Status</td>
            <td className="p-2 border capitalize">{appointment.status || "N/A"}</td>
            <td className="p-2 font-medium border">User Name</td>
            <td className="p-2 border">{appointment.staff_name || "N/A"}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">Transaction ID</td>
            <td className="p-2 border">{appointment.transactionId || "N/A"}</td>
            <td className="p-2 font-medium border">Payment Status</td>
            <td className="p-2 border capitalize">{appointment.paymentStatus || "N/A"}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium border">Subtotal</td>
            <td className="p-2 border">₹{appointment.total_price || 0}</td>
            <td className="p-2 font-medium border">Discount</td>
            <td className="p-2 border">₹{appointment.discount || 0}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">Payable Amount</td>
            <td className="p-2 border font-semibold text-green-700">₹{appointment.payable_amount || 0}</td>
            <td className="p-2 font-medium border">Created At</td>
            <td className="p-2 border">{formatDate(appointment.createdAt)}</td>
          </tr>
        </tbody>
      </table>

      {/* Doctor Info */}
      <div className="flex items-start gap-4 mb-6">
        {appointment.doctor_image && (
          <img
            src={`${baseUrl}${appointment.doctor_image}`}
            alt={appointment.doctor_name || "Doctor"}
            className="w-24 h-24 object-cover border rounded"
          />
        )}
        <div>
          <h4 className="text-lg font-semibold text-purple-900 mb-1">Doctor Information</h4>
          <p><strong>Name:</strong> {appointment.doctor_name || "N/A"}</p>
          <p><strong>Specialization:</strong> {appointment.doctor_specialization || "N/A"}</p>
        </div>
      </div>

      {/* Consultation Link */}
      {appointment.meeting_link && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-900">Consultation</h3>
          <button
            onClick={() => window.open(appointment.meeting_link, "_blank")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
          >
            <FaVideo className="text-white" />
            Consultation Link
          </button>
        </div>
      )}

      {/* Doctor Reports */}
      {/* Doctor Reports */}
      {appointment.doctor_reports?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-900">Doctor Reports</h3>
          <div className="flex flex-wrap gap-3">
            {appointment.doctor_reports.map((report, index) => (
              <button
                key={index}
                onClick={() => window.open(`${baseUrl}${report}`, "_blank")}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                View Report {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Received Doctor Reports */}
      {appointment.receivedDoctorReports?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-900">Received Doctor Reports</h3>
          <div className="flex flex-wrap gap-3">
            {appointment.receivedDoctorReports.map((report, index) => (
              <button
                key={index}
                onClick={() => window.open(`${baseUrl}${report}`, "_blank")}
                className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
              >
                View Received Report {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Prescriptions */}
      {appointment.doctor_prescriptions?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2 text-purple-900">Doctor Prescriptions</h3>
          <div className="flex flex-wrap gap-3">
            {appointment.doctor_prescriptions.map((prescription, index) => (
              <button
                key={index}
                onClick={() => window.open(`${baseUrl}${prescription}`, "_blank")}
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
              >
                View Prescription {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Received Doctor Prescriptions */}
      {appointment.receivedDoctorPrescriptions?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2 text-purple-900">Received Doctor Prescriptions</h3>
          <div className="flex flex-wrap gap-3">
            {appointment.receivedDoctorPrescriptions.map((prescription, index) => (
              <button
                key={index}
                onClick={() => window.open(`${baseUrl}${prescription}`, "_blank")}
                className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700"
              >
                View Received Prescription {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SingleAppointmentDetails;