import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUploadCloud } from "react-icons/fi";

const DoctorDetailsForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
    specialization: "",
    qualification: "",
    description: "",
    consultation_fee: "",
    address: "",
    consultation_type: "",
    onlineSlots: [],
    offlineSlots: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [specialCategories, setSpecialCategories] = useState([]);
  const [mergedCategories, setMergedCategories] = useState([]);

  useEffect(() => {
    // Fetch regular categories
    axios.get('https://api.credenthealth.com/api/admin/getallcategory')
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => {
        console.error('Error loading categories', err);
      });

    // Fetch special categories
    axios.get('https://api.credenthealth.com/api/admin/getspecialcategory')
      .then(res => {
        setSpecialCategories(res.data);
      })
      .catch(err => {
        console.error('Error loading special categories', err);
      });
  }, []);

  // Merge categories when either changes
  useEffect(() => {
    setMergedCategories([...categories, ...specialCategories]);
  }, [categories, specialCategories]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleDocumentChange = (e) => {
    setDocumentFiles([...e.target.files]);
  };

  const handleAddSlot = (type) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Slots`]: [
        ...prev[`${type}Slots`],
        { day: "", date: "", timeSlot: "" }
      ]
    }));
  };

  const handleRemoveSlot = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Slots`]: prev[`${type}Slots`].filter((_, i) => i !== index)
    }));
  };

  const handleSlotChange = (type, index, field, value) => {
    setFormData(prev => {
      const updatedSlots = [...prev[`${type}Slots`]];
      updatedSlots[index] = {
        ...updatedSlots[index],
        [field]: value
      };
      return {
        ...prev,
        [`${type}Slots`]: updatedSlots
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

   Object.keys(formData).forEach(key => {
  if ((key === 'onlineSlots' || key === 'offlineSlots') && formData[key].length > 0) {
    data.append(key, JSON.stringify(formData[key]));
  } else if (key !== 'onlineSlots' && key !== 'offlineSlots') {
    data.append(key, formData[key]);
  }
});


    if (imageFile) {
      data.append("image", imageFile);
    }

    documentFiles.forEach((file, index) => {
      data.append(`documents`, file);
    });

    try {
      const res = await axios.post(
        "https://api.credenthealth.com/api/admin/create-doctor",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Doctor created successfully!");
      navigate("/doctorlist");
    } catch (err) {
      console.error("Error creating doctor:", err);
      alert("Failed to create doctor. " + (err.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-screen-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Doctor Details Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <label className="text-sm">Name</label>
            <input
              className="p-2 border rounded w-full"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="w-1/3">
            <label className="text-sm">Email</label>
            <input
              type="email"
              autoComplete="off"
              name="email"
              className="p-2 border rounded w-full"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="w-1/3">
            <label className="text-sm">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              name="password"
              className="p-2 border rounded w-full"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Professional Details */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <label className="text-sm">Category</label>
            <select
              name="category"
              required
              className="p-2 border rounded w-full"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {mergedCategories.map(cat => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-1/3">
            <label className="text-sm">Specialization</label>
            <input
              className="p-2 border rounded w-full"
              required
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>
          <div className="w-1/3">
            <label className="text-sm">Qualification</label>
            <input
              className="p-2 border rounded w-full"
              required
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Consultation Type */}
        <div className="mb-4">
          <label className="text-sm">Consultation Type</label>
          <select
            className="p-2 border rounded w-full"
            required
            name="consultation_type"
            value={formData.consultation_type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="Online">Online (Chat & Video Call)</option>
            <option value="Offline">Offline</option>
            <option value="Both">Both</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-sm">Description</label>
          <textarea
            className="p-2 border rounded w-full"
            rows={3}
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Fee, Address */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/4">
            <label className="text-sm">Consultation Fee</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              required
              name="consultation_fee"
              value={formData.consultation_fee}
              onChange={handleChange}
            />
          </div>
          <div className="w-2/4">
            <label className="text-sm">Clinic Address</label>
            <input
              className="p-2 border rounded w-full"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="text-sm">Upload Doctor Profile Image</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUploadCloud className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                {imageFile ? imageFile.name : "Click to upload"}
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="mt-2 border rounded"
              style={{ height: "80px" }}
            />
          )}
        </div>

        {/* Documents Upload */}
        <div className="mb-4">
          <label className="text-sm">Upload Documents (Max 5)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUploadCloud className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                {documentFiles.length > 0
                  ? `${documentFiles.length} file(s) selected`
                  : "Click to upload documents"}
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleDocumentChange}
              className="hidden"
            />
          </label>
          {documentFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm">Selected files:</p>
              <ul className="text-sm text-gray-600">
                {documentFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Online Slots */}
        {(formData.consultation_type === "Online" || formData.consultation_type === "Both") && (
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Online Consultation Slots</label>
            <button
              type="button"
              onClick={() => handleAddSlot("online")}
              className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Add Online Slot
            </button>

            {formData.onlineSlots.map((slot, index) => (
              <div key={`online-${index}`} className="border p-4 rounded mb-4 bg-gray-50">
                <div className="flex gap-4 mb-2">
                  <div className="w-1/3">
                    <label className="text-sm">Day</label>
                    <select
                      className="p-2 border rounded w-full"
                      value={slot.day}
                      onChange={(e) => handleSlotChange("online", index, "day", e.target.value)}
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
                  </div>

                  <div className="w-1/3">
                    <label className="text-sm">Date</label>
                    <input
                      type="date"
                      className="p-2 border rounded w-full"
                      value={slot.date}
                      onChange={(e) => handleSlotChange("online", index, "date", e.target.value)}
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-sm">Time Slot</label>
                    <input
                      type="time"
                      className="p-2 border rounded w-full"
                      value={slot.timeSlot}
                      onChange={(e) => handleSlotChange("online", index, "timeSlot", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => handleRemoveSlot("online", index)}
                  >
                    Remove Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Offline Slots */}
        {(formData.consultation_type === "Offline" || formData.consultation_type === "Both") && (
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Offline Consultation Slots</label>
            <button
              type="button"
              onClick={() => handleAddSlot("offline")}
              className="mb-2 px-4 py-2 bg-green-600 text-white rounded"
            >
              + Add Offline Slot
            </button>

            {formData.offlineSlots.map((slot, index) => (
              <div key={`offline-${index}`} className="border p-4 rounded mb-4 bg-gray-50">
                <div className="flex gap-4 mb-2">
                  <div className="w-1/3">
                    <label className="text-sm">Day</label>
                    <input
                      className="p-2 border rounded w-full"
                      placeholder="e.g., Monday"
                      value={slot.day}
                      onChange={(e) => handleSlotChange("offline", index, "day", e.target.value)}
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-sm">Date</label>
                    <input
                      type="date"
                      className="p-2 border rounded w-full"
                      value={slot.date}
                      onChange={(e) => handleSlotChange("offline", index, "date", e.target.value)}
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-sm">Time Slot</label>
                    <input
                      type="time"
                      className="p-2 border rounded w-full"
                      value={slot.timeSlot}
                      onChange={(e) => handleSlotChange("offline", index, "timeSlot", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => handleRemoveSlot("offline", index)}
                  >
                    Remove Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/create-doctor")}
            className="px-4 py-2 bg-gray-200 text-red-700 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorDetailsForm;