import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import PurchasePage from "./pages/PurchasePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Home from "./pages/Home"; // Página aberta
import { Web3Provider } from "./context/Web3Context";

// Componente de Rota Protegida
const ProtectedRoute = ({ element }) => {
  const { user } = useAuth(); // Pegando o usuário do contexto AuthContext

  // Verifica se o usuário está autenticado, se não, redireciona para o login
  if (!user) {
    return <LoginPage />; // Se não estiver autenticado, redireciona para o login
  }

  return element; // Retorna o componente protegido
};

const App = () => {
  return (
    <Web3Provider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rotas abertas */}
            <Route path="/" element={<Home />} /> {/* Página inicial */}
            <Route path="/login" element={<LoginPage />} />{" "}
            {/* Página de login */}
            <Route path="/cadastro" element={<RegisterPage />} />{" "}
            {/* Página de cadastro */}
            {/* Rotas protegidas */}
            <Route
              path="/profile"
              element={<ProtectedRoute element={<ProfilePage />} />}
            />
            <Route
              path="/purchase/:ticketId"
              element={<ProtectedRoute element={<PurchasePage />} />}
            />
          </Routes>
        </AuthProvider>
      </Router>
    </Web3Provider>
  );
};

export default App;
