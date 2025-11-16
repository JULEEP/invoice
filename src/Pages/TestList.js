import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaFileExcel } from 'react-icons/fa';
import axios from 'axios';
import * as XLSX from 'xlsx';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTest, setEditingTest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const testsPerPage = 5;

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://api.credenthealth.com/api/admin/alltestname');
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setMessage({ text: 'Failed to fetch tests', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTests = tests.filter(test =>
    test.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const handleEdit = (test) => {
    setEditingTest(test);
    setEditValue(test.testName);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!editValue.trim()) {
      setMessage({ text: 'Test name cannot be empty', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.put(
        `https://api.credenthealth.com/api/admin/updatetestname/${editingTest._id}`,
        { testName: editValue }
      );

      setTests(tests.map(test => 
        test._id === editingTest._id ? response.data.test : test
      ));
      setMessage({ text: 'Test updated successfully', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating test:', error);
      setMessage({ text: 'Failed to update test', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`https://api.credenthealth.com/api/admin/deletetestname/${id}`);
      setTests(tests.filter(test => test._id !== id));
      setMessage({ text: 'Test deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting test:', error);
      setMessage({ text: 'Failed to delete test', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const dataToExport = filteredTests.map(test => ({
      'Test Name': test.testName,
      'Created At': new Date(test.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tests');
    XLSX.writeFile(workbook, 'tests_export.xlsx');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Test List</h1>

        {/* Search and filter - now with left-aligned and compact layout */}
        <div className="mb-6 flex items-center gap-2">
          <div className="w-64"> {/* Smaller fixed width for search */}
            <input
              type="text"
              placeholder="Search tests..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
            disabled={filteredTests.length === 0}
          >
            <FaFileExcel className="text-xs" /> <span>Export</span>
          </button>
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tests table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTests.length > 0 ? (
                currentTests.map((test) => (
                  <tr key={test._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.testName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(test)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={isLoading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(test._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isLoading}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading...' : 'No tests found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTests.length > testsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FaChevronLeft className="mr-1" /> Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 border text-sm font-medium rounded-md ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Test</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;