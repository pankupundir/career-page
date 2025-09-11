import "../App.css";

function JobDataLoader() {
  return (
    <div>
      <section className="loading-screen">
        <div className="loader-content">
          <span className="loader-wrapper job-loader"></span>
          <p className="loader-text">Loading job data...</p>
        </div>
      </section>
    </div>
  );
}

export default JobDataLoader;
