import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SingleDiagnosticDetail = () => {
  const { id } = useParams();
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Base URL for images
  const BASE_URL = "https://api.credenthealth.com";

  useEffect(() => {

    
    const fetchDiagnosticDetails = async () => {
       const diagnosticId = localStorage.getItem("diagnosticId");
      
      console.log("🧾 Diagnostic ID from localStorage:", diagnosticId);
      
      if (!diagnosticId) {
        setError("Diagnostic ID not found in localStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `https://api.credenthealth.com/api/admin/diagnostics/${diagnosticId}`
        );
        setDiagnostic(response.data.diagnostic);
      } catch (err) {
        setError("Failed to fetch diagnostic details");
        console.error("Error fetching diagnostic:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosticDetails();
  }, [id]);



  const [selectedSlot, setSelectedSlot] = useState(null);
const [slotType, setSlotType] = useState("home"); // or 'center'
const [slotForm, setSlotForm] = useState({
  day: "",
  date: "",
  timeSlot: "",
  isBooked: false
});

// API base
const API_BASE = "https://api.credenthealth.com/api/admin"; // change if needed

// Add Slot
const addSlot = async () => {
  try {
    const res = await axios.put(`${API_BASE}//add-slot/${diagnostic._id}`, {
      slotType,
      ...slotForm
    });
    alert("Slot added");
    setDiagnostic(res.data.diagnostic);
  } catch (err) {
    console.error("Add slot error:", err);
    alert("Failed to add slot");
  }
};

// Update Slot
const updateSlot = async () => {
  try {
    const res = await axios.put(`${API_BASE}/update-slot/${diagnostic._id}`, {
      slotType,
      ...selectedSlot, // old slot
      newSlot: slotForm
    });
    alert("Slot updated");
    setSelectedSlot(null);
    setSlotForm({ day: "", date: "", timeSlot: "", isBooked: false });
    setDiagnostic(res.data.diagnostic);
  } catch (err) {
    console.error("Update slot error:", err);
    alert("Failed to update slot");
  }
};

const deleteSlot = async (slot, type) => {
  try {
    // Convert your type to match backend field names exactly
    const slotTypeMap = {
      home: "homeCollectionSlots",
      center: "centerVisitSlots",
      homeCollectionSlots: "homeCollectionSlots",  // in case already correct
      centerVisitSlots: "centerVisitSlots"         // in case already correct
    };

    const slotType = slotTypeMap[type];

    if (!slotType) {
      alert("Invalid slot type");
      return;
    }

    const res = await axios.put(`${API_BASE}/delete-diagslot/${diagnostic._id}`, {
      slotType,
      day: slot.day,
      date: slot.date,
      timeSlot: slot.timeSlot
    });

    alert("Slot deleted");
    setDiagnostic(res.data.diagnostic);
  } catch (err) {
    console.error("Delete slot error:", err);
    alert("Failed to delete slot");
  }
};




  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!diagnostic) return <div className="p-4">Diagnostic center not found</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-start mb-6">
        {diagnostic.image && (
          <div className="mr-6">
            <img 
              src={`${BASE_URL}${diagnostic.image}`} 
              alt={diagnostic.name}
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{diagnostic.name}</h1>
          <p className="text-gray-600">{diagnostic.centerType} Center</p>
          <p className="text-gray-600">{diagnostic.methodology} Services</p>
          {diagnostic.pathologyAccredited && (
            <p className="text-gray-600">Accreditation: {diagnostic.pathologyAccredited}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {[
          { id: "basic", label: "Basic Info" },
          { id: "tests", label: `Tests (${diagnostic.tests.length})` },
          { id: "packages", label: `Packages (${diagnostic.packages.length})` },
          { id: "scans", label: `Scans (${diagnostic.scans.length})` },
          { id: "slots", label: "Slots" },
          { id: "contacts", label: `Contacts (${diagnostic.contactPersons.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            className={`py-2 px-4 whitespace-nowrap ${activeTab === tab.id ? "border-b-2 border-blue-500 font-medium" : "text-gray-600"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "basic" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-lg mb-3 text-gray-800">Contact Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {diagnostic.email}</p>
                  <p><span className="font-medium">Phone:</span> {diagnostic.phone}</p>
                  <p><span className="font-medium">Address:</span> {diagnostic.address}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-lg mb-3 text-gray-800">Center Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Type:</span> {diagnostic.centerType}</p>
                  <p><span className="font-medium">Methodology:</span> {diagnostic.methodology}</p>
                  <p><span className="font-medium">Network:</span> {diagnostic.network}</p>
                  <p><span className="font-medium">Description:</span> {diagnostic.description}</p>
                  <p><span className="font-medium">Accreditation:</span> {diagnostic.pathologyAccredited || "None"}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-lg mb-3 text-gray-800">Location</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Country:</span> {diagnostic.country}</p>
                  <p><span className="font-medium">State:</span> {diagnostic.state}</p>
                  <p><span className="font-medium">City:</span> {diagnostic.city}</p>
                  <p><span className="font-medium">Pincode:</span> {diagnostic.pincode}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-lg mb-3 text-gray-800">Visit Options</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Visit Type:</span> {diagnostic.visitType}</p>
                </div>
              </div>
            </div>
          </div>
        )}

     {activeTab === "tests" && (
  <div>
    <h2 className="text-xl font-semibold mb-6">Available Tests</h2>

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left font-medium">Test Name</th>
            <th className="py-3 px-4 text-left font-medium">MRP (₹)</th>
            <th className="py-3 px-4 text-left font-medium">Fasting</th>
            <th className="py-3 px-4 text-left font-medium">Home Collection</th>
            <th className="py-3 px-4 text-left font-medium">Report Time</th>
            <th className="py-3 px-4 text-left font-medium">Category</th>
            <th className="py-3 px-4 text-left font-medium">Instructions</th> {/* ✅ NEW */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {diagnostic.tests.map((test) => (
            <tr key={test._id} className="hover:bg-gray-50">
              <td className="py-3 px-4">{test.name}</td>
              <td className="py-3 px-4">{test.price}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${test.fastingRequired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {test.fastingRequired ? 'Required' : 'Not Required'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${test.homeCollectionAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {test.homeCollectionAvailable ? 'Available' : 'Not Available'}
                </span>
              </td>
              <td className="py-3 px-4">
                {test.reportIn24Hrs ? '24 Hours' : `${test.reportHour || '48'} Hours`}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {test.category || 'General'}
                </span>
              </td>
              <td className="py-3 px-4">{test.instruction || '—'}</td> {/* ✅ NEW */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        {activeTab === "packages" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Health Packages</h2>

            <div className="grid gap-6">
              {diagnostic.packages.map((pkg) => (
                <div key={pkg._id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-4">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <p className="text-gray-600">₹{pkg.price} • {pkg.totalTestsIncluded} tests included</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-700">{pkg.description || 'No description provided'}</p>
                    </div>
                    
                    {pkg.precautions && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Precautions</h4>
                        <p className="text-gray-700">{pkg.precautions}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Included Tests</h4>
                      <div className="space-y-3">
                        {pkg.includedTests.map((test, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-gray-600">
                              Includes {test.subTestCount} sub-tests: {test.subTests.join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "scans" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Scans & X-Rays</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnostic.scans.map((scan) => (
                <div key={scan._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-100 p-4">
                    <h3 className="font-semibold text-lg">{scan.title}</h3>
                    <span className="font-medium text-blue-600">₹{scan.price}</span>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-gray-500">Preparation</h4>
                      <p className="text-gray-700">{scan.preparation || 'No special preparation required'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Report Time</h4>
                      <p className="text-gray-700">{scan.reportTime || '24-48 hours'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

       {activeTab === "slots" && (
  <div className="space-y-8">
    <h2 className="text-xl font-semibold mb-6">Available Slots</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Home Collection Slots */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h3 className="font-semibold text-lg">Home Collection Slots</h3>
        </div>
        <div className="p-4 space-y-4">
          {diagnostic.homeCollectionSlots.length > 0 ? (
            diagnostic.homeCollectionSlots.map((slot, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-sm text-gray-600">{slot.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {slot.timeSlot}
                    </span>
                    <button
                      className="text-blue-600 text-xs"
                      onClick={() => {
                        setSlotType("home");
                        setSelectedSlot(slot);
                        setSlotForm(slot);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 text-xs"
                      onClick={() => deleteSlot(slot, "home")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No home collection slots available</p>
          )}
        </div>
      </div>

      {/* Center Visit Slots */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h3 className="font-semibold text-lg">Center Visit Slots</h3>
        </div>
        <div className="p-4 space-y-4">
          {diagnostic.centerVisitSlots.length > 0 ? (
            diagnostic.centerVisitSlots.map((slot, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-sm text-gray-600">{slot.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {slot.timeSlot}
                    </span>
                    <button
                      className="text-blue-600 text-xs"
                      onClick={() => {
                        setSlotType("center");
                        setSelectedSlot(slot);
                        setSlotForm(slot);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 text-xs"
                      onClick={() => deleteSlot(slot, "center")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No center visit slots available</p>
          )}
        </div>
      </div>
    </div>

    {/* Slot Form Section */}
    <div className="mt-8 border p-4 rounded bg-gray-50">
      <h3 className="font-semibold mb-3">
        {selectedSlot ? "Edit Slot" : "Add New Slot"}
      </h3>
      <div className="grid md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Day (e.g., Saturday)"
          value={slotForm.day}
          onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={slotForm.date}
          onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={slotForm.timeSlot}
          onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={slotType}
          onChange={(e) => setSlotType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="home">Home Collection</option>
          <option value="center">Center Visit</option>
        </select>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={selectedSlot ? updateSlot : addSlot}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {selectedSlot ? "Update Slot" : "Add Slot"}
        </button>
        {selectedSlot && (
          <button
            onClick={() => {
              setSelectedSlot(null);
              setSlotForm({ day: "", date: "", timeSlot: "", isBooked: false });
            }}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  </div>
)}


        {activeTab === "contacts" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Contact Persons</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnostic.contactPersons.map((contact) => (
                <div key={contact._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-100 p-4">
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <p className="text-gray-600">{contact.designation}</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium text-sm text-gray-500">Gender:</span> 
                        <span className="ml-2 capitalize">{contact.gender || 'Not specified'}</span>
                      </p>
                      <p>
                        <span className="font-medium text-sm text-gray-500">Email:</span> 
                        <span className="ml-2">{contact.contactEmail || 'Not specified'}</span>
                      </p>
                      <p>
                        <span className="font-medium text-sm text-gray-500">Phone:</span> 
                        <span className="ml-2">{contact.contactNumber || 'Not specified'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleDiagnosticDetail;

