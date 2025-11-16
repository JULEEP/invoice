import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CreatePackagePage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [totalTestsIncluded, setTotalTestsIncluded] = useState("");
  const [description, setDescription] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [selectedDiagnostics, setSelectedDiagnostics] = useState([]);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [includedTests, setIncludedTests] = useState([
    { name: "", subTestCount: 0, subTests: [""] },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fetch diagnostics list from API
  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setLoadingDiagnostics(true);
        const response = await axios.get("https://api.credenthealth.com/api/admin/alldiagnostics");
        
        if (response.data && response.data.data) {
          setDiagnosticsList(response.data.data);
        } else {
          setDiagnosticsList([]);
        }
      } catch (error) {
        console.error("Error fetching diagnostics:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load diagnostics list",
        });
        setDiagnosticsList([]);
      } finally {
        setLoadingDiagnostics(false);
      }
    };

    fetchDiagnostics();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle diagnostic checkbox change
  const handleDiagnosticChange = (diagnosticId) => {
    setSelectedDiagnostics(prev => {
      if (prev.includes(diagnosticId)) {
        return prev.filter(id => id !== diagnosticId);
      } else {
        return [...prev, diagnosticId];
      }
    });
  };

  // Select all diagnostics
  const handleSelectAll = () => {
    if (selectedDiagnostics.length === diagnosticsList.length) {
      setSelectedDiagnostics([]);
    } else {
      const allIds = diagnosticsList.map(diagnostic => diagnostic._id);
      setSelectedDiagnostics(allIds);
    }
  };

  // Remove selected diagnostic
  const handleRemoveDiagnostic = (diagnosticId) => {
    setSelectedDiagnostics(prev => prev.filter(id => id !== diagnosticId));
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedDiagnostics([]);
  };

  const handleAddTest = () => {
    setIncludedTests([...includedTests, { name: "", subTestCount: 0, subTests: [""] }]);
  };

  const handleRemoveTest = (index) => {
    const updated = includedTests.filter((_, i) => i !== index);
    setIncludedTests(updated);
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...includedTests];
    updated[index][field] = field === "subTestCount" ? Number(value) : value;
    setIncludedTests(updated);
  };

  const handleSubTestChange = (testIndex, subTestIndex, value) => {
    const updated = [...includedTests];
    updated[testIndex].subTests[subTestIndex] = value;
    setIncludedTests(updated);
  };

  const handleAddSubTest = (testIndex) => {
    const updated = [...includedTests];
    updated[testIndex].subTests.push("");
    setIncludedTests(updated);
  };

  // NEW FUNCTION: Remove sub test
  const handleRemoveSubTest = (testIndex, subTestIndex) => {
    const updated = [...includedTests];
    // Remove the specific sub test
    updated[testIndex].subTests = updated[testIndex].subTests.filter((_, index) => index !== subTestIndex);
    setIncludedTests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !precautions || selectedDiagnostics.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields and select at least one diagnostic",
      });
      return;
    }

    const payload = {
      name,
      price: Number(price),
      totalTestsIncluded: Number(totalTestsIncluded),
      description,
      precautions,
      includedTests,
      diagnosticIds: selectedDiagnostics,
    };

    try {
      setLoading(true);
      await axios.post("https://api.credenthealth.com/api/admin/create-packages", payload);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Package created successfully and linked to selected diagnostics!",
      });

      navigate("/package-list");
    } catch (error) {
      console.error("Error creating package:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to create package.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get selected diagnostic names
  const getSelectedDiagnosticNames = () => {
    return selectedDiagnostics.map(id => {
      const diagnostic = diagnosticsList.find(d => d._id === id);
      return diagnostic ? diagnostic.name : "";
    });
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h3 className="text-lg font-bold mb-4">Create a New Package</h3>
      <form onSubmit={handleSubmit}>
        {/* Row 1: Name & Price */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Package Name</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">MRP (₹)</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 2: Total Tests Included */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Total Tests Included</label>
          <input
            type="number"
            className="p-2 border rounded w-full"
            value={totalTestsIncluded}
            onChange={(e) => setTotalTestsIncluded(e.target.value)}
            required
          />
        </div>

        {/* Row 3: Description & Precautions */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Package Description</label>
            <textarea
              className="p-2 border rounded w-full h-[86px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">Instructions's</label>
            <textarea
              className="p-2 border rounded w-full h-[86px]"
              value={precautions}
              onChange={(e) => setPrecautions(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Diagnostics Selection with Dropdown Checkboxes */}
        <div className="mb-4" ref={dropdownRef}>
          <label className="block text-sm font-medium mb-2">
            Select Diagnostics {selectedDiagnostics.length > 0 && `(${selectedDiagnostics.length} selected)`}
          </label>

          {/* Selected Items Display */}
          {selectedDiagnostics.length > 0 && (
            <div className="mb-2 p-2 border rounded bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {getSelectedDiagnosticNames().map((name, index) => (
                  <span
                    key={selectedDiagnostics[index]}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => handleRemoveDiagnostic(selectedDiagnostics[index])}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {selectedDiagnostics.length} diagnostic(s) selected
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-red-500 text-xs hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full p-2 border rounded bg-white text-left flex justify-between items-center"
            >
              <span>
                {selectedDiagnostics.length === 0 
                  ? "Choose Diagnostics" 
                  : `${selectedDiagnostics.length} diagnostic(s) selected`
                }
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                {loadingDiagnostics ? (
                  <div className="p-3 text-center text-gray-500">
                    Loading diagnostics...
                  </div>
                ) : diagnosticsList.length > 0 ? (
                  <>
                    {/* Select All Option */}
                    <div className="p-2 border-b bg-gray-50">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedDiagnostics.length === diagnosticsList.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium">
                          {selectedDiagnostics.length === diagnosticsList.length 
                            ? "Deselect All" 
                            : "Select All"
                          }
                        </span>
                      </label>
                    </div>

                    {/* Diagnostics List */}
                    <div className="p-2">
                      {diagnosticsList.map((diagnostic) => (
                        <label
                          key={diagnostic._id}
                          className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDiagnostics.includes(diagnostic._id)}
                            onChange={() => handleDiagnosticChange(diagnostic._id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {diagnostic.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No diagnostics available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Included Tests Section */}
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2">Included Sub Tests</h4>
          {includedTests.map((test, i) => (
            <div key={i} className="mb-4 border p-4 rounded bg-gray-50">
              <div className="flex gap-4 mb-2">
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Test Name</label>
                  <input
                    type="text"
                    className="p-2 border rounded w-full"
                    value={test.name}
                    onChange={(e) => handleTestChange(i, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Sub Test Count</label>
                  <input
                    type="number"
                    className="p-2 border rounded w-full"
                    value={test.subTestCount}
                    onChange={(e) => handleTestChange(i, "subTestCount", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Include Sub Tests</label>
                {test.subTests.map((sub, j) => (
                  <div key={j} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="p-2 border rounded w-full"
                      value={sub}
                      onChange={(e) => handleSubTestChange(i, j, e.target.value)}
                      required
                    />
                    {/* Remove Sub Test Button - Only show if there's more than one sub test */}
                    {test.subTests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubTest(i, j)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove this sub test"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSubTest(i)}
                  className="text-blue-500 text-sm hover:underline mt-1"
                >
                  + Add Sub Test
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => handleRemoveTest(i)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove Test
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddTest}
            className="text-green-600 text-sm hover:underline"
          >
            + Add Another Test
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Package"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePackagePage;