import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Header from "../components/Header";

const ProfilePage = () => {
  const { user, logout, requireAuth } = useAuth();
  const navigate = useNavigate();

  // Definindo o estado para armazenar os dados adicionais do usuário
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL base para as requisições API (ajuste conforme necessário)
  const API_URL = "http://localhost:3001/users/";

  useEffect(() => {
    if (!requireAuth()) {
      navigate("/login");
    } else if (user && user.id) {
      // Iniciando o processo de carregamento
      setLoading(true);
      setError(null);

      // Realizando a chamada para buscar informações adicionais do usuário
      axios
        .get(`${API_URL}${user.id}`)
        .then((response) => {
          setUserDetails(response.data); // Armazenando os dados retornados
        })
        .catch((error) => {
          console.error("Erro ao buscar detalhes do usuário", error);
          setError(
            "Erro ao carregar as informações do usuário. Tente novamente."
          );
        })
        .finally(() => {
          setLoading(false); // Finalizando o processo de carregamento
        });
    }
  }, [user, navigate, requireAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-[#1a1a1a] text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-[#1a1a1a] text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-[#1a1a1a] flex flex-col items-center justify-center px-6 py-12">
        <div className="relative bg-[#1a1a1a] bg-opacity-80 backdrop-blur-md rounded-3xl p-10 max-w-2xl w-full shadow-2xl border border-[#333] animate-fade-in space-y-6">
          {/* Borda animada */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-[#1a1a1a] opacity-20 blur-lg"></div>

          <h1 className="text-4xl font-extrabold text-white text-center mb-8">
            Meu Perfil
          </h1>

          <div className="space-y-4 text-lg text-gray-300">
            <div>
              <p className="text-sm text-gray-400">Nome</p>
              <p className="font-semibold text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-semibold text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Carteira</p>
              <p className="font-semibold text-white">
                {userDetails?.publicKey}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">CPF</p>
              <p className="font-semibold text-white">{userDetails?.cpf}</p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={logout}
              className="bg-vermelho hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
