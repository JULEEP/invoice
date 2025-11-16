import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DoctorBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const baseURL = "https://api.credenthealth.com";
  const defaultDoctorImage = "https://tse1.mm.bing.net/th/id/OIP.RHv6Wp2QhSCU1nIrp9d9ZwHaEh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
  const blogsPerPage = 3;

  const fetchBlogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/api/doctor/blogs?page=${page}&limit=${blogsPerPage}`
      );

      setBlogs(response.data.blogs);
      setTotalBlogs(response.data.totalCount || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  const totalPages = Math.ceil(totalBlogs / blogsPerPage);

  if (loading) return <div className="text-center py-10">Loading blogs...</div>;

  return (
    <div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => {
          const blogImage = blog.image
            ? blog.image.startsWith('http')
              ? blog.image
              : `${baseURL}${blog.image}`
            : 'https://via.placeholder.com/400x200';

          const doctor = blog.doctor || {};
          const doctorImage = doctor.image
            ? doctor.image.startsWith('http')
              ? doctor.image
              : `${baseURL}${doctor.image}`
            : defaultDoctorImage;
          const doctorName = doctor.name || 'Unknown Doctor';
          const doctorSpecialization = doctor.specialization || '';

          return (
            <Link
              to={`/doctor/doctorblogs/${blog._id}`}
              key={blog._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={blogImage}
                alt={blog.title || 'Blog Image'}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x200';
                }}
              />
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{blog.title || 'Untitled Blog'}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  {blog.description
                    ? blog.description.length > 100
                      ? blog.description.substring(0, 100) + '...'
                      : blog.description
                    : 'No description available.'}
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
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 my-6">
          <button
            onClick={() => fetchBlogs(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 text-white'
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => fetchBlogs(pageNum)}
                className={`px-3 py-1 rounded ${
                  pageNum === currentPage ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => fetchBlogs(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorBlogs;