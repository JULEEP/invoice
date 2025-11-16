import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { FiUploadCloud } from 'react-icons/fi';
import { FiDownload } from "react-icons/fi";



const CompanyDiagnosticDetail = () => {
  const { id } = useParams();
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Base URL for images
  const BASE_URL = "https://api.credenthealth.com";

  useEffect(() => {
    const fetchDiagnosticDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.credenthealth.com/api/admin/diagnostics/${id}`
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
      const res = await axios.put(`${API_BASE}/add-slotfordiag/${diagnostic._id}`, {
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
    if (!selectedSlot || !slotForm || !slotType) {
      alert("Missing slot data.");
      return;
    }

    try {
      const payload = {
        slotType: slotType, // "home" or "center"
        day: selectedSlot.day,
        date: selectedSlot.date,
        timeSlot: selectedSlot.timeSlot,
        newSlot: {
          newDay: slotForm.day,
          newDate: slotForm.date,
          newTimeSlot: slotForm.timeSlot,
          isBooked: slotForm.isBooked || false
        }
      };

      const res = await axios.put(`${API_BASE}/update-slot/${diagnostic._id}`, payload);

      alert("Slot updated successfully");
      setSelectedSlot(null);
      setSlotForm({ day: "", date: "", timeSlot: "", isBooked: false });
      setDiagnostic(res.data.diagnostic); // update UI with latest data
    } catch (err) {
      console.error("Update slot error:", err);
      alert("Failed to update slot");
    }
  };


  const deleteSlot = async (slot, type) => {
    try {
      const slotType = type === "home" ? "home" : "center";

      const res = await axios.put(`${API_BASE}/delete-diagslot/${diagnostic._id}`, {
        slotType,
        day: slot.day,
        date: slot.date,
        timeSlot: slot.timeSlot
      });

      alert("Slot deleted successfully");
      setDiagnostic(res.data.diagnostic);
      setSelectedSlot(null);
    } catch (err) {
      console.error("Delete slot error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to delete slot");
    }
  };


  const handleBulkTestUpload = async (e, diagnosticId) => {
    const file = e.target.files[0];
    if (!file) {
      Swal.fire("Error", "Please select a CSV file", "error");
      return;
    }

    if (!diagnosticId) {
      Swal.fire("Error", "Diagnostic ID missing", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`https://api.credenthealth.com/api/admin/upload-testcsv/${diagnosticId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();

      Swal.fire("Success", `${result.insertedCount} tests uploaded successfully!`, "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload CSV", "error");
    }
  };


  const handleBulkUploadPackages = async (e, diagnosticId) => {
    const file = e.target.files[0]; // get file from input event
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);  // multer field name

    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/admin/upload-pkgcsv/${diagnosticId}`,  // diagnosticId in URL
        formData
      );

      alert('✅ Upload success');
      console.log(response.data);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('❌ Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };



  const downloadCSVTemplate = () => {
    const headers = [
      "name",
      "description",
      "price",
      "reportIn24Hrs",
      "reportHour",
      "instruction",
      "fastingRequired",
      "homeCollectionAvailable",
      "category",
      "precaution",
      "image"
    ];

    const sample = [
      "Blood Sugar",
      "Test for blood glucose levels",
      "300",
      "true",
      "24",
      "Fast for 8 hours before test",
      "true",
      "true",
      "General",
      "Avoid alcohol 24 hrs before test",
      "https://example.com/image.jpg"
    ];

    const csvContent = [headers.join(","), sample.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "test-upload-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const downloadPackageCSVTemplate = () => {
    const headers = [
      "name",
      "price",
      "doctorInfo",
      "totalTestsIncluded",
      "description",
      "precautions",
      "includedTests"
    ];

    const description = `A "Blood Package" typically refers to a group of blood tests ordered together to assess various aspects of a person's health. These packages can range from basic screenings to comprehensive assessments and often include tests like Complete Blood Count (CBC), lipid profile, liver function tests, kidney function tests, and thyroid function tests. They are designed to provide a broad overview of an individual's health status and can help in the early detection of various conditions.`;

    const precautions = `Please fast for 8 hours before blood test.`;

    // ✅ Full includedTests data with subTests array
    const includedTests = JSON.stringify([
      {
        name: "Complete Blood Picture/Count",
        subTestCount: 3,
        subTests: ["Hemoglobin", "RBC", "WBC"]
      },
      {
        name: "Stool Routine Examination",
        subTestCount: 3,
        subTests: ["Color", "Consistency", "Microscopy"]
      },
      {
        name: "Radiology",
        subTestCount: 2,
        subTests: ["Chest X-ray", "Ultrasound Abdomen"]
      }
    ]);

    const values = [
      "Blood Package",
      5000,
      "Dr. John Doe, General Physician",
      3,
      description,
      precautions,
      includedTests
    ];

    const csvContent = [
      headers.join(","), // header row
      values.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") // value row
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "package-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const handleBulkUploadScans = async (e, diagnosticId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // backend expects 'file' key

    try {
      // Note the diagnosticId in the URL
      const response = await fetch(`https://api.credenthealth.com/api/admin/upload-xray-csv/${diagnosticId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CSV");
      }

      const result = await response.json();

      if (result.insertedCount) {
        alert(`✅ ${result.insertedCount} X-ray records uploaded successfully`);
      } else {
        alert("Upload succeeded, but response format was unexpected");
      }
    } catch (error) {
      console.error("❌ CSV upload error:", error);
      alert("❌ Failed to upload X-ray CSV. Check file format and try again.");
    }
  };



  const downloadScanCSVTemplate = () => {
    const headers = ["title", "price", "preparation", "reportTime", "image"];

    const exampleRow = [
      "Chest X-ray",
      1000,
      "No preparation needed",
      "24 Hours",
      "https://example.com/images/chest-xray.jpg" // optional image field
    ];

    const csvContent = [
      headers.join(","), // Header row
      exampleRow.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") // Data row
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "scan-xray-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  <p><span className="font-medium">Password:</span> {diagnostic.password}</p>
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

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition mb-2">
              <FiUploadCloud className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">Upload CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleBulkTestUpload(e, diagnostic._id)}
                className="hidden"
              />

            </label>

            <button
              onClick={downloadCSVTemplate}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50 ml-2 mb-2"
            >
              <FiDownload className="text-gray-500" />
              <span className="text-sm">Download CSV Format</span>
            </button>

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

            <div className="flex items-center gap-4 mb-2">
              {/* Bulk Upload Button */}
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition">
                <FiUploadCloud className="w-5 h-5" />
                <span className="text-sm">Bulk Upload</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleBulkUploadPackages(e, diagnostic._id)}
                  className="hidden"
                />
              </label>

              {/* Download Template Button */}
              <button
                onClick={downloadPackageCSVTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition"
              >
                <FiDownload className="w-5 h-5" />
                <span className="text-sm">Download CSV Template</span>
              </button>
            </div>

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

            {/* Bulk Upload Button */}
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition mb-2">
                <FiUploadCloud className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Bulk Upload</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleBulkUploadScans(e, diagnostic._id)}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={downloadScanCSVTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition mb-2"
              >
                <FiDownload className="w-5 h-5" />
                <span className="text-sm">Download CSV Template</span>
              </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnostic.scans.map((scan) => (
                <div key={scan._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* ✅ Image display */}
                  {scan.image && (
                    <img
                      src={`https://api.credenthealth.com${scan.image}`}
                      alt={scan.title}
                      className="w-full h-48 object-cover"
                    />
                  )}

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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${slot.isBooked
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                                }`}
                            >
                              {slot.isBooked ? "Booked" : "Available"}
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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${slot.isBooked
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                                }`}
                            >
                              {slot.isBooked ? "Booked" : "Available"}
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Day Dropdown */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Day</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Day</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                {/* Date Input */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Date</label>
                  <input
                    type="date"
                    value={slotForm.date}
                    onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                {/* Time Input */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Time</label>
                  <input
                    type="time"
                    value={slotForm.timeSlot}
                    onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                {/* Type Dropdown */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Type</label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="home">Home Collection</option>
                    <option value="center">Center Visit</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  disabled={!slotForm.day || !slotForm.date || !slotForm.timeSlot}
                  onClick={selectedSlot ? updateSlot : addSlot}
                  className={`px-4 py-2 rounded text-white ${selectedSlot ? "bg-blue-600" : "bg-green-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
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

export default CompanyDiagnosticDetail;

