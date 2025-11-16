import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BiCloudUpload } from "react-icons/bi";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [newBannerName, setNewBannerName] = useState("");

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      const response = await axios.get("https://api.credenthealth.com/api/admin/getbanners");
      if (response.data && response.data.imageUrls) {
        const formattedBanners = response.data.imageUrls.map((banner) => ({
          _id: banner._id, // Using the provided _id from the API response
          imageUrls: banner.imageUrls.map((imageUrl) => imageUrl.replace(/\\/g, "/")), // Replacing backslashes with forward slashes
        }));
        setBanners(formattedBanners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image change (when images are selected to upload)
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages([...e.target.files]);
    }
  };

  // Handle form submission to upload images
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (images.length === 0) {
      setMessage("At least one banner image is required");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      images.forEach((file) => formData.append("bannerImages", file));

      const response = await axios.post(
        "https://api.credenthealth.com/api/admin/uploadbanner",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message || "Banner created successfully!");
      setImages([]);
      setTimeout(() => {
        fetchBanners();
      }, 1500);
    } catch (error) {
      console.error("Error creating banner:", error);
      setMessage("Failed to create banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle banner deletion
  const handleDelete = async (bannerId) => {
    if (!bannerId) {
      console.error("Invalid banner ID");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this banner?");
    if (!confirmed) return;

    try {
      const response = await axios.delete(`https://api.credenthealth.com/api/admin/delete-banner/${bannerId}`);
      alert(response.data.message || "Banner deleted successfully!");
      setTimeout(() => {
        fetchBanners();
      }, 1500);
    } catch (error) {
      console.error("Error deleting banner:", error);
      setMessage("Failed to delete banner. Please try again.");
    }
  };

  // Handle banner update
  const handleUpdate = async () => {
    if (!newBannerName || !selectedBannerId) return;

    try {
      const response = await axios.put(
        `https://api.credenthealth.com/api/admin/update-banner/${selectedBannerId}`,
        { hraName: newBannerName }
      );
      alert(response.data.message || "Banner updated successfully!");
      setTimeout(() => {
        fetchBanners();
      }, 1500);
    } catch (error) {
      console.error("Error updating banner:", error);
      setMessage("Failed to update banner. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center my-12 bg-gray-100 min-h-[calc(100vh-100px)] px-4">
      <div className="flex space-x-8 w-full">
        {/* Create Banner Section */}
        <div className="w-1/2 p-6 bg-white rounded shadow">
          <h3 className="text-lg font-bold mb-4 text-[#188753] text-center">Create Banner</h3>
          {message && (
            <div
              className={`mb-4 text-sm text-center font-medium ${
                message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Images</label>
              <div
                className="w-full border border-dashed border-gray-400 p-4 rounded flex flex-col items-center justify-center cursor-pointer hover:border-green-500"
                onClick={() => fileInputRef.current.click()}
              >
                <BiCloudUpload className="text-4xl text-gray-600 mb-2" />
                <p className="text-sm text-gray-600">Click to upload images</p>
                {images.length > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-semibold">
                    {images.length} image(s) selected
                  </p>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setImages([])}
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
        </div>

        {/* Banner List Section */}
        <div className="w-1/2 p-6 bg-white rounded shadow">
          <h3 className="text-lg font-bold mb-4 text-[#188753] text-center">Banner List</h3>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Images</th>
                <th className="border-b p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, index) => (
                <tr key={index}>
                  <td className="border-b p-2">
                    {banner.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={`https://api.credenthealth.com/${url}`}  // Corrected URL for images
                        alt={`banner-${i}`}
                        className="w-32 h-32 object-cover mb-2"
                      />
                    ))}
                  </td>
                  <td className="border-b p-2">
                    <FaEdit
                      className="text-blue-500 cursor-pointer"
                      onClick={() => {
                        setSelectedBannerId(banner._id);
                        setShowUpdateModal(true);
                      }}
                    />
                    <FaTrashAlt
                      className="ml-4 text-red-500 cursor-pointer"
                      onClick={() => handleDelete(banner._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-1/3">
            <h3 className="text-lg font-bold text-[#188753] mb-4">Update Banner</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Name</label>
                <input
                  type="text"
                  value={newBannerName}
                  onChange={(e) => setNewBannerName(e.target.value)}
                  placeholder="Enter new banner name"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded hover:bg-red-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#188753] border border-green-700 rounded hover:bg-green-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerPage;
