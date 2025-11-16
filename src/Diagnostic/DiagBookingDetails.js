import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineFilePdf } from 'react-icons/ai';
import { FaFileMedicalAlt } from 'react-icons/fa';
import { MdDownload } from 'react-icons/md';

const DiagBookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(
          `https://api.credenthealth.com/api/admin/booking/${bookingId}`
        );
        if (res.data && res.data.booking) {
          setBooking(res.data.booking);
        } else {
          console.error('Unexpected booking response:', res.data);
        }
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (!booking) {
    return <p className="p-4">Loading booking details...</p>;
  }

  const {
    diagnosticBookingId,
    serviceType,
    status,
    date,
    timeSlot,
    totalPrice,
    discount,
    payableAmount,
    transactionId,
    paymentStatus,
    diagnostic,
    staff,
    cartItems = [],
    reportFile,
    diagPrescription
  } = booking;

  const fileBase = "https://api.credenthealth.com"; // Change as needed in prod

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-900 mb-4">
        Booking Details (ID: {diagnosticBookingId})
      </h2>

      {/* Booking Summary */}
      <table className="w-full border rounded mb-6 text-sm">
        <tbody>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">Service Type</td>
            <td className="p-2 border">{serviceType}</td>
            <td className="p-2 font-medium border">Status</td>
            <td className="p-2 border capitalize">{status}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium border">Date</td>
            <td className="p-2 border">{date}</td>
            <td className="p-2 font-medium border">Time Slot</td>
            <td className="p-2 border">{timeSlot === "null" ? "-" : timeSlot}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">Diagnostic Center</td>
            <td className="p-2 border">{diagnostic?.name || '-'}</td>
            <td className="p-2 font-medium border">Pincode</td>
            <td className="p-2 border">{diagnostic?.pincode || '-'}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium border">Contact Person</td>
            <td className="p-2 border">{diagnostic?.contactPerson?.name || '-'}</td>
            <td className="p-2 font-medium border">Contact Number</td>
            <td className="p-2 border">{diagnostic?.contactPerson?.contactNumber || '-'}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">User</td>
            <td className="p-2 border">{staff?.name || 'N/A'}</td>
            <td className="p-2 font-medium border">User Contact</td>
            <td className="p-2 border">{staff?.contact_number || '-'}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium border">Transaction ID</td>
            <td className="p-2 border">{transactionId || '-'}</td>
            <td className="p-2 font-medium border">Payment Status</td>
            <td className="p-2 border">
              <span className={`px-2 py-1 rounded-full text-xs ${
                paymentStatus === 'captured' ? 'bg-green-100 text-green-800' : 
                paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {paymentStatus || 'N/A'}
              </span>
            </td>
          </tr>
          <tr className="bg-gray-100">
            <td className="p-2 font-medium border">Total MRP</td>
            <td className="p-2 border">₹{totalPrice}</td>
            <td className="p-2 font-medium border">Discount</td>
            <td className="p-2 border">₹{discount}</td>
          </tr>
          <tr>
            <td className="p-2 font-medium border">Payable Amount</td>
            <td className="p-2 border text-green-700 font-semibold" colSpan="3">
              ₹{payableAmount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Report & Prescription */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">Files</h3>
        <div className="flex gap-6 items-center">
          {reportFile ? (
            <a
              href={`${fileBase}${reportFile}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:underline"
              download
            >
              <AiOutlineFilePdf size={20} />
              Diagnostic Report
              <MdDownload size={16} />
            </a>
          ) : (
            <span className="text-gray-500 italic">No Report Uploaded</span>
          )}

          {diagPrescription ? (
            <a
              href={`${fileBase}${diagPrescription}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:underline"
              download
            >
              <FaFileMedicalAlt size={18} />
              Prescription
              <MdDownload size={16} />
            </a>
          ) : (
            <span className="text-gray-500 italic">No Prescription</span>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div>
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          Items Booked ({cartItems.length})
        </h3>

        {cartItems.length > 0 ? (
          <table className="w-full border text-sm">
            <thead className="bg-pink-100">
              <tr>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">MRP</th>
                <th className="p-2 border">Total Payable</th>
                <th className="p-2 border">Description</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border capitalize">{item.type}</td>
                  <td className="p-2 border">
                    {item.title || item.itemDetails?.name}
                  </td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">₹{item.price}</td>
                  <td className="p-2 border">₹{item.totalPayable}</td>
                  <td className="p-2 border">
                    {item.itemDetails?.description || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 italic">No items booked</p>
        )}
      </div>
    </div>
  );
};

export default DiagBookingDetails;