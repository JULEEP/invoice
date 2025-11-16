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
  const [error, setError] = useState(''); // State for error message

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
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const addQuestion = () => {
    // Check if questions exceed the limit for selected category
    const maxQuestionsAllowed = 5; // Limit of 5 questions per category
    const currentCategoryQuestions = questions.filter(q => q.hraCategoryName === selectedCategory).length;
    
    if (currentCategoryQuestions >= maxQuestionsAllowed) {
      setError(`You can only add up to ${maxQuestionsAllowed} questions for this category.`);
      return;
    }

    setError(''); // Clear any previous errors
    setQuestions([...questions, { 
      hraCategoryName: selectedCategory,
      questionText: '', 
      options: [{ text: '', point: 0 }] 
    }]);
  };

  const removeQuestion = (qIndex) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    try {
      const response = await axios.post('https://api.credenthealth.com/api/admin/submit-section', {
        questions: questions.map(q => ({
          ...q,
          hraCategoryName: selectedCategory
        }))
      });

      if (response.status === 200) {
        alert('HRA Section Added Successfully!');
        setSelectedCategory('');
        setQuestions([{ 
          hraCategoryName: '',
          questionText: '', 
          options: [{ text: '', point: 0 }] 
        }]);
      } else {
        alert('Failed to submit: ' + response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">

      
      {/* Note below the title */}
      <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 font-medium rounded-md">
        <p><strong>Note:</strong> You can only add up to 5 questions per category. Please ensure you don't exceed this limit!</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">HRA Category</h3>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-700">Question {qIndex + 1}</h3>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            )}
          </div>
          
          <input
            type="text"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={q.questionText}
            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
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
                onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                placeholder={`Option ${oIndex + 1}`}
                required
              />
              <input
                type="number"
                className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={opt.point}
                onChange={(e) => handleOptionPointChange(qIndex, oIndex, e.target.value)}
                placeholder="Points"
                required
              />
              {q.options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(qIndex, oIndex)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addOption(qIndex)}
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
          className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium"
        >
          + Add Question
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Submit Questions
        </button>
      </div>
    </div>
  );
};

export default AddHRA;
