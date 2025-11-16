import React, { useState } from "react";
import CompanyNavbar from "../Components/CompanyNavbar";
import CompanySidebar from "../Components/CompanySidebar";

const CompanyLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <CompanySidebar isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col">
        <CompanyNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default CompanyLayout;
