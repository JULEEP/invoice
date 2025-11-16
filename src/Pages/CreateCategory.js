import React, { useState, useRef } from "react";
import axios from "axios";
import { BiCloudUpload } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const CreateCategory = ({ closeModal }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("normal"); // default type
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();


  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCancel = () => {
    setCategoryName("");
    setCategoryType("normal");
    setImage(null);
    setMessage("");
    if (closeModal) closeModal();
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!categoryName.trim()) {
    setMessage("Category name is required");
    return;
  }

  if (categoryType === "normal" && !image) {
    setMessage("Image is required for normal category");
    return;
  }

  const formData = new FormData();
  formData.append("name", categoryName);
  formData.append("type", categoryType);
  if (image && categoryType === "normal") {
    formData.append("image", image);
  }

  try {
    setLoading(true);
    const response = await axios.post(
      "https://api.credenthealth.com/api/admin/create-category",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setMessage(response.data.message || "Category created successfully!");
    setCategoryName("");
    setCategoryType("normal");
    setImage(null);

    // Redirect to doctorcategorylist after creation
    navigate("/doctorcategorylist");

  } catch (error) {
    console.error("Create category error:", error);
    setMessage("Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center my-12 bg-gray-100 min-h-[calc(100vh-100px)] px-4">
      <div className="p-6 bg-white rounded shadow w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-[#188753] text-center">Create Category</h3>

        {message && (
          <div className="mb-4 text-sm text-center text-red-600 font-medium">
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

          <div>
            <label className="block text-sm font-medium mb-1">Category Type</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-green-500"
            >
              <option value="normal">Normal</option>
              <option value="special">Special</option>
            </select>
          </div>

          {categoryType === "normal" && (
            <div>
              <label className="block text-sm font-medium mb-1">Upload Image</label>
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
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded hover:bg-red-200"
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
      </div>
    </div>
  );
};

export default CreateCategory;
