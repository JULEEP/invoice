import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateEmployee() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [designation, setDesignation] = useState('');
    const [department, setDepartment] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [grade, setGrade] = useState(1);
    const [selectedPages, setSelectedPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Mapping of page paths to readable names
    const pageNames = {
        '/dashboard': 'Dashboard',
        '/create-diagnostic': 'Create Diagnostic',
        '/setting': 'Settings',
        '/diagnosticlist': 'Diagnostic List',
        '/company-register': 'Company Register',
        '/companylist': 'Company List',
        '/create-doctor': 'Create Doctor',
        '/doctorlist': 'Doctor List',
        '/singledoctor/:doctorId': 'Single Doctor',
        '/staff-register': 'Staff Register',
        '/stafflist': 'Staff List',
        '/diagnosticslist': 'Diagnostics List',
        '/booking/:bookingId': 'Booking Details',
        '/diagnosticsacceptedlist': 'Accepted Diagnostics',
        '/diagnosticsrejectedlist': 'Rejected Diagnostics',
        '/doctoracceptedlist': 'Accepted Appointments',
        '/doctorrejectedlist': 'Rejected Appointments',
        '/appintmentlist': 'Appointment List',
        '/appintmentbooking': 'Appointment Booking',
        '/diagnostic-center/:id': 'Diagnostic Center',
        '/diagnosticpending': 'Pending Diagnostics',
        '/doctorpendingbookings': 'Pending Doctor Appointments',
        '/appointment/:appointmentId': 'Single Appointment',
        '/create-hracat': 'Create Category',
        '/categorylist': 'Category List',
        '/companysidebar': 'Company Sidebar',
        '/alldiagnostic': 'All Diagnostics',
        '/staff-history/:staffId': 'Staff History',
        '/book-diagnostic': 'Book Diagnostic',
        '/stafftestpkg/:staffId': 'Staff Test Package',
        '/add-hra': 'Add HRA',
        '/hralist': 'HRA List',
        '/createblog': 'Create Blog',
        '/bloglist': 'Blog List',
        '/blogs/:id': 'Single Blog',
        '/labtest-list': 'Lab Test List',
        '/create-package': 'Create Package',
        '/package-list': 'Package List',
        '/diagtestlist': 'Diagnostic Test List',
        '/xraylist': 'X-Ray List',
        '/create-scanxray': 'Create Scan X-ray',
        '/create-category': 'Create Category',
        '/doctorcategorylist': 'Doctor Category List',
        '/createtest': 'Create Test Name',
        '/testlist': 'Test List',
        '/staffmedicaluplods': 'Staff Medical Uploads',
        '/create-employee': 'Create Employee',
        '/employeelist': 'Employee List',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const employeeData = {
            name,
            email,
            password,
            mobile,
            address,
            gender,
            designation,
            department,
            employeeId,
            grade,
            pagesAccess: selectedPages,
        };

        try {
            // Make API call to the backend to create employee
            const response = await axios.post('https://api.credenthealth.com/api/admin/create-employee', employeeData);

            if (response.status === 201) {
                alert('Employee created successfully!');
                navigate('/employeelist');
            }
        } catch (err) {
            setError('Failed to create employee. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (e) => {
        const selectedOption = e.target.value;

        // If the option is not already selected, add it to the array
        if (selectedOption && !selectedPages.includes(selectedOption)) {
            setSelectedPages([...selectedPages, selectedOption]);
        }

        // Reset the select value
        e.target.value = "";
    };

    const removePage = (pageToRemove) => {
        setSelectedPages(selectedPages.filter(page => page !== pageToRemove));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
            <h2 className="text-2xl font-semibold text-center mb-6">Create Employee</h2>

            <form onSubmit={handleSubmit}>
                {/* Name and Email fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Password and Mobile fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input
                            type="text"
                            id="mobile"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Address field */}
                <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address/Location</label>
                    <textarea
                        id="address"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                {/* Gender */}
                <div className="mb-4">
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        id="gender"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Designation, Department, Employee ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label>
                        <input
                            type="text"
                            id="designation"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                            type="text"
                            id="department"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <input
                            type="text"
                            id="employeeId"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Grade Selection */}
                <div className="mb-4">
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                    <select
                        id="grade"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        value={grade}
                        onChange={(e) => setGrade(Number(e.target.value))}
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>
                </div>

                {/* Page Access Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Page Access</label>
                    <select
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        onChange={handlePageChange}
                    >
                        <option value="">Select a page</option>
                        {/* Loop through all pages to create options */}
                        {Object.keys(pageNames).map((path) => (
                            <option key={path} value={path}>
                                {pageNames[path]}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Select pages one by one to add them</p>
                </div>

                {/* Display selected pages */}
                {selectedPages.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Pages:</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedPages.map((page, index) => (
                                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                                    {pageNames[page] || page} {/* Display page name or path */}
                                    <button
                                        type="button"
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                        onClick={() => removePage(page)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Employee'}
                </button>
            </form>
        </div>
    );
}

export default CreateEmployee;
