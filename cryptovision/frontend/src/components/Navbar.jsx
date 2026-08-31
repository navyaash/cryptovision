import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("cryptovision_token");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        Crypto<span className="accent-dot">Vision</span>
      </div>
      <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
        Dashboard
      </NavLink>
      <NavLink to="/trade" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
        Trade
      </NavLink>
      <NavLink to="/watchlist" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
        Watchlist
      </NavLink>
      <div className="nav-footer">
        <button onClick={logout} className="btn" style={{ width: "100%" }}>
          Log out
        </button>
      </div>
    </nav>
  );
}
