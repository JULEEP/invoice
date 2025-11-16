import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import { FiUploadCloud, FiCheckCircle, FiChevronRight, FiUpload, FiTrash2  } from 'react-icons/fi';
import { FiDownload } from "react-icons/fi";
import axios from 'axios';
import { FaHome } from "react-icons/fa";


const DiagnostiCreate = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [bulkTests, setBulkTests] = useState([]);
  const [bulkPackages, setBulkPackages] = useState([]);
  const [bulkScans, setBulkScans] = useState([]);
  const [pendingBulkTests, setPendingBulkTests] = useState([]);
  const [pendingBulkPackages, setPendingBulkPackages] = useState([]);
  const [pendingBulkScans, setPendingBulkScans] = useState([]);

  // Basic Information - No changes needed as it already matches
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    centerType: "",
    methodology: "",
    pathologyAccredited: "",
    gstNumber: "",
    centerStrength: "",
    location: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    visitType: "",
    network: "",
    description: "",
    homeCollectionSlots: [],
    centerVisitSlots: []
  });

   const [branches, setBranches] = useState([
    {
      branchName: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      contactPersons: [
        { name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" }
      ]
    }
  ]);


   // Add Branch Handlers
  const handleAddBranch = () => {
    setBranches([
      ...branches,
      {
        branchName: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        contactPersons: [
          { name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" }
        ]
      }
    ]);
  };

  const handleRemoveBranch = (index) => {
    if (branches.length > 1) {
      const updatedBranches = [...branches];
      updatedBranches.splice(index, 1);
      setBranches(updatedBranches);
    }
  };

  const handleBranchChange = (branchIndex, field, value) => {
    const updatedBranches = [...branches];
    updatedBranches[branchIndex][field] = value;
    setBranches(updatedBranches);
  };

  const handleBranchContactChange = (branchIndex, contactIndex, field, value) => {
    const updatedBranches = [...branches];
    updatedBranches[branchIndex].contactPersons[contactIndex][field] = value;
    setBranches(updatedBranches);
  };

  const handleAddBranchContact = (branchIndex) => {
    const updatedBranches = [...branches];
    updatedBranches[branchIndex].contactPersons.push({
      name: "", designation: "", gender: "", contactEmail: "", contactNumber: ""
    });
    setBranches(updatedBranches);
  };

  const handleRemoveBranchContact = (branchIndex, contactIndex) => {
    const updatedBranches = [...branches];
    if (updatedBranches[branchIndex].contactPersons.length > 1) {
      updatedBranches[branchIndex].contactPersons.splice(contactIndex, 1);
      setBranches(updatedBranches);
    }
  };

  const [imageFile, setImageFile] = useState(null);

  // Contact Persons - No changes needed
  const [contactPersons, setContactPersons] = useState([
    { name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" },
  ]);

  // Tests - Updated to match backend model
  const [tests, setTests] = useState([
    {
      name: "",
      price: "",
      fastingRequired: false,
      homeCollectionAvailable: false,
      reportIn24Hrs: false,
      reportIn: "",
      reportHour: "",
      description: "",
      category: "General",
      instructions: "",            // newly added
      precautions: "",             // newly added
      reportHour: "",
    },
  ]);

  // Packages - Updated to match backend model
  const [packages, setPackages] = useState([
    {
      packageName: "",
      price: "",
      offerPrice: "",
      totalTestsIncluded: "",
      description: "",
      instructions: "",    // <-- Add this here
      precautions: "",     // <-- Or add this if you want separate field
      tests: [
        {
          test_name: "",
          description: "",
          image: null,
          subTestCount: 1,
          subTests: [""]
        }
      ],
      suggestions: [[]]
    }
  ]);



  // Scans - Updated to match backend model (Xray model)
  const [scans, setScans] = useState([
    {
      title: "",
      price: "",
      preparation: "",
      reportTime: "",
      image: null
    },
  ]);

  const [testSuggestions, setTestSuggestions] = useState([]);
  // Tab Navigation
  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "contact", label: "Contact Persons" },
    { id: "tests", label: "Tests" },
    { id: "packages", label: "Packages" },
    { id: "scans", label: "Scan & Xrays" },
  ];

  // Handle Basic Info Changes
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Contact Person Handlers
  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contactPersons];
    updatedContacts[index][field] = value;
    setContactPersons(updatedContacts);
  };

  const handleAddContactPerson = () => {
    setContactPersons([
      ...contactPersons,
      { name: "", designation: "", gender: "", contactEmail: "", contactNumber: "" },
    ]);
  };



  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const response = await fetch("https://api.credenthealth.com/api/admin/alltestname");
        const data = await response.json();
        const names = data.tests?.map(t => t.testName) || [];
        setTestNamesList(names);
      } catch (error) {
        console.error("Failed to fetch test names:", error);
      }
    };

    fetchTestNames();
  }, []);


  // Test Handlers
  const handleTestChange = (idx, field, value) => {
    const updated = [...tests];
    updated[idx][field] = value;

    if (field === "test_name") {
      const matches = testNamesList.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      updated[idx].suggestions = value ? matches : [];
    }

    setTests(updated);
  };


  const handleTestImageChange = (idx, e) => {
    const file = e.target.files[0];
    const updated = [...tests];
    updated[idx].image = file;
    setTests(updated);
  };

  const handleAddTest = () => {
    setTests([
      ...tests,
      { test_name: "", description: "", price: "", offerPrice: "", image: null },
    ]);
  };


  // Package Handlers

  const handlePackageChange = (pkgIdx, field, value) => {
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      updated[pkgIdx] = { ...updated[pkgIdx], [field]: value };
      return updated;
    });
  };


  const [testNamesList, setTestNamesList] = useState([]);

  const handlePackageTestChange = (pkgIdx, testIdx, field, value) => {
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      const packageCopy = { ...updated[pkgIdx] };

      // Clone tests array and test object to avoid mutation
      const testsCopy = [...packageCopy.tests];
      const testCopy = { ...testsCopy[testIdx], [field]: value };
      testsCopy[testIdx] = testCopy;

      // Prepare suggestions array (clone it or initialize)
      const suggestionsCopy = packageCopy.suggestions ? [...packageCopy.suggestions] : [];

      if (field === "test_name") {
        const matches = value
          ? testNamesList.filter(name => name.toLowerCase().includes(value.toLowerCase()))
          : [];
        suggestionsCopy[testIdx] = matches;
      }

      if (field === "suggestions") {
        suggestionsCopy[testIdx] = value;
      }

      // Update package with new tests and suggestions
      updated[pkgIdx] = {
        ...packageCopy,
        tests: testsCopy,
        suggestions: suggestionsCopy,
      };

      return updated;
    });
  };



  const handleAddPackage = () => {
    setPackages(prevPackages => [
      ...prevPackages,
      {
        packageName: "",
        price: "",
        offerPrice: "",
        totalTestsIncluded: "",
        description: "",
        instructions: "",  // <-- add this
        precautions: "",   // <-- if you want both
        tests: [{ test_name: "", description: "", image: null, subTestCount: 1, subTests: [""] }],
        suggestions: [[]],
      },
    ]);
  };


  const handleAddTestToPackage = (pkgIdx) => {
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      const packageCopy = { ...updated[pkgIdx] };

      // Add new test
      const testsCopy = [...packageCopy.tests, { test_name: "", description: "", image: null }];

      // Add empty suggestions array for the new test
      const suggestionsCopy = packageCopy.suggestions ? [...packageCopy.suggestions, []] : [[]];

      updated[pkgIdx] = {
        ...packageCopy,
        tests: testsCopy,
        suggestions: suggestionsCopy,
      };

      return updated;
    });
  };

  // Add Slot
  const handleAddSlot = (key) => {
    const newSlot = { day: "", date: "", timeSlot: "" };
    setFormData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newSlot]
    }));
  };

  // Remove Slot
  const handleRemoveSlot = (key, index) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  // Change Slot Field
  const handleSlotChange = (key, index, field, value) => {
    setFormData(prev => {
      const updatedSlots = [...prev[key]];
      updatedSlots[index][field] = value;
      return {
        ...prev,
        [key]: updatedSlots
      };
    });
  };


  const handleScanChange = (scanIdx, field, value) => {
    const updated = [...scans];
    updated[scanIdx][field] = value;
    setScans(updated);
  };

  const handleScanImageChange = (scanIdx, e) => {
    const file = e.target.files[0];
    const updated = [...scans];
    updated[scanIdx].image = file;
    setScans(updated);
  };

  const handleAddScan = () => {
    setScans([
      ...scans,
      {
        title: "",
        price: "",
        offerPrice: "",
        description: "",
        category: "",
        preparation: "",
        reportTime: "",
        image: null,
      },
    ]);
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append basic info
     Object.entries(formData).forEach(([key, value]) => {
  if (value !== undefined && value !== null) {
    if ((key === 'homeCollectionSlots' || key === 'centerVisitSlots') && value.length === 0) {
      // ❌ Skip if empty so backend generates default
      return;
    }
    if (key === 'homeCollectionSlots' || key === 'centerVisitSlots') {
      formDataToSend.append(key, JSON.stringify(value));
    } else {
      formDataToSend.append(key, value);
    }
  }
});


      // Append image if exists
      // Append Diagnostic image
      if (imageFile) {
        formDataToSend.append("image", imageFile); // diagnostic image
      }

      const scanWithImage = scans.find(scan => scan.image);
      if (scanWithImage?.image) {
        formDataToSend.append("image", scanWithImage.image); // scan image
      }


      // Combine manually entered data with bulk uploaded data
      const allTests = [
        ...tests.map(test => ({
          name: test.test_name,
          price: test.price,
          description: test.description,
          fastingRequired: test.fastingRequired || false,
          homeCollectionAvailable: test.homeCollection || false,
          reportIn24Hrs: !!test.reportIn24Hrs,
          reportHour: test.reportHour && !isNaN(test.reportHour)
            ? Number(test.reportHour)
            : undefined,
          instruction: test.instruction,
          category: test.category || "General",
          precautions: test.precautions || ""
        })),
        ...bulkTests.map(test => ({
          name: test.name,
          price: test.price,
          description: test.description || "",
          fastingRequired: test.fastingRequired || false,
          homeCollectionAvailable: test.homeCollectionAvailable || false,
          reportIn24Hrs: test.reportIn24Hrs || false,
          reportHour: test.reportHour || (test.reportIn24Hrs ? 24 : undefined),
          instruction: test.instruction || "",
          category: test.category || "General",
          precautions: test.precautions || ""
        }))
      ];

      const allPackages = [
        ...packages.map(pkg => ({
          name: pkg.packageName || pkg.name,
          price: pkg.price,
          doctorInfo: pkg.doctorInfo || "",
          totalTestsIncluded: pkg.totalTestsIncluded || pkg.tests.length,
          description: pkg.description || "",
          instructions: pkg.instructions || "",
          precautions: pkg.precautions || "",
          includedTests: pkg.tests.map(test => ({
            name: test.test_name || test.name,
            subTestCount: test.subTestCount || 1,
            subTests: test.subTests || []
          }))
        })),
        ...bulkPackages.map(pkg => ({
          name: pkg.name,
          price: pkg.price,
          doctorInfo: pkg.doctorInfo || "",
          totalTestsIncluded: pkg.totalTestsIncluded || 0,
          description: pkg.description || "",
          instructions: pkg.instructions || "",
          precautions: pkg.precautions || "",
          includedTests: pkg.includedTests || []
        }))
      ];

      const allScans = [
        ...scans.map(scan => ({
          title: scan.title,
          price: scan.price,
          preparation: scan.preparation || "",
          reportTime: scan.reportTime || "",
          category: scan.category || "",
          image: scan.image ? "placeholder" : ""
        })),
        ...bulkScans.map(scan => ({
          title: scan.title,
          price: scan.price,
          preparation: scan.preparation || "",
          reportTime: scan.reportTime || "",
          category: scan.category || ""
        }))
      ];

      // Prepare the final data to send
      const formattedData = {
        ...formData,
        contactPersons: contactPersons.map(person => ({
          name: person.name,
          designation: person.designation,
          gender: person.gender,
          contactEmail: person.contactEmail,
          contactNumber: person.contactNumber
        })),
        branches: branches, // Add branches to formatted data
        tests: allTests,
        packages: allPackages,
        scans: allScans
      };

      // Append the formatted data
      formDataToSend.append("contactPersons", JSON.stringify(formattedData.contactPersons));
      formDataToSend.append("branches", JSON.stringify(formattedData.branches)); // Add this line
      formDataToSend.append("tests", JSON.stringify(formattedData.tests));
      formDataToSend.append("packages", JSON.stringify(formattedData.packages));
      formDataToSend.append("scans", JSON.stringify(formattedData.scans));

      // Add bulk upload indicators
      if (bulkTests.length > 0 || bulkPackages.length > 0 || bulkScans.length > 0) {
        formDataToSend.append("hasBulkUploads", "true");
        if (bulkTests.length > 0) formDataToSend.append("bulkTestsCount", bulkTests.length.toString());
        if (bulkPackages.length > 0) formDataToSend.append("bulkPackagesCount", bulkPackages.length.toString());
        if (bulkScans.length > 0) formDataToSend.append("bulkScansCount", bulkScans.length.toString());
      }

      const response = await fetch("https://api.credenthealth.com/api/admin/create-diagnostics", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        // Clear bulk data after successful submission
        setBulkTests([]);
        setBulkPackages([]);
        setBulkScans([]);

        Swal.fire({
          title: "Success!",
          text: `Diagnostic center created successfully with:
               ${tests.length + bulkTests.length} tests,
               ${packages.length + bulkPackages.length} packages, and
               ${scans.length + bulkScans.length} scans`,
          icon: "success"
        });
        navigate("/diagnosticlist");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create diagnostic center");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error"
      });
    }
  };

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  useEffect(() => {
    setLoading((l) => ({ ...l, countries: true }));
    fetch('https://countriesnow.space/api/v0.1/countries/iso')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          const countryNames = data.data.map((c) => c.name).sort();
          setCountries(countryNames);
        } else {
          console.warn("Fallback countries being used.");
          setCountries(['India', 'United States', 'Canada']);
        }
      })
      .catch((err) => {
        console.error("Country fetch error:", err);
        setCountries(['India', 'United States', 'Canada']);
      })
      .finally(() =>
        setLoading((l) => ({ ...l, countries: false }))
      );
  }, []);





  useEffect(() => {
    if (!formData.country) return setStates([]);

    setLoading((l) => ({ ...l, states: true }));
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: formData.country })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.states) {
          setStates(data.data.states.map((s) => s.name));
        } else {
          console.warn("No states found, using fallback.");
          setStates(formData.country === 'India' ? ['Maharashtra', 'Gujarat', 'Delhi'] : []);
        }
      })
      .catch((err) => {
        console.error("State fetch error:", err);
        setStates(formData.country === 'India' ? ['Maharashtra', 'Gujarat', 'Delhi'] : []);
      })
      .finally(() => setLoading((l) => ({ ...l, states: false })));
  }, [formData.country]);


  useEffect(() => {
    if (!formData.country || !formData.state) return setCities([]);

    setLoading((l) => ({ ...l, cities: true }));
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: formData.country,
        state: formData.state
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setCities(data.data);
        } else {
          console.warn("No cities found, using fallback.");
          setCities(formData.state === 'Maharashtra' ? ['Mumbai', 'Pune'] : []);
        }
      })
      .catch((err) => {
        console.error("City fetch error:", err);
        setCities(formData.state === 'Maharashtra' ? ['Mumbai', 'Pune'] : []);
      })
      .finally(() => setLoading((l) => ({ ...l, cities: false })));
  }, [formData.country, formData.state]);






  return (
    <div className="p-6 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-6">Create Diagnostic Center</h3>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium ${activeTab === tab.id
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Tab */}
        {activeTab === "basic" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Center Name*</label>
                <input
                  className="w-full p-2 border rounded"
                  name="name"
                  value={formData.name}
                  onChange={handleBasicInfoChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email*</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  name="email"
                  value={formData.email}
                  onChange={handleBasicInfoChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Phone*</label>
                <input
                  className="w-full p-2 border rounded"
                  name="phone"
                  value={formData.phone}
                  onChange={handleBasicInfoChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Center Type*</label>
                <select
                  className="w-full p-2 border rounded"
                  name="centerType"
                  value={formData.centerType}
                  onChange={handleBasicInfoChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Diagnostic">Diagnostic</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Methodology*</label>
                <select
                  className="w-full p-2 border rounded"
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleBasicInfoChange}
                  required
                >
                  <option value="">Select Methodology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Integrated">Integrated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Pathology Accreditation</label>
                <select
                  className="w-full p-2 border rounded"
                  name="pathologyAccredited"
                  value={formData.pathologyAccredited}
                  onChange={handleBasicInfoChange}
                >
                  <option value="">Select Accreditation</option>
                  <option value="NABL">NABL</option>
                  <option value="NABH">NABH</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Network Type</label>
                <select
                  className="w-full p-2 border rounded"
                  name="network"
                  value={formData.network}
                  onChange={handleBasicInfoChange}
                >
                  <option value="">Select Network</option>
                  <option value="Chain">Chain</option>
                  <option value="Independent">Independent</option>
                  <option value="Standalone">Standalone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Visit Type*</label>
                <select
                  className="w-full p-2 border rounded"
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleBasicInfoChange}
                  required
                >
                  <option value="">Select Visit Type</option>
                  <option value="Home Collection">Home Collection</option>
                  <option value="Center Visit">Center Visit</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Center Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  name="description"
                  value={formData.description}
                  onChange={handleBasicInfoChange}
                  rows="3"
                  placeholder="Optional center description..."
                />
              </div>

            </div>

            {/* Address Section */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Country */}
                <div>
                  <label className="block text-sm mb-1">Country*</label>
                  <select
                    className="w-full p-2 border rounded"
                    name="country"
                    value={formData.country}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData((fd) => ({
                        ...fd,
                        state: '',
                        city: '',
                      }));
                    }}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm mb-1">State*</label>
                  <select
                    className="w-full p-2 border rounded"
                    name="state"
                    value={formData.state}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData((fd) => ({
                        ...fd,
                        city: '',
                      }));
                    }}
                    disabled={!formData.country}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm mb-1">City*</label>
                  <select
                    className="w-full p-2 border rounded"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.state}
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm mb-1">Pincode*</label>
                  <input
                    className="w-full p-2 border rounded"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Full Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Full Address*</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>



                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Password*</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password" // ⛔ prevents autofill
                    required
                  />
                </div>


              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm mb-2">Center Image</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    {imageFile ? imageFile.name : "Click to upload center image"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>




                    {/* Branches Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg">Branch Centers</h4>
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FiUploadCloud className="w-4 h-4" />
                  Add Branch
                </button>
              </div>

              {branches.map((branch, branchIndex) => (
                <div key={branchIndex} className="mb-6 p-4 border rounded bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Branch {branchIndex + 1}</h5>
                    {branches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBranch(branchIndex)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Branch Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm mb-1">Branch Name*</label>
                      <input
                        className="w-full p-2 border rounded"
                        value={branch.branchName}
                        onChange={(e) => handleBranchChange(branchIndex, "branchName", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Email*</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded"
                        value={branch.email}
                        onChange={(e) => handleBranchChange(branchIndex, "email", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Phone*</label>
                      <input
                        className="w-full p-2 border rounded"
                        value={branch.phone}
                        onChange={(e) => handleBranchChange(branchIndex, "phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Branch Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm mb-1">Country*</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={branch.country}
                        onChange={(e) => handleBranchChange(branchIndex, "country", e.target.value)}
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">State*</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={branch.state}
                        onChange={(e) => handleBranchChange(branchIndex, "state", e.target.value)}
                        disabled={!branch.country}
                        required
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">City*</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={branch.city}
                        onChange={(e) => handleBranchChange(branchIndex, "city", e.target.value)}
                        disabled={!branch.state}
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Pincode*</label>
                      <input
                        className="w-full p-2 border rounded"
                        value={branch.pincode}
                        onChange={(e) => handleBranchChange(branchIndex, "pincode", e.target.value)}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">Full Address*</label>
                      <textarea
                        className="w-full p-2 border rounded"
                        value={branch.address}
                        onChange={(e) => handleBranchChange(branchIndex, "address", e.target.value)}
                        rows="3"
                        required
                      />
                    </div>
                  </div>

                  {/* Branch Contact Persons */}
                  <div className="mb-4">
                    <h6 className="font-medium mb-2">Branch Contact Persons</h6>
                    {branch.contactPersons.map((contact, contactIndex) => (
                      <div key={contactIndex} className="mb-4 p-3 border rounded bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          <div>
                            <label className="block text-sm mb-1">Name*</label>
                            <input
                              className="w-full p-2 border rounded"
                              value={contact.name}
                              onChange={(e) => handleBranchContactChange(branchIndex, contactIndex, "name", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1">Designation*</label>
                            <input
                              className="w-full p-2 border rounded"
                              value={contact.designation}
                              onChange={(e) => handleBranchContactChange(branchIndex, contactIndex, "designation", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1">Gender*</label>
                            <select
                              className="w-full p-2 border rounded"
                              value={contact.gender}
                              onChange={(e) => handleBranchContactChange(branchIndex, contactIndex, "gender", e.target.value)}
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm mb-1">Email*</label>
                            <input
                              type="email"
                              className="w-full p-2 border rounded"
                              value={contact.contactEmail}
                              onChange={(e) => handleBranchContactChange(branchIndex, contactIndex, "contactEmail", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1">Contact Number*</label>
                            <input
                              className="w-full p-2 border rounded"
                              value={contact.contactNumber}
                              onChange={(e) => handleBranchContactChange(branchIndex, contactIndex, "contactNumber", e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {branch.contactPersons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBranchContact(branchIndex, contactIndex)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                          >
                            Remove Contact
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddBranchContact(branchIndex)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      + Add Contact Person
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Home Collection Slots */}
            {(formData.visitType === "Home Collection" || formData.visitType === "Both") && (
              <div className="mb-6 p-4 border rounded">
                <h4 className="font-medium mb-3">Home Collection Slots</h4>
                {formData.homeCollectionSlots.map((slot, index) => (
                  <div key={index} className="flex flex-wrap gap-4 mb-4 items-end">
                    <div className="w-full md:w-1/4">
                      <label className="block text-sm mb-1">Day</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={slot.day}
                        onChange={(e) => handleSlotChange("homeCollectionSlots", index, "day", e.target.value)}
                      >
                        <option value="">Select Day</option>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-1/4">
                      <label className="block text-sm mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={slot.date}
                        onChange={(e) => handleSlotChange("homeCollectionSlots", index, "date", e.target.value)}
                      />
                    </div>

                    <div className="w-full md:w-1/4">
                      <label className="block text-sm mb-1">Time Slot</label>
                      <input
                        type="time"
                        className="w-full p-2 border rounded"
                        value={slot.timeSlot}
                        onChange={(e) => handleSlotChange("homeCollectionSlots", index, "timeSlot", e.target.value)}
                      />
                    </div>

                    <div className="w-full md:w-1/4">
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot("homeCollectionSlots", index)}
                        className="w-full p-2 bg-red-100 text-red-700 rounded"
                      >
                        Remove Slot
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSlot("homeCollectionSlots")}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded"
                >
                  + Add Home Collection Slot
                </button>
              </div>
            )}

            {/* Center Visit Slots */}
            {(formData.visitType === "Center Visit" || formData.visitType === "Both") && (
              <div className="mb-6 p-4 border rounded">
                <h4 className="font-medium mb-3">Center Visit Slots</h4>
                {formData.centerVisitSlots.map((slot, index) => (
                  <div key={index} className="flex flex-wrap gap-4 mb-4 items-end">
                    <div className="w-full md:w-1/4">
                      <label className="block text-sm mb-1">Day</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={slot.day}
                        onChange={(e) => handleSlotChange("centerVisitSlots", index, "day", e.target.value)}
                      >
                        <option value="">Select Day</option>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-1/4">
                      <label className="block text-sm mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={slot.date}
                        onChange={(e) => handleSlotChange("centerVisitSlots", index, "date", e.target.value)}
                      />
                    </div>

                    <div className="w-full md:w-1/4">
                      <label className="block text-sm mb-1">Time Slot</label>
                      <input
                        type="time"
                        className="w-full p-2 border rounded"
                        value={slot.timeSlot}
                        onChange={(e) => handleSlotChange("centerVisitSlots", index, "timeSlot", e.target.value)}
                      />
                    </div>

                    <div className="w-full md:w-1/4">
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot("centerVisitSlots", index)}
                        className="w-full p-2 bg-red-100 text-red-700 rounded"
                      >
                        Remove Slot
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSlot("centerVisitSlots")}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded"
                >
                  + Add Center Visit Slot
                </button>
              </div>
            )}
          </div>
        )}




        {/* Contact Persons Tab */}
        {activeTab === "contact" && (
          <div>
            <h4 className="font-medium mb-4">Contact Persons</h4>
            {contactPersons.map((person, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-1">Name*</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={person.name}
                      onChange={(e) => handleContactChange(index, "name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Designation*</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={person.designation}
                      onChange={(e) => handleContactChange(index, "designation", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Gender*</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={person.gender}
                      onChange={(e) => handleContactChange(index, "gender", e.target.value)}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Email*</label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded"
                      value={person.contactEmail}
                      onChange={(e) => handleContactChange(index, "contactEmail", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Contact Number*</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={person.contactNumber}
                      onChange={(e) => handleContactChange(index, "contactNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...contactPersons];
                      updated.splice(index, 1);
                      setContactPersons(updated);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                  >
                    Remove Contact
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddContactPerson}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded"
            >
              + Add Contact Person
            </button>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === "tests" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Tests</h4>
            </div>


            {tests.map((test, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Test Name */}
                  <div>
                    <label className="block text-sm mb-1">Test Name*</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={test.test_name}
                      onChange={(e) => handleTestChange(index, "test_name", e.target.value)}
                      required
                    />
                    {test.suggestions?.length > 0 && test.test_name && (
                      <div className="mt-1 border rounded shadow-lg bg-white z-10 max-h-40 overflow-y-auto relative">
                        {test.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              handleTestChange(index, "test_name", suggestion);
                              handleTestChange(index, "suggestions", []); // Clear suggestions
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={test.description}
                      onChange={(e) => handleTestChange(index, "description", e.target.value)}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm mb-1">MRP*</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={test.price}
                      onChange={(e) => handleTestChange(index, "price", e.target.value)}
                      required
                    />
                  </div>

                  {/* Offer Price */}
                  {/* Report in 24 Hours Checkbox */}
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={test.reportIn24Hrs || false}
                      onChange={(e) => handleTestChange(index, "reportIn24Hrs", e.target.checked)}
                    />
                    <label className="text-sm">Report in 24 Hours</label>
                  </div>

                  {/* Custom Report Hour Field */}
                  <div>
                    <label className="block text-sm mb-1">Report Time (hrs)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={test.reportHour || ""}
                      onChange={(e) => handleTestChange(index, "reportHour", e.target.value)}
                      placeholder="Enter hours (e.g. 48)"
                      min="1"
                    />
                  </div>


                  {/* Instructions */}
                  <div>
                    <label className="block text-sm mb-1">Instructions</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={test.instruction || ""}
                      onChange={(e) => handleTestChange(index, "instruction", e.target.value)}
                      placeholder="Enter instructions"
                    />
                  </div>

                  {/* Precautions */}

                  {/* Fasting Required */}
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={test.fastingRequired || false}
                      onChange={(e) => handleTestChange(index, "fastingRequired", e.target.checked)}
                    />
                    <label className="text-sm">Fasting Required</label>
                  </div>

                  {/* Home Collection */}
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={test.homeCollection || false}
                      onChange={(e) => handleTestChange(index, "homeCollection", e.target.checked)}
                      id={`homeCollection-${index}`}
                    />
                    <label htmlFor={`homeCollection-${index}`} className="text-sm flex items-center gap-1 cursor-pointer">
                      <FaHome />
                      Home
                    </label>
                  </div>

                  {/* Test Image */}
                </div>

                {/* Remove Test Button */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...tests];
                      updated.splice(index, 1);
                      setTests(updated);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                  >
                    Remove Test
                  </button>
                )}
              </div>
            ))}

            {/* Add Test Button */}
            <button
              type="button"
              onClick={handleAddTest}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded"
            >
              + Add Test
            </button>
          </div>
        )}

        {activeTab === "packages" && (
          <div>
            <h4 className="font-medium mb-4">Packages</h4>

            {/* Bulk Upload Packages (CSV) */}

            {packages.map((pkg, pkgIndex) => (
              <div key={pkgIndex} className="mb-6 p-4 border rounded bg-white shadow-sm">
                {/* Package Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Package Name*</label>
                    <input
                      className="w-full p-2 border rounded"
                      value={pkg.packageName}
                      onChange={(e) => handlePackageChange(pkgIndex, "packageName", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">MRP (₹)*</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(pkgIndex, "price", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Total Tests Included</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full p-2 border rounded"
                      value={pkg.totalTestsIncluded || ""}
                      onChange={(e) => handlePackageChange(pkgIndex, "totalTestsIncluded", e.target.value)}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Package Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={pkg.description || ""}
                    onChange={(e) => handlePackageChange(pkgIndex, "description", e.target.value)}
                  />
                </div>

                {/* Instructions */}

                {/* Precautions (optional) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Instructions</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={2}
                    value={packages[pkgIndex].precautions || ""}
                    onChange={(e) => handlePackageChange(pkgIndex, "precautions", e.target.value)}
                  />
                </div>


                {/* Tests */}
                <h5 className="font-medium mb-3">Included Tests</h5>

                {pkg.tests.map((test, testIndex) => (
                  <div key={testIndex} className="mb-4 p-3 border rounded bg-gray-50">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Test Name*</label>
                      <input
                        className="w-full p-2 border rounded"
                        value={test.test_name}
                        onChange={(e) =>
                          handlePackageTestChange(pkgIndex, testIndex, "test_name", e.target.value)
                        }
                        required
                      />
                      {pkg.suggestions?.[testIndex]?.length > 0 && test.test_name && (
                        <div className="mt-1 border rounded shadow bg-white z-10 max-h-40 overflow-y-auto">
                          {pkg.suggestions[testIndex].map((suggestion, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                // 1. Update test_name
                                handlePackageTestChange(pkgIndex, testIndex, "test_name", suggestion);
                                // 2. Clear suggestions
                                handlePackageTestChange(pkgIndex, testIndex, "suggestions", []);
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sub Test Count */}
                    <div className="mb-3">
                      <label className="block font-medium mb-1">Sub Test Count</label>
                      <input
                        type="number"
                        min={0}
                        className="w-24 p-2 border rounded"
                        value={test.subTestCount || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...packages];
                          updated[pkgIndex].tests[testIndex].subTestCount = val;
                          setPackages(updated);
                        }}
                      />
                    </div>

                    {/* Sub Tests */}
                    <label className="block font-semibold mb-1">Included Sub Tests</label>
                    {(test.subTests || []).map((subTest, subTestIndex) => (
                      <div key={subTestIndex} className="flex gap-2 items-center mb-2">
                        <input
                          type="text"
                          className="p-2 border rounded flex-grow"
                          value={subTest}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[pkgIndex].tests[testIndex].subTests[subTestIndex] = e.target.value;
                            setPackages(updated);
                          }}
                          placeholder="Sub Test Name"
                        />
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                          onClick={() => {
                            const updated = [...packages];
                            updated[pkgIndex].tests[testIndex].subTests.splice(subTestIndex, 1);
                            setPackages(updated);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {/* Add Sub Test */}
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm mb-2"
                      onClick={() => {
                        const updated = [...packages];
                        if (!updated[pkgIndex].tests[testIndex].subTests) {
                          updated[pkgIndex].tests[testIndex].subTests = [];
                        }
                        updated[pkgIndex].tests[testIndex].subTests.push("");
                        setPackages(updated);
                      }}
                    >
                      + Add Sub Test
                    </button>

                    {/* Remove Test */}
                    {testIndex > 0 && (
                      <button
                        type="button"
                        className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                        onClick={() => {
                          const updated = [...packages];
                          updated[pkgIndex].tests.splice(testIndex, 1);
                          updated[pkgIndex].suggestions.splice(testIndex, 1);
                          setPackages(updated);
                        }}
                      >
                        Remove Test
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Test */}
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm mb-4"
                  onClick={() => handleAddTestToPackage(pkgIndex)}
                >
                  + Add Test to Package
                </button>

                {/* Remove Package */}
                {pkgIndex > 0 && (
                  <button
                    type="button"
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                    onClick={() => {
                      const updated = [...packages];
                      updated.splice(pkgIndex, 1);
                      setPackages(updated);
                    }}
                  >
                    Remove Package
                  </button>
                )}
              </div>
            ))}

            {/* Add New Package */}
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleAddPackage}
            >
              + Add Package
            </button>
          </div>
        )}


        {/* Scan & Xrays Tab */}
        {activeTab === 'scans' && (
          <div>
            <h4 className="font-semibold mb-2">Scan & Xrays</h4>
            {scans.map((scan, scanIdx) => (
              <div key={scanIdx} className="mb-6 border p-4 rounded">
                {/* Scan Details */}
                <div className="flex gap-4 mb-4 flex-wrap">
                  <div className="w-full sm:w-1/4">
                    <label className="block text-sm mb-1">Title</label>
                    <input
                      className="p-1 border rounded w-full"
                      placeholder="Title"
                      value={scan.title}
                      onChange={(e) =>
                        handleScanChange(scanIdx, "title", e.target.value)
                      }
                    />
                  </div>

                  <div className="w-full sm:w-1/4">
                    <label className="block text-sm mb-1">MRP</label>
                    <input
                      className="p-1 border rounded w-full"
                      placeholder="Price"
                      type="number"
                      value={scan.price}
                      onChange={(e) =>
                        handleScanChange(scanIdx, "price", e.target.value)
                      }
                    />
                  </div>

                  <div className="w-full sm:w-1/4">
                    <label className="block text-sm mb-1">Preparation</label>
                    <input
                      className="p-1 border rounded w-full"
                      placeholder="Preparation"
                      value={scan.preparation}
                      onChange={(e) =>
                        handleScanChange(scanIdx, "preparation", e.target.value)
                      }
                    />
                  </div>

                  <div className="w-full sm:w-1/4">
                    <label className="block text-sm mb-1">Report Time</label>
                    <input
                      className="p-1 border rounded w-full"
                      placeholder="Report Time"
                      value={scan.reportTime}
                      onChange={(e) =>
                        handleScanChange(scanIdx, "reportTime", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm mb-1">Upload Scan Image</label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-gray-50">
                    <FiUploadCloud className="text-gray-500" />
                    <span className="text-sm">Choose Image</span>
                    <input
                      type="file"
                      onChange={(e) => handleScanImageChange(scanIdx, e)}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                  {scan.image && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                      <FiCheckCircle className="text-green-500" />
                      <span>{scan.image.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Scan Button */}
            <button
              type="button"
              onClick={handleAddScan}
              className="px-3 py-1 bg-green-200 text-green-800 rounded"
            >
              + Add Scan/Xray
            </button>
          </div>
        )}


        {/* Form Submit */}
        <div className="flex justify-between mt-6">
          <div>
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) - 1].id)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {activeTab !== 'scans' ? (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) + 1].id)}
                className="px-4 py-2 bg-blue-200 text-blue-700 rounded"
              >
                Next
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/diagnosticlist")}
                  className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-blue-700 bg-blue-100 border border-blue-600 rounded"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default DiagnostiCreate;