import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // <-- import

const CreateTestName = ({ closeModal }) => {
  const [testName, setTestName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // <-- initialize navigate

  const handleCancel = () => {
    setTestName("");
    setCsvFile(null);
    setMessage("");
    if (closeModal) closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (csvFile) {
        // Handle CSV upload
        const formData = new FormData();
        formData.append("file", csvFile);

        const response = await axios.post(
          "https://api.credenthealth.com/api/admin/upload-test-csv",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setMessage(response.data.message || "CSV uploaded successfully!");
        setCsvFile(null);
        setTestName("");
      } else if (testName.trim()) {
        // Handle single test creation
        const response = await axios.post(
          "https://api.credenthealth.com/api/admin/create-testname",
          { testName }
        );
        setMessage(response.data.message || "Test created successfully!");
        setTestName("");
      } else {
        setMessage("Please enter a test name or select a CSV file.");
        setLoading(false);
        return; // Exit early if no input
      }

      // After successful creation/upload, navigate to /testlist
      navigate("/testlist");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create test. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-12 bg-gray-100 min-h-[calc(100vh-100px)] px-4">
      <div className="p-6 bg-white rounded shadow w-full max-w-md">
        <h3 className="text-lg font-bold mb-6 text-[#188753] text-center">
          Create New Test
        </h3>

        {message && (
          <div
            className={`mb-4 text-sm text-center font-medium ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-green-500"
            placeholder="Enter test name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="block w-full text-sm border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded hover:bg-red-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-[#188753] border border-green-700 rounded hover:bg-green-700"
            >
              {loading ? "Processing..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestName;
