import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileAlt } from "react-icons/fa";
import { BiCloudUpload } from "react-icons/bi";



const DoctorProfilePage = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorId = localStorage.getItem("doctorId");
        if (!doctorId) {
          alert("Doctor ID not found in localStorage");
          return;
        }

        const response = await axios.get(
          `https://api.credenthealth.com/api/admin/single-doctor/${doctorId}`
        );
        setDoctor(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleDocumentChange = (e) => {
    setDocumentFiles([...e.target.files]);
  };

  const handleOnlineSlotChange = (index, field, value) => {
    const updatedSlots = [...formData.onlineSlots];
    updatedSlots[index][field] = value;
    setFormData((prev) => ({ ...prev, onlineSlots: updatedSlots }));
  };

  const handleOfflineSlotChange = (index, field, value) => {
    const updatedSlots = [...formData.offlineSlots];
    updatedSlots[index][field] = value;
    setFormData((prev) => ({ ...prev, offlineSlots: updatedSlots }));
  };

  const handleUpdate = async () => {
    try {
      const doctorId = doctor._id;
      const form = new FormData();

      for (let key in formData) {
        if (key === "onlineSlots" || key === "offlineSlots") {
          form.append(key, JSON.stringify(formData[key]));
        } else {
          form.append(key, formData[key]);
        }
      }

      if (imageFile) {
        form.append("image", imageFile);
      }

      documentFiles.forEach((doc) => {
        form.append("documents", doc);
      });

      const res = await axios.put(
        `https://api.credenthealth.com/api/admin/update-doctor/${doctorId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile updated successfully!");
      setDoctor(res.data.doctor);
      setFormData(res.data.doctor);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Update failed.");
    }
  };

  if (loading)
    return <div className="p-4 text-center text-gray-600">Loading doctor details...</div>;
  if (!doctor)
    return <div className="p-4 text-center text-red-600">Doctor not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-900">Doctor Profile</h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Profile Info */}
        <div className="w-full md:w-1/3">
          {doctor.image && (
            <div className="mb-6">
              <img
                src={`https://api.credenthealth.com${doctor.image}`}
                alt="Doctor"
                className="max-w-xs w-full h-auto rounded border"
              />
              {isEditing && (
                <div className="mt-2">
                  <label className="text-xs text-gray-600">Upload New Image</label>
                 
  {/* Upload area */}
  <div
    onClick={() => document.getElementById("imageUpload").click()}
    className="flex items-center gap-2 border border-dashed border-green-500 rounded p-2 cursor-pointer hover:bg-green-50 w-fit"
  >
    <BiCloudUpload className="text-xl text-green-600" />
    <span className="text-sm text-green-700">
      {imageFile ? "Change Image" : "Click to Upload"}
    </span>
  </div>

  {/* Hidden file input */}
  <input
    id="imageUpload"
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files[0])}
    className="hidden"
  />

  {/* Show selected image name with remove */}
  {imageFile && (
    <div className="mt-2 flex justify-between items-center bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
      <span className="truncate max-w-[80%]">{imageFile.name}</span>
      <button
        onClick={() => setImageFile(null)}
        className="text-red-500 hover:text-red-700 text-xs"
      >
        Remove
      </button>
    </div>
  )}
</div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: "Name", name: "name" },
              { label: "Email", name: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Specialization", name: "specialization" },
              { label: "Qualification", name: "qualification" },
              { label: "Description", name: "description" },
              { label: "Consultation Fee", name: "consultation_fee" },
              { label: "Address", name: "address" },
              { label: "Category", name: "category" },
              { label: "Consultation Type", name: "consultation_type" },
            ].map(({ label, name, type = "text" }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {isEditing ? (
                  <input
                    type={type}
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                ) : (
                  <p className="text-gray-800">
                    {name === "consultation_type" && doctor[name] === "Both"
                      ? "Both (Online, Offline)"
                      : doctor[name]}
                  </p>
                )}
              </div>
            ))}

          </div>

          <div className="mt-6">
            {isEditing ? (
              <div className="flex flex-col gap-4">
  <div>
    <label className="text-sm text-gray-700 mb-1">Upload Documents</label>

    {/* Upload Icon as Button */}
    <div
      onClick={() => document.getElementById("documentUpload").click()}
      className="flex items-center gap-2 cursor-pointer border border-dashed border-green-500 rounded p-3 hover:bg-green-50 w-fit"
    >
      <BiCloudUpload className="text-2xl text-green-600" />
      <span className="text-sm text-green-700">Click to upload</span>
    </div>

    {/* Hidden File Input */}
    <input
      id="documentUpload"
      type="file"
      accept=".jpg,.jpeg,.png,.pdf"
      multiple
      onChange={(e) => {
        const files = Array.from(e.target.files);
        setDocumentFiles((prev) => [...prev, ...files]);
      }}
      className="hidden"
    />

    {/* List of Selected Files */}
    <ul className="mt-3 space-y-1 text-sm text-gray-700">
      {documentFiles.map((file, index) => (
        <li
          key={index}
          className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded"
        >
          <span className="truncate max-w-[80%]">{file.name}</span>
          <button
            onClick={() =>
              setDocumentFiles((prev) => prev.filter((_, i) => i !== index))
            }
            className="text-red-500 hover:text-red-700 text-xs"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  </div>



                <div className="flex gap-4">
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Slots and Documents */}
        <div className="w-full md:w-2/3 space-y-8">
          {/* Online Slots */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Online Consultation Slots
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.onlineSlots?.map((slot, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={slot.day}
                        onChange={(e) =>
                          handleOnlineSlotChange(index, "day", e.target.value)
                        }
                        className="mb-2 w-full border p-2 rounded text-sm"
                      />
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) =>
                          handleOnlineSlotChange(index, "date", e.target.value)
                        }
                        className="mb-2 w-full border p-2 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={slot.timeSlot}
                        onChange={(e) =>
                          handleOnlineSlotChange(index, "timeSlot", e.target.value)
                        }
                        className="w-full border p-2 rounded text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-blue-700">{slot.day}</h4>
                      <p className="text-sm text-gray-600">Date: {slot.date}</p>
                      <p className="text-sm">Time: {slot.timeSlot}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Offline Slots */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Offline Consultation Slots
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.offlineSlots?.map((slot, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={slot.day}
                        onChange={(e) =>
                          handleOfflineSlotChange(index, "day", e.target.value)
                        }
                        className="mb-2 w-full border p-2 rounded text-sm"
                      />
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) =>
                          handleOfflineSlotChange(index, "date", e.target.value)
                        }
                        className="mb-2 w-full border p-2 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={slot.timeSlot}
                        onChange={(e) =>
                          handleOfflineSlotChange(index, "timeSlot", e.target.value)
                        }
                        className="w-full border p-2 rounded text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-blue-700">{slot.day}</h4>
                      <p className="text-sm text-gray-600">Date: {slot.date}</p>
                      <p className="text-sm">Time: {slot.timeSlot}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blog Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Blogs</h3>
            <div className="space-y-4">
              {doctor.myBlogs?.map((blog, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start gap-4">
                    {blog.image && (
                      <img
                        src={
                          blog.image.startsWith("http")
                            ? blog.image
                            : `https://api.credenthealth.com${blog.image}`
                        }
                        alt="Blog"
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-lg">{blog.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{blog.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Posted on: {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Documents</h3>
            <div className="space-y-3">
              {doctor.documents?.length > 0 ? (
                doctor.documents.map((doc, idx) => (
                  <div key={idx}>
                    <a
                      key={idx}
                      href={`https://api.credenthealth.com${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title={`Document ${idx + 1}`}
                    >
                      <FaFileAlt size={28} />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No documents uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
