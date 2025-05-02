import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import Header from "../components/Header";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, IdCard } from "lucide-react";

const RegisterPage = () => {
  const { connectWallet, account, error: walletError } = useWeb3();
  const navigate = useNavigate();
  const [walletType, setWalletType] = useState("generated");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    walletType,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (walletType === "metamesk" && !account) {
        throw new Error("Conecte sua carteira MetaMask antes de continuar.");
      }

      const payload = {
        ...formData,
        publicKey: walletType === "metamesk" ? account : "", // Se for gerado, pode ser null ou outro valor que queira
      };

      const response = await axios.post(
        "http://localhost:3001/users/register",
        payload
      );

      toast.success(`Usuário registrado com sucesso: ${response.data.name}`, {
        position: "top-center",
        autoClose: 5000,
      });

      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <>
      <Header />
      <div className="bg-background min-h-screen flex justify-center items-center relative">
        <div className="relative flex bg-background-secundario rounded-xl shadow-xl overflow-hidden w-full max-w-3xl border-4 border-transparent animate-gradient-border">
          {/* Lado Esquerdo com Imagem de Fundo */}
          <div
            className="w-1/2 flex justify-center items-center p-8 relative z-10 bg-cover bg-center"
            style={{ backgroundImage: "url('/vg.jpeg')" }}
          ></div>

          {/* Lado Direito com Formulário */}
          <div className="w-1/2 p-10 relative z-10 bg-cinza rounded-tr-xl">
            <h2 className="text-3xl font-bold text-gray-200 mb-6 text-center">
              Criar Conta
            </h2>

            {walletError && (
              <p className="text-red-600 text-center mb-4">{walletError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-600 bg-white text-black p-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
                  required
                />
              </div>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-600 bg-white text-black p-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
                  required
                />
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-600 bg-white text-black p-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
                  required
                />
              </div>
              <div className="relative">
                <IdCard
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="cpf"
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-600 bg-white text-black p-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
                  required
                />
              </div>

              {/* Botão de Conexão com MetaMask */}
              <div className="mt-6 flex justify-center">
                {account ? (
                  <p className="text-green-600 text-center">
                    Conectado: {account}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setWalletType("metamesk");
                        await connectWallet();
                      } catch (error) {
                        console.error("Erro ao conectar MetaMask:", error);
                      }
                    }}
                    className="bg-gray-600 w-[200px] h-[40px] text-white rounded-lg hover:bg-gray-600 flex justify-center items-center"
                  >
                    <img src="/MetaMask_Fox.png" className="w-7 h-7 mr-2" />
                    <h2>Conectar MetaMask</h2>
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-vermelho text-white px-6 py-3 rounded-lg hover:bg-red-700 transition transform hover:scale-105 mt-8"
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default RegisterPage;
