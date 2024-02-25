import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../../config/firebase.jsx";
import { Table } from "antd";

function PatientsRecord() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "patient"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserDetails(userData);
            fetchPatientDetails(userData.referenceId);
          } else {
            console.error("No user data found in patient collection.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
        }
      } else {
        setUserDetails(null);
        setPatientDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientDetails = async (referenceId) => {
    try {
      const q = query(
        collection(db, "patientRecords"),
        where("referenceId", "==", referenceId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const patientData = querySnapshot.docs[0].data();
        setPatientDetails(patientData);
      } else {
        console.error("No patient data found in patientRecords collection.");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Reference ID",
      dataIndex: "referenceId",
      key: "referenceId",
    },
    // Add more columns as needed based on user details structure
  ];
  

  return (
    <div className="overflow-auto max-h-screen p-4">
      <h2>User Details</h2>

      {userDetails && (
        <Table
          dataSource={[userDetails]} // Pass userDetails as an array with single element
          columns={columns}
          rowKey={(record) => record.uid} // Assuming uid is unique
        />
      )}

      <h2>Patient Details</h2>

      {patientDetails && (
        <Table
          dataSource={[patientDetails]} // Pass patientDetails as an array with single element
          columns={columns}
          rowKey={(record) => record.uid} // Assuming uid is unique
        />
      )}
    </div>
  );
}

export default PatientsRecord;
