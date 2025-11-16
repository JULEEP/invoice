import React, { useState, useEffect } from 'react';
import { FaFileCsv, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import axios from 'axios';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('https://api.credenthealth.com/api/admin/getallemployees');
            setEmployees(res.data.employees || []);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;

        try {
            await axios.delete(`https://api.credenthealth.com/api/admin/deleteemployee/${id}`);
            setEmployees(employees.filter((employee) => employee._id !== id));
            alert('Employee deleted successfully!');
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await axios.put(
                `https://api.credenthealth.com/api/admin/updateemployee/${editingEmployee._id}`,
                editingEmployee
            );
            setEmployees(
                employees.map((employee) =>
                    employee._id === editingEmployee._id ? res.data.employee : employee
                )
            );
            setIsModalOpen(false);
            alert('Employee updated successfully!');
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    const headers = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Role', key: 'role' },
        { label: 'Mobile', key: 'mobile' },
        { label: 'Address', key: 'address' },
        { label: 'Pages Access', key: 'pagesAccess' },
        { label: 'Gender', key: 'gender' },
        { label: 'Designation', key: 'designation' },
        { label: 'Department', key: 'department' },
        { label: 'Employee ID', key: 'employeeId' },
        { label: 'Grade', key: 'grade' },
        { label: 'Created At', key: 'createdAt' },
        { label: 'Updated At', key: 'updatedAt' },
    ];


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

    const [selectedPages, setSelectedPages] = useState([]);

    useEffect(() => {
        if (editingEmployee) {
            setSelectedPages(editingEmployee.pagesAccess || []);
        }
    }, [editingEmployee]);

    const handlePageAccessChange = (e) => {
        const { value } = e.target;
        const newSelectedPages = [...selectedPages];

        if (newSelectedPages.includes(value)) {
            const index = newSelectedPages.indexOf(value);
            newSelectedPages.splice(index, 1);
        } else {
            newSelectedPages.push(value);
        }

        setSelectedPages(newSelectedPages);
        setEditingEmployee({
            ...editingEmployee,
            pagesAccess: newSelectedPages,
        });
    };

    const handleNewPagesSelect = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedPages(selectedOptions);
        setEditingEmployee({
            ...editingEmployee,
            pagesAccess: selectedOptions,
        });
    };


    return (
        <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Employee List</h2>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <input
                    type="text"
                    className="px-3 py-2 border rounded text-sm"
                    placeholder="Search by employee name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <CSVLink
                    data={filteredEmployees}
                    headers={headers}
                    filename="employee_list.csv"
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
                            <th className="p-2 border text-left">Email</th>
                            <th className="p-2 border text-left">Password</th>
                            <th className="p-2 border text-left">Mobile</th>
                            <th className="p-2 border text-left">Address/Location</th>
                            <th className="p-2 border text-left">Gender</th>
                            <th className="p-2 border text-left">Designation</th>
                            <th className="p-2 border text-left">Department</th>
                            <th className="p-2 border text-left">Employee ID</th>
                            <th className="p-2 border text-left">Grade</th>
                            <th className="p-2 border text-left">Pages Access</th>
                            <th className="p-2 border text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee._id} className="hover:bg-gray-100 border-b">
                                <td className="p-2 border">{employee.name}</td>
                                <td className="p-2 border">{employee.email}</td>
                                <td className="p-2 border">{employee.password}</td>
                                <td className="p-2 border">{employee.mobile}</td>
                                <td className="p-2 border">{employee.address}</td>
                                <td className="p-2 border">{employee.gender}</td>
                                <td className="p-2 border">{employee.designation}</td>
                                <td className="p-2 border">{employee.department}</td>
                                <td className="p-2 border">{employee.employeeId}</td>
                                <td className="p-2 border">{employee.grade}</td>
                                <td className="p-2 border">
                                    {employee.pagesAccess && employee.pagesAccess.join(', ')}
                                </td>
                                <td className="p-2 border flex gap-2">
                                    <button
                                        onClick={() => handleEdit(employee)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan="12" className="text-center p-4 text-gray-500">
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Edit Employee</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm mb-1">Name</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.name}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, name: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm mb-1">Email</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.email}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, email: e.target.value })
                                        }
                                    />
                                </div>


                                {/* Password Input */}
                                <div className="w-1/2">
                                    <label className="block text-sm mb-1">Password</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        type="password" // Hide password input
                                        value={editingEmployee.password}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, password: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label className="block text-sm mb-1">Mobile</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.mobile}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, mobile: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {/* Location */}
                                <div>
                                    <label className="block text-sm mb-1">Location (Address)</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.address}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, location: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm mb-1">Gender</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.gender}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, gender: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="block text-sm mb-1">Designation</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.designation}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, designation: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {/* Department */}
                                <div>
                                    <label className="block text-sm mb-1">Department</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.department}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, department: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Employee ID */}
                                <div>
                                    <label className="block text-sm mb-1">Employee ID</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.employeeId}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, employeeId: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Grade */}
                                <div>
                                    <label className="block text-sm mb-1">Grade</label>
                                    <input
                                        className="p-2 border rounded w-full"
                                        value={editingEmployee.grade}
                                        onChange={(e) =>
                                            setEditingEmployee({ ...editingEmployee, grade: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Pages Access */}
                            <div className="mb-4">
                                <label className="block text-sm mb-1">Pages Access</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedPages.length > 0 && selectedPages.map((page) => (
                                        <span
                                            key={page}
                                            className="bg-gray-200 px-2 py-1 rounded text-sm"
                                        >
                                            {pageNames[page] || page}
                                        </span>
                                    ))}
                                </div>

                                {/* Dropdown to add new pages */}
                                <label className="block text-sm mb-1">Add New Pages</label>
                                <select
                                    className="p-2 border rounded w-full"
                                    value={selectedPages}
                                    onChange={handleNewPagesSelect}
                                >
                                    {Object.entries(pageNames).map(([path, name]) => (
                                        <option key={path} value={path}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className={`px-4 py-2 bg-blue-500 text-white rounded w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Employee'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
