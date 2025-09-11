import "./JobListLoader.css";

function JobListLoader() {
  return (
    <div className="job-list-loader">
      <div className="job-list-loader-content">
        <span className="job-list-loader-wrapper"></span>
        <p className="job-list-loader-text">Loading jobs...</p>
      </div>
    </div>
  );
}

export default JobListLoader;

