import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AppointmentBookingForm = () => {
  const navigate = useNavigate();

  const [doctorList, setDoctorList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("");
  const [consultationType, setConsultationType] = useState("Online");
  const [submittedData, setSubmittedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [showDoctorResults, setShowDoctorResults] = useState(false);
  const [showStaffResults, setShowStaffResults] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch doctors and staff
  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsRes = await axios.get("https://api.credenthealth.com/api/admin/getdoctors");
        setDoctorList(doctorsRes.data);
        setFilteredDoctors(doctorsRes.data);

        const staffRes = await axios.get("https://api.credenthealth.com/api/admin/getallstaffs");
        setStaffList(staffRes.data.staff);
        setFilteredStaff(staffRes.data.staff);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Filter doctors based on search
  useEffect(() => {
    if (doctorSearch) {
      const filtered = doctorList.filter(doctor => 
        doctor.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        doctor.email.toLowerCase().includes(doctorSearch.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctorList);
    }
  }, [doctorSearch, doctorList]);

  // Filter staff based on search
  useEffect(() => {
    if (staffSearch) {
      const filtered = staffList.filter(staff => 
        staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staff.email.toLowerCase().includes(staffSearch.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff(staffList);
    }
  }, [staffSearch, staffList]);

  // Load family members when staff is selected
  useEffect(() => {
    if (!selectedStaff) return;

    const staff = staffList.find(s => s._id === selectedStaff);
    setFamilyMembers(staff?.family_members || []);
  }, [selectedStaff, staffList]);

  // Load available slots when doctor or consultation type changes
  useEffect(() => {
    if (!selectedDoctor || !consultationType) return;

    const doctor = doctorList.find(doc => doc._id === selectedDoctor);
    if (doctor) {
      let slots = [];
      if (consultationType === "Online") {
        slots = doctor.onlineSlots || [];
      } else {
        slots = doctor.offlineSlots || [];
      }
      // Filter out booked slots
      const availableSlots = slots.filter(slot => !slot.isBooked);
      setAvailableSlots(availableSlots);
      setSelectedSlot("");
    }
  }, [selectedDoctor, consultationType, doctorList]);

  const launchRazorpay = (amount, appointmentData) => {
    if (!window.Razorpay) {
      alert("Payment system is still loading. Please try again in a moment.");
      return;
    }

    const options = {
      key: "rzp_test_BxtRNvflG06PTV",
      amount: amount * 100,
      currency: "INR",
      name: "Doctor Consultation",
      description: "Admin Booking",
      handler: async function (response) {
        try {
          const transactionId = response.razorpay_payment_id;
          const res = await axios.post(
            "https://api.credenthealth.com/api/admin/create-doctor-booking",
            { ...appointmentData, transactionId }
          );
          alert(res.data.message);
          setSubmittedData(res.data.booking);
          navigate("/appintmentlist");
        } catch (err) {
          alert("Booking failed after payment.");
          console.error("Razorpay booking error:", err);
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: "Admin",
        email: "admin@example.com",
      },
      theme: {
        color: "#007AFF",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) return alert("Please select a slot.");

    const [day, date, timeSlot] = selectedSlot.split("||");

    const appointmentData = {
      staffId: selectedStaff,
      doctorId: selectedDoctor,
      date,
      timeSlot,
      day,
      familyMemberId: selectedFamilyMember,
      type: consultationType,
    };

    try {
      setIsProcessing(true);
      const res = await axios.post(
        "https://api.credenthealth.com/api/admin/create-doctor-booking",
        appointmentData
      );
      alert(res.data.message);
      setSubmittedData(res.data.booking);
      navigate("/appintmentlist");
    } catch (err) {
      const error = err.response?.data;

      if (err.response?.status === 402 && error?.requiredOnline > 0) {
        alert(`Insufficient balance. Please pay ₹${error.requiredOnline} to complete booking.`);
        if (razorpayLoaded) {
          launchRazorpay(error.requiredOnline, appointmentData);
        } else {
          alert("Payment system is loading. Please try again in a moment.");
        }
      } else {
        alert(error?.message || "Booking failed.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor._id);
    setShowDoctorResults(false);
    setDoctorSearch(`${doctor.name} (${doctor.specialization}) - ₹${doctor.consultation_fee}`);
  };

  const selectStaff = (staff) => {
    setSelectedStaff(staff._id);
    setShowStaffResults(false);
    setStaffSearch(`${staff.name} (${staff.email})`);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-purple-800">Book Appointment</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Search User</label>
            <input
              type="text"
              className="p-3 border rounded w-full"
              value={staffSearch}
              onChange={(e) => {
                setStaffSearch(e.target.value);
                setShowStaffResults(true);
              }}
              onFocus={() => setShowStaffResults(true)}
              placeholder="Search by name or email"
              required
            />
            {showStaffResults && filteredStaff.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                {filteredStaff.map((staff) => (
                  <div
                    key={staff._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectStaff(staff)}
                  >
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-sm text-gray-600">{staff.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Search Doctor</label>
            <input
              type="text"
              className="p-3 border rounded w-full"
              value={doctorSearch}
              onChange={(e) => {
                setDoctorSearch(e.target.value);
                setShowDoctorResults(true);
              }}
              onFocus={() => setShowDoctorResults(true)}
              placeholder="Search by name or email"
              required
            />
            {showDoctorResults && filteredDoctors.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDoctor(doctor)}
                  >
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-sm text-gray-600">
                      {doctor.specialization} - ₹{doctor.consultation_fee}
                    </div>
                    <div className="text-sm text-gray-600">{doctor.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedStaff && (
          <div>
            <label className="block text-sm font-medium mb-1">Select Family Member</label>
            <select
              className="p-3 border rounded w-full"
              value={selectedFamilyMember}
              onChange={(e) => setSelectedFamilyMember(e.target.value)}
            >
              <option value="">Select Family Member</option>
              {familyMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName} ({member.relation}) - {member.age} years
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Consultation Type</label>
          <select
            className="p-3 border rounded w-full"
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value)}
          >
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {availableSlots.length > 0 ? (
          <div>
            <label className="block text-sm font-medium mb-1 mt-4">Select Available Slot</label>
            <select
              className="p-3 border rounded w-full"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              required
            >
              <option value="">Select Date & Time</option>
              {availableSlots.map((slot) => (
                <option
                  key={`${slot.date}-${slot.timeSlot}`}
                  value={`${slot.day}||${slot.date}||${slot.timeSlot}`}
                >
                  {slot.day} - {slot.date} - {slot.timeSlot}
                </option>
              ))}
            </select>
          </div>
        ) : selectedDoctor && (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
            No available {consultationType.toLowerCase()} slots for this doctor.
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 text-red-600 border border-red-500 bg-red-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
            disabled={!selectedSlot || isProcessing}
          >
            {isProcessing ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>

      {submittedData && (
        <div className="mt-6 p-4 border border-green-400 bg-green-50 rounded">
          <h4 className="text-lg font-bold text-green-800">Appointment Booked Successfully</h4>
          <p><strong>Doctor:</strong> {submittedData.doctorId?.name || "N/A"}</p>
          <p><strong>User:</strong> {submittedData.staffId?.name || "N/A"}</p>
          <p><strong>Family Member:</strong> {submittedData.familyMemberId?.fullName || "N/A"}</p>
          <p><strong>Date:</strong> {submittedData.date}</p>
          <p><strong>Time Slot:</strong> {submittedData.timeSlot}</p>
          <p><strong>Consultation Type:</strong> {submittedData.type}</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentBookingForm;