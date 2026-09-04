 import { useState } from "react";

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [role, setRole] = useState("student");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        " https://campusreuse.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      const userId =
        data.user?.id ||
        data.user?._id;

      if (!userId) {
        throw new Error(
          "Login successful, but user ID was not returned."
        );
      }

      localStorage.setItem(
        "userId",
        String(userId)
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          id: userId,
        })
      );

      console.log(
        "Logged in user:",
        data.user
      );

      onLogin();

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        " https://campusreuse.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            department: department.trim(),
            year:
              role === "student"
                ? Number(year)
                : undefined,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      console.log(
        "Registration successful:",
        data
      );

      setSuccess(
        "Account created successfully! Please login."
      );

      // Clear registration fields
      setName("");
      setPhone("");
      setDepartment("");
      setYear("");
      setPassword("");

      // Switch back to login
      setTimeout(() => {
        setIsRegistering(false);
        setSuccess("");
      }, 1500);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="login-page">

      <div className="login-box">

        <h1>🎓 CampusReuse</h1>

        <h2>
          {isRegistering
            ? "Create Account"
            : "Login"}
        </h2>

        <p>
          {isRegistering
            ? "Join your campus community."
            : "Login to list and manage your resources."}
        </p>

        <form
          onSubmit={
            isRegistering
              ? handleRegister
              : handleLogin
          }
        >

          {/* ================================
              REGISTRATION FIELDS
          ================================= */}

          {isRegistering && (
            <>
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

              <label>Phone Number</label>

              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                required
              />

              <label>Department</label>

              <input
                type="text"
                placeholder="Example: Computer Science"
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
                required
              />

              <label>Role</label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                required
              >
                <option value="student">
                  Student
                </option>

                <option value="teacher">
                  Teacher
                </option>
              </select>

              {/* YEAR ONLY FOR STUDENTS */}

              {role === "student" && (
                <>
                  <label>Year</label>

                  <select
                    value={year}
                    onChange={(e) =>
                      setYear(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select year
                    </option>

                    <option value="1">
                      1st Year
                    </option>

                    <option value="2">
                      2nd Year
                    </option>

                    <option value="3">
                      3rd Year
                    </option>

                    <option value="4">
                      4th Year
                    </option>
                  </select>
                </>
              )}
            </>
          )}

          {/* ================================
              EMAIL
          ================================= */}

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          {/* ================================
              PASSWORD
          ================================= */}

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {/* ================================
              MESSAGES
          ================================= */}

          {error && (
            <div className="form-error">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              ✅ {success}
            </div>
          )}

          {/* ================================
              SUBMIT
          ================================= */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? isRegistering
                ? "Creating Account..."
                : "Logging in..."
              : isRegistering
              ? "Create Account"
              : "Login"}
          </button>

        </form>

        {/* ================================
            SWITCH LOGIN / REGISTER
        ================================= */}

        <p style={{ marginTop: "15px" }}>

          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegistering(
                !isRegistering
              );

              setError("");
              setSuccess("");
            }}
            style={{
              marginLeft: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isRegistering
              ? "Login"
              : "Create Account"}
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;