import React, { useState } from "react";
import { Card, Input, Button, message } from "antd";
import {db} from "../../config/firebase.jsx"

function PatientAppointment() {
  const [reference, setReference] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const handleFetchAppointment = async () => {
    try {
      const appointmentRef = await db.collection("appointments").doc(reference).get();
      if (appointmentRef.exists) {
        setAppointmentDetails(appointmentRef.data());
      } else {
        message.error("Appointment not found!");
        setAppointmentDetails(null);
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      message.error("Error fetching appointment. Please try again later.");
    }
  };

  return (
    <div>
      <Card title="Welcome to Patient">
        <Input
          placeholder="Enter appointment reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
        <Button type="primary" onClick={handleFetchAppointment}>Fetch Appointment</Button>
        {appointmentDetails && (
          <div>
            <h3>Appointment Details:</h3>
            <p>Appointment Date: {appointmentDetails.date}</p>
            <p>Doctor: {appointmentDetails.doctor}</p>
            {/* Add more details as needed */}
          </div>
        )}
      </Card>
    </div>
  );
}

export default PatientAppointment;
