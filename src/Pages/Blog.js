import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const baseURL = "https://api.credenthealth.com";
  const defaultDoctorImage =
    "https://tse1.mm.bing.net/th/id/OIP.RHv6Wp2QhSCU1nIrp9d9ZwHaEh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/doctor/blogs`);
      if (response.data?.blogs) {
        setBlogs(response.data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setErrorMessage("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (blogId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${baseURL}/api/doctor/deleteblog/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
      setErrorMessage("Blog deleted successfully.");
      setTimeout(() => setErrorMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting blog:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to delete blog. Please try again."
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-lg font-medium text-gray-600">
        Loading blogs...
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No blogs available.
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => {
          const {
            _id,
            title = "Untitled Blog",
            description = "No description provided.",
            image,
            doctor, // might be undefined
          } = blog;

          const blogImage = image
            ? image.startsWith("http")
              ? image
              : `${baseURL}${image}`
            : "https://via.placeholder.com/600x300?text=No+Image";

          const hasDoctorImage =
            doctor && typeof doctor.image === "string" && doctor.image.trim() !== "";

          const doctorImage = hasDoctorImage
            ? doctor.image.startsWith("http")
              ? doctor.image
              : `${baseURL}${doctor.image}`
            : defaultDoctorImage;

          const doctorName = doctor?.name || "Admin";
          const doctorSpecialization =
            doctor?.specialization || "Specialization not listed";

          return (
            <div
              key={_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
            >
              <Link to={`/blogs/${_id}`}>
                <img
                  src={blogImage}
                  alt={title}
                  className="w-full h-48 object-cover bg-gray-100"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {description.length > 100
                      ? `${description.slice(0, 100)}...`
                      : description}
                  </p>

                  <div className="flex items-center mt-4">
                    <img
                      src={doctorImage}
                      alt={doctorName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-600"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultDoctorImage;
                      }}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-700">{doctorName}</p>
                      <p className="text-xs text-gray-500">{doctorSpecialization}</p>
                    </div>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => handleDelete(_id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                title="Delete Blog"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Blogs;
