import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaSearch } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useParams } from "react-router-dom";

const CompanyStaffHistory = () => {
  const API_BASE_URL = "https://api.credenthealth.com/api/staff";
  const { staffId } = useParams();

  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const fetchData = async () => {
    if (!staffId) return;

    setLoading(true);
    try {
      const [bookingsRes, walletRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/mybookings/${staffId}`),
        axios.get(`${API_BASE_URL}/wallet/${staffId}`)
      ]);

      setBookings(bookingsRes.data?.bookings || []);
      setWalletBalance(walletRes.data?.wallet_balance || 0);
    } catch (err) {
      handleApiError(err, 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [staffId]);

  // Utility functions
  const handleApiError = (error, message) => {
    console.error(message, error);
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid date') return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const formatCurrency = (amount) => {
    return `₹${amount || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Search and filter bookings
  const filterBookings = (bookings) => {
    const term = searchTerm.toLowerCase();
    if (!term) return bookings;

    return bookings.filter(booking => {
      // Check booking IDs
      if (booking.bookingId?.toLowerCase().includes(term)) return true;
      if (booking.doctorConsultationBookingId?.toLowerCase().includes(term)) return true;
      if (booking.diagnosticBookingId?.toLowerCase().includes(term)) return true;

      // Check patient details
      if (booking.patient?.name?.toLowerCase().includes(term)) return true;
      if (booking.patient?.relation?.toLowerCase().includes(term)) return true;

      // Check doctor details
      if (booking.doctor?.name?.toLowerCase().includes(term)) return true;
      if (booking.doctor?.specialization?.toLowerCase().includes(term)) return true;

      // Check diagnostic details
      if (booking.diagnostic?.name?.toLowerCase().includes(term)) return true;
      if (booking.package?.name?.toLowerCase().includes(term)) return true;

      // Check status
      if (booking.status?.toLowerCase().includes(term)) return true;

      // Check dates
      if (formatDate(booking.date).toLowerCase().includes(term)) return true;
      if (formatTime(booking.timeSlot).toLowerCase().includes(term)) return true;

      return false;
    });
  };

  // Categorize bookings
  const categorizedBookings = {
    all: filterBookings(bookings),
    doctor: filterBookings(bookings.filter(b => b.doctor)),
    diagnostics: filterBookings(bookings.filter(b => b.diagnostic)),
    packages: filterBookings(bookings.filter(b => b.package)),
    tests: filterBookings(bookings.filter(b =>
      b.cartItems?.some(item => item.type === 'test') ||
      (b.package && b.package.totalTestsIncluded > 0)
    )),
    scans: filterBookings(bookings.filter(b =>
      b.cartItems?.some(item => item.type === 'xray') ||
      (b.package && b.package.totalScansIncluded > 0)
    ))
  };

  const renderBookingCard = (booking) => {
    const isDoctorBooking = !!booking.doctor;
    const isDiagnosticBooking = !!booking.diagnostic;
    const isPackageBooking = !!booking.package;
    const hasTests = booking.cartItems?.some(item => item.type === 'test') ||
      (isPackageBooking && booking.package.totalTestsIncluded > 0);
    const hasScans = booking.cartItems?.some(item => item.type === 'xray') ||
      (isPackageBooking && booking.package.totalScansIncluded > 0);

    return (
      <div key={booking.bookingId} className="bg-white rounded-lg shadow-md p-4 mb-4">
       <div className="flex justify-between items-center mb-2">
  <h2 className="text-lg font-semibold">
    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
      {booking.doctorConsultationBookingId
        ? "Doctor Consultation"
        : booking.diagnosticBookingId
        ? "Diagnostic"
        : "Booking Type"}
    </span>
  </h2>
  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
    {booking.status || 'Confirmed'}
  </span>
</div>

<p className="text-sm text-gray-600 mb-2">
  Booking ID:{" "}
  {booking.doctorConsultationBookingId
    ? `(${booking.doctorConsultationBookingId})`
    : booking.diagnosticBookingId
    ? `(${booking.diagnosticBookingId})`
    : "N/A"}
</p>




        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="border-r pr-4">
            <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
            <p>Date: {formatDate(booking.date)}</p>
            <p>Time: {formatTime(booking.timeSlot)}</p>
            {booking.bookedSlot?.day && <p>Day: {booking.bookedSlot.day}</p>}
            {booking.serviceType && <p>Service Type: {booking.serviceType}</p>}
            {booking.type && <p>Booking Type: {booking.type}</p>}
          </div>

          <div className="border-r pr-4">
            <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
            <p>Total Price: {formatCurrency(booking.totalPrice)}</p>
            <p>Discount: {formatCurrency(booking.discount || 0)}</p>
            <p>Payable Amount: {formatCurrency(booking.payableAmount)}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Patient Details</h3>
            {booking.patient ? (
              <>
                <p>Name: {booking.patient.name}</p>
                {booking.patient.age && <p>Age: {booking.patient.age}</p>}
                {booking.patient.gender && <p>Gender: {booking.patient.gender}</p>}
                {booking.patient.relation && <p>Relation: {booking.patient.relation}</p>}
              </>
            ) : (
              <p>No patient details available</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          {isDoctorBooking ? (
            <>
              <h3 className="font-semibold text-lg mb-2">Doctor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p>Name: {booking.doctor.name}</p>
                  <p>Specialization: {booking.doctor.specialization}</p>
                </div>
                <div>
                  <p>Qualification: {booking.doctor.qualification}</p>
                  <p>Email: {booking.doctor.email}</p>
                </div>
                <div>
                  <p>Address: {booking.doctor.address}</p>
                  {booking.meetingLink && (
                    <p>Meeting Link: <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">Join Meeting</a></p>
                  )}
                </div>
              </div>
            </>
          ) : isDiagnosticBooking ? (
            <>
              <h3 className="font-semibold text-lg mb-2">Diagnostic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p>Name: {booking.diagnostic.name}</p>
                  {booking.diagnostic.description && <p>Description: {booking.diagnostic.description}</p>}
                </div>
                <div>
                  {booking.diagnostic.homeCollection !== undefined && (
                    <p>Home Collection: {booking.diagnostic.homeCollection ? 'Yes' : 'No'}</p>
                  )}
                  {booking.diagnostic.centerVisit !== undefined && (
                    <p>Center Visit: {booking.diagnostic.centerVisit ? 'Yes' : 'No'}</p>
                  )}
                </div>
                <div>
                  {isPackageBooking ? (
                    <>
                      <p>Package: {booking.package.name}</p>
                      <p>Price: {formatCurrency(booking.package.price)}</p>
                      {booking.package.totalTestsIncluded > 0 && (
                        <p>Tests Included: {booking.package.totalTestsIncluded}</p>
                      )}
                      {booking.package.totalScansIncluded > 0 && (
                        <p>Scans Included: {booking.package.totalScansIncluded}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {hasTests && <p>Tests: {booking.cartItems?.filter(item => item.type === 'test').length || 0}</p>}
                      {hasScans && <p>Scans/X-rays: {booking.cartItems?.filter(item => item.type === 'xray').length || 0}</p>}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500">No additional details available</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">User Booking History</h1>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-purple-900 sm:text-sm"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="bg-white px-4 py-2 rounded shadow">
                <span className="font-medium">Wallet Balance:</span> {formatCurrency(walletBalance)}
              </div>
              <button
                onClick={() => {/* export functionality here */ }}
                className="px-4 py-2 bg-purple-900 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
              >
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto">
          {['all', 'doctor', 'diagnostics', 'packages', 'tests', 'scans'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab
                ? 'text-purple-900 border-b-2 border-purple-900'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'all' ? 'All Bookings' :
                tab === 'doctor' ? 'Doctor' :
                  tab === 'diagnostics' ? 'Diagnostics' :
                    tab === 'packages' ? 'Packages' :
                      tab === 'tests' ? 'Tests' : 'Scans & X-rays'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : categorizedBookings[activeTab]?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {activeTab === 'all' ? '' : activeTab} bookings found
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        ) : (
          <div className="space-y-4">
            {categorizedBookings[activeTab]?.map(booking => renderBookingCard(booking))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyStaffHistory;

