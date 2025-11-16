import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PackageListForDiag = () => {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const diagnosticId = localStorage.getItem("diagnosticId");

  // Edit state
  const [editingPackage, setEditingPackage] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    doctorInfo: "",
    totalTestsIncluded: "",
    description: "",
    precautions: "",
    includedTests: "", // comma separated names
  });

  useEffect(() => {
    if (!diagnosticId) {
      setError("Diagnostic ID not found.");
      setLoading(false);
      return;
    }
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(
        `https://api.credenthealth.com/api/admin/getpackagesdiagnostic/${diagnosticId}`
      );
      if (res.data?.packages) {
        setPackages(res.data.packages);
      } else {
        setPackages([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch packages.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await axios.delete(
        `https://api.credenthealth.com/api/admin/delete-package/${diagnosticId}/${packageId}`
      );
      setPackages((prev) => prev.filter((p) => p._id !== packageId));
      alert("Package deleted.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed.");
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setEditForm({
      name: pkg.name || "",
      price: pkg.price || "",
      doctorInfo: pkg.doctorInfo || "",
      totalTestsIncluded: pkg.totalTestsIncluded || "",
      description: pkg.description || "",
      precautions: pkg.precautions || "",
      includedTests: (pkg.includedTests || []).map((t) => t.name).join(", "),
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editingPackage) return;

    const { name, price, totalTestsIncluded, includedTests } = editForm;

    if (!name || !price || !totalTestsIncluded || !includedTests) {
      alert("Fill all required fields.");
      return;
    }

    const payload = {
      name,
      price,
      doctorInfo: editForm.doctorInfo,
      totalTestsIncluded,
      description: editForm.description,
      precautions: editForm.precautions,
      includedTests: includedTests
        .split(",")
        .map((n) => ({ name: n.trim(), subTests: [] })),
    };

    try {
      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/update-package/${diagnosticId}/${editingPackage._id}`,
        payload
      );
      setPackages((prev) =>
        prev.map((p) => (p._id === editingPackage._id ? res.data.package : p))
      );
      setEditingPackage(null);
      alert("Package updated.");
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed.");
    }
  };

  const exportToExcel = () => {
    const data = packages.map((pkg, i) => ({
      "S.No": i + 1,
      Name: pkg.name,
      Price: pkg.price,
      "Total Tests": pkg.totalTestsIncluded,
      Description: pkg.description,
      Instructions: pkg.precautions,
      "Included Tests": formatTests(pkg.includedTests),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Packages");
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "packages.xlsx");
  };

  const formatTests = (tests) =>
    (tests || []).map((t) => t.name).join(", ") || "-";

  const filtered = packages.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded shadow max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Diagnostic Packages</h2>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaFileExcel /> Export
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by package name..."
        className="w-full md:w-1/3 border p-2 rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center">No packages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">S.No</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">MRP</th>
                <th className="border p-2">Tests</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Instructions</th>
                <th className="border p-2">Included Tests</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg, i) => (
                <tr key={pkg._id} className="hover:bg-gray-50">
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{pkg.name}</td>
                  <td className="border p-2">₹{pkg.price}</td>
                  <td className="border p-2">{pkg.totalTestsIncluded}</td>
                  <td className="border p-2">{pkg.description}</td>
                  <td className="border p-2">{pkg.precautions}</td>
                  <td className="border p-2">{formatTests(pkg.includedTests)}</td>
                  <td className="border p-2">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Package</h3>
            <div className="grid gap-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editForm.name}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="mrp"
                placeholder="MRP"
                value={editForm.price}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="totalTestsIncluded"
                placeholder="Total Tests Included"
                value={editForm.totalTestsIncluded}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={editForm.description}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <textarea
                name="precautions"
                placeholder="Instructions"
                value={editForm.precautions}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
              <textarea
                name="includedTests"
                placeholder="Included Tests (comma separated)"
                value={editForm.includedTests}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingPackage(null)}
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

export default PackageListForDiag;
