import React, { useEffect, useState, useRef } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload, FaTimes } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";

const HraList = () => {
  const [hras, setHras] = useState([]);
  const [search, setSearch] = useState("");
  const [editingHra, setEditingHra] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchHras();
  }, []);

  const fetchHras = async () => {
    try {
      const res = await axios.get("https://api.credenthealth.com/api/admin/allhracat");
      setHras(res.data.hras || []);
    } catch (err) {
      console.error("Error fetching HRAs:", err);
    }
  };

  const filteredHras = hras.filter((hra) =>
    hra.hraName.toLowerCase().includes(search.toLowerCase())
  );

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const imported = XLSX.utils.sheet_to_json(worksheet);

      console.log("Imported HRAs:", imported);
      alert("HRA data imported successfully!");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (hra) => {
    setEditingHra(hra);
    setNewImage(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("hraName", editingHra.hraName);
      formData.append("prescribed", editingHra.prescribed || "");
      formData.append("gender", editingHra.gender || ""); // Add gender to formData

      if (newImage) {
        formData.append("image", newImage);
      }

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updatehra/${editingHra._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setHras(hras.map(h => h._id === editingHra._id ? res.data.hra : h));
      setIsModalOpen(false);
      alert("HRA updated successfully!");
    } catch (error) {
      console.error("Error updating HRA:", error);
      alert("Failed to update HRA");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this HRA category?")) return;

    try {
      await axios.delete(`https://api.credenthealth.com/api/admin/deletehra/${id}`);
      setHras(hras.filter((hra) => hra._id !== id));
      alert("HRA deleted successfully!");
    } catch (error) {
      console.error("Error deleting HRA:", error);
      alert("Failed to delete HRA");
    }
  };

  const headers = [
    { label: "HRA Name", key: "hraName" },
    { label: "Prescribed", key: "prescribed" },
    { label: "Gender", key: "gender" }, // Add Gender to CSV export
    { label: "Image URL", key: "hraImage" },
    { label: "Created At", key: "createdAt" },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">HRA Categories</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by HRA name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CSVLink
          data={filteredHras}
          headers={headers}
          filename="hra_list.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>

        <label
          htmlFor="import-hra"
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaUpload /> Bulk Import
          <input
            type="file"
            accept=".xlsx, .xls"
            id="import-hra"
            onChange={handleBulkImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">HRA Name</th>
              <th className="p-2 border text-left">Prescribed</th>
              <th className="p-2 border text-left">Gender</th> {/* Add Gender Column */}
              <th className="p-2 border text-left">Image</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHras.map((hra) => (
              <tr key={hra._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{hra.hraName}</td>
                <td className="p-2 border">{hra.prescribed || "-"}</td>
                <td className="p-2 border">{hra.gender || "Not Specified"}</td> {/* Show Gender */}
                <td className="p-2 border">
                  {hra.hraImage ? (
                    <img
                      src={`https://api.credenthealth.com${hra.hraImage}`}
                      alt={hra.hraName}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(hra)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(hra._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredHras.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No HRA categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingHra && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit HRA Category</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm mb-1">HRA Name*</label>
                <input
                  className="p-2 border rounded w-full"
                  value={editingHra.hraName}
                  onChange={(e) =>
                    setEditingHra({ ...editingHra, hraName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1">Prescribed (optional)</label>
                <input
                  className="p-2 border rounded w-full"
                  value={editingHra.prescribed || ""}
                  onChange={(e) =>
                    setEditingHra({ ...editingHra, prescribed: e.target.value })
                  }
                />
              </div>

              {/* Gender Field */}
              <div className="mb-4">
                <label className="block text-sm mb-1">Gender</label>
                <select
                  className="p-2 border rounded w-full"
                  value={editingHra.gender || ""}
                  onChange={(e) =>
                    setEditingHra({ ...editingHra, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1">Update Image (optional)</label>
                <div
                  className="flex items-center justify-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaUpload className="text-gray-500" />
                  <span>{newImage ? newImage.name : "Choose a new image"}</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {newImage && (
                  <div className="mt-2 text-xs text-gray-500">
                    Selected: {newImage.name} ({(newImage.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded hover:bg-red-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-600 border border-green-700 rounded hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HraList;
