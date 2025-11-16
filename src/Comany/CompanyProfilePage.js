import React, { useEffect, useState } from "react";
import axios from "axios";

const CompanyProfilePage = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companyId = localStorage.getItem("companyId");

        if (!companyId) {
          alert("Company ID not found in localStorage");
          return;
        }

        const response = await axios.get(`https://api.credenthealth.com/api/admin/singlecompany/${companyId}`);
        setCompany(response.data.company);
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-600">Loading company details...</div>;
  if (!company) return <div className="p-4 text-center text-red-600">Company not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-900">Company Profile</h2>

     {company.image && (
  <div className="mb-8 flex justify-center">
    <img
      src={`https://api.credenthealth.com${company.image}`}
      alt="Company"
      className="max-w-md w-full h-auto rounded-lg border shadow-md object-cover"
    />
  </div>
)}

      

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm bg-gray-50 p-6 rounded border">
        <Info label="Company ID" value={company._id} />
        <Info label="Company Name" value={company.name} />
        <Info label="Industry Type" value={company.companyType} />
        <Info label="Contact Person" value={company.assignedBy} />
        <Info label="Tie Up" value={formatDate(company.registrationDate)} />
        <Info label="Contract Period" value={company.contractPeriod} />
        <Info label="Renewal Date" value={formatDate(company.renewalDate)} />
        <Info label="Insurance Partner" value={company.insuranceBroker} />
        <Info label="Email" value={company.email} />
        <Info label="Phone" value={company.phone} />
        <Info label="Employee Head Count" value={company.companyStrength} />
        <Info label="Country" value={company.country} />
        <Info label="State" value={company.state} />
        <Info label="City" value={company.city} />
        <Info label="Pincode" value={company.pincode} />
      </div>
    </div>
  );
};

// Reusable Info Component
const Info = ({ label, value }) => (
  <div className="bg-white p-3 rounded shadow-sm border hover:shadow-md transition duration-200">
    <span className="text-xs text-gray-500 font-medium block mb-1">{label}</span>
    <span className="text-gray-800 font-semibold">{value || "N/A"}</span>
  </div>
);

// Utility to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default CompanyProfilePage;
