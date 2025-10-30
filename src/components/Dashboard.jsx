import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_REACT_APP_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");
  const adminId = Cookies.get("admin_id");
  const token = Cookies.get("access_token");

  if (!username || !token) return <Navigate to="/login" />;

  const [students, setStudents] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    age: "",
    address: "",
    is_active: true,
    percentage_range_id: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // ✅ Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${BASE_URL}student/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Please login again.",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            handleLogout();
          });
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  // ✅ Fetch percentage ranges
  useEffect(() => {
    const fetchPercentages = async () => {
      try {
        const response = await fetch(`${BASE_URL}percentage/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch percentages");
        const data = await response.json();
        setPercentages(data);
      } catch (error) {
        console.error("Error fetching percentages:", error);
      }
    };
    fetchPercentages();
  }, [token]);

  //  Add Student with proper error handling
  const handleAdd = async () => {
    if (
      !newStudent.name ||
      !newStudent.age ||
      !newStudent.address ||
      !newStudent.percentage_range_id
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields before adding a student.",
      });
      return;
    }

    const payload = {
      ...newStudent,
      created_id: adminId,
    };

    try {
      const response = await fetch(`${BASE_URL}student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: "Please login again.",
        });
        handleLogout();
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to save student");
      }

      const savedStudent = await response.json();
      setStudents([...students, savedStudent]);
      setNewStudent({
        name: "",
        age: "",
        address: "",
        is_active: true,
        percentage_range_id: 0,
      });

      Swal.fire({
        icon: "success",
        title: "Student Added!",
        text: `${savedStudent.name} has been added successfully.`,
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}student/delete/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            Swal.fire({
              icon: "error",
              title: "Authentication Failed",
              text: "Please login again.",
            });
            handleLogout();
            return;
          }

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Failed to delete student");
          }

          //  Remove student from UI after successful deletion
          setStudents(students.filter((s) => s.id !== id));

          //  Show success SweetAlert
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Student has been deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
        } catch (error) {
          console.error("Error deleting student:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        }
      }
    });
  };

  //  Navigate to Edit page
  const handleEdit = (id) => {
    navigate(`/edit-student/${id}`);
  };

  //  Logout handler
  const handleLogout = () => {
    Cookies.remove("access_token");
    sessionStorage.removeItem("username");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-xl font-semibold text-red-600 mb-4">
          Error: {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-lg">
        <h1 className="text-2xl font-bold">Student Management System</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {username}</span>
          <button
            className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/*  Add New Student Section */}
      <div className="mt-8 bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              placeholder="Enter age"
              value={newStudent.age}
              onChange={(e) =>
                setNewStudent({ ...newStudent, age: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage Range
            </label>
            <select
              value={newStudent.percentage_range_id}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  percentage_range_id: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Range</option>
              {percentages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.percentage_range}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active Status
            </label>
            <select
              value={newStudent.is_active}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  is_active: e.target.value === "true",
                })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div className="mt-4 w-2/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            placeholder="Enter address"
            value={newStudent.address}
            onChange={(e) =>
              setNewStudent({ ...newStudent, address: e.target.value })
            }
            rows="3"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAdd}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Add Student
        </button>
      </div>

      {/*  Student List Section */}
      <div className="mt-8 bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">List of Students</h2>
        {students.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No students found. Add your first student above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Age</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Percentage Range</th>
                  <th className="p-2 border">Admin</th>
                  <th className="p-2 border">Active</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="text-center border hover:bg-gray-50"
                  >
                    <td className="p-2 border">{s.name}</td>
                    <td className="p-2 border">{s.age}</td>
                    <td className="p-2 border">{s.address}</td>
                    <td className="p-2 border">
                      {s.percentage_range?.percentage_range || "N/A"}
                    </td>
                    <td className="p-2 border">{s.admin?.username || "N/A"}</td>
                    <td className="p-2 border font-semibold">
                      {s.is_active ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>
                    <td className="p-2 border flex justify-center items-center gap-4">
                      {/* Edit Icon */}

                      <button
                        onClick={() => handleEdit(s.id)}
                        className={`text-xl ${
                          s.admin?.id.toString() === adminId
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={s.admin?.id.toString() !== adminId}
                      >
                        <FiEdit />
                      </button>

                      {/* Delete Icon */}
                      <button
                        onClick={() => handleDelete(s.id)}
                        className={`text-xl ${
                          s.admin?.id.toString() === adminId
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={s.admin?.id.toString() !== adminId}
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
