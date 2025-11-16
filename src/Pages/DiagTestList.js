import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaTrash, FaEdit, FaSearch, FaTimes } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const DaigTestList = () => {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 5;

  const [editingTest, setEditingTest] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    subTests: "",
    instruction: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.credenthealth.com/api/admin/alltests");
      if (res.data?.tests) {
        // Show all records including empty ones
        setTests(res.data.tests || []);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
      setError("Failed to fetch tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    try {
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/deletetest/${id}`);
      if (res.status === 200) {
        setTests(tests.filter((test) => test._id !== id));
        setSuccessMessage("Test deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete test:", error);
      setError("Failed to delete test.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditClick = (test) => {
    setEditingTest(test);
    setEditForm({
      name: test.name || "",
      category: test.category || "",
      price: test.price || "",
      description: test.description || "",
      subTests: Array.isArray(test.subTests) ? test.subTests.join(", ") : "",
      instruction: test.instruction || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        name: editForm.name,
        category: editForm.category,
        price: editForm.price,
        description: editForm.description,
        subTests: editForm.subTests.split(",").map((s) => s.trim()).filter((s) => s),
        instruction: editForm.instruction,
      };

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updatetest/${editingTest._id}`,
        payload
      );

      if (res.status === 200) {
        setSuccessMessage("Test updated successfully.");
        setEditingTest(null);
        fetchTests();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update test:", error);
      setError("Failed to update test.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredTests = tests.filter((test) => {
    if (!test) return false;
    
    const searchLower = search.toLowerCase();
    return (
      (test.name && test.name.toLowerCase().includes(searchLower)) ||
      (test.category && test.category.toLowerCase().includes(searchLower)) ||
      (test.description && test.description.toLowerCase().includes(searchLower)) ||
      (test.instruction && test.instruction.toLowerCase().includes(searchLower)) ||
      (test.price && test.price.toString().includes(search)) ||
      search === "" // Show all if search is empty
    );
  });

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const exportToExcel = () => {
    const formatted = tests.map(({ _id, __v, createdAt, ...rest }) => ({
      ...rest,
      subTests: Array.isArray(rest.subTests) ? rest.subTests.join(", ") : "",
      fastingRequired: rest.fastingRequired ? "Yes" : "No",
      homeCollectionAvailable: rest.homeCollectionAvailable ? "Yes" : "No",
      reportIn24Hrs: rest.reportIn24Hrs ? "Yes" : "No"
    }));
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tests");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "tests.xlsx");
  };

  const formatSubTests = (subTests) => {
    if (!Array.isArray(subTests) || subTests.length === 0) return "-";
    return subTests.join(", ");
  };

  const formatText = (text) => {
    if (!text) return "-";
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading tests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Diagnostic Tests</h2>
        <span className="text-sm text-gray-500">
          {filteredTests.length} record(s) found
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
            placeholder="Search by name, category, description, instruction or price..."
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
              <th className="p-2 border">Category</th>
              <th className="p-2 border">MRP</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Sub Tests</th>
              <th className="p-2 border">Instructions</th>
              <th className="p-2 border">Fasting</th>
              <th className="p-2 border">Home Collection</th>
              <th className="p-2 border">24hr Report</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTests.length > 0 ? (
              currentTests.map((test) => (
                <tr key={test._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{test.name || "-"}</td>
                  <td className="p-2 border">{test.category || "-"}</td>
                  <td className="p-2 border">₹{test.price || "0"}</td>
                  <td className="p-2 border" title={test.description}>
                    {formatText(test.description)}
                  </td>
                  <td className="p-2 border" title={formatSubTests(test.subTests)}>
                    {formatText(formatSubTests(test.subTests))}
                  </td>
                  <td className="p-2 border" title={test.instruction}>
                    {formatText(test.instruction)}
                  </td>
                  <td className="p-2 border">
                    {test.fastingRequired ? "Yes" : "No"}
                  </td>
                  <td className="p-2 border">
                    {test.homeCollectionAvailable ? "Yes" : "No"}
                  </td>
                  <td className="p-2 border">
                    {test.reportIn24Hrs ? "Yes" : "No"}
                  </td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditClick(test)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(test._id)}
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
                <td colSpan="10" className="text-center p-4">
                  {search ? "No matching tests found" : "No tests available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTests.length > 0 && (
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
              Page {currentPage} of {totalPages} ({filteredTests.length} items)
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
      {editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Test</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Test Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MRP (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter price"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Sub Tests (comma separated)</label>
                <textarea
                  name="subTests"
                  value={editForm.subTests}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  rows="2"
                  placeholder="Enter sub tests separated by commas"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea
                  name="instruction"
                  value={editForm.instruction}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  rows="3"
                  placeholder="Enter instructions"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button 
                onClick={() => setEditingTest(null)} 
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit} 
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaigTestList;