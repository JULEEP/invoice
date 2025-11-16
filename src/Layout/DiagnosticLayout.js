import React, { useState } from "react";
import DiagnosticSidebar from "../Diagnostic/DiagnosticSidebar";
import DiagnosticNavbar from "../Diagnostic/DiagnosticNavbar";

const DiagnosticLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <DiagnosticSidebar isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col">
        <DiagnosticNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DiagnosticLayout;
