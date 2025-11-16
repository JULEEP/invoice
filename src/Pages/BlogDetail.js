import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseURL = "https://api.credenthealth.com";
  const defaultBlogImage = "https://via.placeholder.com/800x400?text=No+Image";

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/doctor/blogs/${id}`);
      setBlog(response.data.blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading blog...</div>;
  if (!blog) return <div className="text-center py-10 text-red-600">Blog not found.</div>;

  // Prepare blog image URL
  const blogImage =
    blog.image?.startsWith("http")
      ? blog.image
      : blog.image
      ? `${baseURL}${blog.image}`
      : defaultBlogImage;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>
      <img
        src={blogImage}
        alt={blog.title}
        className="w-full h-64 object-cover mb-4 rounded"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultBlogImage;
        }}
      />
      <p className="text-gray-600 text-sm mb-4">{blog.description}</p>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
};

export default BlogDetail;
