import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload, FaEye, FaFile } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDocuments, setViewingDocuments] = useState(null);
  const [updatedDoctor, setUpdatedDoctor] = useState({
    name: "",
    specialization: "",
    qualification: "",
    consultation_fee: 0,
    consultation_type: "",
  });

  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Limit to 5 doctors per page

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("https://api.credenthealth.com/api/admin/getdoctors");
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  // Filtered and paginated doctor list
  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get doctors for the current page
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredDoctors.length / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const headers = [
    { label: "SI No", key: "siNo" },
    { label: "Name", key: "name" },
    { label: "Specialization", key: "specialization" },
    { label: "Qualification", key: "qualification" },
    { label: "Consultation Fee", key: "consultation_fee" },
    { label: "Consultation Type", key: "consultation_type" },
  ];

  // Add SI No to CSV data
  const csvData = filteredDoctors.map((doctor, index) => ({
    siNo: index + 1,
    ...doctor
  }));

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(sheet);

      console.log("Imported Doctors:", importedData);
      alert("Doctor data imported successfully!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (id) => {
    const doctorToEdit = doctors.find((doc) => doc._id === id);
    setEditingDoctor(doctorToEdit);
    setUpdatedDoctor({
      name: doctorToEdit.name,
      specialization: doctorToEdit.specialization,
      qualification: doctorToEdit.qualification,
      consultation_fee: doctorToEdit.consultation_fee,
      consultation_type: doctorToEdit.consultation_type,
    });
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/remvoe-doctors/${id}`);
      if (res.status === 200) {
        setDoctors((prev) => prev.filter((doc) => doc._id !== id));
        alert("Doctor deleted successfully!");
      } else {
        alert("Failed to delete doctor");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Server error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDoctor((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`https://api.credenthealth.com/api/admin/update-doctor/${editingDoctor._id}`, updatedDoctor);
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) =>
          doc._id === editingDoctor._id ? { ...doc, ...updatedDoctor } : doc
        )
      );
      setEditingDoctor(null);
      alert("Doctor details updated successfully!");
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Failed to update doctor");
    }
  };

  const handleCancel = () => {
    setEditingDoctor(null);
  };

  const handleViewDocuments = (doc) => {
    setViewingDocuments(doc);
  };

  const handleCloseDocuments = () => {
    setViewingDocuments(null);
  };

  const handleViewDoctor = (doctorId) => {
    navigate(`/singledoctor/${doctorId}`);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Doctor Management</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CSVLink
          data={csvData}
          headers={headers}
          filename="doctor_list.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>
      </div>

      <div className="overflow-y-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">SI No</th>
              <th className="p-2 border text-left">Doctor</th>
              <th className="p-2 border text-left">Specialization</th>
              <th className="p-2 border text-left">Consultation</th>
              <th className="p-2 border text-left">Fee</th>
              <th className="p-2 border text-left">Document</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDoctors.map((doc, index) => (
              <tr key={doc._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{(currentPage - 1) * pageSize + index + 1}</td>
                <td className="p-2 border">{doc.name}</td>
                <td className="p-2 border">{doc.specialization}</td>
                <td className="p-2 border">{doc.consultation_type}</td>
                <td className="p-2 border">₹{doc.consultation_fee}</td>
                <td className="p-2 border">
                  {doc.documents && doc.documents.length > 0 ? (
                    <button
                      onClick={() => handleViewDocuments(doc)}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      <FaFile /> View
                    </button>
                  ) : (
                    "No Documents"
                  )}
                </td>
                <td className="p-2 border flex gap-2 justify-center">
                  <button
                    onClick={() => handleViewDoctor(doc._id)}
                    className="text-green-600 hover:text-green-800"
                    title="View Doctor"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(doc._id)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={prevPage}
          className="px-4 py-2 bg-gray-300 text-sm rounded"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm">
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredDoctors.length)} to {Math.min(currentPage * pageSize, filteredDoctors.length)} of {filteredDoctors.length} doctors
        </span>
        <button
          onClick={nextPage}
          className="px-4 py-2 bg-gray-300 text-sm rounded"
          disabled={currentPage === Math.ceil(filteredDoctors.length / pageSize)}
        >
          Next
        </button>
      </div>

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-3/4 md:w-2/3 lg:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Edit Doctor Details</h3>
            <form>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={updatedDoctor.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={updatedDoctor.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={updatedDoctor.qualification}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Consultation Fee</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={updatedDoctor.consultation_fee}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Consultation Type</label>
                  <select
                    name="consultation_type"
                    value={updatedDoctor.consultation_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents View Modal */}
      {viewingDocuments && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-3/4 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Documents for {viewingDocuments.name}</h3>
              <button
                onClick={handleCloseDocuments}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingDocuments.documents.map((doc, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex justify-center mb-2">
                    {doc.endsWith('.jpg') || doc.endsWith('.jpeg') || doc.endsWith('.png') ? (
                      <img
                        src={`https://api.credenthealth.com${doc}`}
                        alt={`Document ${index + 1}`}
                        className="max-h-48 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 border rounded">
                        <FaFile className="text-4xl text-gray-400 mb-2" />
                        <span className="text-sm">Document {index + 1}</span>
                        <a
                          href={`https://api.credenthealth.com${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm mt-2"
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-sm truncate">
                    {doc.split('/').pop()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;