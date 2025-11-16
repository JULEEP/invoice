import React, { useEffect, useState } from "react";
import { FaFileCsv, FaUpload, FaEye, FaTrash } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DiagnosticList = () => {
  const [centers, setCenters] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await axios.get("https://api.credenthealth.com/api/admin/alldiagnostics");
        setCenters(response.data.data.reverse());
      } catch (error) {
        console.error("Error fetching centers:", error);
      }
    };

    fetchCenters();
  }, []);

  const filteredCenters = centers.filter(center =>
    center.name && center.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastCenter = currentPage * itemsPerPage;
  const indexOfFirstCenter = indexOfLastCenter - itemsPerPage;
  const currentCenters = filteredCenters.slice(indexOfFirstCenter, indexOfLastCenter);
  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);

  const handleBulkImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setCenters(prevCenters => [...parsedData.reverse(), ...prevCenters]);
        alert("Diagnostic center data imported successfully!");
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleView = (id) => {
    navigate(`/diagnostic-center/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diagnostic center?")) return;

    try {
      const response = await axios.delete(`https://api.credenthealth.com/api/admin/delete-diagnostic/${id}`);
      if (response.status === 200) {
        alert("Diagnostic center deleted successfully!");
        setCenters(prevCenters => prevCenters.filter(center => center._id !== id));
      } else {
        alert("Failed to delete diagnostic center.");
      }
    } catch (error) {
      console.error("Error deleting center:", error);
      alert("Something went wrong while deleting.");
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Prepare data for CSV export with computed fields
  const csvData = filteredCenters.map(center => ({
    name: center.name || "",
    description: center.description || "",
    centerType: center.centerType || "",
    network: center.network || "",
    homeCollectionSlotsCount: center.homeCollectionSlots?.length || 0,
    centerVisitSlotsCount: center.centerVisitSlots?.length || 0,
    testsCount: center.tests?.length || 0,
    packagesCount: center.packages?.length || 0,
    scansCount: center.scans?.length || 0,
    branchesCount: center.branches?.length || 0
  }));

  const headers = [
    { label: "Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Center Type", key: "centerType" },
    { label: "Network", key: "network" },
    { label: "Home Collection Slots", key: "homeCollectionSlotsCount" },
    { label: "Center Visit Slots", key: "centerVisitSlotsCount" },
    { label: "Tests Count", key: "testsCount" },
    { label: "Packages Count", key: "packagesCount" },
    { label: "Scans Count", key: "scansCount" },
    { label: "Branches Count", key: "branchesCount" }
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Health Care Centers</h2>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <CSVLink
          data={csvData}
          headers={headers}
          filename="diagnostic_centers.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Description</th>
              <th className="p-2 border text-left">Network</th>
              <th className="p-2 border text-left">Center Type</th>
              <th className="p-2 border text-left">Home Collection</th>
              <th className="p-2 border text-left">Center Visit</th>
              <th className="p-2 border text-left">Tests</th>
              <th className="p-2 border text-left">Packages</th>
              <th className="p-2 border text-left">Scans</th>
              <th className="p-2 border text-left">Branches</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCenters.map((center, idx) => (
              <tr key={idx} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{center.name}</td>
                <td className="p-2 border">{center.description || "-"}</td>
                <td className="p-2 border">{center.network}</td>
                <td className="p-2 border">{center.centerType}</td>
                <td className="p-2 border text-center">
                  {center.homeCollectionSlots?.length || 0}
                </td>
                <td className="p-2 border text-center">
                  {center.centerVisitSlots?.length || 0}
                </td>
                <td className="p-2 border text-center">
                  {center.tests?.length || 0}
                </td>
                <td className="p-2 border text-center">
                  {center.packages?.length || 0}
                </td>
                <td className="p-2 border text-center">
                  {center.scans?.length || 0}
                </td>
                <td className="p-2 border text-center">
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      center.branches?.length > 0 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {center.branches?.length || 0}
                    </span>
                    {center.branches?.length > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {center.branches.length} branch{center.branches.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2 border flex gap-2 justify-center">
                  <button
                    onClick={() => handleView(center._id)}
                    className="text-blue-500 hover:text-blue-700"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDelete(center._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Center"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div>
          <span className="font-semibold">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DiagnosticList;