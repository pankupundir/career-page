import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./Page";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/:pageId" element={<Page />} />
        {/* Define other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
