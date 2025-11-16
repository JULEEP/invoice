import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Settings = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`https://api.credenthealth.com/api/admin/getadmin/${adminId}`);
        setAdmin(res.data.admin);
        setFormData({
          name: res.data.admin.name,
          email: res.data.admin.email,
          password: res.data.admin.password
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (adminId) fetchAdmin();
    else setLoading(false);
  }, [adminId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/updateadmin/${adminId}`,
        formData
      );
      setAdmin(res.data.admin);
      setModalOpen(false); // Close modal after update
    } catch (err) {
      console.error('Error updating admin:', err);
      alert('Failed to update admin details.');
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!admin) return <div className="p-4 text-red-600">Admin not found or not logged in.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Admin ID</label>
          <input type="text" value={admin._id} disabled className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={admin.name} disabled className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input type="email" value={admin.email} disabled className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
          <input type="text" value={admin.role} disabled className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
          <input type="text" value={new Date(admin.createdAt).toLocaleString()} disabled className="w-full p-2 border rounded bg-gray-100" />
        </div>
      </div>

      <button
        onClick={openModal}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Edit
      </button>

      {/* Modal for editing */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-full md:w-96">
            <h2 className="text-xl font-bold mb-4">Edit Admin</h2>

            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
