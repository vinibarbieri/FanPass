import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import Header from "../components/Header";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Ajustado para usar 'useNavigate'

const RegisterPage = () => {
  const { connectWallet, account, error: walletError } = useWeb3();
  const navigate = useNavigate(); // Usado para redirecionamento após sucesso

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    walletType: "generated",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWalletTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({ ...prev, walletType: newType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let publicKey = null;

      if (formData.walletType === "metamask") {
        if (!account) {
          await connectWallet(); // Tenta conectar com MetaMask
        }
        if (!account) {
          throw new Error("Não foi possível conectar à MetaMask");
        }
        publicKey = account;

        const payload = {
          ...formData,
          ...(formData.walletType === "metamask" ),
        };
      }

      // Prepara os dados para envio

      const payload = {
        ...formData,
        ...(formData.walletType === "metamask" ? { publicKey } : ""),
      };
      console.log(payload);

      const response = await axios.post(
        "http://localhost:3001/users/register",
        payload
      );

      toast.success(`Usuário registrado com sucesso: ${response.data.name}`, {
        position: "top-center",
        autoClose: 5000,
      });

      navigate("/marketplace");
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
      <div className="bg-cinza min-h-screen flex justify-center items-center">
        <div className="flex bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl">
          {/* Lado Esquerdo com Gradiente Futurista e Animação */}
          <div className="w-1/2 bg-gradient-to-r from-red-600 via-purple-600 to-gray-800 bg-[length:400%_400%] animate-gradient-x flex justify-center items-center p-8">
            <h1 className="text-4xl font-bold text-white text-center">
              <img src="/Logo-FanPass.png" alt="" />
            </h1>
          </div>

          {/* Lado Direito com Formulário */}
          <div className="w-1/2 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              FanPass
            </h2>

            {walletError && (
              <p className="text-red-500 text-center">{walletError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-2 border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full border-2 border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />

              <div className="space-y-2">
                <label className="block font-medium text-white">
                  Tipo de Carteira:
                </label>
                <select
                  name="walletType"
                  value={formData.walletType}
                  onChange={handleWalletTypeChange}
                  className="w-full border-2 border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="generated">
                    Gerar carteira automaticamente
                  </option>
                  <option value="metamask">Conectar com MetaMask</option>
                </select>

                {formData.walletType === "metamask" && (
                  <div className="mt-2 text-sm text-gray-300">
                    {account ? (
                      <p className="text-green-400">Conectado: {account}</p>
                    ) : (
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg transition transform hover:bg-gray-700 hover:scale-105"
                      >
                        Conectar MetaMask
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition transform hover:scale-105"
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Adicionando ToastContainer */}
      <ToastContainer />
    </>
  );
};

export default RegisterPage;
