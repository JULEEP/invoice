import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Import your components
import AdminLayout from "./Layout/AdminLayout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import CompanyList from "./Pages/CompanyList.js";
import InvoiceGenerationForm from "./Pages/CompanyDetailsForm.js";

function App() {
  return (
    <Routes>
      {/* Redirect root path to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* All routes inside AdminLayout */}
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companylist" element={<CompanyList />} />
              <Route path="/generateinvoice" element={<InvoiceGenerationForm />} />
              
              {/* Redirect any unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;