import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiDownload, FiEye, FiPlus, FiSearch, FiX, FiCheck, FiCheckSquare, FiMinus, FiDollarSign, FiFile, FiSave, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';

const CompanyList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Sample dummy data
  const dummyInvoices = [
    {
      id: 'INV-001',
      invoiceNumber: 'INV-001',
      patient: {
        id: '1',
        name: 'Rahul Sharma',
        age: 35,
        gender: 'Male',
        phone: '9876543210',
        address: '123 Main St, Delhi'
      },
      tests: [
        { id: '1', name: 'Complete Blood Count (CBC)', price: 500, quantity: 1, category: 'Hematology' },
        { id: '2', name: 'Lipid Profile', price: 800, quantity: 1, category: 'Biochemistry' }
      ],
      invoiceDate: '2024-01-15',
      dueDate: '2024-01-22',
      paymentStatus: 'paid',
      totalAmount: 1300,
      amountPaid: 1300,
      remainingAmount: 0,
      paymentMethod: 'upi',
      transactionId: 'TXN001234',
      notes: 'Routine health checkup',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'INV-002',
      invoiceNumber: 'INV-002',
      patient: {
        id: '2',
        name: 'Priya Patel',
        age: 28,
        gender: 'Female',
        phone: '9876543211',
        address: '456 Park Ave, Mumbai'
      },
      tests: [
        { id: '3', name: 'Liver Function Test', price: 1200, quantity: 1, category: 'Biochemistry' },
        { id: '4', name: 'Thyroid Profile', price: 1000, quantity: 1, category: 'Hormones' },
        { id: '5', name: 'Blood Glucose Fasting', price: 200, quantity: 1, category: 'Biochemistry' }
      ],
      invoiceDate: '2024-01-16',
      dueDate: '2024-01-23',
      paymentStatus: 'partial',
      totalAmount: 2400,
      amountPaid: 1500,
      remainingAmount: 900,
      paymentMethod: 'cash',
      transactionId: '',
      notes: 'Comprehensive health screening',
      createdAt: '2024-01-16T14:20:00Z'
    }
  ];

  // Sample data for forms
  const samplePatients = [
    { id: '1', name: 'Rahul Sharma', age: 35, gender: 'Male', phone: '9876543210', address: '123 Main St, Delhi' },
    { id: '2', name: 'Priya Patel', age: 28, gender: 'Female', phone: '9876543211', address: '456 Park Ave, Mumbai' },
    { id: '3', name: 'Amit Kumar', age: 45, gender: 'Male', phone: '9876543212', address: '789 MG Road, Bangalore' }
  ];

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

  useEffect(() => {
    setInvoices(dummyInvoices);
    setFilteredInvoices(dummyInvoices);
  }, []);

  // Filter invoices
  useEffect(() => {
    let filtered = invoices;
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patient.phone.includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.paymentStatus === statusFilter);
    }
    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  // Action Handlers
  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowEditForm(true);
  };

  const handleDelete = (invoice) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete invoice ${invoice.invoiceNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setInvoices(invoices.filter(inv => inv.id !== invoice.id));
        Swal.fire('Deleted!', 'Invoice has been deleted.', 'success');
      }
    });
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleDownload = (invoice) => {
    generateAndDownloadPDF(invoice);
  };

  const handleCreateInvoice = (newInvoice) => {
    const invoiceWithId = {
      ...newInvoice,
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    setInvoices([invoiceWithId, ...invoices]);
    setShowCreateForm(false);
    Swal.fire('Success!', 'Invoice created successfully.', 'success');
  };

  const handleUpdateInvoice = (updatedInvoice) => {
    setInvoices(invoices.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
    setShowEditForm(false);
    setSelectedInvoice(null);
    Swal.fire('Success!', 'Invoice updated successfully.', 'success');
  };

  // Helper Functions
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', text: 'Partial' },
      pending: { color: 'bg-red-100 text-red-800', text: 'Pending' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  const getPaymentMethod = (method) => {
    const methods = {
      cash: 'Cash', card: 'Card', upi: 'UPI', netbanking: 'Net Banking', insurance: 'Insurance'
    };
    return methods[method] || 'Not Specified';
  };

  const generateAndDownloadPDF = (invoice) => {
    // Create a simple PDF using html2pdf without autoTable
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #2c5aa0; 
            padding-bottom: 20px; 
          }
          .invoice-title { 
            font-size: 28px; 
            font-weight: bold; 
            color: #2c5aa0; 
            margin-bottom: 10px;
          }
          .clinic-info {
            font-size: 14px;
            color: #666;
            line-height: 1.4;
          }
          .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin: 25px 0; 
            flex-wrap: wrap;
          }
          .info-section {
            flex: 1;
            min-width: 200px;
            margin: 10px;
          }
          .section { 
            margin: 25px 0; 
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 8px; 
            color: #2c5aa0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left; 
          }
          th { 
            background-color: #2c5aa0; 
            color: white; 
            font-weight: bold;
            text-align: center;
          }
          .total-section { 
            margin-top: 25px; 
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            padding: 5px 0;
          }
          .total-amount { 
            font-size: 16px; 
            font-weight: bold; 
          }
          .balance-due {
            border-top: 2px solid #2c5aa0;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 18px;
            color: #d32f2f;
            font-weight: bold;
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .patient-info, .invoice-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .payment-summary {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">MEDICAL DIAGNOSTIC CENTER</div>
          <div class="clinic-info">
            123 Healthcare Street, Medical City, MC 12345<br>
            Phone: +91 9876543210 | Email: info@diagnosticcenter.com<br>
            GSTIN: 07AABCU9603R1ZM
          </div>
        </div>

        <div class="invoice-info">
          <div class="info-section">
            <div class="patient-info">
              <strong>BILL TO:</strong><br>
              ${invoice.patient.name}<br>
              ${invoice.patient.address}<br>
              Phone: ${invoice.patient.phone}<br>
              Age: ${invoice.patient.age} years | Gender: ${invoice.patient.gender}
            </div>
          </div>
          <div class="info-section">
            <div class="invoice-details">
              <strong>INVOICE DETAILS:</strong><br>
              Invoice No: ${invoice.invoiceNumber}<br>
              Invoice Date: ${invoice.invoiceDate}<br>
              Due Date: ${invoice.dueDate}<br>
              Status: ${invoice.paymentStatus.toUpperCase()}<br>
              Payment Method: ${getPaymentMethod(invoice.paymentMethod)}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TESTS CONDUCTED</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%">Test Name</th>
                <th style="width: 20%">Category</th>
                <th style="width: 10%">Qty</th>
                <th style="width: 15%">Price (₹)</th>
                <th style="width: 15%">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.tests.map(test => `
                <tr>
                  <td>${test.name}</td>
                  <td>${test.category}</td>
                  <td style="text-align: center;">${test.quantity}</td>
                  <td style="text-align: right;">${test.price}</td>
                  <td style="text-align: right;">${test.price * test.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="payment-summary">
          <div class="section-title">PAYMENT SUMMARY</div>
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1;">
              <div class="total-row">
                <span>Total Amount:</span>
                <span>₹${invoice.totalAmount}</span>
              </div>
              <div class="total-row">
                <span>Amount Paid:</span>
                <span>₹${invoice.amountPaid}</span>
              </div>
              <div class="total-row">
                <span>Remaining Amount:</span>
                <span>₹${invoice.remainingAmount}</span>
              </div>
              <div class="total-row balance-due">
                <span>BALANCE DUE:</span>
                <span>₹${invoice.remainingAmount}</span>
              </div>
            </div>
            <div style="flex: 1; padding-left: 20px;">
              ${invoice.transactionId ? `<p><strong>Transaction ID:</strong><br>${invoice.transactionId}</p>` : ''}
              ${invoice.notes ? `<p><strong>Notes:</strong><br>${invoice.notes}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing our diagnostic services!</strong></p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>For any queries, please contact: +91 9876543210 | info@diagnosticcenter.com</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window with the invoice content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
    };

    Swal.fire('Success!', `Invoice ${invoice.invoiceNumber} is ready for printing.`, 'success');
  };

  // Edit Invoice Form Component - WITH ADD TEST FUNCTIONALITY
  const EditInvoiceForm = ({ invoice, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({ ...invoice });
    const [selectedTests, setSelectedTests] = useState([...invoice.tests]);
    const [showAddTestDropdown, setShowAddTestDropdown] = useState(false);
    const [testSearchTerm, setTestSearchTerm] = useState("");

    useEffect(() => {
      const total = selectedTests.reduce((sum, test) => sum + (test.price * test.quantity), 0);
      const remaining = total - formData.amountPaid;
      setFormData(fd => ({ ...fd, totalAmount: total, remainingAmount: remaining > 0 ? remaining : 0 }));
    }, [selectedTests, formData.amountPaid]);

    const handleInputChange = e => {
      const { name, value } = e.target;
      setFormData(fd => ({ ...fd, [name]: value }));
    };

    const updateTestQuantity = (testId, newQuantity) => {
      if (newQuantity < 1) return;
      setSelectedTests(prev => prev.map(test => test.id === testId ? { ...test, quantity: newQuantity } : test));
    };

    const removeTest = (testId) => {
      setSelectedTests(prev => prev.filter(test => test.id !== testId));
    };

    const toggleTestSelection = (test) => {
      setSelectedTests(prev => {
        const existingTest = prev.find(t => t.id === test.id);
        if (existingTest) return prev.filter(t => t.id !== test.id);
        return [...prev, { ...test, quantity: 1 }];
      });
    };

    const filteredTests = sampleTests.filter(test => 
      test.name.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(testSearchTerm.toLowerCase())
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ ...formData, tests: selectedTests });
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={onCancel} className="mr-4 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
            <FiArrowLeft size={24} />
          </button>
          <h3 className="text-2xl font-bold text-blue-700">Edit Invoice - {invoice.invoiceNumber}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold mb-4 text-blue-800">Patient Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input type="text" value={formData.patient.name} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="text" value={formData.patient.phone} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>

          {/* Tests Section with Add Test Functionality */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-blue-800">Tests</h4>
              <button
                type="button"
                onClick={() => setShowAddTestDropdown(!showAddTestDropdown)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <FiPlus size={18} />
                Add Tests
              </button>
            </div>

            {/* Add Test Dropdown */}
            {showAddTestDropdown && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <h5 className="font-semibold mb-3 text-gray-800">Add New Tests</h5>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={testSearchTerm}
                    onChange={(e) => setTestSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FiSearch className="absolute right-3 top-3 text-gray-400" />
                </div>
                
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredTests.map(test => (
                    <div
                      key={test.id}
                      className={`flex items-center p-3 cursor-pointer border-b border-gray-100 ${
                        selectedTests.find(t => t.id === test.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
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
                          {test.category} • ₹{test.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-600">
                    {selectedTests.length} tests selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddTestDropdown(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Selected Tests List */}
            <div className="space-y-3">
              {selectedTests.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <FiFile className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">No tests added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add Tests" to add tests to this invoice</p>
                </div>
              ) : (
                selectedTests.map(test => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800">{test.name}</h5>
                      <p className="text-sm text-gray-600">{test.category}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center space-x-2">
                          <button 
                            type="button" 
                            onClick={() => updateTestQuantity(test.id, test.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{test.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => updateTestQuantity(test.id, test.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">₹{test.price * test.quantity}</div>
                        <div className="text-sm text-gray-500">₹{test.price} each</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeTest(test.id)} 
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tests Summary */}
            {selectedTests.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Tests:</span>
                  <span className="font-bold text-blue-600">{selectedTests.length}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-semibold text-gray-700">Tests Amount:</span>
                  <span className="font-bold text-green-600">
                    ₹{selectedTests.reduce((sum, test) => sum + (test.price * test.quantity), 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold mb-4 text-blue-800">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select 
                  name="paymentStatus" 
                  value={formData.paymentStatus} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid (₹)</label>
                <input 
                  type="number" 
                  name="amountPaid" 
                  value={formData.amountPaid} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  min="0" 
                  max={formData.totalAmount}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select 
                  name="paymentMethod" 
                  value={formData.paymentMethod} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                <input 
                  type="text" 
                  name="transactionId" 
                  value={formData.transactionId} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleInputChange} 
                rows="3" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="text-lg font-semibold mb-4 text-green-800">Amount Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-semibold">₹{formData.totalAmount}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-semibold text-blue-600">₹{formData.amountPaid}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-green-300">
                  <span className="font-bold text-lg">Remaining Amount:</span>
                  <span className={`font-bold text-lg ${formData.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{formData.remainingAmount}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {formData.remainingAmount === 0 ? (
                  <div className="text-center">
                    <div className="text-green-500 text-4xl mb-2">✅</div>
                    <p className="text-green-700 font-semibold">Payment Completed</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-red-500 text-4xl mb-2">⚠️</div>
                    <p className="text-red-700 font-semibold">Balance Due: ₹{formData.remainingAmount}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <FiSave size={18} />
              Update Invoice
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Rest of the component remains the same...
  // [Previous code for ViewInvoiceModal, InvoiceGenerationForm, and main component continues...]

  // View Invoice Modal
  const ViewInvoiceModal = ({ invoice, onClose }) => {
    if (!invoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header with Download Button */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">Invoice Details - {invoice.invoiceNumber}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownload(invoice)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors font-medium"
                >
                  <FiDownload size={18} />
                  Print Invoice
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">MEDICAL DIAGNOSTIC CENTER</h1>
              <p className="text-gray-600">123 Healthcare Street, Medical City, MC 12345</p>
              <p className="text-gray-600">Phone: +91 9876543210 | Email: info@diagnosticcenter.com</p>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-lg mb-3 text-blue-800">Patient Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {invoice.patient.name}</p>
                  <p><strong>Age:</strong> {invoice.patient.age} years</p>
                  <p><strong>Gender:</strong> {invoice.patient.gender}</p>
                  <p><strong>Phone:</strong> {invoice.patient.phone}</p>
                  <p><strong>Address:</strong> {invoice.patient.address}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-lg mb-3 text-blue-800">Invoice Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
                  <p><strong>Invoice Date:</strong> {invoice.invoiceDate}</p>
                  <p><strong>Due Date:</strong> {invoice.dueDate}</p>
                  <p><strong>Status:</strong> {getStatusBadge(invoice.paymentStatus)}</p>
                  <p><strong>Payment Method:</strong> {getPaymentMethod(invoice.paymentMethod)}</p>
                  {invoice.transactionId && <p><strong>Transaction ID:</strong> {invoice.transactionId}</p>}
                </div>
              </div>
            </div>

            {/* Tests Table */}
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-4 text-blue-800 border-b pb-2">Tests Conducted</h4>
              <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="p-3 border-b border-r text-left font-semibold text-gray-700">Test Name</th>
                      <th className="p-3 border-b border-r text-center font-semibold text-gray-700">Category</th>
                      <th className="p-3 border-b border-r text-center font-semibold text-gray-700">Quantity</th>
                      <th className="p-3 border-b border-r text-right font-semibold text-gray-700">Price</th>
                      <th className="p-3 border-b text-right font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.tests.map((test, index) => (
                      <tr key={test.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 border-b border-r">{test.name}</td>
                        <td className="p-3 border-b border-r text-center text-sm text-gray-600">{test.category}</td>
                        <td className="p-3 border-b border-r text-center">{test.quantity}</td>
                        <td className="p-3 border-b border-r text-right">₹{test.price}</td>
                        <td className="p-3 border-b text-right font-semibold text-blue-600">₹{test.price * test.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-lg mb-4 text-green-800">Payment Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-semibold">₹{invoice.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="font-semibold text-green-600">₹{invoice.amountPaid}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Remaining Amount:</span>
                    <span className={`font-bold text-lg ${invoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{invoice.remainingAmount}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {invoice.notes && (
                    <div>
                      <p className="font-medium mb-1">Notes:</p>
                      <p className="text-gray-700 bg-white p-3 rounded border">{invoice.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-gray-500 text-sm border-t pt-4">
              <p>Thank you for choosing our diagnostic services!</p>
              <p>This is a computer-generated invoice and does not require a signature.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 border-t pt-4">
              <button 
                onClick={() => handleDownload(invoice)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors font-medium"
              >
                <FiDownload size={18} />
                Print Invoice
              </button>
              <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  if (showCreateForm) {
    // [Include the InvoiceGenerationForm component here - same as before]
    return <div>Create Form Component - Same as before</div>;
  }

  if (showEditForm && selectedInvoice) {
    return <EditInvoiceForm invoice={selectedInvoice} onSubmit={handleUpdateInvoice} onCancel={() => setShowEditForm(false)} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Invoice Management</h1>
          <p className="text-gray-600">Manage and track all patient invoices</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, invoice number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Create Button */}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">Due: {invoice.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.patient.name}</div>
                      <div className="text-sm text-gray-500">{invoice.patient.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{invoice.tests.length} tests</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {invoice.tests[0]?.name} {invoice.tests.length > 1 && `+${invoice.tests.length - 1} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{invoice.totalAmount}</div>
                      {invoice.remainingAmount > 0 && (
                        <div className="text-sm text-red-600">Due: ₹{invoice.remainingAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.paymentStatus)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.invoiceDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleView(invoice)} 
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors" 
                          title="View Invoice"
                        >
                          <FiEye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDownload(invoice)} 
                          className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors" 
                          title="Print Invoice"
                        >
                          <FiDownload size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(invoice)} 
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-50 transition-colors" 
                          title="Edit Invoice"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice)} 
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors" 
                          title="Delete Invoice"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FiFile className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Get started by creating your first invoice'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto font-medium"
                >
                  <FiPlus size={18} />
                  Create First Invoice
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <ViewInvoiceModal 
          invoice={selectedInvoice} 
          onClose={() => setShowViewModal(false)} 
        />
      )}
    </div>
  );
};

export default CompanyList;





