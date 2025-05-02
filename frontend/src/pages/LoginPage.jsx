import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/");
    } else {
      setError("Email ou senha inválidos");
    }
  };

  return (
    <>
      <Header />
      <div className="bg-background min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-background-secundario border border-[#333] rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-extrabold text-center mb-6 tracking-wide">
            Conecte-se ao Futuro
          </h2>

          {error && (
            <div className="bg-red-600 text-white px-4 py-2 mb-4 rounded-md text-center text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-vermelho transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-1">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-vermelho transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-vermelho hover:bg-vermelho-700 text-white py-2 rounded-lg transition-colors font-semibold tracking-wider"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-400">
            Ainda não tem uma conta?{" "}
            <a
              href="/cadastro"
              className="text-vermelho hover:underline transition"
            >
              Cadastre-se
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
