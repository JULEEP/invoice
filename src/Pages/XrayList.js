import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaTrash, FaEdit, FaSearch, FaTimes } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const XRayList = () => {
  const [xrays, setXrays] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editingXray, setEditingXray] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    preparation: "",
    reportTime: "",
    image: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchXrays();
  }, []);

  const fetchXrays = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.credenthealth.com/api/admin/getallxrays");
      if (res.data) {
        // Show all records including empty ones
        setXrays(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch X-Rays:", error);
      setError("Failed to fetch X-Rays. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this X-Ray record?")) {
      return;
    }
    
    try {
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/deletexray/${id}`);
      if (res.status === 200) {
        setXrays(xrays.filter((xray) => xray._id !== id));
        setSuccessMessage("X-Ray deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete X-Ray:", error);
      setError("Failed to delete X-Ray.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditClick = (xray) => {
    setEditingXray(xray);
    setEditForm({
      title: xray.title || "",
      price: xray.price || "",
      preparation: xray.preparation || "",
      reportTime: xray.reportTime || "",
      image: null
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleImageChange = (e) => {
    setEditForm({ ...editForm, image: e.target.files[0] });
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("price", editForm.price);
      formData.append("preparation", editForm.preparation);
      formData.append("reportTime", editForm.reportTime);
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updatexray/${editingXray._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        setSuccessMessage("X-Ray updated successfully.");
        setEditingXray(null);
        fetchXrays();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update X-Ray:", error);
      setError("Failed to update X-Ray.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredXrays = xrays.filter((xray) => {
    if (!xray) return false;
    
    const searchLower = search.toLowerCase();
    return (
      (xray.title && xray.title.toLowerCase().includes(searchLower)) ||
      (xray.preparation && xray.preparation.toLowerCase().includes(searchLower)) ||
      (xray.reportTime && xray.reportTime.toLowerCase().includes(searchLower)) ||
      (xray.price && xray.price.toString().includes(search)) ||
      search === "" // Show all if search is empty
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredXrays.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredXrays.length / itemsPerPage);

  const exportToExcel = () => {
    // Format data for export, handling null values
    const formatted = xrays.map(({ _id, __v, createdAt, updatedAt, image, ...rest }) => {
      const formattedItem = {};
      for (const key in rest) {
        formattedItem[key] = rest[key] === null || rest[key] === undefined ? "N/A" : rest[key];
      }
      return formattedItem;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "X-Rays");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "xrays.xlsx");
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    return `₹${price}`;
  };

  const formatText = (text) => {
    if (!text) return "-";
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading X-Rays...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Scans & X-Rays</h2>
        <span className="text-sm text-gray-500">
          {filteredXrays.length} record(s) found
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
            placeholder="Search by title, preparation, report time or price..."
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
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Preparation</th>
              <th className="p-2 border">Report Time</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((xray) => (
                <tr key={xray._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{xray.title || "-"}</td>
                  <td className="p-2 border">{formatPrice(xray.price)}</td>
                  <td className="p-2 border" title={xray.preparation}>
                    {formatText(xray.preparation)}
                  </td>
                  <td className="p-2 border">{xray.reportTime || "-"}</td>
                  <td className="p-2 border">
                    {xray.image ? (
                      <img 
                        src={`https://api.credenthealth.com${xray.image}`} 
                        alt={xray.title || "X-Ray"} 
                        className="h-10 w-10 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditClick(xray)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(xray._id)}
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
                <td colSpan="6" className="text-center p-4">
                  {search ? "No matching X-Rays found" : "No X-Rays available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredXrays.length > 0 && (
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
              Page {currentPage} of {totalPages} ({filteredXrays.length} items)
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
      {editingXray && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit X-Ray/Scan</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Report Time</label>
                <input
                  type="text"
                  name="reportTime"
                  value={editForm.reportTime}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="e.g., 1 hour, 2 days"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Preparation Instructions</label>
                <textarea
                  name="preparation"
                  value={editForm.preparation}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  rows="4"
                  placeholder="Enter preparation instructions"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border p-2 rounded"
                />
                {editingXray.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current Image:</p>
                    <img 
                      src={`https://api.credenthealth.com${editingXray.image}`} 
                      alt={editingXray.title || "X-Ray"} 
                      className="h-20 object-contain mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button 
                onClick={() => setEditingXray(null)} 
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

export default XRayList;