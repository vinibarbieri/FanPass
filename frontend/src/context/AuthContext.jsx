import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        email,
        password,
      });
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (name, email, password, cpf) => {
    try {
      const response = await axios.post("http://localhost:3001/user/register", {
        name,
        email,
        password,
        cpf,
      });
      const { id } = response.data;
      return id;
    } catch (error) {
      console.error("Registration failed:", error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  const requireAuth = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Exportando o hook useAuth para acesso em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
