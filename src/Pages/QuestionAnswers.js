import React, { useEffect, useState } from 'react';

const QuestionAnswers = () => {
  const [questionsData, setQuestionsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    answerCount: 'all'
  });

  // Fetch data from the API
  useEffect(() => {
    fetch('https://api.credenthealth.com/api/admin/answers')
      .then(response => response.json())
      .then(data => {
        setQuestionsData(data.data);
        setFilteredData(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...questionsData];
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(question => 
        question.question.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Answer count filter
    if (filters.answerCount === 'withAnswers') {
      filtered = filtered.filter(question => question.submittedAnswers.length > 0);
    } else if (filters.answerCount === 'withoutAnswers') {
      filtered = filtered.filter(question => question.submittedAnswers.length === 0);
    }
    
    setFilteredData(filtered);
  }, [filters, questionsData]);

  const openAnswersModal = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Enhanced Export to CSV function with detailed user information
  const exportToCSV = () => {
    // Prepare CSV data
    const csvData = [];
    
    // Add main headers
    csvData.push(['Question ID', 'Question', 'Total Answers', 'Created Date']);
    
    // Add questions and their basic info
    filteredData.forEach(question => {
      csvData.push([
        question._id,
        `"${question.question.replace(/"/g, '""')}"`,
        question.submittedAnswers.length,
        new Date(question.createdAt).toLocaleString()
      ]);
      
      // Add user answers details if available
      if (question.submittedAnswers.length > 0) {
        // Add sub-headers for answers
        csvData.push(['', 'User Details', 'Answer', 'Submitted Date']);
        
        // Add each answer with user details
        question.submittedAnswers.forEach(answer => {
          const user = answer.userId || {};
          csvData.push([
            '',
            `"${user.name || 'Anonymous'} (${user.email || 'No Email'})"`,
            `"${answer.answer.replace(/"/g, '""')}"`,
            new Date(answer.createdAt).toLocaleString()
          ]);
        });
        
        // Add empty row for separation
        csvData.push(['', '', '', '']);
      } else {
        csvData.push(['', 'No answers submitted', '', '']);
        csvData.push(['', '', '', '']);
      }
    });
    
    // Create CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `detailed_questions_answers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Alternative bulk export - Simple format
  const exportToCSVSimple = () => {
    const csvData = [];
    
    // Headers
    csvData.push(['Question', 'User Name', 'User Email', 'Answer', 'Answer Submitted Date', 'Question Created Date']);
    
    // Data rows
    filteredData.forEach(question => {
      if (question.submittedAnswers.length > 0) {
        question.submittedAnswers.forEach(answer => {
          const user = answer.userId || {};
          csvData.push([
            `"${question.question.replace(/"/g, '""')}"`,
            `"${user.name || 'Anonymous'}"`,
            `"${user.email || 'No Email'}"`,
            `"${answer.answer.replace(/"/g, '""')}"`,
            new Date(answer.createdAt).toLocaleString(),
            new Date(question.createdAt).toLocaleString()
          ]);
        });
      } else {
        csvData.push([
          `"${question.question.replace(/"/g, '""')}"`,
          'No User',
          'No Email',
          'No Answer',
          'N/A',
          new Date(question.createdAt).toLocaleString()
        ]);
      }
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `questions_answers_simple_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export single question answers to CSV with detailed user info
  const exportQuestionToCSV = (question) => {
    const csvData = [];
    
    // Main question header
    csvData.push(['Question ID', 'Question', 'Total Answers', 'Question Created Date']);
    csvData.push([
      question._id,
      `"${question.question.replace(/"/g, '""')}"`,
      question.submittedAnswers.length,
      new Date(question.createdAt).toLocaleString()
    ]);
    
    // Empty row
    csvData.push([]);
    
    if (question.submittedAnswers.length > 0) {
      // Answers header with user details
      csvData.push(['User Name', 'User Email', 'User ID', 'Answer', 'Submitted Date']);
      
      // Answers data
      question.submittedAnswers.forEach(answer => {
        const user = answer.userId || {};
        csvData.push([
          `"${user.name || 'Anonymous'}"`,
          `"${user.email || 'No Email'}"`,
          user._id || 'N/A',
          `"${answer.answer.replace(/"/g, '""')}"`,
          new Date(answer.createdAt).toLocaleString()
        ]);
      });
    } else {
      csvData.push(['No answers submitted for this question']);
    }
    
    // Create CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `question_${question._id}_answers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-xl font-semibold">Loading questions...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Questions & Answers</h1>
          <p className="text-gray-600">Manage and review all submitted answers</p>
        </div>

        {/* Filters and Export Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search Filter */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Questions
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Answer Count Filter */}
              <div className="flex-1">
                <label htmlFor="answerCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Answers
                </label>
                <select
                  id="answerCount"
                  value={filters.answerCount}
                  onChange={(e) => handleFilterChange('answerCount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="all">All Questions</option>
                  <option value="withAnswers">With Answers</option>
                  <option value="withoutAnswers">Without Answers</option>
                </select>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="w-full lg:w-auto mt-4 lg:mt-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportToCSVSimple}
                  disabled={filteredData.length === 0}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    filteredData.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                  title="Simple Format - One row per answer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Simple CSV
                </button>
                
                <button
                  onClick={exportToCSV}
                  disabled={filteredData.length === 0}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    filteredData.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                  }`}
                  title="Detailed Format - Grouped by questions"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Detailed CSV
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm text-gray-600">
              Showing {filteredData.length} of {questionsData.length} questions
            </div>
            <div className="text-xs text-gray-500">
              Total Answers: {filteredData.reduce((sum, q) => sum + q.submittedAnswers.length, 0)}
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <th className="px-8 py-6 text-left font-semibold text-lg">Question</th>
                  <th className="px-8 py-6 text-left font-semibold text-lg">Answers Count</th>
                  <th className="px-8 py-6 text-center font-semibold text-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xl font-semibold">No questions found</p>
                        <p className="mt-2">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((question, index) => (
                    <tr 
                      key={question._id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-8 py-6">
                        <div className="max-w-xl">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {question.question}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                              </svg>
                              {question.submittedAnswers.length} responses
                            </span>
                            <span className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                              </svg>
                              {new Date(question.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            question.submittedAnswers.length === 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : question.submittedAnswers.length > 5
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {question.submittedAnswers.length} answers
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => openAnswersModal(question)}
                            disabled={question.submittedAnswers.length === 0}
                            className={`inline-flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                              question.submittedAnswers.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:scale-105 transform'
                            }`}
                            title="View Answers"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => exportQuestionToCSV(question)}
                            disabled={question.submittedAnswers.length === 0}
                            className={`inline-flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                              question.submittedAnswers.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105 transform'
                            }`}
                            title="Export Answers to CSV"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Answers Modal */}
        {isModalOpen && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">Question Answers</h2>
                    <p className="text-indigo-100 text-sm max-w-2xl">
                      {selectedQuestion.question}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => exportQuestionToCSV(selectedQuestion)}
                      disabled={selectedQuestion.submittedAnswers.length === 0}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedQuestion.submittedAnswers.length === 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      title="Export to CSV"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={closeModal}
                      className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center mt-4 text-indigo-100">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                  </svg>
                  <span>{selectedQuestion.submittedAnswers.length} users responded</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {selectedQuestion.submittedAnswers.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No answers submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedQuestion.submittedAnswers.map((answer) => {
                      const user = answer.userId || {};
                      return (
                        <div 
                          key={answer._id} 
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div>
                                <strong className="text-gray-800 font-medium">
                                  {user.name || 'Anonymous User'}
                                </strong>
                                {user.email && (
                                  <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Submitted on: {new Date(answer.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border">
                            <p className="text-gray-700 leading-relaxed">{answer.answer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{selectedQuestion.submittedAnswers.length}</span> answers total
                    {selectedQuestion.submittedAnswers.length > 0 && (
                      <span className="ml-4">
                        Unique users: {new Set(selectedQuestion.submittedAnswers.map(a => a.userId?._id)).size}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => exportQuestionToCSV(selectedQuestion)}
                      disabled={selectedQuestion.submittedAnswers.length === 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedQuestion.submittedAnswers.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionAnswers;