import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";

const CreateXrayPage = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [preparation, setPreparation] = useState("");
  const [reportTime, setReportTime] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !preparation || !reportTime || !image) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields",
      });
      return;
    }

    const diagnosticId = localStorage.getItem("diagnosticId"); // get diagnosticId from localStorage

    if (!diagnosticId) {
      Swal.fire({
        icon: "error",
        title: "No Diagnostic Selected",
        text: "Diagnostic ID not found. Please select a diagnostic first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("preparation", preparation);
    formData.append("reportTime", reportTime);
    formData.append("image", image);

    try {
      setLoading(true);

      await axios.post(
        `https://api.credenthealth.com/api/admin/create-diagxray/${diagnosticId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "X-ray created successfully!",
      });

      navigate("/diagnostic/getscanxray");
    } catch (error) {
      console.error("Error creating X-ray:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to create X-ray.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
        Create a New X-ray
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Price Row */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1 text-gray-600">X-ray Title</label>
            <input
              type="text"
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the X-ray title"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1 text-gray-600">MRP (₹)</label>
            <input
              type="number"
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter the MRP"
              required
            />
          </div>
        </div>

        {/* Report Time */}
        <div>
          <label className="block text-sm mb-1 text-gray-600">Report Time</label>
          <input
            type="text"
            className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={reportTime}
            onChange={(e) => setReportTime(e.target.value)}
            placeholder="E.g. Within 24 hours"
            required
          />
        </div>

        {/* Preparation */}
        <div>
          <label className="block text-sm mb-1 text-gray-600">Preparation</label>
          <textarea
            className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={preparation}
            onChange={(e) => setPreparation(e.target.value)}
            placeholder="Enter the preparation instructions"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">X-ray Image</label>
          <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleImageChange}
              required
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex items-center gap-2 text-blue-600 text-sm"
            >
              <FaUpload className="text-xl" /> Upload X-ray Image
            </label>
            {image && <span className="text-sm text-gray-500">{image.name}</span>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create X-ray"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateXrayPage;
