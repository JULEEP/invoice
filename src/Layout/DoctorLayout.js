import React, { useState } from "react";
import DoctorNavbar from "../Doctor/DoctorNavbar";
import DoctorSidebar from "../Doctor/DoctorSidebar";

const DoctorLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);  // Sidebar collapse state

  return (
    <div className="flex h-screen">
      {/* Sidebar for the Doctor */}
      <DoctorSidebar isCollapsed={isCollapsed} />

      <div className="flex-1 flex flex-col">
        {/* Navbar for the Doctor */}
        <DoctorNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        {/* Main content area */}
        <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
