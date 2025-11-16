import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaTrash, FaEdit } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const EditTestModal = ({ test, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: test.name || "",
    price: test.price || "",
    description: test.description || "",
    category: test.category || "",
    fastingRequired: test.fastingRequired || false,
    homeCollectionAvailable: test.homeCollectionAvailable || false,
    reportIn24Hrs: test.reportIn24Hrs || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name.trim()) {
      return Swal.fire("Error", "Name is required", "error");
    }
    if (!formData.price || isNaN(formData.price)) {
      return Swal.fire("Error", "Valid price is required", "error");
    }
    if (!formData.description.trim()) {
      return Swal.fire("Error", "Description is required", "error");
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <h3 className="text-xl font-semibold mb-4">Edit Test</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">MRP (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Optional"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="fastingRequired"
                checked={formData.fastingRequired}
                onChange={handleChange}
              />
              Fasting Required
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="homeCollectionAvailable"
                checked={formData.homeCollectionAvailable}
                onChange={handleChange}
              />
              Home Collection Available
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="reportIn24Hrs"
                checked={formData.reportIn24Hrs}
                onChange={handleChange}
              />
              Report In 24 Hrs
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Close modal"
          disabled={loading}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const GetTestsByDiagnostic = () => {
  const diagnosticId = localStorage.getItem("diagnosticId");
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 5;
  const [loading, setLoading] = useState(false);

  // New state for edit modal
  const [editTest, setEditTest] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (diagnosticId) fetchTests();
  }, [diagnosticId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.credenthealth.com/api/admin/getdiagnostic/${diagnosticId}`
      );
      if (res.data?.tests) {
        setTests(res.data.tests);
      }
    } catch (error) {
      console.error("Failed to fetch diagnostic tests:", error);
      Swal.fire("Error", "Failed to fetch tests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `https://api.credenthealth.com/api/admin/deletetests/${diagnosticId}/${id}`
        );
        setTests(tests.filter((t) => t._id !== id));
        Swal.fire("Deleted!", "Test has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting test:", error);
        Swal.fire("Error", "Failed to delete test", "error");
      }
    }
  };

  const openEditModal = (test) => {
    setEditTest(test);
  };

  const closeEditModal = () => {
    setEditTest(null);
  };

  const handleSaveEdit = async (updatedData) => {
    if (!editTest) return;

    try {
      setEditLoading(true);
      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updatetestsdiagnostic/${diagnosticId}/${editTest._id}`,
        updatedData
      );
      setTests((prevTests) =>
        prevTests.map((t) => (t._id === editTest._id ? res.data.test : t))
      );
      Swal.fire("Success", "Test updated successfully", "success");
      closeEditModal();
    } catch (error) {
      console.error("Error updating test:", error);
      Swal.fire("Error", "Failed to update test", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const filteredTests = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const exportToExcel = () => {
    const formatted = tests.map(({ _id, __v, ...rest }) => ({
      ...rest,
      createdAt: rest.createdAt ? new Date(rest.createdAt).toLocaleString() : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diagnostic Tests");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "diagnostic_tests.xlsx");
  };

  return (
    <div className="p-6 bg-white rounded shadow w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lab Tests</h2>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm flex-grow max-w-md"
          placeholder="Search tests..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-1"
        >
          <FaFileExcel /> Excel
        </button>
      </div>

      {loading && <p className="text-center mb-4">Loading...</p>}

      {editTest && (
        <EditTestModal
          test={editTest}
          onClose={closeEditModal}
          onSave={handleSaveEdit}
          loading={editLoading}
        />
      )}

      <div className="overflow-auto border rounded">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2 border w-8">SI. No</th>
              <th className="p-2 border w-48">Name</th>
              <th className="p-2 border w-20">MRP</th>
              <th className="p-2 border w-24">Category</th>
              <th className="p-2 border w-16">Fasting</th>
              <th className="p-2 border w-16">Home</th>
              <th className="p-2 border w-16">24Hrs</th>
              <th className="p-2 border w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTests.length > 0 ? (
              currentTests.map((test, index) => (
                <tr key={test._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{indexOfFirstTest + index + 1}</td>
                  <td className="p-2 border">
                    <div className="font-medium">{test.name}</div>
                    <div className="text-xs text-gray-500 truncate">{test.description}</div>
                  </td>
                  <td className="p-2 border">₹{test.price}</td>
                  <td className="p-2 border">{test.category || "-"}</td>
                  <td className="p-2 border text-center">
                    {test.fastingRequired ? "Yes" : "No"}
                  </td>
                  <td className="p-2 border text-center">
                    {test.homeCollectionAvailable ? "Yes" : "No"}
                  </td>
                  <td className="p-2 border text-center">
                    {test.reportIn24Hrs ? "Yes" : "No"}
                  </td>
                  <td className="p-2 border">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(test)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit Test"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(test._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Test"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No tests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>
          Showing {indexOfFirstTest + 1} to{" "}
          {Math.min(indexOfLastTest, filteredTests.length)} of {filteredTests.length} tests
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="px-3 py-1 bg-gray-100 rounded">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetTestsByDiagnostic;