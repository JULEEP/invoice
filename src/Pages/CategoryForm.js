import React, { useState, useRef } from "react";
import axios from "axios";
import { BiCloudUpload } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const CategoryForm = ({ closeModal }) => {
  const [categoryName, setCategoryName] = useState("");
  const [prescribed, setPrescribed] = useState(""); // ✅ New state for prescribed
  const [gender, setGender] = useState(""); // ✅ New state for gender
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleCancel = () => {
    setCategoryName("");
    setPrescribed(""); // Reset prescribed
    setGender(""); // Reset gender
    setImage(null);
    setMessage("");
    if (closeModal) closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!categoryName.trim()) {
      setMessage("Category name is required");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("hraName", categoryName);
      formData.append("prescribed", prescribed); // Add prescribed to formData
      formData.append("gender", gender); // Add gender to formData
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(
        "https://api.credenthealth.com/api/admin/hra-category",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message || "Category created successfully!");
      setCategoryName("");
      setPrescribed(""); // Clear prescribed after success
      setGender(""); // Clear gender after success
      setImage(null);

      setTimeout(() => {
        if (closeModal) closeModal();
        navigate("/categorylist");
      }, 1500);
    } catch (error) {
      console.error("Error creating category:", error);
      setMessage("Failed to create category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-12 bg-gray-100 min-h-[calc(100vh-100px)] px-4">
      <div className="p-6 bg-white rounded shadow w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-[#188753] text-center">
          Create HRA Category
        </h3>

        {message && (
          <div
            className={`mb-4 text-sm text-center font-medium ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-green-500"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>

          {/* ✅ Prescribed Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Prescribed</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-green-500"
              value={prescribed}
              onChange={(e) => setPrescribed(e.target.value)}
            />
          </div>

          {/* ✅ Gender Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-green-500"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Image (optional)</label>
            <div
              className="w-full border border-dashed border-gray-400 p-4 rounded flex flex-col items-center justify-center cursor-pointer hover:border-green-500"
              onClick={() => fileInputRef.current.click()}
            >
              <BiCloudUpload className="text-4xl text-gray-600 mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
              {image && (
                <p className="mt-2 text-sm text-green-600 font-semibold">
                  {image.name}
                </p>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded hover:bg-red-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-[#188753] border border-green-700 rounded hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {/* ✅ Note about 8 categories limit */}
        <div className="mt-4 text-sm text-center text-gray-500">
          <p>Note: You can only add a maximum of 8 categories.</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
