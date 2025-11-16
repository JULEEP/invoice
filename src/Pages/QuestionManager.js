import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [error, setError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [selectedQuestionAnswers, setSelectedQuestionAnswers] = useState([]);
  const [selectedQuestionText, setSelectedQuestionText] = useState('');

  // Fetch all questions from the server
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('https://api.credenthealth.com/api/admin/questions');
      if (response.data && response.data.data) {
        setQuestions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions.');
    }
  };

  const handleQuestionChange = (e) => {
    setQuestionText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionText) {
      setError('Please enter a question.');
      return;
    }

    try {
      const response = await axios.post('https://api.credenthealth.com/api/admin/create-question', {
        question: questionText,
      });

      console.log("Response: ", response);

      if (response && response.data && response.data.message && response.data.message.includes("Question created successfully")) {
        alert('Question created successfully!');
        setQuestionText('');
        fetchQuestions();
      } else {
        alert('Failed to submit question: ' + (response.data ? response.data.message : 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong!');
    }
  };

  const handleDelete = async (questionId) => {
    try {
      const response = await axios.delete(`https://api.credenthealth.com/api/admin/delete-question/${questionId}`);
      if (response.status === 200) {
        alert('Question deleted successfully!');
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete question.');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.question);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!questionText) {
      setError('Please enter a question.');
      return;
    }

    try {
      const response = await axios.put(`https://api.credenthealth.com/api/admin/edit-question/${editingQuestion._id}`, {
        question: questionText,
      });

      if (response && response.data && response.data.message === "Question updated successfully") {
        alert('Question updated successfully!');
        setIsModalOpen(false);
        setEditingQuestion(null);
        setQuestionText('');
        fetchQuestions();
      } else {
        alert('Failed to update question');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong!');
    }
  };

  const handleViewAnswers = (question) => {
    setSelectedQuestionAnswers(question.submittedAnswers || []);
    setSelectedQuestionText(question.question);
    setIsAnswersModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setQuestionText('');
  };

  const closeAnswersModal = () => {
    setIsAnswersModalOpen(false);
    setSelectedQuestionAnswers([]);
    setSelectedQuestionText('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Manage Questions</h2>

      {/* Error message */}
      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left column: Create Question Form */}
        <div className="p-6 border rounded-md bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Create New Question</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={questionText}
              onChange={handleQuestionChange}
              placeholder="Enter question"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Submit Question
            </button>
          </form>
        </div>

        {/* Right column: List of Questions */}
        <div className="p-6 border rounded-md bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">All Questions</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 border-b text-left">Question</th>
                  <th className="py-3 px-4 border-b text-center">Actions</th>
                  <th className="py-3 px-4 border-b text-center">View Answers</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question._id} className="hover:bg-gray-100">
                    <td className="py-3 px-4 border-b">{question.question}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleEdit(question)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                          title="Edit Question"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(question._id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Delete Question"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <button
                        onClick={() => handleViewAnswers(question)}
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="View Submitted Answers"
                        disabled={!question.submittedAnswers || question.submittedAnswers.length === 0}
                      >
                        <FaEye size={18} />
                        {question.submittedAnswers && question.submittedAnswers.length > 0 && (
                          <span className="ml-1 text-xs bg-green-500 text-white rounded-full px-2 py-1">
                            {question.submittedAnswers.length}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Edit Question</h3>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={questionText}
                onChange={handleQuestionChange}
                required
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Viewing Submitted Answers */}
      {isAnswersModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Submitted Answers</h3>
              <button
                onClick={closeAnswersModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800">Question:</h4>
              <p className="text-blue-900">{selectedQuestionText}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total Answers: <span className="font-semibold">{selectedQuestionAnswers.length}</span>
              </p>
            </div>

            {selectedQuestionAnswers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No answers submitted for this question yet.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedQuestionAnswers.map((answer, index) => (
                  <div key={answer._id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-700">Answer #{index + 1}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {formatDate(answer.createdAt)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">User ID:</span>
                      <span className="ml-2 text-gray-800 font-mono text-sm">{answer.userId}</span>
                    </div>
                    <div className="mt-2 p-3 bg-gray-100 rounded-md">
                      <span className="text-sm text-gray-600">Answer:</span>
                      <p className="mt-1 text-gray-800">{answer.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeAnswersModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;