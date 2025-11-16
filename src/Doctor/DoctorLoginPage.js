import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.credenthealth.com/api/admin/login-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        if (data.doctor?.id) {
          localStorage.setItem('doctorId', data.doctor.id);
        }

        if (data.doctor?.name) {
          localStorage.setItem('doctorName', data.doctor.name);
        }

        setSuccessMessage('Login successful! Token and Doctor info saved.');
        navigate('/doctor/doctordashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10">
      <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full">
        
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 space-y-6">
          {/* Branding */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold flex gap-1">
                <span className="text-blue-600">CREDENT</span>
                <span className="text-black">HEALTH</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-600">Doctor Login</div>
          </div>

          {error && (
            <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm">{error}</div>
          )}
          {successMessage && (
            <div className="p-3 text-green-600 bg-green-100 rounded-md shadow-sm">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-teal-500 focus:border-teal-600 transition duration-200"
                placeholder="doctor@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-teal-500 focus:border-teal-600 transition duration-200"
                placeholder="********"
              />
            </div>
            <button
              type="submit"
              className={`w-full p-3 text-white bg-teal-600 rounded-md hover:bg-teal-700 transition duration-200 transform ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

 {/* Image Section */}
 <div className="w-full md:w-1/2 flex justify-center p-4 md:p-0">
 <img
   src="https://static.vecteezy.com/system/resources/previews/000/541/397/original/vector-a-doctor-at-clinic-background.jpg"
   alt="Doctor Login Illustration"
   className="object-cover w-full h-auto rounded-lg md:rounded-none"
 />
</div>
      </div>
    </div>
  );
};

export default DoctorLoginPage;
