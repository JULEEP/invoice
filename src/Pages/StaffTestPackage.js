import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StaffTestPackage = () => {
  const { staffId } = useParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!staffId) return;

    setLoading(true);
    axios
      .get(`https://api.credenthealth.com/api/staff/stafftestpackages/${staffId}`)
      .then((res) => {
        if (res.data.myPackages) {
          setPackages(res.data.myPackages);
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching staff packages:", err);
        alert("Failed to load packages.");
      })
      .finally(() => setLoading(false));
  }, [staffId]);

  return (
    <div className="p-6 bg-white rounded shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-800 mb-6">
        User Diagnostic Packages
      </h2>

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : packages.length === 0 ? (
        <p className="text-center text-lg">No packages found.</p>
      ) : (
        packages.map((pkg) => (
          <div
            key={pkg._id}
            className="mb-10 p-5 border border-gray-300 rounded-lg shadow-md bg-gray-50"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-green-800 capitalize">
                {pkg.packageName}{" "}
                <span className="text-gray-500">({pkg.totalTestsIncluded} Tests)</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Price:</strong> ₹{pkg.price}
              </p>
              {pkg.offerPrice > 0 && (
                <p className="text-sm text-blue-600">
                  <strong>Offer Price:</strong> ₹{pkg.offerPrice}
                </p>
              )}
            </div>

            {/* Diagnostic Center Info */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700">Diagnostic Center</h4>
              <p className="text-sm text-gray-700">{pkg.diagnosticCenter?.name} ({pkg.diagnosticCenter?.centerType})</p>
              <p className="text-sm text-gray-600">{pkg.diagnosticCenter?.address}</p>
              <p className="text-sm text-gray-600">📞 {pkg.diagnosticCenter?.phone}</p>
              <p className="text-sm text-gray-600">✉️ {pkg.diagnosticCenter?.email}</p>
            </div>

            {/* Description */}
            {pkg.description && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{pkg.description}</p>
              </div>
            )}

            {/* Precautions */}
            {pkg.precautions && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Precautions</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{pkg.precautions}</p>
              </div>
            )}

            {/* Included Tests */}
            {pkg.includedTests?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Included Tests</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pkg.includedTests.map((test, idx) => (
                    <div
                      key={test._id || idx}
                      className="bg-white border-l-4 border-blue-500 px-4 py-2 rounded shadow-sm"
                    >
                      <p className="font-semibold text-gray-800">{test.name}</p>
                      <p className="text-sm text-gray-600">
                        Sub-tests ({test.subTestCount}):{" "}
                        {test.subTests.length > 0
                          ? test.subTests.join(", ")
                          : "None"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default StaffTestPackage;
