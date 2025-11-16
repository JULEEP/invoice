import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CreatePackage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [totalTestsIncluded, setTotalTestsIncluded] = useState("");
  const [description, setDescription] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [includedTests, setIncludedTests] = useState([
    { name: "", subTestCount: 0, subTests: [""] },
  ]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const diagnosticId = localStorage.getItem("diagnosticId");

  const handleAddTest = () => {
    setIncludedTests([...includedTests, { name: "", subTestCount: 0, subTests: [""] }]);
  };

  const handleRemoveTest = (index) => {
    const updated = includedTests.filter((_, i) => i !== index);
    setIncludedTests(updated);
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...includedTests];
    updated[index][field] = field === "subTestCount" ? Number(value) : value;
    setIncludedTests(updated);
  };

  const handleSubTestChange = (testIndex, subTestIndex, value) => {
    const updated = [...includedTests];
    updated[testIndex].subTests[subTestIndex] = value;
    setIncludedTests(updated);
  };

  const handleAddSubTest = (testIndex) => {
    const updated = [...includedTests];
    updated[testIndex].subTests.push("");
    setIncludedTests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !precautions || includedTests.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields",
      });
      return;
    }

    if (!diagnosticId) {
      Swal.fire({
        icon: "error",
        title: "Diagnostic ID Missing",
        text: "Diagnostic ID not found in local storage",
      });
      return;
    }

    const payload = {
      name,
      price: Number(price),
      totalTestsIncluded: Number(totalTestsIncluded),
      description,
      precautions,
      includedTests,
    };

    try {
      setLoading(true);
      await axios.post(
        `https://api.credenthealth.com/api/admin/createpackage/${diagnosticId}`,
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Package created successfully!",
      });

      navigate("/diagnostic/getpackages");
    } catch (error) {
      console.error("Error creating package:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to create package.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h3 className="text-lg font-bold mb-4">Create a New Package</h3>
      <form onSubmit={handleSubmit}>
        {/* Row 1: Name & Price */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Package Name</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">MRP (₹)</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 2: Total Tests Included */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Total Tests Included</label>
          <input
            type="number"
            className="p-2 border rounded w-full"
            value={totalTestsIncluded}
            onChange={(e) => setTotalTestsIncluded(e.target.value)}
            required
          />
        </div>

        {/* Row 3: Description & Precautions */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Package Description</label>
            <textarea
              className="p-2 border rounded w-full h-[86px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">Instructions</label>
            <textarea
              className="p-2 border rounded w-full h-[86px]"
              value={precautions}
              onChange={(e) => setPrecautions(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Included Tests Section */}
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2">Included Tests</h4>
          {includedTests.map((test, i) => (
            <div key={i} className="mb-4 border p-4 rounded bg-gray-50">
              <div className="flex gap-4 mb-2">
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Test Name</label>
                  <input
                    type="text"
                    className="p-2 border rounded w-full"
                    value={test.name}
                    onChange={(e) => handleTestChange(i, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Sub Test Count</label>
                  <input
                    type="number"
                    className="p-2 border rounded w-full"
                    value={test.subTestCount}
                    onChange={(e) => handleTestChange(i, "subTestCount", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Include  Sub Tests</label>
                {test.subTests.map((sub, j) => (
                  <input
                    key={j}
                    type="text"
                    className="p-2 border rounded w-full mb-2"
                    value={sub}
                    onChange={(e) => handleSubTestChange(i, j, e.target.value)}
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSubTest(i)}
                  className="text-blue-500 text-sm hover:underline mt-1"
                >
                  + Add Sub Test
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => handleRemoveTest(i)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove Test
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddTest}
            className="text-green-600 text-sm hover:underline"
          >
            + Add Another Test
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Package"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePackage;
