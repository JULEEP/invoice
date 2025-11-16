import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload, FaPlus, FaFilter } from "react-icons/fa";
import { CSVLink } from "react-csv";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

const StaffList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = new URLSearchParams(location.search).get("companyId");

  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState({
    forTests: "",
    forDoctors: "",
    forPackages: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState({
    staff: false,
    diagnostics: false,
    packages: false
  });
  const [updatedStaff, setUpdatedStaff] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [applyToAllStaff, setApplyToAllStaff] = useState(false);
  
  // NEW: Branch states
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(""); // NEW: Branch filter state
  const [showBranchFilter, setShowBranchFilter] = useState(false); // NEW: Toggle for branch filter dropdown

  const staffsPerPage = 5;

  // Fetch staff data
  useEffect(() => {
    if (!companyId) return;

    setLoading(prev => ({ ...prev, staff: true }));
    axios
      .get(`https://api.credenthealth.com/api/admin/companystaffs/${companyId}`)
      .then((res) => setStaffs(res.data.company.staff || []))
      .catch((err) => console.error("Error fetching staff data:", err))
      .finally(() => setLoading(prev => ({ ...prev, staff: false })));
  }, [companyId]);

  // Fetch diagnostics data
  useEffect(() => {
    setLoading(prev => ({ ...prev, diagnostics: true }));
    axios.get("https://api.credenthealth.com/api/admin/alldiagnostics")
      .then(response => {
        const centers = response?.data?.data || response?.data?.diagnostics || [];
        setDiagnosticsList(centers);
      })
      .catch(err => {
        console.error("Error fetching diagnostics:", err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load diagnostic centers',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      })
      .finally(() => setLoading(prev => ({ ...prev, diagnostics: false })));
  }, []);

  // NEW: Fetch branches when component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      if (!companyId) return;
      
      try {
        setLoadingBranches(true);
        const response = await axios.get(
          `https://api.credenthealth.com/api/admin/singlecompany/${companyId}`
        );
        
        if (response.data && response.data.company && response.data.company.branches) {
          setBranches(response.data.company.branches);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load branches",
        });
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [companyId]);

  // Helper function to get branch name by ID
  const getBranchName = (branchId) => {
    if (!branchId) return 'N/A';
    const branch = branches.find(b => b._id === branchId);
    return branch ? `${branch.branchName} - ${branch.branchCode}` : 'N/A';
  };

  // NEW: Filter staffs based on search and branch filter
  const filteredStaffs = staffs.filter((staff) => {
    if (!staff || !staff.name) return false;
    
    const matchesSearch = staff.name.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranchFilter ? staff.branch === selectedBranchFilter : true;
    
    return matchesSearch && matchesBranch;
  });

  const indexOfLast = currentPage * staffsPerPage;
  const indexOfFirst = indexOfLast - staffsPerPage;
  const currentStaffs = filteredStaffs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStaffs.length / staffsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const headers = [
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
    { label: "Branch", key: "branchName" },
  ];

  // Add branch name to staff data for CSV
  const staffsWithBranchNames = filteredStaffs.map(staff => ({
    ...staff,
    branchName: getBranchName(staff.branch)
  }));

  // NEW: Handle branch filter change
  const handleBranchFilterChange = (branchId) => {
    setSelectedBranchFilter(branchId);
    setCurrentPage(1); // Reset to first page when filter changes
    setShowBranchFilter(false); // Close dropdown after selection
  };

  // NEW: Clear branch filter
  const clearBranchFilter = () => {
    setSelectedBranchFilter("");
    setCurrentPage(1);
  };

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const companyId = new URLSearchParams(location.search).get("companyId");

    if (!companyId) {
      Swal.fire({
        title: 'Error!',
        text: 'Company ID is missing. Please ensure the URL is correct.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    e.target.value = '';

    Swal.fire({
      title: 'Confirm Import',
      text: `You are about to import staff from "${file.name}". Do you want to proceed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Proceed',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch(`https://api.credenthealth.com/api/admin/import-staffs/${companyId}`, {
            method: "POST",
            body: formData,
          });

          const result = await res.json();

          if (res.ok) {
            const newStaff = Array.isArray(result.data) 
              ? result.data.filter(staff => staff != null) 
              : (result.data ? [result.data] : []);

            Swal.fire({
              title: 'Success!',
              text: 'Staff imported successfully!',
              icon: 'success',
              confirmButtonText: 'OK',
            });

            setStaffs((prev) => [...prev.filter(staff => staff != null), ...newStaff]);
          } else {
            Swal.fire({
              title: 'Error!',
              text: result.error || 'Something went wrong during import.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: 'Error!',
            text: 'Upload failed.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'Import cancelled.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
      }
    });
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setUpdatedStaff({
      ...staff,
      branch: staff.branch || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this staff. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    try {
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/deletestaff/${id}`);

      if (res.status === 200) {
        setStaffs((prev) => prev.filter((s) => s._id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Staff deleted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete staff.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      console.error("Error deleting staff:", err);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong while deleting the staff.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const openAddAmountModal = (staff) => {
    setSelectedStaff(staff);
    setAmountToAdd({
      forTests: "",
      forDoctors: "",
      forPackages: ""
    });
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

  const closeAddTestModal = () => {
    setShowAddTestModal(false);
    setSelectedDiagnostic('');
    setSelectedPackages([]);
    setAgeGroup("");
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
        const updated = res.data.updatedStaff;
        setStaffs((prev) =>
          prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s))
        );
        closeEditModal();
        Swal.fire({
          title: 'Success!',
          text: 'Staff updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Update failed.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error!',
        text: 'Error updating staff. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleViewHistory = (staffId) => {
    navigate(`/staff-history/${staffId}`);
  };

  const handlePackageChange = (e) => {
    const value = e.target.value;
    if (selectedPackages.includes(value)) {
      setSelectedPackages(selectedPackages.filter((id) => id !== value));
    } else {
      setSelectedPackages([...selectedPackages, value]);
    }
  };

  const handleSelectAllPackages = (e) => {
    if (e.target.checked) {
      const allPackageIds = diagnosticsList
        .find((d) => d._id === selectedDiagnostic)
        ?.packages?.map((pkg) => pkg._id) || [];
      setSelectedPackages(allPackageIds);
    } else {
      setSelectedPackages([]);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, packages: true }));

    if (!applyToAllStaff && (!ageGroup || selectedPackages.length === 0)) {
      Swal.fire({
        title: "Error!",
        text: "Please select age group and packages or choose apply to all staff.",
        icon: "error",
        confirmButtonText: "OK",
      });
      setLoading((prev) => ({ ...prev, packages: false }));
      return;
    }

    const payload = {
      applyToAllStaff,
      ageGroup: applyToAllStaff ? null : ageGroup,
      diagnostics: [
        {
          diagnosticId: selectedDiagnostic,
          packageIds: selectedPackages,
        },
      ],
    };

    try {
      const response = await axios.post(
        "https://api.credenthealth.com/api/admin/add-packages",
        payload
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Packages successfully added to Users!",
          icon: "success",
          confirmButtonText: "OK",
        });
        closeAddTestModal();
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data?.message || "Failed to add packages.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while adding packages.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading((prev) => ({ ...prev, packages: false }));
    }
  };

  const selectedDiagnosticPackages =
    diagnosticsList.find((d) => d._id === selectedDiagnostic)?.packages || [];

  const allSelected =
    selectedDiagnosticPackages.length > 0 &&
    selectedPackages.length === selectedDiagnosticPackages.length;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User List</h2>
        <button
          onClick={() => setShowAddTestModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          disabled={loading.packages}
        >
          <FaPlus /> Add Packages
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by user name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* NEW: Branch Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBranchFilter(!showBranchFilter)}
            className="px-4 py-2 bg-orange-500 text-white rounded text-sm flex items-center gap-2"
          >
            <FaFilter /> Branch Filter
            {selectedBranchFilter && (
              <span className="ml-1 bg-white text-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                ✓
              </span>
            )}
          </button>
          
          {showBranchFilter && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Filter by Branch</span>
                  {selectedBranchFilter && (
                    <button
                      onClick={clearBranchFilter}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => handleBranchFilterChange("")}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    !selectedBranchFilter ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  All Branches
                </button>
                {branches.map((branch) => (
                  <button
                    key={branch._id}
                    onClick={() => handleBranchFilterChange(branch._id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      selectedBranchFilter === branch._id ? "bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    {branch.branchName} - {branch.branchCode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Show active filter badge */}
        {selectedBranchFilter && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            <span>Branch: {getBranchName(selectedBranchFilter)}</span>
            <button
              onClick={clearBranchFilter}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <CSVLink
          data={staffsWithBranchNames}
          headers={headers}
          filename="staff_list.csv"
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
            accept=".xlsx, .xls"
            id="import-file"
            onChange={handleBulkImport}
            className="hidden"
          />
        </label>
      </div>

      {/* NEW: Filter Summary */}
      {selectedBranchFilter && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Active Filter:</strong> Showing staff from branch: <span className="font-semibold">{getBranchName(selectedBranchFilter)}</span>
          <span className="ml-4 text-gray-600">
            ({filteredStaffs.length} of {staffs.length} staff members)
          </span>
        </div>
      )}

      {loading.staff ? (
        <div className="text-center py-8">Loading staff data...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border rounded text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Department</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Age</th>
                  <th className="p-2 border">Branch</th>
                  <th className="p-2 border">Add</th>
                  <th className="p-2 border">Actions</th>
                  <th className="p-2 border">History</th>
                  <th className="p-2 border">User PKGS</th>
                </tr>
              </thead>
              <tbody>
                {currentStaffs.map((staff) => (
                  staff && (
                    <tr key={staff._id} className="hover:bg-gray-100">
                      <td className="p-2 border">{staff.name || 'N/A'}</td>
                      <td className="p-2 border">{staff.role || 'N/A'}</td>
                      <td className="p-2 border">{staff.department || 'N/A'}</td>
                      <td className="p-2 border">{staff.contact_number || 'N/A'}</td>
                      <td className="p-2 border">{staff.email || 'N/A'}</td>
                      <td className="p-2 border">{staff.address || 'N/A'}</td>
                      <td className="p-2 border">{staff.age || 'N/A'}</td>
                      <td className="p-2 border">{getBranchName(staff.branch)}</td>
                      <td className="p-2 border">
                        <button
                          onClick={() => openAddAmountModal(staff)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Add Amount
                        </button>
                      </td>
                      <td className="p-2 border flex justify-center gap-2">
                        <button onClick={() => handleEdit(staff)} className="text-blue-600"><FaEdit /></button>
                        <button onClick={() => handleDelete(staff._id)} className="text-red-600"><FaTrash /></button>
                      </td>
                      <td className="p-2 border">
                        <button
                          onClick={() => handleViewHistory(staff._id)}
                          className="bg-indigo-500 text-white px-2 py-1 rounded text-xs"
                        >
                          View
                        </button>
                      </td>
                      <td className="p-2 border text-center">
                        <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition duration-200 text-sm">
                          <Link to={`/stafftestpkg/${staff._id}`}>
                            View
                          </Link>
                        </button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>

          {filteredStaffs.length > staffsPerPage && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? "bg-blue-500 text-white" : ""
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Amount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Add Amount</h3>

            <p className="text-sm text-gray-700 mb-4 bg-blue-50 border border-blue-200 p-3 rounded-md shadow-sm">
              <strong>How to Add Amounts:</strong> Enter the desired amount for each category below.<br />
              For instance, if you wish to add ₹2000 for Tests, ₹1000 for Packages, and ₹2000 for Doctors, input these values accordingly.
            </p>

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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleSubmitEdit} className="space-y-3">
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Name"
                value={updatedStaff.name || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Role"
                value={updatedStaff.role || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, role: e.target.value })}
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Contact Number"
                value={updatedStaff.contact_number || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, contact_number: e.target.value })}
              />
              <input
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Email"
                value={updatedStaff.email || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, email: e.target.value })}
              />
              <input
                type="date"
                className="w-full border p-2 rounded"
                placeholder="DOB"
                value={updatedStaff.dob || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, dob: e.target.value })}
              />
              <select
                className="w-full border p-2 rounded"
                value={updatedStaff.gender || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Age"
                value={updatedStaff.age || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, age: e.target.value })}
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Address"
                value={updatedStaff.address || ""}
                onChange={(e) => setUpdatedStaff({ ...updatedStaff, address: e.target.value })}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  className="w-full border p-2 rounded"
                  value={updatedStaff.branch || ""}
                  onChange={(e) => setUpdatedStaff({ ...updatedStaff, branch: e.target.value })}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.branchCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-w-5xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeAddTestModal}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Add Package
            </h3>

            <form onSubmit={handleAddTest} className="space-y-4">
              <div>
                <label
                  htmlFor="diagnosticName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Diagnostic Center
                </label>
                {loading.diagnostics ? (
                  <div className="w-full border p-2 rounded-lg text-sm bg-gray-100 animate-pulse h-10"></div>
                ) : (
                  <select
                    id="diagnosticName"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={selectedDiagnostic}
                    onChange={(e) => {
                      setSelectedDiagnostic(e.target.value);
                      setSelectedPackages([]);
                    }}
                    disabled={loading.diagnostics}
                  >
                    <option value="">Select Diagnostic Center</option>
                    {diagnosticsList.map((diagnostic) => (
                      <option key={diagnostic._id} value={diagnostic._id}>
                        {diagnostic.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedDiagnostic && (
                <div className="mb-4">
                  <label className="block text-sm mb-2 text-gray-700">
                    Select Packages
                  </label>

                  <label className="inline-flex items-center mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAllPackages}
                      className="mr-2 accent-purple-900"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </label>

                  {loading.packages ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-4 bg-gray-100 rounded border animate-pulse h-24"
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto whitespace-nowrap border rounded p-2 bg-gray-50">
                      <div className="flex gap-4">
                        {selectedDiagnosticPackages.map((pkg) => (
                          <label
                            key={pkg._id}
                            className="inline-flex items-center whitespace-normal px-3 py-2 bg-white border rounded shadow-sm min-w-[200px] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={pkg._id}
                              checked={selectedPackages.includes(pkg._id)}
                              onChange={handlePackageChange}
                              className="mr-2 accent-purple-900"
                            />
                            <div>
                              <div className="font-semibold text-sm">
                                {pkg.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                ₹{pkg.offerPrice || pkg.price}
                              </div>
                              <div className="text-xs text-gray-500">
                                {pkg.tests?.map((test) => test.test_name).join(", ")}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="applyToAllStaff"
                  checked={applyToAllStaff}
                  onChange={() => setApplyToAllStaff((prev) => !prev)}
                  className="accent-purple-900"
                />
                <label htmlFor="applyToAllStaff" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Apply to all users (ignore age group)
                </label>
              </div>

              {!applyToAllStaff && (
                <div>
                  <label
                    htmlFor="ageGroup"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Age Group
                  </label>
                  <select
                    id="ageGroup"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    disabled={applyToAllStaff}
                  >
                    <option value="">Select Age Group</option>
                    <option value="20-23">20-23</option>
                    <option value="23-26">23-26</option>
                    <option value="26-29">26-29</option>
                    <option value="29-32">29-32</option>
                    <option value="32-35">32-35</option>
                    <option value="35-38">35-38</option>
                    <option value="38-41">38-41</option>
                    <option value="41-44">41-44</option>
                    <option value="44-47">44-47</option>
                    <option value="47-50">47-50</option>
                    <option value="50-53">50-53</option>
                    <option value="53-56">53-56</option>
                    <option value="56-59">56-59</option>
                    <option value="59-62">59-62</option>
                    <option value="62-65">62-65</option>
                    <option value="65-68">65-68</option>
                    <option value="68-71">68-71</option>
                    <option value="71-74">71-74</option>
                    <option value="74-77">74-77</option>
                    <option value="77-80">77-80</option>
                    <option value="80-83">80-83</option>
                    <option value="83-86">83-86</option>
                    <option value="86-89">86-89</option>
                    <option value="89-90">89-90</option>
                  </select>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={closeAddTestModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.packages || !selectedDiagnostic || (!applyToAllStaff && selectedPackages.length === 0)}
                  className="px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50"
                >
                  {loading.packages ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>

            {selectedPackages.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">Selected Packages</h4>
                <div className="grid grid-cols-2 gap-4 max-h-40 overflow-y-auto pr-2">
                  {selectedPackages.map((pkgId) => {
                    const pkg = diagnosticsList
                      .find((d) => d._id === selectedDiagnostic)
                      ?.packages?.find((p) => p._id === pkgId);
                    if (!pkg) return null;
                    return (
                      <div
                        key={pkg._id}
                        className="p-2 bg-gray-100 rounded border"
                      >
                        <div className="font-medium mb-1">
                          {pkg.name} - ₹{pkg.offerPrice || pkg.price}
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {pkg.tests?.map((test, idx) => (
                            <li key={idx}>{test.test_name}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;