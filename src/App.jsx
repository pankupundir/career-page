import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./Page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobDetails from "./JobDetails";
import SeeAllJobs from "./SeeAllJobs";

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
          <Route path="/see-all-jobs" element={<SeeAllJobs />} />
          {/* Define other routes here */}
        </Routes>
      </Router>
      
    </>
  );
}

export default App;
