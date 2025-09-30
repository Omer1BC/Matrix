import { useState, useContext, useEffect } from "react";
import "./header.css";
import { UserContext } from "../../contexts/usercontext";

import Link from "next/link";

export default function Header() {
  const [login, setLogin] = useState(false);
  const [signup, setSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const { user, setUser } = useContext(UserContext);

  const toggleLogin = () => {
    setLogin(!login);
  };

  const toggleSignup = () => {
    setSignup(!signup);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log(firstname);
    console.log(lastname);
    console.log(username);
    console.log(password);

    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password: password,
          firstname: firstname,
          lastname: lastname,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text; // fallback to raw text
      }
      console.log("Signup response:", data);
      setUser(data.user[0]);
    } catch (err) {
      console.error("Signup failed:", err);
    }
    setSignup(!signup);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logout", {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // clear user from context so UI updates
        setUser(null);
        console.log("Logged out successfully");
        window.location.href = "/homepage";
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/supabase_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      setUser(data.user[0]);
    } catch (err) {
      console.log("Login error: ", err);
    }
  };

  useEffect(() => {
    console.log(user);
  });

  return (
    <>
      <div className="header-div">
        <div className="logo-title">
          <Link href="/homepage" className="logo-title">
            <img className="imgg-icon" src={"matrix_logo.png"}></img>
            <h1 className="header-title">Matrix</h1>
          </Link>
        </div>
        <div>
          {!user && (
            <div>
              <button className="log-in-button" onClick={toggleLogin}>
                Log in
              </button>
              <button className="log-in-button" onClick={toggleSignup}>
                Sign up
              </button>
            </div>
          )}
          {user && (
            <div className="logo-title">
              <p style={{ fontSize: "40px" }}>Hello {user.first_name}!</p>
              <button className="log-in-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
        {!user && login && (
          <div className="login-popup-overlay">
            <div className="login-popup-content">
              <form className="login-form" onSubmit={handleLogin}>
                <input
                  placeholder="Enter username"
                  onChange={(e) => setUsername(e.target.value)}
                ></input>
                <input
                  placeholder="Enter passowrd"
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
                <button type="submit">Log in!</button>
              </form>
            </div>
          </div>
        )}
        {!user && signup && (
          <div className="login-popup-overlay">
            <div className="login-popup-content">
              <form className="login-form" onSubmit={handleSignup}>
                <input
                  placeholder="First Name"
                  onChange={(e) => setFirstname(e.target.value)}
                ></input>
                <input
                  placeholder="Last Name"
                  onChange={(e) => setLastname(e.target.value)}
                ></input>
                <input
                  placeholder="Enter username"
                  onChange={(e) => setUsername(e.target.value)}
                ></input>
                <input
                  placeholder="Enter passowrd"
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
                <button type="submit">Signup!</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
