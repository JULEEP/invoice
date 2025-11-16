import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Email and password are required.');
    return;
  }

  setIsLoading(true);

  const payload = { email, password };

  try {
    // Make API request to employee login
    const response = await fetch('https://api.credenthealth.com/api/admin/emplogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      // Store data in localStorage
      localStorage.setItem('employeeId', data.employee._id);
      localStorage.setItem('pagesAccess', JSON.stringify(data.employee.pagesAccess));
      localStorage.setItem('role', 'employee');  // Store the role as 'employee'

      // Redirect to the dashboard (or any other accessible page from pagesAccess)
      const accessiblePage = data.employee.pagesAccess.includes('/dashboard') ? '/dashboard' : data.employee.pagesAccess[0];

      navigate(accessiblePage); // Redirect to the first accessible page (e.g., /dashboard)
    } else {
      setError(data.message || 'Login failed. Please try again.');
    }
  } catch (err) {
    console.error('Login error:', err);
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
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold flex gap-1">
                <span className="text-blue-600">CREDENT</span>
                <span className="text-black">HEALTH</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-600">Employee Login</div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md"
                placeholder="you@domain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md"
                placeholder="********"
              />
            </div>
            <button
              type="submit"
              className={`w-full p-3 text-white bg-teal-600 rounded-md hover:bg-teal-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
              Register here
            </a>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center p-4 md:p-0">
          <img
            src="https://static.vecteezy.com/system/resources/previews/003/689/228/original/online-registration-or-sign-up-login-for-account-on-smartphone-app-user-interface-with-secure-password-mobile-application-for-ui-web-banner-access-cartoon-people-illustration-vector.jpg"
            alt="Login Illustration"
            className="object-cover w-full h-auto rounded-lg md:rounded-none"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;
