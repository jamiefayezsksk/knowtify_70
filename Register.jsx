import React, { useEffect } from "react";
import { useState } from "react";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Button, Form, Input, Card, Select, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { setDoc, doc, db, fsTimeStamp, getDocs, collection, where, query } from "../../config/firebase";
import { Timestamp } from "firebase/firestore";
import { InboxOutlined } from "@ant-design/icons";


function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showReferenceId, setShowReferenceId] = useState(false);


  const signInWithGoogle = async () => {
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const addNewDocument = async (userData, id) => {
    const myDoc = doc(db, "users", `${id}`);
    try {
      await setDoc(myDoc, userData);
      console.log("firestore success");
    } catch (error) {
      console.log(error);
    }
  };

  const createDoctorCollection = async (userId, name) => {
    const doctorsCollection = doc(db, "doctors", `${userId}`);
    try {
      const docData = {
        name: name,
        uid: userId,
        setSpecialty: false,
        specialty: "",
      };

      await setDoc(doctorsCollection, docData);

      console.log("Doctor collection created successfully");
    } catch (error) {
      console.error("Error creating doctor collection:", error);
    }
  };

  const createPatientCollection = async (userId, name, referenceId) => {
  const patientsCollection = doc(db, "patient", `${userId}`);
  try {
    const docData = {
      name: name,
      uid: userId,
      referenceId: referenceId, // Include referenceId in patient document data
      // Add other patient-specific data as needed
    };

    await setDoc(patientsCollection, docData);

    console.log("Patient collection created successfully");
  } catch (error) {
    console.error("Error creating patient collection:", error);
  }
};

  const onFinish = async (values) => {
  const { name, email, password, role, referenceId } = values; // Destructure referenceId from values
  try {
    setLoading(true);

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        const userData = {
          name: name,
          uid: user.uid,
          email: user.email,
          type: role,
          dateofregistration: fsTimeStamp.now(),
          password: password,
          reference: referenceId,
        };

        addNewDocument(userData, user.uid);

       if (role === "doctor") {
          createDoctorCollection(user.uid, name);
        } else if (role === "patient") {
          createPatientCollection(user.uid, name, referenceId); // Pass referenceId to createPatientCollection
        }

        navigate("/login");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      })
      .finally(() => {
        setLoading(false);
      });
  } catch (error) {
    console.log(error);
  }
};


  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleRoleChange = (value) => {
    setShowReferenceId(value === "patient");
  };

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const user = auth.currentUser;
        if (user && user.displayName) {
          const isPatient = await checkExistingPatient(user.displayName);
          if (isPatient) {
            navigate("/patientdashboard");
          }
        }
      } catch (error) {
        console.error("Error auto-logging in:", error);
      }
    };

    autoLogin();
  }, []);

  return (
    <Card
      title="Register"
      bordered={true}
      style={{ width: 350 }}
      className="drop-shadow-md mt-20"
    >
      <div>
        <Form
          name="login"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 300,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your Name!",
              },
            ]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please select a role!",
              },
            ]}
          >
            <Select placeholder="Select a role" onChange={handleRoleChange}>
              <Select.Option value="doctor">Doctor</Select.Option>
              <Select.Option value="admin">Secretary</Select.Option>
              <Select.Option value="patient">Patient</Select.Option>
            </Select>
          </Form.Item>

          {showReferenceId && (
            <Form.Item
              label="Reference ID"
              name="referenceId"
              rules={[
                {
                  required: true,
                  message: "Please input your reference ID!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            wrapperCol={{
              offset: 0,
              span: "full",
            }}
            style={{
              marginBottom: 5,
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600 w-full"
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
        <Button className="bg-green-600 w-full" onClick={signInWithGoogle}>
          SignIn with Google
        </Button>
      </div>
    </Card>
  );
}

export default Register;
