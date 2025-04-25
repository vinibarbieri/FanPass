import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, logout, requireAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireAuth()) {
      navigate("/login");
    }
  }, [user, navigate, requireAuth]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="text-white p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>

      <div className="bg-[#1a1a1a] p-4 rounded-xl shadow">
        <p>
          <strong>Nome:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <button
          onClick={logout}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
