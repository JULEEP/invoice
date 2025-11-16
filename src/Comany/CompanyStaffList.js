import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload, FaEye } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaDownload } from "react-icons/fa";

const CompanyStaffList = () => {
  const navigate = useNavigate()
  const companyId = localStorage.getItem("companyId");

  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState({ forTests: '', forDoctors: '', forPackages: '' });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState({ packages: false });
  const [updatedStaff, setUpdatedStaff] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleViewHistory = (staffId) => {
    navigate(`/company/staff-history/${staffId}`);
  };

  useEffect(() => {
    if (!companyId) {
      console.error("Company ID not found in localStorage.");
      return;
    }

    axios
      .get(`https://api.credenthealth.com/api/admin/companystaffs/${companyId}`)
      .then((response) => {
        setStaffs(response.data.company.staff);
      })
      .catch((error) => {
        console.error("Error fetching staff data:", error);
      });
  }, [companyId]);

  const filteredStaffs = staffs.filter((staff) =>
    staff.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaffs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const headers = [
    { label: "S.No", key: "sno" },
    { label: "Name", key: "name" },
    { label: "Role", key: "role" },
    { label: "Department", key: "department" },
    { label: "Contact Number", key: "contact_number" },
    { label: "Email", key: "email" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Age", key: "age" },
    { label: "Address", key: "address" },
    { label: "Wallet Amount", key: "wallet_balance" },
  ];

  const csvData = filteredStaffs.map((staff, index) => ({
    sno: index + 1,
    ...staff
  }));

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedStaffs = XLSX.utils.sheet_to_json(worksheet);

      console.log("Imported Staffs:", importedStaffs);

      if (importedStaffs.length === 0) {
        return alert("No data found in Excel file.");
      }

      try {
        // Change 'staffs' to 'staff' here
        const res = await axios.post(
          `https://api.credenthealth.com/api/admin/create-staffinbulk/${companyId}`,
          { staff: importedStaffs }  // <-- Correct key 'staff'
        );

        if (res.status === 200) {
          alert("Staff bulk upload successful!");
          if (Array.isArray(res.data.savedStaffs)) {
            setStaffs(prev => [...prev, ...res.data.savedStaffs]);
          } else {
            alert("Uploaded, but no staff data returned.");
          }
        }

      } catch (error) {
        console.error("Upload error:", error);
        alert("Server error during upload.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setUpdatedStaff(staff);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/deletestaff/${id}`);

      if (res.status === 200) {
        const updatedStaffs = staffs.filter((s) => s._id !== id);
        setStaffs(updatedStaffs);
        alert("User deleted successfully!");
      } else {
        alert("Failed to delete staff.");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert("Error deleting staff.");
    }
  };

  const openAddAmountModal = (staff) => {
    setSelectedStaff(staff);
    setAmountToAdd({ forTests: '', forDoctors: '', forPackages: '' });
    setShowModal(true);
  };

  const closeAddAmountModal = () => {
    setSelectedStaff(null);
    setShowModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedStaff(null);
  };

  const handleAddAmount = async () => {
    const { forTests, forDoctors, forPackages } = amountToAdd;
    const totalAmount =
      parseFloat(forTests || 0) +
      parseFloat(forDoctors || 0) +
      parseFloat(forPackages || 0);

    if (totalAmount <= 0) {
      return Swal.fire({
        title: 'Invalid Amount!',
        text: 'Please enter at least one valid amount greater than zero.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }

    setLoading(prev => ({ ...prev, packages: true }));

    try {
      const res = await axios.post(
        `https://api.credenthealth.com/api/admin/addamount/${selectedStaff._id}/${companyId}`,
        {
          forTests: parseFloat(forTests || 0),
          forDoctors: parseFloat(forDoctors || 0),
          forPackages: parseFloat(forPackages || 0),
          from: 'Admin',
        }
      );

      if (res.status === 200) {
        const updated = staffs.map((s) =>
          s._id === selectedStaff._id
            ? {
              ...s,
              wallet_balance: (parseFloat(s.wallet_balance) || 0) + totalAmount,
              forTests: (parseFloat(s.forTests) || 0) + parseFloat(forTests || 0),
              forDoctors: (parseFloat(s.forDoctors) || 0) + parseFloat(forDoctors || 0),
              forPackages: (parseFloat(s.forPackages) || 0) + parseFloat(forPackages || 0),
              totalAmount: (parseFloat(s.totalAmount) || 0) + totalAmount,
            }
            : s
        );

        setStaffs(updated);
        setAmountToAdd({ forTests: '', forDoctors: '', forPackages: '' });
        closeAddAmountModal();

        Swal.fire({
          title: 'Success!',
          text: 'Amount added successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add amount.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error!',
        text: 'Add amount failed. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(prev => ({ ...prev, packages: false }));
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/editstaff/${selectedStaff._id}`,
        updatedStaff
      );

      if (res.status === 200) {
        const updatedStaffs = staffs.map((s) =>
          s._id === selectedStaff._id ? { ...s, ...updatedStaff } : s
        );
        setStaffs(updatedStaffs);
        setShowEditModal(false);
        alert("User updated successfully!");
      } else {
        alert("Failed to update staff.");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Error updating staff.");
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const BASE_URL = 'https://api.credenthealth.com'


  // 👇 Sample headers and one example row for guidance
  const sampleHeaders = [
    { label: "name", key: "name" },
    { label: "email", key: "email" },
    { label: "password", key: "password" },
    { label: "contact_number", key: "contact_number" },
    { label: "address", key: "address" },
    { label: "dob", key: "dob" },
    { label: "gender", key: "gender" },
    { label: "age", key: "age" },
    { label: "department", key: "department" },
    { label: "role", key: "role" },
  ];

  // 👇 Example row to show format
  const sampleData = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      contact_number: "9876543210",
      address: "123 Main Street, Mumbai",
      dob: "1990-05-20",
      gender: "Male",
      age: 33,
      department: "Sales",
      role: "User",
    },
  ];



  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Company User List</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by user name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CSVLink
          data={csvData}
          headers={headers}
          filename="company_staff_list.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>

        <label
          htmlFor="import-file"
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaUpload /> Bulk Import
          <input
            type="file"
            accept=".xlsx, .xls, .csv" // ✅ CSV format added
            id="import-file"
            onChange={handleBulkImport}
            className="hidden"
          />

        </label>

        <CSVLink
          data={sampleData}
          headers={sampleHeaders}
          filename="bulk_user_upload_format.csv"
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2"
        >
          <FaDownload />
          Download Format
        </CSVLink>

      </div>

      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Image Preview</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <img
                src={`${BASE_URL}${selectedImage}`}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="overflow-y-auto max-h-[400px]">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">S.No</th>
              <th className="p-2 border text-left">Profile</th>
              <th className="p-2 border text-left">User ID</th>
              <th className="p-2 border text-left">User Name</th>
              <th className="p-2 border text-left">Department</th>
              <th className="p-2 border text-left">Contact</th>
              <th className="p-2 border text-left">Email</th>
              <th className="p-2 border text-left">Gender</th>
              <th className="p-2 border text-left">Age</th>
              <th className="p-2 border text-left">Address</th>
              <th className="p-2 border text-left">Add Amount</th>
              <th className="p-2 border text-left">Actions</th>
              <th className="p-2 border text-left">History</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((staff, index) => (
              <tr key={staff._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{indexOfFirstItem + index + 1}</td>

                {/* Profile Image with click handler */}
                <td className="p-2 border">
                  {staff.profileImage ? (
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border cursor-pointer"
                      onClick={() => openImageModal(staff.profileImage)}
                    >
                      <img
                        src={`${BASE_URL}${staff.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </td>

                {/* ID Image with click handler */}
                <td className="p-2 border">
                  {staff.idImage ? (
                    <div
                      className="w-10 h-10 overflow-hidden border cursor-pointer"
                      onClick={() => openImageModal(staff.idImage)}
                    >
                      <img
                        src={`${BASE_URL}${staff.idImage}`}
                        alt="ID Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No ID</span>
                    </div>
                  )}
                </td>

                <td className="p-2 border">{staff.name}</td>
                <td className="p-2 border">{staff.department}</td>
                <td className="p-2 border">{staff.contact_number}</td>
                <td className="p-2 border">{staff.email}</td>
                <td className="p-2 border">{staff.gender}</td>
                <td className="p-2 border">{staff.age}</td>
                <td className="p-2 border">{staff.address}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openAddAmountModal(staff)}
                    className="bg-purple-900 text-white px-2 py-1 rounded text-xs"
                  >
                    Add
                  </button>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(staff)}
                    className="text-blue-500 text-lg mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(staff._id)}
                    className="text-red-500 text-lg"
                  >
                    <FaTrash />
                  </button>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleViewHistory(staff._id)}
                    className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredStaffs.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaffs.length)} of {filteredStaffs.length} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Amount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Add Amount</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">For Tests (₹)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter amount"
                  value={amountToAdd.forTests}
                  onChange={(e) => setAmountToAdd({ ...amountToAdd, forTests: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">For Doctors (₹)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter amount"
                  value={amountToAdd.forDoctors}
                  onChange={(e) => setAmountToAdd({ ...amountToAdd, forDoctors: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">For Packages (₹)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter amount"
                  value={amountToAdd.forPackages}
                  onChange={(e) => setAmountToAdd({ ...amountToAdd, forPackages: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeAddAmountModal}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAmount}
                disabled={loading.packages}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                {loading.packages ? "Adding..." : "Add Amount"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing staff */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleSubmitEdit}>
              {["name", "email", "contact_number", "role", "department", "dob", "gender", "age", "address"].map((field) => (
                <div key={field} className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                  </label>
                  <input
                    type={field === 'dob' ? 'date' : 'text'}
                    className="w-full px-3 py-2 border rounded"
                    value={updatedStaff[field] || ""}
                    onChange={(e) =>
                      setUpdatedStaff({ ...updatedStaff, [field]: e.target.value })
                    }
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyStaffList;