import React from "react";
import "./style.css";

const ErrorMsg = ({error}) => {
  return <p className="errorMsg">{error}</p>;
};

export default ErrorMsg;
