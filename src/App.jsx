import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./Page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobDetails from "./JobDetails";

function App() {
  return (
    <>
      <ToastContainer
        className="custom-toast-container"
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Router>
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/:pageId" element={<Page />} />
          <Route path="/job-details/:jobId" element={<JobDetails />} />
          {/* Define other routes here */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
