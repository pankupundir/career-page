import "../App.css";

function WebsiteLoader() {
  return (
    <div>
      <section className="loading-screen">
        <div className="loader-content">
          <span className="loader-wrapper website-loader"></span>
          <p className="loader-text">Loading website content...</p>
        </div>
      </section>
    </div>
  );
}

export default WebsiteLoader;
