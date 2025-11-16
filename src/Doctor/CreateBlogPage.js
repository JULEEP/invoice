import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CreateBlogPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

  // Ref for hidden file input
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in Title and Description",
      });
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/doctor/create-blog/${doctorId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Blog created successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      navigate("/doctor/doctorblogs");
    } catch (error) {
      console.error("❌ Error creating blog:", error);
      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.message || "Error creating blog.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-xl mx-auto">
      <h3 className="text-lg font-bold mb-4">Create a New Blog</h3>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Blog Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="p-2 border rounded w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Blog Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="p-2 border rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Cloud Upload Icon + Hidden File Input */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Image (Optional)</label>

          <div
            onClick={handleFileClick}
            className="cursor-pointer inline-flex items-center justify-center border border-dashed border-gray-400 rounded p-6 text-gray-600 hover:text-purple-600 hover:border-purple-600 transition-colors"
            style={{ width: 120, height: 120 }}
            title="Click to upload image"
          >
            {/* Simple Cloud Upload SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 014-4h1a4 4 0 014-4 4 4 0 014 4h1a4 4 0 014 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Selected"
              className="mt-2 rounded border"
              style={{ height: "80px", width: "auto" }}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 text-blue-700 bg-blue-100 border border-blue-600 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;
