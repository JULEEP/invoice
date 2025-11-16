import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaTrash, FaEdit } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const XrayListForDiagnostic = () => {
  const [xrays, setXrays] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const xraysPerPage = 5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingXray, setEditingXray] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    preparation: "",
    reportTime: "",
    imageFile: null,
  });

  useEffect(() => {
    fetchXrays();
  }, []);

  const fetchXrays = async () => {
    const diagnosticId = localStorage.getItem("diagnosticId");
    if (!diagnosticId) {
      setError("Diagnostic ID not found in local storage.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.credenthealth.com/api/admin/getxraysdiagnostic/${diagnosticId}`
      );
      if (res.data?.scans) {
        setXrays(res.data.scans);
      } else {
        setXrays([]);
      }
    } catch (err) {
      console.error("Failed to fetch X-rays:", err);
      setError("Failed to fetch X-rays. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (xrayId) => {
    const diagnosticId = localStorage.getItem("diagnosticId");
    if (!diagnosticId) {
      alert("Diagnostic ID missing!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this X-ray?")) return;

    try {
      await axios.delete(
        `https://api.credenthealth.com/api/admin/delete-diagxray/${diagnosticId}/${xrayId}`
      );
      alert("X-ray deleted successfully.");
      // Refresh list
      fetchXrays();
    } catch (err) {
      console.error("Failed to delete X-ray:", err);
      alert("Failed to delete X-ray. Please try again.");
    }
  };

  const handleEditClick = (xray) => {
    setEditingXray(xray);
    setEditForm({
      title: xray.title || "",
      price: xray.price || "",
      preparation: xray.preparation || "",
      reportTime: xray.reportTime || "",
      imageFile: null, // reset image file input
    });
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setEditForm((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async () => {
    const diagnosticId = localStorage.getItem("diagnosticId");
    if (!diagnosticId) {
      alert("Diagnostic ID missing!");
      return;
    }

    if (!editingXray) {
      alert("No X-ray selected for editing");
      return;
    }

    if (!editForm.title || !editForm.price) {
      alert("Title and MRP are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("price", editForm.price);
      formData.append("preparation", editForm.preparation);
      formData.append("reportTime", editForm.reportTime);
      if (editForm.imageFile) {
        formData.append("image", editForm.imageFile);
      }

      await axios.put(
        `https://api.credenthealth.com/api/admin/update-diagxray/${diagnosticId}/${editingXray._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("X-ray updated successfully.");
      setEditingXray(null);
      fetchXrays();
    } catch (err) {
      console.error("Failed to update X-ray:", err);
      alert("Failed to update X-ray. Please try again.");
    }
  };

  const filteredXrays = xrays.filter((x) => {
    if (!x || !x.title) return false;
    return x.title.toLowerCase().includes(search.toLowerCase());
  });

  const indexOfLastXray = currentPage * xraysPerPage;
  const indexOfFirstXray = indexOfLastXray - xraysPerPage;
  const currentXrays = filteredXrays.slice(indexOfFirstXray, indexOfLastXray);
  const totalPages = Math.ceil(filteredXrays.length / xraysPerPage);

  const exportToExcel = () => {
    const formatted = xrays.map(({ _id, __v, createdAt, ...rest }) => ({
      ...rest,
      preparation: rest.preparation || "",
      reportTime: rest.reportTime || "",
      image: rest.image || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "X-rays");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "xrays.xlsx");
  };

  if (loading) {
    return <div className="p-4 text-center">Loading X-rays...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">X-rays for Diagnostic</h2>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by X-ray title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-1"
        >
          <FaFileExcel /> Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">MRP (₹)</th>
              <th className="p-2 border">Preparation</th>
              <th className="p-2 border">Report Time</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentXrays.length > 0 ? (
              currentXrays.map((xray, index) => (
                <tr key={xray._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">{indexOfFirstXray + index + 1}</td>
                  <td className="p-2 border">{xray.title || "-"}</td>
                  <td className="p-2 border">₹{xray.price || "0"}</td>
                  <td className="p-2 border">{xray.preparation || "-"}</td>
                  <td className="p-2 border">{xray.reportTime || "-"}</td>
                  <td className="p-2 border">
                    {xray.image ? (
                      <img
                        src={`https://api.credenthealth.com${xray.image}`}
                        alt={xray.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditClick(xray)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit X-ray"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(xray._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete X-ray"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No X-rays found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredXrays.length > 0 && (
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="flex items-center justify-center">
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingXray && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow w-[600px] max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Edit X-ray</h3>
            <div className="grid gap-2">
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                placeholder="X-ray Title"
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="MRP"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="MRP"
                className="border p-2 rounded"
              />
              <textarea
                name="preparation"
                value={editForm.preparation}
                onChange={handleEditChange}
                placeholder="Preparation"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="reportTime"
                value={editForm.reportTime}
                onChange={handleEditChange}
                placeholder="Report Time"
                className="border p-2 rounded"
              />
              <input
                type="file"
                name="imageFile"
                onChange={handleEditChange}
                accept="image/*"
                className="border p-2 rounded"
              />
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XrayListForDiagnostic;
