import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TABS = ['Basic Info', 'Online Slots', 'Offline Slots', 'Other Info', 'Blogs', 'Documents'];

const SingleDoctorDetails = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newSlot, setNewSlot] = useState({ day: '', date: '', timeSlot: '' });
  const [editingSlot, setEditingSlot] = useState({ index: -1, type: '' });
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [changedFields, setChangedFields] = useState({});

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = () => {
    axios.get(`https://api.credenthealth.com/api/admin/single-doctor/${doctorId}`)
      .then(res => {
        setDoctor(res.data);
        setFormData(res.data);
        setChangedFields({});
        setEditingSlot({ index: -1, type: '' });
      })
      .catch(err => console.error('Error fetching doctor:', err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setChangedFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSlotInputChange = (e) => {
    const { name, value } = e.target;
    setNewSlot(prev => ({ ...prev, [name]: value }));
  };

  const handleBlogInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://api.credenthealth.com/api/admin/update-doctors/${doctorId}`,
        changedFields
      );
      setEditMode(false);
      fetchDoctor();
      alert('Doctor details updated successfully!');
    } catch (err) {
      console.error('Error updating doctor:', err);
      alert('Failed to update doctor details');
    }
  };

  const handleEditSlot = async (type, index) => {
    try {
      const slotsKey = `${type}Slots`;
      const slots = [...formData[slotsKey]];

      // Update the selected slot
      slots[index] = newSlot;

      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append(slotsKey, JSON.stringify(slots));

      // Make PUT request with multipart/form-data
      await axios.put(
        `https://api.credenthealth.com/api/admin/update-doctors/${doctorId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Reset state
      setEditingSlot({ index: -1, type: '' });
      setNewSlot({ day: '', date: '', timeSlot: '' });
      fetchDoctor();
      alert('Slot updated successfully!');
    } catch (err) {
      console.error('Error updating slot:', err);
      alert('Failed to update slot');
    }
  };

  const handleDeleteSlot = async (type, index) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        const slotToDelete = type === 'online' ? formData.onlineSlots[index] : formData.offlineSlots[index];

        const payload = {
          slotType: type, // 'online' or 'offline'
          day: slotToDelete.day,
          date: slotToDelete.date,
          timeSlot: slotToDelete.timeSlot
        };

        await axios.put(
          `https://api.credenthealth.com/api/admin/delete-slot/${doctorId}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        fetchDoctor();  // Refresh doctor data after deletion
        alert('Slot deleted successfully!');
      } catch (err) {
        console.error('Error deleting slot:', err);
        alert('Failed to delete slot');
      }
    }
  };



  const addSlot = async (type) => {
    try {
      const payload = {
        slotType: type,
        day: newSlot.day,
        date: newSlot.date,
        timeSlot: newSlot.timeSlot,
        isBooked: newSlot.isBooked || false, // optional
      };

      await axios.put(
        `https://api.credenthealth.com/api/admin/add-slot/${doctorId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      setNewSlot({ day: '', date: '', timeSlot: '' });
      setEditingSlot({ index: -1, type: '' });
      fetchDoctor();
      alert(editingSlot.index >= 0 ? 'Slot updated successfully!' : 'Slot added successfully!');
    } catch (err) {
      console.error('Error saving slot:', err);
      alert('Failed to save slot');
    }
  };



  const addBlog = async () => {
    try {
      const updatedBlogs = [...formData.myBlogs, newBlog];
      await axios.put(
        `https://api.credenthealth.com/api/admin/update-doctors/${doctorId}`,
        { myBlogs: updatedBlogs }
      );
      setNewBlog({ title: '', content: '' });
      fetchDoctor();
      alert('Blog added successfully!');
    } catch (err) {
      console.error('Error adding blog:', err);
      alert('Failed to add blog');
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    const uploadData = new FormData();
    uploadData.append('document', selectedFile);
    uploadData.append('action', 'add_document');

    try {
      await axios.put(
        `https://api.credenthealth.com/api/admin/update-doctors/${doctorId}`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSelectedFile(null);
      fetchDoctor();
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document');
    }
  };

  if (!doctor) return <p className="p-4">Loading doctor details…</p>;

  const {
    name, specialization, qualification, category,
    consultation_fee, address, email, description, consultation_type,
    image, onlineSlots = [], offlineSlots = [],
    myBlogs = [], documents = []
  } = doctor;


  const convertTo12Hour = (time24) => {
    const [hour, minute] = time24.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };


  return (
    <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-900">{name}</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {editMode ? 'Cancel Edit' : 'Edit Doctor'}
        </button>
      </div>

      <div className="flex border-b mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 mr-2 ${activeTab === tab
              ? 'border-b-2 border-purple-700 font-semibold'
              : 'text-gray-600'
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Basic Info' && (
        <div>
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consultation Fee</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={formData.consultation_fee || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <table className="w-full text-sm border mb-4">
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="p-2 font-medium border">Specialization</td>
                    <td className="p-2 border">{specialization}</td>
                    <td className="p-2 font-medium border">Qualification</td>
                    <td className="p-2 border">{qualification}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium border">Category</td>
                    <td className="p-2 border">{category}</td>
                    <td className="p-2 font-medium border">Consultation Fee</td>
                    <td className="p-2 border">₹{consultation_fee}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="p-2 font-medium border">Consultation Type</td>
                    <td className="p-2 border">{consultation_type}</td>
                    <td className="p-2 font-medium border">Email</td>
                    <td className="p-2 border">{email}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium border">Address</td>
                    <td className="p-2 border" colSpan="3">{address}</td>
                  </tr>
                </tbody>
              </table>
              {image ? (
                <img
                  src={`https://api.credenthealth.com${image}`}
                  alt={name}
                  className="w-32 h-32 object-cover border rounded"
                />
              ) : (
                <p>No image available</p>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'Online Slots' && (
        <div>
          {editMode && (
            <div className="mb-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-2">
                {editingSlot.index >= 0 ? 'Edit Online Slot' : 'Add New Online Slot'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <select
                  name="day"
                  value={newSlot.day}
                  onChange={handleSlotInputChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Day</option>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="date"
                  name="date"
                  value={newSlot.date}
                  onChange={handleSlotInputChange}
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  name="timeSlot"
                  value={newSlot.timeSlot}
                  onChange={handleSlotInputChange}
                  className="p-2 border rounded"
                />


              </div>
              <button
                onClick={() => {
                  if (editingSlot.index >= 0 && editingSlot.type === 'online') {
                    handleEditSlot('online', editingSlot.index);
                  } else {
                    addSlot('online');
                  }
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editingSlot.index >= 0 ? 'Update Slot' : 'Add Slot'}
              </button>
              {editingSlot.index >= 0 && (
                <button
                  onClick={() => {
                    setEditingSlot({ index: -1, type: '' });
                    setNewSlot({ day: '', date: '', timeSlot: '' });
                  }}
                  className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {onlineSlots.length ? (
            <table className="w-full table-auto border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Day</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time Slot</th>
                  <th className="p-2 border">Status</th>
                  {editMode && <th className="p-2 border">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {onlineSlots.map((slot, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{slot.day}</td>
                    <td className="p-2 border">{slot.date}</td>
                    <td className="p-2 border">{slot.timeSlot}</td>
                    <td className="p-2 border">
                      {slot.isBooked ? (
                        <span className="text-red-600">Booked</span>
                      ) : (
                        <span className="text-green-600">Available</span>
                      )}
                    </td>
                    {editMode && (
                      <td className="p-2 border">
                        <button
                          onClick={() => {
                            setEditingSlot({ index: idx, type: 'online' });
                            setNewSlot(onlineSlots[idx]);
                          }}
                          className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlot('online', idx)}
                          className="px-2 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="italic text-gray-600">No online slots available</p>
          )}
        </div>
      )}

      {activeTab === 'Offline Slots' && (
        <div>
          {editMode && (
            <div className="mb-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-2">
                {editingSlot.index >= 0 ? 'Edit Offline Slot' : 'Add New Offline Slot'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <select
                  name="day"
                  value={newSlot.day}
                  onChange={handleSlotInputChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Day</option>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="date"
                  name="date"
                  value={newSlot.date}
                  onChange={handleSlotInputChange}
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  name="timeSlot"
                  value={newSlot.timeSlot}
                  onChange={handleSlotInputChange}
                  className="p-2 border rounded"
                />

              </div>
              <button
                onClick={() => {
                  if (editingSlot.index >= 0 && editingSlot.type === 'offline') {
                    handleEditSlot('offline', editingSlot.index);
                  } else {
                    addSlot('offline');
                  }
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editingSlot.index >= 0 ? 'Update Slot' : 'Add Slot'}
              </button>
              {editingSlot.index >= 0 && (
                <button
                  onClick={() => {
                    setEditingSlot({ index: -1, type: '' });
                    setNewSlot({ day: '', date: '', timeSlot: '' });
                  }}
                  className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {offlineSlots.length ? (
            <table className="w-full table-auto border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Day</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time Slot</th>
                  <th className="p-2 border">Status</th>
                  {editMode && <th className="p-2 border">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {offlineSlots.map((slot, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{slot.day}</td>
                    <td className="p-2 border">{slot.date}</td>
                    <td className="p-2 border">{slot.timeSlot}</td>
                    <td className="p-2 border">
                      {slot.isBooked ? (
                        <span className="text-red-600">Booked</span>
                      ) : (
                        <span className="text-green-600">Available</span>
                      )}
                    </td>
                    {editMode && (
                      <td className="p-2 border">
                        <button
                          onClick={() => {
                            setEditingSlot({ index: idx, type: 'offline' });
                            setNewSlot(offlineSlots[idx]);
                          }}
                          className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlot('offline', idx)}
                          className="px-2 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="italic text-gray-600">No offline slots available</p>
          )}
        </div>
      )}

      {activeTab === 'Other Info' && (
        <div>
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="5"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm">{description || 'No description provided'}</p>
            </>
          )}
        </div>
      )}

      {activeTab === 'Blogs' && (
        <div>
          {editMode && (
            <div className="mb-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-2">Add New Blog</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={newBlog.title}
                  onChange={handleBlogInputChange}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name="content"
                  placeholder="Content"
                  value={newBlog.content}
                  onChange={handleBlogInputChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                />
              </div>
              <button
                onClick={addBlog}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add Blog
              </button>
            </div>
          )}
          {myBlogs.length ? (
            <ul className="space-y-2">
              {myBlogs.map((blog, idx) => (
                <li key={idx} className="p-2 border rounded hover:bg-gray-50">
                  <h4 className="font-semibold">{blog.title}</h4>
                  <p className="text-sm">{blog.summary || blog.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-600">No blogs available</p>
          )}
        </div>
      )}

      {activeTab === 'Documents' && (
        <div>
          {editMode && (
            <div className="mb-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-2">Upload New Document</h3>
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-2"
              />
              <button
                onClick={uploadDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Upload
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {documents.length ? (
              documents.map((doc, idx) => (
                <div key={idx} className="border rounded p-2">
                  <img
                    src={`https://api.credenthealth.com${doc}`}
                    alt={`Document ${idx + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))
            ) : (
              <p className="italic text-gray-600">No documents uploaded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDoctorDetails;