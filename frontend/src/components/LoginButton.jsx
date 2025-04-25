import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Aqui também usamos o contexto para verificar o estado de autenticação

const LoginButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Verifica se o usuário está autenticado

  const handleLoginClick = () => {
    if (!user) {
      navigate("/login"); // Se não estiver logado, redireciona para a página de login
    } else {
      // Caso esteja logado, pode redirecionar para o perfil ou outra ação
      navigate("/profile");
    }
  };

  return (
    <button
      onClick={handleLoginClick}
      className="text-white text-lg px-4 py-2 rounded-lg bg-vermelho"
    >
      <i className="fas fa-user mr-2"></i>
      {user ? "Meu Perfil" : "Entrar"}{" "}
      {/* Muda o texto do botão dependendo do estado de autenticação */}
    </button>
  );
};

export default LoginButton;
