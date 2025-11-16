import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CreateLabTestPage = () => {
  const navigate = useNavigate();
  const diagnosticId = localStorage.getItem("diagnosticId");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    reportIn24Hrs: false,
    reportHour: "",
    instruction: "",
    fastingRequired: false,
    homeCollectionAvailable: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, price, description } = formData;

    if (!name || !price || !description || !diagnosticId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields",
      });
      return;
    }

    try {
      setLoading(true);
      
      await axios.post(
        `https://api.credenthealth.com/api/admin/testsdiagnostic/${diagnosticId}`,
        formData
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Lab test created successfully!",
      });

      navigate("/diagnostic/getlabtest");
    } catch (error) {
      console.error("Create Test Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-3xl mx-auto">
      <h3 className="text-lg font-bold mb-6">+ Add Test</h3>

      <form onSubmit={handleSubmit}>
        {/* Test Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Test Name*</label>
          <input
            type="text"
            name="name"
            className="p-2 border rounded w-full"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description*</label>
          <textarea
            name="description"
            className="p-2 border rounded w-full h-24"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* MRP */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">MRP*</label>
          <input
            type="number"
            name="price"
            className="p-2 border rounded w-full"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        {/* Report Options */}
        <div className="mb-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="reportIn24Hrs"
              checked={formData.reportIn24Hrs}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Report in 24 Hours
          </label>
          
          {!formData.reportIn24Hrs && (
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Report Time (hrs)</label>
              <input
                type="number"
                name="reportHour"
                placeholder="Enter hours (e.g. 48)"
                className="p-2 border rounded w-full"
                value={formData.reportHour}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea
            name="instruction"
            placeholder="Enter instructions"
            className="p-2 border rounded w-full h-24"
            value={formData.instruction}
            onChange={handleChange}
          />
        </div>

        {/* Checkboxes */}
        <div className="mb-6 flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="fastingRequired"
              checked={formData.fastingRequired}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Fasting Required
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="homeCollectionAvailable"
              checked={formData.homeCollectionAvailable}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Home Collection Available
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
            disabled={loading}
          >
            {loading ? "Creating..." : "Add Test"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLabTestPage;