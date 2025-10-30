import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_REACT_APP_BASE_URL;

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = Cookies.get("access_token");
  const adminId = Cookies.get("admin_id");

  if (!token) return <Navigate to="/login" />;

  const [student, setStudent] = useState({
    name: "",
    age: "",
    address: "",
    is_active: true,
    percentage_range_id: 0,
  });
  const [percentages, setPercentages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`${BASE_URL}student/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          await Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Your session has expired. Please login again.",
            confirmButtonText: "OK",
          });
          navigate("/login");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch student");

        const data = await response.json();

        setStudent({
          name: data.name,
          age: data.age,
          address: data.address,
          is_active: data.is_active,
          percentage_range_id: data.percentage_range?.id || 0,
        });
      } catch (error) {
        console.error("Error fetching student:", error);
        setError(error.message);

        // Show Swal error message
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, token, navigate]);

  useEffect(() => {
    const fetchPercentages = async () => {
      try {
        const response = await fetch(`${BASE_URL}percentage/`, {
        });

        if (!response.ok) throw new Error("Failed to fetch percentages");
        const data = await response.json();
        setPercentages(data);
      } catch (error) {
        console.error("Error fetching percentages:", error);
      }
    };

    fetchPercentages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({
      ...student,
      [name]: name === "is_active" ? value === "true" : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !student.name ||
      !student.age ||
      !student.address ||
      !student.percentage_range_id
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please fill all fields",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const payload = {
      name: student.name,
      age: student.age,
      address: student.address,
      is_active: student.is_active,
      percentage_range_id: student.percentage_range_id,
      created_id: adminId,
    };

    try {
      const response = await fetch(
        `${BASE_URL}student/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        await Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Your session has expired. Please login again.",
          confirmButtonColor: "#2563eb",
        });
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update student");
      }

      await Swal.fire({
        title: "Success!",
        text: "Student updated successfully.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating student:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading student details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Error Occurred
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4">
      {/* Modern Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Edit Student</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Compact Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              Update Student Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={student.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter student name"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={student.age}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter age"
                  min="1"
                  required
                />
              </div>

              {/* Percentage Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Percentage Range <span className="text-red-500">*</span>
                </label>
                <select
                  name="percentage_range_id"
                  value={student.percentage_range_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Range</option>
                  {percentages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.percentage_range}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="is_active"
                  value={student.is_active}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={student.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter address"
                  rows="2"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
              >
                Update Student
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
