import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload, FaTimes } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";

const API_BASE = "https://api.credenthealth.com/api/admin";

const DoctorCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [specialSearch, setSpecialSearch] = useState("");
  const [specialCategories, setSpecialCategories] = useState([]);

  // Pagination for main category
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination for special category
  const [specialCurrentPage, setSpecialCurrentPage] = useState(1);
  const specialItemsPerPage = 5;

  // Edit modal state
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchSpecialCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get(`${API_BASE}/getallcategory`)
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  };

  const fetchSpecialCategories = () => {
    axios
      .get(`${API_BASE}/getspecialcategory`)
      .then((res) => {
        setSpecialCategories(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching special categories:", err);
      });
  };

  // Filtered categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered special categories based on special search
  const filteredSpecialCategories = specialCategories.filter((cat) =>
    cat.name.toLowerCase().includes(specialSearch.toLowerCase())
  );

  // Split into normal and special
  const normalCategories = filteredCategories.filter(
    (cat) => cat.image && cat.image.trim() !== ""
  );

  // Pagination for main categories
  const totalPages = Math.ceil(normalCategories.length / itemsPerPage);
  const paginatedCategories = normalCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination for special categories
  const specialTotalPages = Math.ceil(filteredSpecialCategories.length / specialItemsPerPage);
  const paginatedSpecialCategories = filteredSpecialCategories.slice(
    (specialCurrentPage - 1) * specialItemsPerPage,
    specialCurrentPage * specialItemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToSpecialPage = (page) => {
    if (page >= 1 && page <= specialTotalPages) setSpecialCurrentPage(page);
  };

  const handleBulkImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Step 1: Create FormData and append file
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      "https://api.credenthealth.com/api/admin/bulk-upload-categories-csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    if (res.status === 201) {
      alert("Categories uploaded successfully!");
      console.log("Uploaded Categories:", res.data.categories);
    } else {
      alert("Upload failed. Please try again.");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Something went wrong during category upload.");
  }
};

  const handleEdit = (cat) => {
    setEditCategory(cat);
    setEditName(cat.name);
    setEditImage(null);
    setEditMessage("");
  };

  const closeEditModal = () => {
    setEditCategory(null);
    setEditName("");
    setEditImage(null);
    setEditMessage("");
    setEditLoading(false);
  };

  const handleEditImageChange = (e) => {
    setEditImage(e.target.files[0]);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditMessage("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", editName);
    if (editImage) formData.append("image", editImage);

    try {
      setEditLoading(true);
      await axios.put(`${API_BASE}/updatecategory/${editCategory._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditMessage("Category updated successfully!");
      setTimeout(() => {
        fetchCategories();
        fetchSpecialCategories();
        closeEditModal();
      }, 1000);
    } catch (err) {
      console.error("Update error:", err);
      setEditMessage("Failed to update category. Try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`${API_BASE}/deletecategory/${id}`);
      fetchCategories();
      fetchSpecialCategories();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete category.");
    }
  };

  const headers = [
    { label: "name", key: "name" },
    { label: "image", key: "image" },
  ];

  return (
    <div className="p-4 bg-white rounded shadow max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#188753]">Doctor Category List</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by category name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <CSVLink
          data={normalCategories}
          headers={headers}
          filename="doctor_categories.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> Export CSV
        </CSVLink>

        <label
          htmlFor="import-cat"
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaUpload /> Bulk Import
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            id="import-cat"
            onChange={handleBulkImport}
            className="hidden"
          />
        </label>
        <button
  onClick={() => {
    const csvContent = "name,image\nExample Category,https://example.com/image.jpg";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "category_bulk_format.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2"
>
  <FaFileCsv /> Download Format
</button>

      </div>

      {/* Normal Category Table */}
      <div className="overflow-x-auto max-h-[400px] mb-2">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0">
            <tr>
              <th className="p-2 border text-left">Image</th>
              <th className="p-2 border text-left">Category Name</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50 border-b">
                <td className="p-2 border">
                  <img
                    src={`https://api.credenthealth.com${cat.image}`}
                    alt={cat.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="p-2 border">{cat.name}</td>
                <td className="p-2 border flex gap-3">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedCategories.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Normal Category Pagination */}
      <div className="flex justify-center gap-2 my-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-green-600 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>

      {/* Special Categories */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-yellow-700">
            Special Categories (Name only, no image)
          </h3>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            className="px-3 py-2 border rounded text-sm"
            placeholder="Search special categories..."
            value={specialSearch}
            onChange={(e) => {
              setSpecialSearch(e.target.value);
              setSpecialCurrentPage(1);
            }}
          />

          <CSVLink
            data={specialCategories}
            headers={headers}
            filename="special_doctor_categories.csv"
            className="px-4 py-2 bg-yellow-500 text-white rounded text-sm flex items-center gap-2"
          >
            <FaFileCsv /> Export Special
          </CSVLink>
        </div>

        <div className="overflow-x-auto border border-yellow-300 rounded bg-yellow-50 max-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100 text-yellow-800 sticky top-0">
              <tr>
                <th className="p-2 border text-left">Category Name</th>
                <th className="p-2 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSpecialCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-yellow-100 border-b">
                  <td className="p-2 border">{cat.name}</td>
                  <td className="p-2 border flex gap-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedSpecialCategories.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-yellow-900 italic">
                    {specialSearch ? "No matching special categories found" : "No special categories found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Special Category Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => goToSpecialPage(specialCurrentPage - 1)}
            disabled={specialCurrentPage === 1}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          {[...Array(specialTotalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToSpecialPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                specialCurrentPage === i + 1 ? "bg-yellow-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToSpecialPage(specialCurrentPage + 1)}
            disabled={specialCurrentPage === specialTotalPages}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={closeEditModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-[#188753]">Edit Category</h3>

            {editMessage && (
              <div
                className={`mb-4 text-center font-medium ${
                  editMessage.includes("successfully") ? "text-green-600" : "text-red-600"
                }`}
              >
                {editMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} encType="multipart/form-data" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload New Image (optional)</label>
                
                {/* Custom file input with cloud icon */}
                <label
                  htmlFor="edit-image"
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-100 border border-blue-400 text-blue-700 rounded hover:bg-blue-200 w-fit"
                >
                  <FaUpload />
                  <span>{editImage ? editImage.name : "Choose Image"}</span>
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </label>

                {editImage && (
                  <p className="mt-1 text-sm text-green-600 font-medium">
                    Selected: {editImage.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`px-4 py-2 rounded text-white ${
                    editLoading
                      ? "bg-green-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {editLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorCategoryList;