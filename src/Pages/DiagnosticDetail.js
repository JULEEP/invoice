import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { FiUploadCloud, FiDownload, FiEdit, FiTrash2, FiPlus, FiMinus, FiX } from 'react-icons/fi';

const DiagnosticDetail = () => {
  const { id } = useParams();
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Base URL for images
  const BASE_URL = "https://api.credenthealth.com";

  // Edit states for different entities
  const [editingTest, setEditingTest] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingScan, setEditingScan] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);

  // Edit forms
  const [testForm, setTestForm] = useState({
    name: "",
    price: "",
    description: "",
    instruction: "",
    fastingRequired: false,
    homeCollectionAvailable: false,
    reportIn24Hrs: false,
    reportHour: "",
    category: "",
    precaution: ""
  });

  const [packageForm, setPackageForm] = useState({
    name: "",
    price: "",
    totalTestsIncluded: "",
    description: "",
    precautions: "",
    includedTests: []
  });

  const [scanForm, setScanForm] = useState({
    title: "",
    price: "",
    preparation: "",
    reportTime: "",
    image: ""
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    designation: "",
    gender: "",
    contactEmail: "",
    contactNumber: ""
  });

  // Slot states
  const [slotForm, setSlotForm] = useState({
    day: "",
    date: "",
    timeSlot: "",
    isBooked: false,
    slotType: "home"
  });




  // Add this with other state declarations
const [showAddPackageModal, setShowAddPackageModal] = useState(false);
const [newPackageForm, setNewPackageForm] = useState({
  name: "",
  price: "",
  totalTestsIncluded: "",
  description: "",
  precautions: "",
  includedTests: [{ name: "", subTestCount: 0, subTests: [""] }]
});



// Add these with other state declarations
const [showAddBranchModal, setShowAddBranchModal] = useState(false);
const [editingBranch, setEditingBranch] = useState(null);
const [branchForm, setBranchForm] = useState({
  branchName: "",
  email: "",
  phone: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  contactPersons: [{ name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" }]
});



// Branch CRUD Operations
const handleEditBranch = (branch) => {
  setEditingBranch(branch);
  setBranchForm({
    branchName: branch.branchName || "",
    email: branch.email || "",
    phone: branch.phone || "",
    address: branch.address || "",
    country: branch.country || "",
    state: branch.state || "",
    city: branch.city || "",
    pincode: branch.pincode || "",
    contactPersons: branch.contactPersons?.map(cp => ({
      name: cp.name || "",
      designation: cp.designation || "",
      gender: cp.gender || "",
      contactEmail: cp.contactEmail || "",
      contactNumber: cp.contactNumber || ""
    })) || [{ name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" }]
  });
};

const handleBranchContactChange = (index, field, value) => {
  const updatedContacts = [...branchForm.contactPersons];
  updatedContacts[index][field] = value;
  setBranchForm({ ...branchForm, contactPersons: updatedContacts });
};

const handleAddBranchContact = () => {
  setBranchForm({
    ...branchForm,
    contactPersons: [
      ...branchForm.contactPersons,
      { name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" }
    ]
  });
};

const handleRemoveBranchContact = (index) => {
  if (branchForm.contactPersons.length > 1) {
    const updatedContacts = branchForm.contactPersons.filter((_, i) => i !== index);
    setBranchForm({ ...branchForm, contactPersons: updatedContacts });
  }
};

const handleCreateOrUpdateBranch = async () => {
  try {
    const payload = {
      ...branchForm,
      diagnosticId: diagnostic._id
    };

    let res;
    if (editingBranch) {
      res = await axios.put(`${API_BASE}/update-branch/${editingBranch._id}`, payload);
      Swal.fire("Success", "Branch updated successfully", "success");
    } else {
      res = await axios.post(`${API_BASE}/add-branch`, payload);
      Swal.fire("Success", "Branch added successfully", "success");
    }

    setShowAddBranchModal(false);
    setEditingBranch(null);
    
    // Refresh diagnostic data
    const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
    setDiagnostic(response.data.diagnostic);
  } catch (err) {
    console.error("Branch operation error:", err);
    Swal.fire("Error", "Failed to save branch", "error");
  }
};

const handleDeleteBranch = async (branchId) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This branch will be deleted!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${API_BASE}/delete-branch/${branchId}`);
    Swal.fire("Deleted!", "Branch has been deleted.", "success");
    
    // Refresh diagnostic data
    const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
    setDiagnostic(response.data.diagnostic);
  } catch (err) {
    console.error("Delete branch error:", err);
    Swal.fire("Error", "Failed to delete branch", "error");
  }
};


  const API_BASE = "https://api.credenthealth.com/api/admin";



  // Handle input changes for new package
const handleNewPackageChange = (e) => {
  setNewPackageForm({
    ...newPackageForm,
    [e.target.name]: e.target.value
  });
};

// Handle test changes for new package (similar to existing ones)
const handleNewPackageTestChange = (index, field, value) => {
  const updatedTests = [...newPackageForm.includedTests];
  updatedTests[index][field] = field === "subTestCount" ? parseInt(value) || 0 : value;
  setNewPackageForm({ ...newPackageForm, includedTests: updatedTests });
};

const handleNewPackageSubTestChange = (testIndex, subTestIndex, value) => {
  const updatedTests = [...newPackageForm.includedTests];
  updatedTests[testIndex].subTests[subTestIndex] = value;
  setNewPackageForm({ ...newPackageForm, includedTests: updatedTests });
};

const addNewPackageTest = () => {
  setNewPackageForm({
    ...newPackageForm,
    includedTests: [...newPackageForm.includedTests, { name: "", subTestCount: 0, subTests: [""] }]
  });
};

const removeNewPackageTest = (index) => {
  const updatedTests = newPackageForm.includedTests.filter((_, i) => i !== index);
  setNewPackageForm({ ...newPackageForm, includedTests: updatedTests });
};

const addNewSubTest = (testIndex) => {
  const updatedTests = [...newPackageForm.includedTests];
  updatedTests[testIndex].subTests.push("");
  setNewPackageForm({ ...newPackageForm, includedTests: updatedTests });
};

const removeNewSubTest = (testIndex, subTestIndex) => {
  const updatedTests = [...newPackageForm.includedTests];
  updatedTests[testIndex].subTests = updatedTests[testIndex].subTests.filter((_, i) => i !== subTestIndex);
  setNewPackageForm({ ...newPackageForm, includedTests: updatedTests });
};

// Create new package
const handleCreatePackage = async () => {
  try {
    const formattedTests = newPackageForm.includedTests.map(test => ({
      name: test.name,
      subTestCount: test.subTestCount,
      subTests: test.subTests.filter(subTest => subTest.trim() !== "")
    }));

    const payload = {
      ...newPackageForm,
      includedTests: formattedTests,
      diagnosticIds: [diagnostic._id] // Link to current diagnostic
    };

    const res = await axios.post(`${API_BASE}/create-packages`, payload);
    Swal.fire("Success", "Package created successfully", "success");
    
    // Reset form and close modal
    setNewPackageForm({
      name: "",
      price: "",
      totalTestsIncluded: "",
      description: "",
      precautions: "",
      includedTests: [{ name: "", subTestCount: 0, subTests: [""] }]
    });
    setShowAddPackageModal(false);
    
    // Refresh diagnostic data
    const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
    setDiagnostic(response.data.diagnostic);
  } catch (err) {
    console.error("Create package error:", err);
    Swal.fire("Error", "Failed to create package", "error");
  }
};

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

  // Add Slot
  const addSlot = async () => {
    try {
      const res = await axios.put(`${API_BASE}/add-slotfordiag/${diagnostic._id}`, {
        slotType: slotForm.slotType,
        day: slotForm.day,
        date: slotForm.date,
        timeSlot: slotForm.timeSlot,
        isBooked: slotForm.isBooked
      });
      Swal.fire("Success", "Slot added successfully", "success");
      setDiagnostic(res.data.diagnostic);
      setSlotForm({ day: "", date: "", timeSlot: "", isBooked: false, slotType: "home" });
    } catch (err) {
      console.error("Add slot error:", err);
      Swal.fire("Error", "Failed to add slot", "error");
    }
  };

  // Update Slot - WITH POPUP MODAL
  const handleEditSlot = (slot, type) => {
    setEditingSlot(slot);
    setSlotForm({
      day: slot.day || "",
      date: slot.date || "",
      timeSlot: slot.timeSlot || "",
      isBooked: slot.isBooked || false,
      slotType: type
    });
  };

  const updateSlot = async () => {
    if (!editingSlot) {
      Swal.fire("Error", "No slot selected for update", "error");
      return;
    }

    try {
      const payload = {
        slotType: slotForm.slotType,
        day: editingSlot.day,
        date: editingSlot.date,
        timeSlot: editingSlot.timeSlot,
        newSlot: {
          newDay: slotForm.day,
          newDate: slotForm.date,
          newTimeSlot: slotForm.timeSlot,
          isBooked: slotForm.isBooked || false
        }
      };

      const res = await axios.put(`${API_BASE}/update-slot/${diagnostic._id}`, payload);
      Swal.fire("Success", "Slot updated successfully", "success");
      setEditingSlot(null);
      setSlotForm({ day: "", date: "", timeSlot: "", isBooked: false, slotType: "home" });
      setDiagnostic(res.data.diagnostic);
    } catch (err) {
      console.error("Update slot error:", err);
      Swal.fire("Error", "Failed to update slot", "error");
    }
  };

  const deleteSlot = async (slot, type) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const slotType = type === "home" ? "home" : "center";
      const res = await axios.put(`${API_BASE}/delete-diagslot/${diagnostic._id}`, {
        slotType,
        day: slot.day,
        date: slot.date,
        timeSlot: slot.timeSlot
      });

      Swal.fire("Deleted!", "Slot has been deleted.", "success");
      setDiagnostic(res.data.diagnostic);
      setEditingSlot(null);
    } catch (err) {
      console.error("Delete slot error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to delete slot", "error");
    }
  };

  // Test CRUD Operations
  const handleEditTest = (test) => {
    setEditingTest(test);
    setTestForm({
      name: test.name || "",
      price: test.price || "",
      description: test.description || "",
      instruction: test.instruction || "",
      fastingRequired: test.fastingRequired || false,
      homeCollectionAvailable: test.homeCollectionAvailable || false,
      reportIn24Hrs: test.reportIn24Hrs || false,
      reportHour: test.reportHour || "",
      category: test.category || "",
      precaution: test.precaution || ""
    });
  };

  const handleUpdateTest = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/updatetest/${editingTest._id}`,
        testForm
      );
      Swal.fire("Success", "Test updated successfully", "success");
      setEditingTest(null);
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Update test error:", err);
      Swal.fire("Error", "Failed to update test", "error");
    }
  };

  const handleDeleteTest = async (testId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This test will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/deletetest/${testId}`);
      Swal.fire("Deleted!", "Test has been deleted.", "success");
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Delete test error:", err);
      Swal.fire("Error", "Failed to delete test", "error");
    }
  };

  // Package CRUD Operations
  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || "",
      price: pkg.price || "",
      totalTestsIncluded: pkg.totalTestsIncluded || "",
      description: pkg.description || "",
      precautions: pkg.precautions || "",
      includedTests: Array.isArray(pkg.includedTests) ? pkg.includedTests.map(test => ({
        name: test.name || "",
        subTestCount: test.subTestCount || 0,
        subTests: Array.isArray(test.subTests) ? [...test.subTests] : [""]
      })) : [{ name: "", subTestCount: 0, subTests: [""] }]
    });
  };

  const handlePackageTestChange = (index, field, value) => {
    const updatedTests = [...packageForm.includedTests];
    updatedTests[index][field] = field === "subTestCount" ? parseInt(value) || 0 : value;
    setPackageForm({ ...packageForm, includedTests: updatedTests });
  };

  const handlePackageSubTestChange = (testIndex, subTestIndex, value) => {
    const updatedTests = [...packageForm.includedTests];
    updatedTests[testIndex].subTests[subTestIndex] = value;
    setPackageForm({ ...packageForm, includedTests: updatedTests });
  };

  const addPackageTest = () => {
    setPackageForm({
      ...packageForm,
      includedTests: [...packageForm.includedTests, { name: "", subTestCount: 0, subTests: [""] }]
    });
  };

  const removePackageTest = (index) => {
    const updatedTests = packageForm.includedTests.filter((_, i) => i !== index);
    setPackageForm({ ...packageForm, includedTests: updatedTests });
  };

  const addSubTest = (testIndex) => {
    const updatedTests = [...packageForm.includedTests];
    updatedTests[testIndex].subTests.push("");
    setPackageForm({ ...packageForm, includedTests: updatedTests });
  };

  const removeSubTest = (testIndex, subTestIndex) => {
    const updatedTests = [...packageForm.includedTests];
    updatedTests[testIndex].subTests = updatedTests[testIndex].subTests.filter((_, i) => i !== subTestIndex);
    setPackageForm({ ...packageForm, includedTests: updatedTests });
  };

  const handleUpdatePackage = async () => {
    try {
      const formattedTests = packageForm.includedTests.map(test => ({
        name: test.name,
        subTestCount: test.subTestCount,
        subTests: test.subTests.filter(subTest => subTest.trim() !== "")
      }));

      const payload = {
        ...packageForm,
        includedTests: formattedTests
      };

      const res = await axios.put(
        `${API_BASE}/updatepackage/${editingPackage._id}`,
        payload
      );
      Swal.fire("Success", "Package updated successfully", "success");
      setEditingPackage(null);
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Update package error:", err);
      Swal.fire("Error", "Failed to update package", "error");
    }
  };

  const handleDeletePackage = async (packageId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This package will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/deletepackage/${packageId}`);
      Swal.fire("Deleted!", "Package has been deleted.", "success");
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Delete package error:", err);
      Swal.fire("Error", "Failed to delete package", "error");
    }
  };

  // Scan CRUD Operations
  const handleEditScan = (scan) => {
    setEditingScan(scan);
    setScanForm({
      title: scan.title || "",
      price: scan.price || "",
      preparation: scan.preparation || "",
      reportTime: scan.reportTime || "",
      image: scan.image || ""
    });
  };

  const handleUpdateScan = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/updatescan/${editingScan._id}`,
        scanForm
      );
      Swal.fire("Success", "Scan updated successfully", "success");
      setEditingScan(null);
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Update scan error:", err);
      Swal.fire("Error", "Failed to update scan", "error");
    }
  };

  const handleDeleteScan = async (scanId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This scan will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/deletescan/${scanId}`);
      Swal.fire("Deleted!", "Scan has been deleted.", "success");
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Delete scan error:", err);
      Swal.fire("Error", "Failed to delete scan", "error");
    }
  };

  // Contact CRUD Operations
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name || "",
      designation: contact.designation || "",
      gender: contact.gender || "",
      contactEmail: contact.contactEmail || "",
      contactNumber: contact.contactNumber || ""
    });
  };

  const handleUpdateContact = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/updatecontact/${editingContact._id}`,
        contactForm
      );
      Swal.fire("Success", "Contact updated successfully", "success");
      setEditingContact(null);
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Update contact error:", err);
      Swal.fire("Error", "Failed to update contact", "error");
    }
  };

  const handleDeleteContact = async (contactId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This contact will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/deletecontact/${contactId}`);
      Swal.fire("Deleted!", "Contact has been deleted.", "success");
      // Refresh diagnostic data
      const response = await axios.get(`${API_BASE}/diagnostics/${id}`);
      setDiagnostic(response.data.diagnostic);
    } catch (err) {
      console.error("Delete contact error:", err);
      Swal.fire("Error", "Failed to delete contact", "error");
    }
  };

  // Bulk upload functions
  const handleBulkTestUpload = async (e, diagnosticId) => {
    const file = e.target.files[0];
    if (!file) {
      Swal.fire("Error", "Please select a CSV file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/upload-testcsv/${diagnosticId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      Swal.fire("Success", `${result.insertedCount} tests uploaded successfully!`, "success");
      
      // Refresh data
      const diagnosticResponse = await axios.get(`${API_BASE}/diagnostics/${diagnosticId}`);
      setDiagnostic(diagnosticResponse.data.diagnostic);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload CSV", "error");
    }
  };

  const handleBulkUploadPackages = async (e, diagnosticId) => {
    const file = e.target.files[0];
    if (!file) {
      Swal.fire("Error", "Please select a CSV file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_BASE}/upload-pkgcsv/${diagnosticId}`,
        formData
      );

      Swal.fire("Success", "Packages uploaded successfully!", "success");
      
      // Refresh data
      const diagnosticResponse = await axios.get(`${API_BASE}/diagnostics/${diagnosticId}`);
      setDiagnostic(diagnosticResponse.data.diagnostic);
      
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload CSV", "error");
    }
  };

  const handleBulkUploadScans = async (e, diagnosticId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/upload-xray-csv/${diagnosticId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CSV");
      }

      const result = await response.json();
      Swal.fire("Success", `${result.insertedCount} scans uploaded successfully!`, "success");
      
      // Refresh data
      const diagnosticResponse = await axios.get(`${API_BASE}/diagnostics/${diagnosticId}`);
      setDiagnostic(diagnosticResponse.data.diagnostic);
    } catch (error) {
      console.error("CSV upload error:", error);
      Swal.fire("Error", "Failed to upload scans CSV", "error");
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
      "packageName",
      "price", 
      "totalTestsIncluded",
      "description",
      "precautions",
      "testName",
      "subTests"
    ];

    const rows = [
      ["Blood Package", "5000", "3", "Comprehensive blood test package", "Fast for 8 hours", "Complete Blood Count", "Hemoglobin,RBC,WBC"],
      ["Blood Package", "5000", "3", "Comprehensive blood test package", "Fast for 8 hours", "Liver Function Test", "SGOT,SGPT"],
      ["Blood Package", "5000", "3", "Comprehensive blood test package", "Fast for 8 hours", "Kidney Function Test", "Creatinine,Urea"]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
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

  const downloadScanCSVTemplate = () => {
    const headers = ["title", "price", "preparation", "reportTime", "image"];
    const exampleRow = [
      "Chest X-ray",
      1000,
      "No preparation needed",
      "24 Hours",
      "https://example.com/images/chest-xray.jpg"
    ];

    const csvContent = [
      headers.join(","),
      exampleRow.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
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
          { id: "contacts", label: `Contacts (${diagnostic.contactPersons.length})` },
          // In the tabs array, add branches tab
          { id: "branches", label: `Branches (${diagnostic.branches?.length || 0})` }
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Available Tests</h2>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition">
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
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
                >
                  <FiDownload className="text-gray-500" />
                  <span className="text-sm">Download CSV Format</span>
                </button>
              </div>
            </div>

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
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
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
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTest(test)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "packages" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Health Packages</h2>
              <div className="flex gap-2">

                  <button
          onClick={() => setShowAddPackageModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FiPlus className="w-5 h-5" />
          <span className="text-sm">Add Package</span>
        </button>
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
                <button
                  onClick={downloadPackageCSVTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition"
                >
                  <FiDownload className="w-5 h-5" />
                  <span className="text-sm">Download CSV Template</span>
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {diagnostic.packages.map((pkg) => (
                <div key={pkg._id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <p className="text-gray-600">₹{pkg.price} • {pkg.totalTestsIncluded} tests included</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Scans & X-Rays</h2>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition">
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
                  onClick={downloadScanCSVTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition"
                >
                  <FiDownload className="w-5 h-5" />
                  <span className="text-sm">Download CSV Template</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnostic.scans.map((scan) => (
                <div key={scan._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {scan.image && (
                    <img
                      src={`https://api.credenthealth.com${scan.image}`}
                      alt={scan.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="bg-gray-100 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{scan.title}</h3>
                      <span className="font-medium text-blue-600">₹{scan.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditScan(scan)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScan(scan._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                              className="text-blue-600 text-xs hover:text-blue-800"
                              onClick={() => handleEditSlot(slot, "home")}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 text-xs hover:text-red-800"
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
                              className="text-blue-600 text-xs hover:text-blue-800"
                              onClick={() => handleEditSlot(slot, "center")}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 text-xs hover:text-red-800"
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

            {/* Add New Slot Form */}
            <div className="mt-8 border p-4 rounded bg-gray-50">
              <h3 className="font-semibold mb-3">Add New Slot</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Date</label>
                  <input
                    type="date"
                    value={slotForm.date}
                    onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Time</label>
                  <input
                    type="time"
                    value={slotForm.timeSlot}
                    onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600 font-medium">Type</label>
                  <select
                    value={slotForm.slotType}
                    onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="home">Home Collection</option>
                    <option value="center">Center Visit</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  disabled={!slotForm.day || !slotForm.date || !slotForm.timeSlot}
                  onClick={addSlot}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Slot
                </button>

                <button
                  onClick={() => setSlotForm({ day: "", date: "", timeSlot: "", isBooked: false, slotType: "home" })}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Clear Form
                </button>
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
                  <div className="bg-gray-100 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      <p className="text-gray-600">{contact.designation}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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


      {activeTab === "branches" && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Branch Centers</h2>
      <button
        onClick={() => setShowAddBranchModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        <FiPlus className="w-5 h-5" />
        <span className="text-sm">Add Branch</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {diagnostic.branches?.map((branch) => (
        <div key={branch._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg text-blue-800">{branch.branchName}</h3>
              <p className="text-blue-600 text-sm">{branch.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditBranch(branch)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteBranch(branch._id)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-500">Contact Info</h4>
                <p className="text-gray-700">{branch.phone}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-500">Address</h4>
                <p className="text-gray-700">{branch.address}</p>
                <p className="text-sm text-gray-600">
                  {branch.city}, {branch.state}, {branch.country} - {branch.pincode}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-500">Contact Persons</h4>
                <div className="space-y-2 mt-2">
                  {branch.contactPersons?.map((contact, index) => (
                    <div key={contact._id || index} className="border-l-2 border-blue-200 pl-2">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.designation}</p>
                      <p className="text-xs text-gray-600">{contact.contactNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {(!diagnostic.branches || diagnostic.branches.length === 0) && (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <FiPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No branches added yet</p>
        <button
          onClick={() => setShowAddBranchModal(true)}
          className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          Add your first branch
        </button>
      </div>
    )}
  </div>
)}



      {/* Edit Modals */}
      {/* Test Edit Modal */}
      {editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Test Name</label>
                <input
                  type="text"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={testForm.price}
                  onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={testForm.category}
                  onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea
                  value={testForm.instruction}
                  onChange={(e) => setTestForm({ ...testForm, instruction: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={testForm.fastingRequired}
                  onChange={(e) => setTestForm({ ...testForm, fastingRequired: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Fasting Required</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={testForm.homeCollectionAvailable}
                  onChange={(e) => setTestForm({ ...testForm, homeCollectionAvailable: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Home Collection Available</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={testForm.reportIn24Hrs}
                  onChange={(e) => setTestForm({ ...testForm, reportIn24Hrs: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Report in 24 Hours</label>
              </div>
              {!testForm.reportIn24Hrs && (
                <div>
                  <label className="block text-sm font-medium mb-1">Report Hours</label>
                  <input
                    type="number"
                    value={testForm.reportHour}
                    onChange={(e) => setTestForm({ ...testForm, reportHour: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setEditingTest(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Package Name</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Tests Included</label>
                <input
                  type="number"
                  value={packageForm.totalTestsIncluded}
                  onChange={(e) => setPackageForm({ ...packageForm, totalTestsIncluded: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Precautions</label>
                <textarea
                  value={packageForm.precautions}
                  onChange={(e) => setPackageForm({ ...packageForm, precautions: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Included Tests</h4>
                  <button
                    onClick={addPackageTest}
                    className="flex items-center gap-1 text-blue-600 text-sm"
                  >
                    <FiPlus className="w-4 h-4" /> Add Test
                  </button>
                </div>
                {packageForm.includedTests.map((test, index) => (
                  <div key={index} className="border p-4 rounded mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Test {index + 1}</h5>
                      <button
                        onClick={() => removePackageTest(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Test Name</label>
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => handlePackageTestChange(index, "name", e.target.value )}
                          className="w-full border p-2 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sub Test Count</label>
                        <input
                          type="number"
                          value={test.subTestCount}
                          onChange={(e) => handlePackageTestChange(index, "subTestCount", e.target.value)}
                          className="w-full border p-2 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Sub Tests</label>
                        <button
                          onClick={() => addSubTest(index)}
                          className="flex items-center gap-1 text-green-600 text-sm"
                        >
                          <FiPlus className="w-3 h-3" /> Add Sub Test
                        </button>
                      </div>
                      {test.subTests.map((subTest, subIndex) => (
                        <div key={subIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={subTest}
                            onChange={(e) => handlePackageSubTestChange(index, subIndex, e.target.value)}
                            className="flex-1 border p-2 rounded"
                            placeholder={`Sub test ${subIndex + 1}`}
                          />
                          <button
                            onClick={() => removeSubTest(index, subIndex)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setEditingPackage(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePackage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Edit Modal */}
      {editingScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Scan</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={scanForm.title}
                  onChange={(e) => setScanForm({ ...scanForm, title: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={scanForm.price}
                  onChange={(e) => setScanForm({ ...scanForm, price: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preparation Instructions</label>
                <textarea
                  value={scanForm.preparation}
                  onChange={(e) => setScanForm({ ...scanForm, preparation: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Report Time</label>
                <input
                  type="text"
                  value={scanForm.reportTime}
                  onChange={(e) => setScanForm({ ...scanForm, reportTime: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="e.g., 24 Hours, 48 Hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={scanForm.image}
                  onChange={(e) => setScanForm({ ...scanForm, image: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setEditingScan(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateScan}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Edit Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input
                  type="text"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={contactForm.gender}
                  onChange={(e) => setContactForm({ ...contactForm, gender: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.contactEmail}
                  onChange={(e) => setContactForm({ ...contactForm, contactEmail: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input
                  type="text"
                  value={contactForm.contactNumber}
                  onChange={(e) => setContactForm({ ...contactForm, contactNumber: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setEditingContact(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateContact}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Contact
              </button>
            </div>
          </div>
        </div>
      )}


   {showAddPackageModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add New Package</h3>
        <button
          onClick={() => setShowAddPackageModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Package Name *</label>
          <input
            type="text"
            name="name"
            value={newPackageForm.name}
            onChange={handleNewPackageChange}
            className="w-full border p-2 rounded"
            placeholder="Enter package name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={newPackageForm.price}
            onChange={handleNewPackageChange}
            className="w-full border p-2 rounded"
            placeholder="Enter price"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Total Tests Included *</label>
          <input
            type="number"
            name="totalTestsIncluded"
            value={newPackageForm.totalTestsIncluded}
            onChange={handleNewPackageChange}
            className="w-full border p-2 rounded"
            placeholder="Number of tests"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            name="description"
            value={newPackageForm.description}
            onChange={handleNewPackageChange}
            className="w-full border p-2 rounded"
            rows="3"
            placeholder="Enter package description"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Precautions *</label>
          <textarea
            name="precautions"
            value={newPackageForm.precautions}
            onChange={handleNewPackageChange}
            className="w-full border p-2 rounded"
            rows="3"
            placeholder="Enter precautions"
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Included Tests *</h4>
            <button
              onClick={addNewPackageTest}
              className="flex items-center gap-1 text-blue-600 text-sm"
            >
              <FiPlus className="w-4 h-4" /> Add Test
            </button>
          </div>
          
          {newPackageForm.includedTests.map((test, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium">Test {index + 1}</h5>
                <button
                  onClick={() => removeNewPackageTest(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Test Name *</label>
                  <input
                    type="text"
                    value={test.name}
                    onChange={(e) => handleNewPackageTestChange(index, "name", e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Enter test name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Sub Test Count</label>
                  <input
                    type="number"
                    value={test.subTestCount}
                    onChange={(e) => handleNewPackageTestChange(index, "subTestCount", e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Number of sub-tests"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Sub Tests</label>
                  <button
                    onClick={() => addNewSubTest(index)}
                    className="flex items-center gap-1 text-green-600 text-sm"
                  >
                    <FiPlus className="w-3 h-3" /> Add Sub Test
                  </button>
                </div>
                
                {test.subTests.map((subTest, subIndex) => (
                  <div key={subIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={subTest}
                      onChange={(e) => handleNewPackageSubTestChange(index, subIndex, e.target.value)}
                      className="flex-1 border p-2 rounded"
                      placeholder={`Sub test ${subIndex + 1}`}
                    />
                    <button
                      onClick={() => removeNewSubTest(index, subIndex)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() => setShowAddPackageModal(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleCreatePackage}
          disabled={!newPackageForm.name || !newPackageForm.price || !newPackageForm.description || !newPackageForm.precautions || newPackageForm.includedTests.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Package
        </button>
      </div>
    </div>
  </div>
)}



{/* Branch Modal */}
{(showAddBranchModal || editingBranch) && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {editingBranch ? "Edit Branch" : "Add New Branch"}
        </h3>
        <button
          onClick={() => {
            setShowAddBranchModal(false);
            setEditingBranch(null);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Branch Form - Similar to your main diagnostic form but for branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch basic fields */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Branch Name *</label>
          <input
            type="text"
            value={branchForm.branchName}
            onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={branchForm.email}
            onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone *</label>
          <input
            type="text"
            value={branchForm.phone}
            onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Address fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Country *</label>
          <input
            type="text"
            value={branchForm.country}
            onChange={(e) => setBranchForm({ ...branchForm, country: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <input
            type="text"
            value={branchForm.state}
            onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            value={branchForm.city}
            onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Pincode *</label>
          <input
            type="text"
            value={branchForm.pincode}
            onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Full Address *</label>
          <textarea
            value={branchForm.address}
            onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
            className="w-full border p-2 rounded"
            rows="3"
          />
        </div>

        {/* Contact Persons */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Contact Persons</h4>
            <button
              onClick={handleAddBranchContact}
              className="flex items-center gap-1 text-blue-600 text-sm"
            >
              <FiPlus className="w-4 h-4" /> Add Contact
            </button>
          </div>

          {branchForm.contactPersons.map((contact, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium">Contact Person {index + 1}</h5>
                {branchForm.contactPersons.length > 1 && (
                  <button
                    onClick={() => handleRemoveBranchContact(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => handleBranchContactChange(index, "name", e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Designation *</label>
                  <input
                    type="text"
                    value={contact.designation}
                    onChange={(e) => handleBranchContactChange(index, "designation", e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Gender *</label>
                  <select
                    value={contact.gender}
                    onChange={(e) => handleBranchContactChange(index, "gender", e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => handleBranchContactChange(index, "contactEmail", e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Contact Number *</label>
                  <input
                    type="text"
                    value={contact.contactNumber}
                    onChange={(e) => handleBranchContactChange(index, "contactNumber", e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() => {
            setShowAddBranchModal(false);
            setEditingBranch(null);
          }}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateOrUpdateBranch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingBranch ? "Update Branch" : "Create Branch"}
        </button>
      </div>
    </div>
  </div>
)}
      {/* Slot Edit Modal - NEW POPUP MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Slot</h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select
                  value={slotForm.day}
                  onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                  className="w-full border p-2 rounded"
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

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={slotForm.timeSlot}
                  onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={slotForm.slotType}
                  onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="home">Home Collection</option>
                  <option value="center">Center Visit</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={slotForm.isBooked}
                  onChange={(e) => setSlotForm({ ...slotForm, isBooked: e.target.checked })}
                  className="mr-2"
                  id="isBooked"
                />
                <label htmlFor="isBooked" className="text-sm font-medium">
                  Mark as Booked
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingSlot(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateSlot}
                disabled={!slotForm.day || !slotForm.date || !slotForm.timeSlot}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticDetail;