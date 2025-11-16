import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HRAList = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editData, setEditData] = useState({
    hraCategoryName: '',
    questionText: '',
    options: [],
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const questionsPerPage = 5;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('https://api.credenthealth.com/api/admin/hra-questions');
      setQuestions(res.data.hraQuestions || []);
      setMessage('');
    } catch (err) {
      console.error('Failed to fetch HRA questions:', err);
      setMessage('Failed to load questions');
    }
  };

  // Filter by search term
  const filteredQuestions = questions.filter(
    (q) =>
      q.hraCategoryName.toLowerCase().includes(search.toLowerCase()) ||
      q.question.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedByCategory = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.hraCategoryName]) acc[q.hraCategoryName] = [];
    acc[q.hraCategoryName].push(q);
    return acc;
  }, {});

  const groupedArray = Object.entries(groupedByCategory);

  // Pagination
  const indexOfLast = currentPage * questionsPerPage;
  const indexOfFirst = indexOfLast - questionsPerPage;
  const paginatedCategories = groupedArray.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(groupedArray.length / questionsPerPage);

  // Start editing a question
  const startEditing = (question) => {
    setEditQuestionId(question._id);
    setEditData({
      hraCategoryName: question.hraCategoryName,
      questionText: question.question,
      options: question.options.map((opt) => ({ ...opt })),
    });
    setMessage('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditQuestionId(null);
    setEditData({ hraCategoryName: '', questionText: '', options: [] });
    setMessage('');
  };

  // Handle change in edit inputs
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle option change
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...editData.options];
    if (field === 'point') {
      updatedOptions[index][field] = Number(value);
    } else {
      updatedOptions[index][field] = value;
    }
    setEditData((prev) => ({ ...prev, options: updatedOptions }));
  };

  // Add new option
  const addOption = () => {
    setEditData((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', point: 0 }],
    }));
  };

  // Remove option
  const removeOption = (index) => {
    const updatedOptions = [...editData.options];
    updatedOptions.splice(index, 1);
    setEditData((prev) => ({ ...prev, options: updatedOptions }));
  };

  // Update question API call
  const handleUpdate = async () => {
    if (
      !editData.hraCategoryName.trim() ||
      !editData.questionText.trim() ||
      editData.options.length === 0
    ) {
      setMessage('Category name, question text, and at least one option are required.');
      return;
    }

    for (const opt of editData.options) {
      if (!opt.text.trim() || typeof opt.point !== 'number' || isNaN(opt.point)) {
        setMessage('Each option must have valid text and point.');
        return;
      }
    }

    try {
      setLoading(true);
    const res = await axios.put(
  `https://api.credenthealth.com/api/admin/updatehra-question/${editQuestionId}`,
  {
    hraCategoryName: editData.hraCategoryName,
    questionText: editData.questionText,
    options: editData.options,
  }
);

      setMessage(res.data.message || 'Question updated successfully');
      setEditQuestionId(null);
      setEditData({ hraCategoryName: '', questionText: '', options: [] });

      fetchQuestions();
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  // Delete question API call
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      setLoading(true);
      const res = await axios.delete(`https://api.credenthealth.com/api/admin/deletehra-question/${id}`);
      setMessage(res.data.message || 'Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Health Risk Assessment Questions</h2>
      </div>

      {message && (
        <div className="mb-4 text-center text-sm font-medium text-red-600">{message}</div>
      )}

      <div className="mb-4">
        <input
          type="text"
          className="w-full md:w-1/3 px-4 py-2 border rounded text-sm"
          placeholder="Search by category or question..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {paginatedCategories.length === 0 ? (
        <p className="text-gray-500 italic">No matching results found.</p>
      ) : (
        paginatedCategories.map(([categoryName, questions]) => (
          <div key={categoryName} className="mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">{categoryName}</h3>
            <div className="border border-gray-200 rounded">
              {questions.map((question, qIdx) => (
                <div key={question._id} className="border-t border-gray-100 p-4 first:border-t-0">
                  {editQuestionId === question._id ? (
                    <>
                      {/* Edit Form */}
                      <div className="mb-2">
                        <label className="block font-semibold text-gray-700 mb-1">Category Name</label>
                        <input
                          type="text"
                          className="w-full border px-3 py-2 rounded"
                          value={editData.hraCategoryName}
                          onChange={(e) => handleEditChange('hraCategoryName', e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="mb-2">
                        <label className="block font-semibold text-gray-700 mb-1">Question Text</label>
                        <textarea
                          className="w-full border px-3 py-2 rounded"
                          rows={3}
                          value={editData.questionText}
                          onChange={(e) => handleEditChange('questionText', e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="mb-2">
                        <label className="block font-semibold text-gray-700 mb-1">Options</label>
                        {editData.options.map((opt, idx) => (
                          <div key={idx} className="flex gap-2 mb-2 items-center">
                            <input
                              type="text"
                              placeholder="Option Text"
                              className="flex-1 border px-2 py-1 rounded"
                              value={opt.text}
                              onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                              disabled={loading}
                            />
                            <input
                              type="number"
                              placeholder="Points"
                              className="w-20 border px-2 py-1 rounded"
                              value={opt.point}
                              onChange={(e) => handleOptionChange(idx, 'point', e.target.value)}
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              disabled={loading}
                              className="text-red-600 font-bold px-2"
                              title="Remove option"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addOption}
                          disabled={loading}
                          className="text-green-600 font-semibold text-sm"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading ? 'Updating...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={loading}
                          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-800 mb-2">
                        Q{qIdx + 1}: {question.question}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-2">
                        {question.options.map((opt) => (
                          <li key={opt._id}>
                            {opt.text} — <span className="font-semibold">{opt.point} pts</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(question)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(question._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HRAList;
