import React from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/common/Loading";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Navbar from "./components/student/Navbar";
import "quill/dist/quill.snow.css";
import { Toaster } from "sonner";
import { ProtectedRoute, AdminRoute } from "./middleware/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./middleware/PurchaseCourseProtectedRoute";

const App = () => {
  const isEducatorPage = useMatch("/educator/*");
  return (
    <div className="text-default min-h-screen bg-white">
      {!isEducatorPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route
          path="/my-enrollments"
          element={
            <ProtectedRoute>
              <MyEnrollments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/:courseId"
          element={
            <ProtectedRoute>
              <PurchaseCourseProtectedRoute>
                <Player />
              </PurchaseCourseProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/loading/:path" element={<Loading />} />
        <Route
          path="/educator"
          element={
            <AdminRoute>
              <Educator />
            </AdminRoute>
          }
        >
          <Route path="" element={<Dashboard />} />
          <Route path="educator" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default App;
