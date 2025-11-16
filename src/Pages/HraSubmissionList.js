import React, { useState, useEffect } from 'react';

const HRASubmissionList = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    // Fetch data from API
    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://api.credenthealth.com/api/admin/allhrasubmission');
            const data = await response.json();

            if (data.success) {
                setSubmissions(data.data);
                setFilteredSubmissions(data.data);
            } else {
                setError('Failed to fetch data');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let filtered = submissions;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(submission => 
                submission.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (submission.staff.branch && submission.staff.branch.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Risk level filter
        if (riskFilter !== 'all') {
            filtered = filtered.filter(submission => 
                submission.riskLevel.toLowerCase() === riskFilter.toLowerCase()
            );
        }

        // Department filter
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(submission => 
                submission.staff.department === departmentFilter
            );
        }

        // Date filter (last 7 days, last 30 days, etc.)
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (dateFilter) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setDate(now.getDate() - 30);
                    break;
                default:
                    break;
            }

            filtered = filtered.filter(submission => {
                const submissionDate = new Date(submission.submittedAt);
                return submissionDate >= startDate;
            });
        }

        setFilteredSubmissions(filtered);
    }, [searchTerm, riskFilter, departmentFilter, dateFilter, submissions]);

    // Get unique departments for filter dropdown
    const departments = [...new Set(submissions.map(submission => submission.staff.department))];

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get risk level badge color
    const getRiskBadgeColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Handle view details click
    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
        setShowModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSubmission(null);
    };

    // Export to CSV function - Organized like popup modal
    const exportToCSV = () => {
        if (filteredSubmissions.length === 0) return;

        let csvContent = '';

        // Process each submission individually with clear sections
        filteredSubmissions.forEach((submission, index) => {
            // Header for each submission
            csvContent += `HRA SUBMISSION DETAILS - ${submission.staff.name}\n`;
            csvContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
            csvContent += '='.repeat(50) + '\n\n';

            // SECTION 1: STAFF INFORMATION
            csvContent += 'STAFF INFORMATION\n';
            csvContent += '-'.repeat(20) + '\n';
            csvContent += `Name,${submission.staff.name}\n`;
            csvContent += `Email,${submission.staff.email}\n`;
            csvContent += `Department,${submission.staff.department}\n`;
            csvContent += `Branch,${submission.staff.branch || 'N/A'}\n\n`;

            // SECTION 2: SUBMISSION INFORMATION
            csvContent += 'SUBMISSION INFORMATION\n';
            csvContent += '-'.repeat(25) + '\n';
            csvContent += `Submission Date,${formatDate(submission.submittedAt)}\n`;
            csvContent += `Total Points,${submission.totalPoints}\n`;
            csvContent += `Risk Level,${submission.riskLevel}\n`;
            csvContent += `Risk Assessment,${submission.riskMessage || 'N/A'}\n\n`;

            // SECTION 3: CATEGORY POINTS SUMMARY
            csvContent += 'CATEGORY POINTS SUMMARY\n';
            csvContent += '-'.repeat(25) + '\n';
            if (submission.categoryPoints && Object.keys(submission.categoryPoints).length > 0) {
                Object.entries(submission.categoryPoints).forEach(([category, points]) => {
                    csvContent += `${category},${points} Points\n`;
                });
            } else {
                csvContent += 'No category points data\n';
            }
            csvContent += '\n';

            // SECTION 4: HEALTH RECOMMENDATIONS
            csvContent += 'HEALTH RECOMMENDATIONS\n';
            csvContent += '-'.repeat(25) + '\n';
            if (submission.prescribedForCategories && Object.keys(submission.prescribedForCategories).length > 0) {
                Object.entries(submission.prescribedForCategories).forEach(([category, recommendation]) => {
                    csvContent += `${category},${recommendation}\n`;
                });
            } else {
                csvContent += 'No recommendations available\n';
            }
            csvContent += '\n';

            // SECTION 5: QUESTIONNAIRE RESPONSES
            csvContent += 'QUESTIONNAIRE RESPONSES\n';
            csvContent += '-'.repeat(25) + '\n';
            csvContent += 'Category,Question Number,Question,Selected Answer,Points Scored\n';
            
            if (submission.answers && submission.answers.length > 0) {
                submission.answers.forEach((answer, idx) => {
                    const questionNumber = `Q${idx + 1}`;
                    const category = answer.category || 'Uncategorized';
                    const question = answer.questionText ? `"${answer.questionText.replace(/"/g, '""')}"` : 'Question not available';
                    const selectedAnswer = answer.selectedOption?.text ? `"${answer.selectedOption.text.replace(/"/g, '""')}"` : 'No option selected';
                    const points = answer.scoredPoints || 0;
                    
                    csvContent += `${category},${questionNumber},${question},${selectedAnswer},${points} Points\n`;
                });
            } else {
                csvContent += 'No questionnaire responses available\n';
            }

            // Add separation between multiple submissions
            if (index < filteredSubmissions.length - 1) {
                csvContent += '\n' + '='.repeat(80) + '\n\n';
            }
        });

        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `hra-submissions-detailed-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Alternative: Single row per submission for spreadsheet analysis
    const exportToCSVSpreadsheet = () => {
        const headers = [
            'Staff Name',
            'Staff Email',
            'Department',
            'Branch',
            'Submission Date',
            'Total Points',
            'Risk Level',
            'Risk Message'
        ];

        // Add category points
        const categories = [...new Set(submissions.flatMap(sub => Object.keys(sub.categoryPoints || {})))];
        categories.forEach(cat => {
            headers.push(`${cat} Points`);
        });

        // Add recommendations
        const recommendationCats = [...new Set(submissions.flatMap(sub => Object.keys(sub.prescribedForCategories || {})))];
        recommendationCats.forEach(cat => {
            headers.push(`${cat} Recommendation`);
        });

        // Add question summary
        headers.push('Total Questions Answered');
        headers.push('Categories Covered');

        const csvData = filteredSubmissions.map(submission => {
            const row = [
                submission.staff.name,
                submission.staff.email,
                submission.staff.department,
                submission.staff.branch || 'N/A',
                formatDate(submission.submittedAt),
                submission.totalPoints,
                submission.riskLevel,
                submission.riskMessage || 'N/A'
            ];

            // Add category points
            categories.forEach(cat => {
                row.push(submission.categoryPoints?.[cat] || 0);
            });

            // Add recommendations
            recommendationCats.forEach(cat => {
                row.push(submission.prescribedForCategories?.[cat] || 'N/A');
            });

            // Add question summary
            row.push(submission.answers?.length || 0);
            
            const answeredCategories = [...new Set(submission.answers?.map(a => a.category) || [])];
            row.push(answeredCategories.join('; '));

            return row;
        });

        const csvContent = [
            headers,
            ...csvData
        ].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `hra-submissions-spreadsheet-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setRiskFilter('all');
        setDepartmentFilter('all');
        setDateFilter('all');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 font-semibold mb-2">Error</div>
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={fetchSubmissions}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Export Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            HRA Submissions
                        </h1>
                        <p className="text-gray-600">
                            Total {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
                            {filteredSubmissions.length !== submissions.length && ` (filtered from ${submissions.length})`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToCSV}
                            disabled={filteredSubmissions.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                filteredSubmissions.length === 0 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Detailed Report
                        </button>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        {/* Search Input */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, email, department..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Risk Level Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Risk Level
                            </label>
                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Risk Levels</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Staff Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Submission Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Total Points
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Risk Level
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredSubmissions.map((submission, index) => (
                                    <tr
                                        key={submission.submissionId}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {submission.staff.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {submission.staff.email}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Dept: {submission.staff.department}
                                                    {submission.staff.branch && ` • ${submission.staff.branch}`}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {formatDate(submission.submittedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {submission.totalPoints} Points
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskBadgeColor(submission.riskLevel)}`}>
                                                {submission.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleViewDetails(submission)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredSubmissions.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <div className="text-gray-500 text-lg mb-2">No submissions found</div>
                            {submissions.length > 0 && (
                                <p className="text-gray-400 text-sm">
                                    Try adjusting your search or filters
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Popup Modal */}
                {showModal && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Submission Details
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Staff Information */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3">Staff Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Name</label>
                                            <p className="text-gray-900">{selectedSubmission.staff.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-gray-900">{selectedSubmission.staff.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Department</label>
                                            <p className="text-gray-900">{selectedSubmission.staff.department}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Branch</label>
                                            <p className="text-gray-900">{selectedSubmission.staff.branch || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Information */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3">Submission Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Submission Date</label>
                                            <p className="text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Total Points</label>
                                            <p className="text-2xl font-bold text-blue-600">{selectedSubmission.totalPoints}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Risk Level</label>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskBadgeColor(selectedSubmission.riskLevel)}`}>
                                                {selectedSubmission.riskLevel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Message */}
                                {selectedSubmission.riskMessage && (
                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <h3 className="font-semibold text-yellow-900 mb-2">Risk Assessment</h3>
                                        <p className="text-yellow-800">{selectedSubmission.riskMessage}</p>
                                    </div>
                                )}

                                {/* Category Points */}
                                {selectedSubmission.categoryPoints && Object.keys(selectedSubmission.categoryPoints).length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Category Points</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(selectedSubmission.categoryPoints).map(([category, points]) => (
                                                <div key={category} className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                                                    <div className="font-medium text-gray-900 text-sm mb-2">{category}</div>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {points} Points
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Health Recommendations */}
                                {selectedSubmission.prescribedForCategories && Object.keys(selectedSubmission.prescribedForCategories).length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Health Recommendations</h3>
                                        <div className="space-y-3">
                                            {Object.entries(selectedSubmission.prescribedForCategories).map(([category, prescription]) => (
                                                <div key={category} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                    <div className="font-medium text-green-900 mb-2">{category}</div>
                                                    <div className="text-green-800">{prescription}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Questionnaire Responses */}
                                {selectedSubmission.answers && selectedSubmission.answers.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Questionnaire Responses</h3>
                                        <div className="space-y-4">
                                            {selectedSubmission.answers.map((answer, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                                                >
                                                    {/* Category + Points */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="font-medium text-gray-900 text-sm">
                                                            {answer.category}
                                                        </span>
                                                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                                            {answer.scoredPoints} Points
                                                        </span>
                                                    </div>

                                                    {/* Question Text */}
                                                    <div className="mb-3">
                                                        <p className="text-gray-800 font-medium">
                                                            Q{idx + 1}. {answer.questionText || "— Question not available —"}
                                                        </p>
                                                    </div>

                                                    {/* Selected Option */}
                                                    <div className="text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                        <strong className="text-gray-600">Selected Answer:</strong>
                                                        <p className="mt-1 text-gray-900">
                                                            {answer?.selectedOption?.text || "— No option selected —"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end p-6 border-t border-gray-200">
                                <button
                                    onClick={handleCloseModal}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRASubmissionList;