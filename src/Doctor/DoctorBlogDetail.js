import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DoctorBlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = "https://api.credenthealth.com";
  const defaultBlogImage = "https://via.placeholder.com/800x400?text=Blog+Image";

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseURL}/api/doctor/blogs/${id}`);
      
      if (!response.data.blog) {
        throw new Error('Blog data not found');
      }
      
      setBlog(response.data.blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading blog...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!blog) return <div className="text-center py-10">Blog not found</div>;

  // Construct proper image URL
  const blogImage = blog.image 
    ? blog.image.startsWith('http')
      ? blog.image
      : `${baseURL}${blog.image}`
    : defaultBlogImage;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title || 'Untitled Blog'}</h1>
      
      <img
        src={blogImage}
        alt={blog.title || 'Blog Image'}
        className="w-full h-64 object-cover mb-4 rounded-lg shadow-md"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultBlogImage;
        }}
      />
      
      <p className="text-gray-600 text-lg mb-6">
        {blog.description || 'No description available.'}
      </p>
      
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
      
      {/* Doctor information if available */}
      {blog.doctor && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src={blog.doctor.image 
                ? blog.doctor.image.startsWith('http')
                  ? blog.doctor.image
                  : `${baseURL}${blog.doctor.image}`
                : 'https://via.placeholder.com/100?text=Doctor'}
              alt={blog.doctor.name || 'Doctor'}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-600"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/100?text=Doctor';
              }}
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {blog.doctor.name || 'Unknown Doctor'}
              </h3>
              <p className="text-sm text-gray-600">
                {blog.doctor.specialization || 'General Practitioner'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorBlogDetail;