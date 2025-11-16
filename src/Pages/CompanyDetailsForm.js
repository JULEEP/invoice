import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiUploadCloud, FiX, FiFile, FiCheck, FiCheckSquare, FiPlus, FiMinus, FiDollarSign } from 'react-icons/fi';

const InvoiceGenerationForm = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState({
    patients: false,
    tests: false
  });

  const initialFormData = {
    patientId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentStatus: 'pending',
    totalAmount: 0,
    amountPaid: 0,
    remainingAmount: 0,
    paymentMethod: '',
    transactionId: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedTests, setSelectedTests] = useState([]);
  const [showTestsDropdown, setShowTestsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample test data - in real app, this would come from API
  const sampleTests = [
    { id: '1', name: 'Complete Blood Count (CBC)', price: 500, category: 'Hematology' },
    { id: '2', name: 'Lipid Profile', price: 800, category: 'Biochemistry' },
    { id: '3', name: 'Liver Function Test', price: 1200, category: 'Biochemistry' },
    { id: '4', name: 'Thyroid Profile', price: 1000, category: 'Hormones' },
    { id: '5', name: 'Blood Glucose Fasting', price: 200, category: 'Biochemistry' },
    { id: '6', name: 'Urine Routine Examination', price: 300, category: 'Pathology' },
    { id: '7', name: 'ECG', price: 400, category: 'Cardiology' },
    { id: '8', name: 'Chest X-Ray', price: 600, category: 'Radiology' },
    { id: '9', name: 'Vitamin D Total', price: 1500, category: 'Vitamins' },
    { id: '10', name: 'HbA1c', price: 700, category: 'Diabetes' }
  ];

  // Sample patients data
  const samplePatients = [
    { id: '1', name: 'Rahul Sharma', age: 35, gender: 'Male', phone: '9876543210' },
    { id: '2', name: 'Priya Patel', age: 28, gender: 'Female', phone: '9876543211' },
    { id: '3', name: 'Amit Kumar', age: 45, gender: 'Male', phone: '9876543212' },
    { id: '4', name: 'Sneha Gupta', age: 32, gender: 'Female', phone: '9876543213' },
    { id: '5', name: 'Vikram Singh', age: 50, gender: 'Male', phone: '9876543214' }
  ];

  // Fetch patients and tests on component mount
  useEffect(() => {
    setLoading({ patients: true, tests: true });
    
    // Simulate API calls
    setTimeout(() => {
      setPatients(samplePatients);
      setTests(sampleTests);
      setLoading({ patients: false, tests: false });
    }, 1000);
  }, []);

  // Calculate totals whenever selected tests or amount paid changes
  useEffect(() => {
    const total = selectedTests.reduce((sum, test) => sum + (test.price * test.quantity), 0);
    const remaining = total - formData.amountPaid;
    
    setFormData(fd => ({
      ...fd,
      totalAmount: total,
      remainingAmount: remaining > 0 ? remaining : 0
    }));
  }, [selectedTests, formData.amountPaid]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handlePatientSelect = e => {
    const patientId = e.target.value;
    setFormData(fd => ({ ...fd, patientId }));
  };

  // Filter tests by name or category
  const filteredTests = tests.filter(test => {
    const search = searchTerm.toLowerCase();
    return (
      test.name.toLowerCase().includes(search) ||
      test.category.toLowerCase().includes(search) ||
      test.price.toString().includes(search)
    );
  });

  const toggleTestSelection = (test) => {
    setSelectedTests(prev => {
      const existingTest = prev.find(t => t.id === test.id);
      if (existingTest) {
        return prev.filter(t => t.id !== test.id);
      } else {
        return [...prev, { ...test, quantity: 1 }];
      }
    });
  };

  const updateTestQuantity = (testId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedTests(prev =>
      prev.map(test =>
        test.id === testId ? { ...test, quantity: newQuantity } : test
      )
    );
  };

  const removeTest = (testId) => {
    setSelectedTests(prev => prev.filter(test => test.id !== testId));
  };

  const selectAllTests = () => {
    if (selectedTests.length === filteredTests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(filteredTests.map(test => ({ ...test, quantity: 1 })));
    }
  };

  const toggleTestsDropdown = () => {
    setShowTestsDropdown(!showTestsDropdown);
  };

  const calculateTestTotal = (test) => {
    return test.price * test.quantity;
  };

  const validateForm = () => {
    if (!formData.patientId) {
      Swal.fire("Error", "Please select a patient", "error");
      return false;
    }
    if (selectedTests.length === 0) {
      Swal.fire("Error", "Please select at least one test", "error");
      return false;
    }
    if (formData.amountPaid < 0) {
      Swal.fire("Error", "Amount paid cannot be negative", "error");
      return false;
    }
    if (formData.amountPaid > formData.totalAmount) {
      Swal.fire("Error", "Amount paid cannot be greater than total amount", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const invoiceData = {
      ...formData,
      tests: selectedTests,
      patient: patients.find(p => p.id === formData.patientId),
      createdAt: new Date().toISOString(),
      invoiceNumber: `INV-${Date.now()}`
    };

    try {
      // In real app, you would send this to your backend
      console.log('Invoice Data:', invoiceData);
      
      Swal.fire("Success", "Invoice generated successfully!", "success");
      
      // Reset form
      setFormData({
        ...initialFormData,
        invoiceDate: new Date().toISOString().split('T')[0]
      });
      setSelectedTests([]);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      Swal.fire("Error", "Failed to generate invoice", "error");
    }
  };

  const handleCancel = () => {
    navigate('/invoices');
  };

  const selectedPatient = patients.find(p => p.id === formData.patientId);

  return (
    <div className="p-6 bg-white rounded shadow max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">Generate Invoice</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Patient Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient *
              </label>
              <select
                value={formData.patientId}
                onChange={handlePatientSelect}
                required
                className="border p-2 rounded w-full"
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.age} years, {patient.gender}) - {patient.phone}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-semibold text-blue-800">Selected Patient Details:</h5>
                <p className="text-sm text-blue-700">
                  Name: {selectedPatient.name}<br />
                  Age: {selectedPatient.age} years<br />
                  Gender: {selectedPatient.gender}<br />
                  Phone: {selectedPatient.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tests Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Select Tests</h4>
          
          <div className="relative mb-4">
            <button
              type="button"
              onClick={toggleTestsDropdown}
              className="w-full flex justify-between items-center border p-3 rounded bg-white hover:border-blue-500 transition-colors"
            >
              <span className="text-gray-700">
                {selectedTests.length > 0
                  ? `${selectedTests.length} test(s) selected`
                  : "Click to select tests"}
              </span>
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showTestsDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {/* Search Input */}
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search tests by name, category, or price"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>

                {/* Select All */}
                <div
                  className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={selectAllTests}
                >
                  {selectedTests.length === filteredTests.length && filteredTests.length > 0 ? (
                    <FiCheckSquare className="text-blue-500 mr-3 text-lg" />
                  ) : (
                    <FiCheck className="text-gray-400 mr-3 text-lg" />
                  )}
                  <span className="font-medium">Select All Tests</span>
                </div>

                {/* Tests List */}
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
                      onClick={() => toggleTestSelection(test)}
                    >
                      {selectedTests.find(t => t.id === test.id) ? (
                        <FiCheckSquare className="text-blue-500 mr-3 text-lg" />
                      ) : (
                        <FiCheck className="text-gray-400 mr-3 text-lg" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{test.name}</div>
                        <div className="text-sm text-gray-500">
                          Category: {test.category} | Price: ₹{test.price}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                    No tests found matching your search.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Tests Table */}
          {selectedTests.length > 0 && (
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-gray-700">Selected Tests</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Test Name</th>
                      <th className="py-2 px-4 border-b text-left">Category</th>
                      <th className="py-2 px-4 border-b text-center">Quantity</th>
                      <th className="py-2 px-4 border-b text-right">Price</th>
                      <th className="py-2 px-4 border-b text-right">Total</th>
                      <th className="py-2 px-4 border-b text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b">{test.name}</td>
                        <td className="py-3 px-4 border-b text-sm text-gray-600">{test.category}</td>
                        <td className="py-3 px-4 border-b text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateTestQuantity(test.id, test.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center">{test.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateTestQuantity(test.id, test.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b text-right">₹{test.price}</td>
                        <td className="py-3 px-4 border-b text-right font-semibold">
                          ₹{calculateTestTotal(test)}
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          <button
                            type="button"
                            onClick={() => removeTest(test.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiX size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Invoice Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date *</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status *</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                placeholder="Enter transaction ID if any"
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes or instructions..."
              rows="3"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold mb-4 text-blue-800">Amount Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">₹{formData.totalAmount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-700">Discount:</span>
                <span className="font-semibold text-green-600">₹0</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-700">Tax (0%):</span>
                <span className="font-semibold">₹0</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-800">Total Amount:</span>
                <span className="text-blue-700">₹{formData.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max={formData.totalAmount}
                    className="border p-2 pl-10 rounded w-full"
                    placeholder="Enter amount paid"
                  />
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Remaining Amount:</span>
                  <span className={`text-lg font-bold ${
                    formData.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ₹{formData.remainingAmount}
                  </span>
                </div>
                {formData.remainingAmount > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Patient needs to pay ₹{formData.remainingAmount} more
                  </p>
                )}
                {formData.remainingAmount === 0 && formData.totalAmount > 0 && (
                  <p className="text-sm text-green-500 mt-1">
                    Payment completed successfully!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors flex items-center"
          >
            <FiFile className="mr-2" />
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceGenerationForm;