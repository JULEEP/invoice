import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddHRA = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([
    { 
      hraCategoryName: '',
      questionText: '',
      options: [
        { text: '', point: 0 }
      ]
    }
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://api.credenthealth.com/api/admin/allhracat');
      if (response.data && response.data.hras) {
        setCategories(response.data.hras);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    }
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].questionText = value;
    updated[index].hraCategoryName = selectedCategory;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
  };

  const handleOptionPointChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].point = parseInt(value) || 0;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: '', point: 0 });
    setQuestions(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 1) {
      updated[qIndex].options.splice(oIndex, 1);
      setQuestions(updated);
    }
  };

  const addQuestion = () => {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }

    const maxQuestionsAllowed = 5;
    const currentCategoryQuestions = questions.filter(q => q.hraCategoryName === selectedCategory).length;
    
    if (currentCategoryQuestions >= maxQuestionsAllowed) {
      setError(`You can only add up to ${maxQuestionsAllowed} questions for this category.`);
      return;
    }

    setError('');
    setQuestions([
      ...questions,
      { 
        hraCategoryName: selectedCategory,
        questionText: '', 
        options: [{ text: '', point: 0 }] 
      }
    ]);
  };

  const removeQuestion = (qIndex) => {
    const updated = [...questions];
    if (updated.length > 1) {
      updated.splice(qIndex, 1);
      setQuestions(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    // Validate all questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} is required`);
        return;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text.trim()) {
          setError(`Option ${j + 1} for Question ${i + 1} is required`);
          return;
        }
      }
    }

    try {
      // Filter questions to only include those for the selected category
      const questionsToSubmit = questions
        .filter(q => q.hraCategoryName === selectedCategory && q.questionText.trim())
        .map(q => ({
          hraCategoryName: q.hraCategoryName,
          questionText: q.questionText.trim(),
          options: q.options.filter(opt => opt.text.trim()).map(opt => ({
            text: opt.text.trim(),
            point: opt.point
          }))
        }));

      if (questionsToSubmit.length === 0) {
        setError('No valid questions to submit');
        return;
      }

      const response = await axios.post('https://api.credenthealth.com/api/admin/create-multiplehra', {
        questions: questionsToSubmit
      });

      // Directly show the message from response
      if (response.data && response.data.message) {
        setSuccess(response.data.message);
        setError('');
        
        // Reset form
        setSelectedCategory('');
        setQuestions([{ 
          hraCategoryName: '',
          questionText: '', 
          options: [{ text: '', point: 0 }] 
        }]);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }

    } catch (err) {
      console.error('Submission error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong! Please try again.');
      }
      setSuccess('');
    }
  };

  // Filter questions to show only those for selected category
  const filteredQuestions = questions.filter(q => 
    selectedCategory ? q.hraCategoryName === selectedCategory : true
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add HRA Questions</h2>
      
      {/* Success Message - Directly showing the backend message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 font-medium rounded-md border border-green-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 font-medium rounded-md border border-red-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mb-6 p-4 bg-blue-50 text-blue-800 font-medium rounded-md border border-blue-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p><strong>Note:</strong> You can only add up to 5 questions per category. Please ensure you don't exceed this limit!</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">HRA Category</h3>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setError('');
            setSuccess('');
            // Reset questions when category changes
            setQuestions([{ 
              hraCategoryName: e.target.value,
              questionText: '', 
              options: [{ text: '', point: 0 }] 
            }]);
          }}
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.hraName}>
              {category.hraName}
            </option>
          ))}
        </select>
      </div>

      {filteredQuestions.map((q, qIndex) => (
        <div key={qIndex} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-700">Question {qIndex + 1}</h3>
            {filteredQuestions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(questions.findIndex(question => question === q))}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm font-medium"
              >
                Remove Question
              </button>
            )}
          </div>
          
          <input
            type="text"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={q.questionText}
            onChange={(e) => handleQuestionChange(questions.findIndex(question => question === q), e.target.value)}
            placeholder="Enter question"
            required
          />

          <h4 className="text-md font-medium mb-2 text-gray-600">Options (with points)</h4>
          
          {q.options.map((opt, oIndex) => (
            <div key={oIndex} className="flex items-center gap-3 mb-3">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={opt.text}
                onChange={(e) => handleOptionTextChange(questions.findIndex(question => question === q), oIndex, e.target.value)}
                placeholder={`Option ${oIndex + 1}`}
                required
              />
              <input
                type="number"
                className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={opt.point}
                onChange={(e) => handleOptionPointChange(questions.findIndex(question => question === q), oIndex, e.target.value)}
                placeholder="Points"
                min="0"
                required
              />
              {q.options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(questions.findIndex(question => question === q), oIndex)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addOption(questions.findIndex(question => question === q))}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-sm font-medium"
          >
            + Add Option
          </button>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={addQuestion}
          disabled={!selectedCategory}
          className={`px-4 py-2 rounded-md font-medium ${
            selectedCategory 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          + Add Question
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!selectedCategory || filteredQuestions.length === 0}
          className={`px-6 py-2 rounded-md font-medium ${
            selectedCategory && filteredQuestions.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          Submit Questions
        </button>
      </div>
    </div>
  );
};

export default AddHRA;