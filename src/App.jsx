import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./Page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobDetails from "./JobDetails";
import SeeAllJobs from "./SeeAllJobs";
import DynamicPage from "./DynamicPage";
import ErrorBoundary from "./Components/ErrorBoundary";
import GoogleTranslate from "./Components/GoogleTranslate";

function App() {
  return (
    <ErrorBoundary>
      <GoogleTranslate />
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
          <Route path="/job-details/:jobId" element={<JobDetails />} />
          <Route path="/see-all-jobs" element={<SeeAllJobs />} />
          <Route path="/:pageName" element={<DynamicPage />} />
          <Route path="/:pageId" element={<Page />} />
          {/* Define other routes here */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
