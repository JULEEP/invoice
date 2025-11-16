import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FiUploadCloud, FiX, FiUser, FiCreditCard, FiHome } from "react-icons/fi";

const StaffDetailsForm = ({ companyId, closeModal }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "",
    contact_number: "",
    email: "",
    dob: "",
    gender: "",
    age: "",
    address: "",
    password: "",
    branch: "" // New branch field
  });
  const [profileImage, setProfileImage] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Fetch branches when component mounts
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in Name, Email and Password",
      });
      return;
    }

    // Show confirmation popup before submitting
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm Submission',
      text: 'Are you sure you want to create this user profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Proceed',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    // If user cancels, stop here
    if (!isConfirmed) {
      return;
    }

    // Proceed with form submission
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (profileImage) data.append("profileImage", profileImage);
    if (idImage) data.append("idImage", idImage);
  
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `https://api.credenthealth.com/api/admin/create-staff/${companyId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
  
      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Staff profile created successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          closeModal();
          navigate(`/stafflist?companyId=${companyId}`);
        });
      }
    } catch (error) {
      console.error("Error creating staff profile:", error);
      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.message || "Failed to create staff profile",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e, setImage) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const removeImage = (setImage) => {
    setImage(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">User Details</h3>
        <button
          onClick={closeModal}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Name*</label>
            <input
              name="name"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              name="role"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.role}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              name="department"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              name="contact_number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.contact_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              name="email"
              type="email"
              autoComplete="new-email"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              name="dob"
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              name="age"
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            name="address"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Branch Selection Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Branch</label>
          <div className="relative">
            <select
              name="branch"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
              value={formData.branch}
              onChange={handleChange}
              disabled={loadingBranches}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.branchName} - {branch.branchCode}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiHome className="text-gray-400" />
            </div>
          </div>
          {loadingBranches && (
            <p className="text-sm text-gray-500 mt-1">Loading branches...</p>
          )}
          {branches.length === 0 && !loadingBranches && (
            <p className="text-sm text-gray-500 mt-1">No branches available</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Profile Image</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {profileImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(setProfileImage)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
                  >
                    <FiX className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUser className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setProfileImage)}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ID Proof Image</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {idImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={URL.createObjectURL(idImage)}
                    alt="ID Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(setIdImage)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
                  >
                    <FiX className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiCreditCard className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setIdImage)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Password*</label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffDetailsForm;