import React from "react";

const Cancel = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>❌ Payment Cancelled</h1>
      <p>Your payment was not completed. Please try again later.</p>
      <a href="/">Return Home</a>
    </div>
  );
};

export default Cancel;