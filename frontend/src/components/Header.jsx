import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginButton from "../components/LoginButton";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#0f0f0f] border-b border-[#222] shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Logo e título */}
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-white text-2xl font-bold tracking-wide">
            FanPass
          </span>
        </div>

        {/* Navegação */}
        <nav>
          <ul className="flex items-center gap-8 text-sm font-medium">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition hover:text-gray-400 ${
                    isActive ? "text-gray-300" : "text-white"
                  }`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition hover:text-gray-400 ${
                    isActive ? "text-gray-300" : "text-white"
                  }`
                }
              >
                Mercado
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/meus-ingressos"
                className={({ isActive }) =>
                  `transition hover:text-gray-400 ${
                    isActive ? "text-gray-300" : "text-white"
                  }`
                }
              >
                Meus Ingressos
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `transition hover:text-gray-400 ${
                      isActive ? "text-gray-300" : "text-white"
                    }`
                  }
                >
                  Meu Perfil
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Botão de Login ou Logout */}
        <div className="ml-6">
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 text-white bg-accent rounded-lg hover:bg-red-700 transition"
            >
              Sair
            </button>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
