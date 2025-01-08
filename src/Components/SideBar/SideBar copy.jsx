import React, { useState } from "react";
import "./SideBar.css";

const Sidebar = ({ isOpen, onClose, jobDetails }) => {
  const [showNext, setShowNext] = useState(true);

  const nextPage = () => {
    setShowNext(false);
  };

  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar">
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
        <h2>Sidebar Menu</h2>
      </div>
      {showNext ? (
        <div>
          <div>
            <div>
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Email"
              />
            </div>
            <div>
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter First Name"
              />
            </div>
            <div>
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="Last Name"
                placeholder="Enter Last Name"
              />
            </div>
            <div>
              <label for="lastName">Phone Number</label>
              <input
                type="number"
                id="phoneNumber"
                name="Phone Number"
                placeholder="Enter Phone Number"
              />
            </div>
            <div>
              <label for="profession">Profession</label>
              <input
                type="text"
                id="profession"
                name="Profession"
                placeholder="Enter profession"
              />
            </div>
            <div>
              <label for="location">Location</label>
              <input
                type="text"
                id="location"
                name="Location"
                placeholder="Enter Location"
              />
            </div>
          </div>

          <div className="questionsListing">
            {jobDetails.screening_questions.map((res) => (
              <div>
                <div key={res.id}>
                  <div>{res.question}</div>
                  {res.web_type == "input" ? (
                    <div>
                      {" "}
                      <input type="text" placeholder="Please enter value" />
                    </div>
                  ) : res.web_type == "radio" ? (
                    <div>
                      <div>
                        <input
                          type="radio"
                          id="yes"
                          name="radio-btn"
                          value="no"
                        />
                        <label for="html">Yes</label>

                        <input
                          type="radio"
                          id="no"
                          name="radio-btn"
                          value="no"
                        />
                        <label for="no">No</label>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                
              </div>
            ))}
            <button onClick={nextPage}>Next</button>
          </div>
        </div>
      ) : (
        <div>
          <section>
            <div>
              <label>Upload your CV</label>
              <input type="file" />  
            </div>  
            <div>
              <label>Upload Video</label>
              <input type="file" />  
            </div>  
            <div>
              <label>Application letter*</label>
              <textarea placeholder="Enter a short application text (max 1500 characters)"></textarea>
            </div>

            <div>

              <div>
                <input type="checkbox" />
              I confirm that I have read and agree to the User agreement, Privacy policy and Cookie notice.
              </div>

            </div>
          </section>
        </div>
      )}
    </div>
  );
};
export default Sidebar;
