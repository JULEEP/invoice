import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const StaffMedicalUploadsList = () => {
  const [staffData, setStaffData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    fetchStaffUploads();
  }, []);

  const fetchStaffUploads = async () => {
    try {
      const res = await axios.get(
        "https://api.credenthealth.com/api/admin/staffallmedical-uploads"
      );
      if (res.data && res.data.data) {
        setStaffData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch staff uploads:", error);
    }
  };

  const filteredStaff = staffData.filter((staff) =>
    staff.name?.toLowerCase().includes(search.toLowerCase()) ||
    staff.email?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredStaff.length / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openModal = (files) => {
    setSelectedFiles(files);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedFiles([]);
    setShowModal(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users Medical Uploads  Reports-Prescription.</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="px-3 py-2 border rounded text-sm w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">SI No</th>
              <th className="p-2 border text-left">User Name</th>
              <th className="p-2 border text-left">Email</th>
              <th className="p-2 border text-left">Uploaded Files Count</th>
              <th className="p-2 border text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.length > 0 ? (
              paginatedStaff.map((staff, index) => (
                <tr key={staff._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="p-2 border">{staff.name || "N/A"}</td>
                  <td className="p-2 border">{staff.email || "N/A"}</td>
                  <td className="p-2 border">{staff.uploadedFiles.length}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openModal(staff.uploadedFiles)}
                      className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 text-sm hover:bg-blue-700"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 border text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStaff.length > pageSize && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <FaChevronLeft className="mr-1" /> Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {Math.ceil(filteredStaff.length / pageSize)}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === Math.ceil(filteredStaff.length / pageSize)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
            <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {selectedFiles.map((file, i) => (
                <li key={i} className="text-blue-600 underline break-all">
                  <a href={`https://api.credenthealth.com${file}`} target="_blank" rel="noopener noreferrer">
                    {file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffMedicalUploadsList;
