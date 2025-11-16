import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaTrash, FaEdit, FaSearch, FaTimes, FaPlus, FaMinus, FaChevronDown } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 5;

  const [editingPackage, setEditingPackage] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    totalTestsIncluded: "",
    description: "",
    precautions: "",
    includedTests: [],
    diagnostics: []
  });

  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPackages();
    fetchDiagnostics();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.credenthealth.com/api/admin/getallpackages");
      if (res.data?.packages) {
        setPackages(res.data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      setError("Failed to fetch packages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch diagnostics list from API
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) {
      return;
    }
    
    try {
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/deletepackage/${id}`);
      if (res.status === 200) {
        setPackages(packages.filter((pkg) => pkg._id !== id));
        setSuccessMessage("Package deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
      setError("Failed to delete package.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditClick = (pkg) => {
    setEditingPackage(pkg);
    setEditForm({
      name: pkg.name || "",
      price: pkg.price || "",
      totalTestsIncluded: pkg.totalTestsIncluded || "",
      description: pkg.description || "",
      precautions: pkg.precautions || "",
      includedTests: Array.isArray(pkg.includedTests) && pkg.includedTests.length > 0
        ? pkg.includedTests.map(test => ({
            name: test?.name || "",
            subTests: Array.isArray(test?.subTests) ? test.subTests.join(", ") : ""
          }))
        : [{ name: "", subTests: "" }],
      diagnostics: Array.isArray(pkg.diagnostics) 
        ? pkg.diagnostics.filter(d => d && d._id).map(d => d._id)
        : []
    });
    setDropdownOpen(false);
  };

  const handleEditChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    if (name === "includedTests" && index !== null) {
      const newIncludedTests = [...editForm.includedTests];
      if (field === 'name') {
        newIncludedTests[index].name = value;
      } else if (field === 'subTests') {
        newIncludedTests[index].subTests = value;
      }
      setEditForm({ ...editForm, includedTests: newIncludedTests });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  // Handle individual diagnostic selection
  const handleDiagnosticChange = (diagnosticId) => {
    const currentDiagnostics = [...editForm.diagnostics];
    
    if (currentDiagnostics.includes(diagnosticId)) {
      // Remove if already selected
      setEditForm({
        ...editForm,
        diagnostics: currentDiagnostics.filter(id => id !== diagnosticId)
      });
    } else {
      // Add if not selected
      setEditForm({
        ...editForm,
        diagnostics: [...currentDiagnostics, diagnosticId]
      });
    }
  };

  // Handle select all diagnostics
  const handleSelectAll = () => {
    if (editForm.diagnostics.length === diagnosticsList.length) {
      // Deselect all
      setEditForm({ ...editForm, diagnostics: [] });
    } else {
      // Select all
      const allDiagnosticIds = diagnosticsList.map(d => d._id);
      setEditForm({ ...editForm, diagnostics: allDiagnosticIds });
    }
  };

  const addTestField = () => {
    setEditForm({
      ...editForm,
      includedTests: [...editForm.includedTests, { name: "", subTests: "" }]
    });
  };

  const removeTestField = (index) => {
    if (editForm.includedTests.length > 1) {
      const newIncludedTests = editForm.includedTests.filter((_, i) => i !== index);
      setEditForm({ ...editForm, includedTests: newIncludedTests });
    }
  };

  const handleEditSubmit = async () => {
    try {
      // Validate required fields

      const formattedTests = editForm.includedTests
        .filter(test => test.name.trim() !== "")
        .map(test => ({
          name: test.name.trim(),
          subTests: test.subTests.split(",").map(s => s.trim()).filter(s => s)
        }));

      const payload = {
        name: editForm.name.trim(),
        price: parseFloat(editForm.price),
        totalTestsIncluded: parseInt(editForm.totalTestsIncluded) || formattedTests.length,
        description: editForm.description.trim(),
        precautions: editForm.precautions.trim(),
        includedTests: formattedTests,
        diagnostics: editForm.diagnostics
      };

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updatepackage/${editingPackage._id}`,
        payload
      );

      if (res.status === 200) {
        setSuccessMessage("Package updated successfully.");
        setEditingPackage(null);
        fetchPackages();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update package:", error);
      setError("Failed to update package.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Format assigned diagnostics names
  const formatAssignedDiagnostics = (diagnostics) => {
    if (!Array.isArray(diagnostics) || diagnostics.length === 0) {
      return "-";
    }
    
    const diagnosticNames = diagnostics
      .filter(diagnostic => diagnostic && diagnostic.name)
      .map(diagnostic => diagnostic.name);
    
    if (diagnosticNames.length === 0) return "-";
    
    return diagnosticNames.join(", ");
  };

  // Get diagnostic name by ID
  const getDiagnosticNameById = (id) => {
    const diagnostic = diagnosticsList.find(d => d._id === id);
    return diagnostic ? diagnostic.name : "Unknown Diagnostic";
  };

  const filteredPackages = packages.filter((pkg) => {
    if (!pkg) return false;
    
    const searchLower = search.toLowerCase();
    return (
      (pkg.name && pkg.name.toLowerCase().includes(searchLower)) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchLower)) ||
      (pkg.precautions && pkg.precautions.toLowerCase().includes(searchLower)) ||
      (pkg.price && pkg.price.toString().includes(search)) ||
      (pkg.diagnostics && pkg.diagnostics.some(d => 
        d && d.name && d.name.toLowerCase().includes(searchLower)
      )) ||
      search === ""
    );
  });

  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = filteredPackages.slice(indexOfFirstPackage, indexOfLastPackage);
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);

  const exportToExcel = () => {
    const formatted = packages.map(({ _id, __v, createdAt, doctorInfo, ...rest }) => ({
      ...rest,
      includedTests: rest.includedTests?.map(t => `${t.name || "-"}: ${t.subTests?.join(", ") || "-"}`).join(" | ") || "",
      diagnostics: formatAssignedDiagnostics(rest.diagnostics)
    }));
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packages");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "packages.xlsx");
  };

  const formatIncludedTests = (includedTests) => {
    if (!Array.isArray(includedTests) || includedTests.length === 0) return "-";
    return includedTests
      .map((test) => {
        const testName = test?.name || "-";
        const subTests = Array.isArray(test?.subTests) && test.subTests.length > 0
          ? test.subTests.filter(s => s).join(" , ")
          : "-";
        return `${testName}: ${subTests}`;
      })
      .join(" | ");
  };

  const formatText = (text) => {
    if (!text) return "-";
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading packages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Packages</h2>
        <span className="text-sm text-gray-500">
          {filteredPackages.length} record(s) found
        </span>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="mb-4 flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            className="pl-10 pr-4 py-2 border rounded text-sm w-full"
            placeholder="Search by name, description, precautions, price or diagnostic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-1"
        >
          <FaFileExcel /> Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">MRP</th>
              <th className="p-2 border">Total Tests</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Instructions</th>
              <th className="p-2 border">Included Tests</th>
              <th className="p-2 border">Assigned Diagnostics</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPackages.length > 0 ? (
              currentPackages.map((pkg) => (
                <tr key={pkg._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{pkg.name || "-"}</td>
                  <td className="p-2 border">₹{pkg.price ?? 0}</td>
                  <td className="p-2 border">{pkg.totalTestsIncluded ?? 0}</td>
                  <td className="p-2 border" title={pkg.description}>
                    {formatText(pkg.description)}
                  </td>
                  <td className="p-2 border" title={pkg.precautions}>
                    {formatText(pkg.precautions)}
                  </td>
                  <td className="p-2 border">{formatIncludedTests(pkg.includedTests)}</td>
                  <td className="p-2 border" title={formatAssignedDiagnostics(pkg.diagnostics)}>
                    {formatText(formatAssignedDiagnostics(pkg.diagnostics))}
                  </td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  {search ? "No matching packages found" : "No packages available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="flex items-center justify-center">
            <span className="text-sm">
              Page {currentPage} of {totalPages} ({filteredPackages.length} items)
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Edit Package</h3>
              <button
                onClick={() => setEditingPackage(null)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Package Details Form */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter package name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tests Included
                  </label>
                  <input
                    type="number"
                    name="totalTestsIncluded"
                    value={editForm.totalTestsIncluded}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total tests"
                    min="0"
                  />
                </div>
              </div>

              {/* Diagnostics Selection */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">Assign Diagnostics Centers</h4>
                  <span className="text-xs text-gray-500">
                    {editForm.diagnostics.length} selected
                  </span>
                </div>
                
                {loadingDiagnostics ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Loading diagnostics...</div>
                  </div>
                ) : diagnosticsList.length > 0 ? (
                  <div>
                    {/* Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <span className="text-gray-700">
                          {editForm.diagnostics.length === 0 
                            ? "Choose Diagnostics" 
                            : `${editForm.diagnostics.length} diagnostic(s) selected`
                          }
                        </span>
                        <FaChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {/* Select All Option */}
                          <div className="p-3 border-b bg-gray-50">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.diagnostics.length === diagnosticsList.length}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700">
                                {editForm.diagnostics.length === diagnosticsList.length 
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
                                className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={editForm.diagnostics.includes(diagnostic._id)}
                                  onChange={() => handleDiagnosticChange(diagnostic._id)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                  {diagnostic.name || "Unnamed Diagnostic"}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Diagnostics Preview */}
                    {editForm.diagnostics.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 text-sm mb-2">Selected Diagnostics:</h5>
                        <div className="flex flex-wrap gap-2">
                          {editForm.diagnostics.map(diagnosticId => (
                            <span 
                              key={diagnosticId} 
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1"
                            >
                              {getDiagnosticNameById(diagnosticId)}
                              <button
                                type="button"
                                onClick={() => handleDiagnosticChange(diagnosticId)}
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No diagnostics centers available
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe the package details, benefits, and features..."
                />
              </div>

              {/* Precautions/Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions & Precautions
                </label>
                <textarea
                  name="precautions"
                  value={editForm.precautions}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter any instructions, precautions, or preparation guidelines..."
                />
              </div>

              {/* Included Tests Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-800">Included Tests</h4>
                  <button
                    type="button"
                    onClick={addTestField}
                    className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    <FaPlus /> Add Test
                  </button>
                </div>
                
                <div className="space-y-4">
                  {editForm.includedTests.map((test, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="md:col-span-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Test Name {index === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => handleEditChange(e, index, 'name')}
                          placeholder="Enter test name"
                          name="includedTests"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Sub Tests
                        </label>
                        <input
                          type="text"
                          value={test.subTests}
                          onChange={(e) => handleEditChange(e, index, 'subTests')}
                          placeholder="Enter sub-tests (comma separated)"
                          name="includedTests"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center pt-5">
                        {editForm.includedTests.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTestField(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove test"
                          >
                            <FaMinus />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  <p>💡 Tip: Leave test name empty to remove it. Use commas to separate multiple sub-tests.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <button 
                onClick={() => setEditingPackage(null)} 
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit /> Update Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageList;