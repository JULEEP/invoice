import React from "react";
import { Route, Routes } from "react-router-dom";

// Import your components
import AdminLayout from "./Layout/AdminLayout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import DiagnostiCreate from "./Pages/LeaveApplication.js";
import DiagnosticList from "./Pages/Awardlist.js";
import Settings from "./Pages/Setting";
import CompanyDetailsForm from "./Pages/CompanyDetailsForm.js";
import CompanyList from "./Pages/CompanyList.js";
import DoctorDetailsForm from "./Pages/DoctorDetailsForm.js";
import DoctorList from "./Pages/DoctorList.js";
import StaffDetailsForm from "./Pages/StaffDetailsForm.js";
import StaffList from "./Pages/StaffList.js";
import DiagnosticsBookingList from "./Pages/DiagnosticsBookingList.js";
import DoctorAppointmentList from "./Pages/DoctorAppointmentList.js";
import AppointmentBookingForm from "./Pages/AppointmentBookingForm.js";
import DiagnosticDetail from "./Pages/DiagnosticDetail.js";
import DiagnosticsPendingBooking from "./Pages/DiagnosticsPendingBooking.js";
import DoctorAppointmentListPending from "./Pages/DoctorAppointmentListPending.js";
import LoginPage from "./Pages/Login.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import CompanySidebar from "./Components/CompanySidebar.js";
import CompanyLayout from "./Layout/CompanyLayout.js";
import CompanyDashboard from "./Comany/CompanyDashboard.js";
import CompanyLoginPage from "./Components/CompanyLoginPage.js";
import CompanyStaffDetailsForm from "./Comany/CompanyStaffDetailsForm.js";
import CompanyStaffList from "./Comany/CompanyStaffList.js";
import DiagnosticsAcceptedBooking from "./Pages/DiagnosticsAcceptedBooking.js";
import DiagnosticsRejectedBooking from "./Pages/DiagnosticsRejectedBooking.js";
import AcceptedAppointmentsList from "./Pages/AcceptedAppointmentsList.js";
import RejectedAppointmentsList from "./Pages/RejectedAppointmentsList.js";
import CompanyProfilePage from "./Comany/CompanyProfilePage.js";
import DoctorLayout from "./Layout/DoctorLayout.js";
import DoctorLoginPage from "./Doctor/DoctorLoginPage.js";
import DoctorDashboard from "./Doctor/DoctorDashboard.js";
import DoctorProfilePage from "./Doctor/DoctorProfilePage.js";
import SingleDoctorAppointmentList from "./Doctor/DoctorAppointmentList.js";
import AllDiagnostics from "./Comany/AllDiagnostics.js";
import StaffHistory from "./Pages/StaffHistory.js";
import DiagnosticBookingForm from "./Pages/DiagnosticBookingForm.js";
import CompanyStaffHistory from "./Comany/CompanyStaffHistory.js";
import CompanyAllDiagnostics from "./Comany/CompanyAllDiagnostics.js";
import DiagnosticLayout from "./Layout/DiagnosticLayout.js";
import DiagnosticLoginPage from "./Diagnostic/DiagnosticLoginPage.js";
import DiagnosticDashboard from "./Diagnostic/DiagnosticDashboard.js";
import SingleDiagnosticDetail from "./Diagnostic/SingleDiagnosticDetail.js";
import SingleDiagnosticBookings from "./Diagnostic/SingleDiagnosticBookings.js";
import StaffTestPackage from "./Pages/StaffTestPackage.js";
import AddHRA from "./Pages/HRAForm.js";
import HRAList from "./Pages/HRAList.js";
import Blogs from './Pages/Blog.js'
import DoctorBlogs from "./Doctor/DoctorBlogs.js";
import BookingDetails from "./Pages/BookingDetails.js";
import SingleDoctorDetails from "./Pages/SingleDoctorDetails.js";
import SingleAppointmentDetails from "./Pages/SingleAppointmentDetails.js";
import CreateBlogPage from "./Doctor/CreateBlogPage.js";
import BlogDetail from "./Pages/BlogDetail.js";
import DoctorBlogDetail from "./Doctor/DoctorBlogDetail.js";
import RegisterPage from "./Pages/Register.js";
import CreateLabTestPage from "./Pages/CreateLabTestPage.js";
import LabTestList from "./Pages/LabTestList.js";
import CreatePackagePage from "./Pages/CreatePackagePage.js";
import PackageList from "./Pages/PackageList.js";
import CreateXrayPage from "./Pages/CreateXrayPage.js";
import CreateCategory from "./Pages/CreateCategory.js";
import DoctorCategoryList from "./Pages/DoctorCategoryList.js";
import CreateBlog from "./Pages/CreateBlog.js";
import CreateTestName from "./Pages/CreateTestName.js";
import TestList from "./Pages/TestList.js";
import ChatPage from "./Doctor/ChatPage.js";
import DaigTestList from "./Pages/DiagTestList.js";
import XRayList from "./Pages/XrayList.js";
import CompanyDiagnosticDetail from "./Comany/CompanyDiagnosticDetail.js";
import DiagBookingDetails from "./Diagnostic/DiagBookingDetails.js";
import GetTestsByDiagnostic from "./Pages/LabTestList.js";
import XrayListForDiagnostic from './Pages/XrayListForDiagnostic.js'
import CreatePackage from "./Diagnostic/createPackage.js";
import PackageListForDiag from "./Diagnostic/PackageListForDiag.js";
import StaffMedicalUploadsList from "./Pages/StaffMedicalUploadsList.js";
import CreateEmployee from "./Pages/CreateEmployee.js";
import EmployeeList from "./Pages/EmployeeList.js";
import EmployeeLoginPage from "./Pages/EmployeeLoginPage.js";
import BannerPage from "./Pages/Banner.js";
import HRASubmissionList from "./Pages/HraSubmissionList.js";
import QuestionManager from "./Pages/QuestionManager.js";
import QuestionAnswers from "./Pages/QuestionAnswers.js";
import InvoiceGenerationForm from "./Pages/CompanyDetailsForm.js";




function App() {
  return (
    <Routes>
      {/* Login page rendered outside AdminLayout */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/employee-login" element={<EmployeeLoginPage />} />

      {/* All other routes inside AdminLayout */}
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-diagnostic" element={<DiagnostiCreate />} />
              <Route path="/setting" element={<Settings />} />
              <Route path="/diagnosticlist" element={<DiagnosticList />} />
              <Route path="/generateinvoice" element={<InvoiceGenerationForm />} />
              <Route path="/companylist" element={<CompanyList />} />
              <Route path="/create-doctor" element={<DoctorDetailsForm />} />
              <Route path="/doctorlist" element={<DoctorList />} />
              <Route path="/singledoctor/:doctorId" element={<SingleDoctorDetails />} />
              <Route path="/staff-register" element={<StaffDetailsForm />} />
              <Route path="/stafflist" element={<StaffList />} />
              <Route path="/diagnosticslist" element={<DiagnosticsBookingList />} />
              <Route path="/booking/:bookingId" element={<BookingDetails />} />
              <Route path="/diagnosticsacceptedlist" element={<DiagnosticsAcceptedBooking />} />
              <Route path="/diagnosticsrejectedlist" element={<DiagnosticsRejectedBooking />} />
              <Route path="/doctoracceptedlist" element={<AcceptedAppointmentsList />} />
              <Route path="/doctorrejectedlist" element={<RejectedAppointmentsList />} />
              <Route path="/appintmentlist" element={<DoctorAppointmentList />} />
              <Route path="/appintmentbooking" element={<AppointmentBookingForm />} />
              <Route path="/diagnostic-center/:id" element={<DiagnosticDetail />} />
              <Route path="/diagnosticpending" element={<DiagnosticsPendingBooking />} />
              <Route path="/doctorpendingbookings" element={<DoctorAppointmentListPending />} />
              <Route path="/appointment/:appointmentId" element={<SingleAppointmentDetails />} />
              <Route path="/create-hracat" element={<CategoryForm />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/companysidebar" element={<CompanySidebar />} />
              <Route path="/alldiagnostic" element={<AllDiagnostics />} />
              <Route path="/staff-history/:staffId" element={<StaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="/book-diagnostic" element={<DiagnosticBookingForm />} />
              <Route path="/stafftestpkg/:staffId" element={<StaffTestPackage />} />
              <Route path="/add-hra" element={<AddHRA />} />
              <Route path="/hralist" element={<HRAList />} />
              <Route path="/createblog" element={<CreateBlog />} />
              <Route path="/bloglist" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/labtest-list" element={<LabTestList />} />
              <Route path="/create-package" element={<CreatePackagePage />} />
              <Route path="/package-list" element={<PackageList />} />
              <Route path="/diagtestlist" element={<DaigTestList />} />
              <Route path="/xraylist" element={<XRayList />} />
              <Route path="/create-scanxray" element={<CreateXrayPage />} />
              <Route path="/create-category" element={<CreateCategory />} />
              <Route path="/doctorcategorylist" element={<DoctorCategoryList />} />
              <Route path="/createtest" element={<CreateTestName />} />
              <Route path="/testlist" element={<TestList />} />
              <Route path="/staffmedicaluplods" element={<StaffMedicalUploadsList />} />
              <Route path="/create-employee" element={<CreateEmployee />} />
              <Route path="/create-employee" element={<CreateEmployee />} />
              <Route path="/employeelist" element={<EmployeeList />} />
              <Route path="/banner" element={<BannerPage />} />
              <Route path="/hrasubmissionlist" element={<HRASubmissionList />} />
             <Route path="/question" element={<QuestionManager />} />
              <Route path="/answer" element={<QuestionAnswers />} />







            </Routes>
          </AdminLayout>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company/*"
        element={
          <CompanyLayout>
            <Routes>
              <Route path="companydashboard" element={<CompanyDashboard />} />
              <Route path="add-benificary" element={<CompanyStaffDetailsForm />} />
              <Route path="all-benificary" element={<CompanyStaffList />} />
              <Route path="all-benificary" element={<CompanyStaffList />} />
              <Route path="/staff-history/:staffId" element={<CompanyStaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="doctorlist" element={<DoctorList />} />
              <Route path="appointments" element={<DoctorAppointmentList />} />
              <Route path="book-appointment" element={<AppointmentBookingForm />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="alldiagnostic" element={<CompanyAllDiagnostics />} />
              <Route path="/diagnostics/:id" element={<CompanyDiagnosticDetail />} />
              {/* Add more company routes as needed */}
            </Routes>
          </CompanyLayout>
        }
      />


      {/* Doctor Routes */}
      <Route
        path="/doctor/*"
        element={
          <DoctorLayout>
            <Routes>
              <Route path="doctordashboard" element={<DoctorDashboard />} />  {/* Doctor's Dashboard */}
              <Route path="doctorprofile" element={<DoctorProfilePage />} />  {/* Doctor's Dashboard */}
              <Route path="appointments" element={<SingleDoctorAppointmentList />} />  {/* Appointments */}
              <Route path="book-appointment" element={<AppointmentBookingForm />} />  {/* Book Appointment */}
              <Route path="doctorblogs" element={<DoctorBlogs />} />  {/* Book Appointment */}
              <Route path="createblogs" element={<CreateBlogPage />} />  {/* Book Appointment */}
              <Route path="/doctorblogs/:id" element={<DoctorBlogDetail />} />  {/* Book Appointment */}
              <Route path="/appointment/:appointmentId" element={<SingleAppointmentDetails />} />
              <Route path="/doctor/chat/:staffId/:doctorId" element={<ChatPage />} />
              {/* Add more doctor-specific routes */}
            </Routes>
          </DoctorLayout>
        }
      />


      <Route
        path="/diagnostic/*"
        element={
          <DiagnosticLayout>
            <Routes>
              <Route path="all-bookings" element={<DiagnostiCreate />} />
              <Route path="dashboard" element={<DiagnosticDashboard />} />
              <Route path="mydiagnostic" element={<SingleDiagnosticDetail />} />
              <Route path="mybookings" element={<SingleDiagnosticBookings />} />
              <Route path="diagbooking/:bookingId" element={<DiagBookingDetails />} />
              <Route path="createlabtest" element={<CreateLabTestPage />} />
              <Route path="getlabtest" element={<GetTestsByDiagnostic />} />
              <Route path="add-scan-xray" element={<CreateXrayPage />} />
              <Route path="getscanxray" element={<XrayListForDiagnostic />} />
              <Route path="add-packages" element={<CreatePackage />} />
              <Route path="getpackages" element={<PackageListForDiag />} />
              {/* Add more diagnostic-specific routes here */}
            </Routes>
          </DiagnosticLayout>
        }
      />


      {/* Standalone Company Login Route */}
      <Route path="/company-login" element={<CompanyLoginPage />} />
      <Route path="/doctor-login" element={<DoctorLoginPage />} />
      <Route path="/diagnostic-login" element={<DiagnosticLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
