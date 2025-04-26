import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axios from "axios";
import { QRCode } from "react-qr-code";
const PurchasePage = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("fantoken");
  const [showPixModal, setShowPixModal] = useState(false);

  const [pixCode, setPixCode] = useState(""); // <- Novo estado para armazenar o código Pix

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/ticket/${ticketId}`
        );
        const data = response.data;

        if (data.tokenURI) {
          const tokenData = await axios.get(data.tokenURI, {
            headers: {
              Authorization: undefined,
            },
          });

          setTicket({
            ...data,
            tokenURI: tokenData.data,
          });
        } else {
          setTicket(data);
        }
      } catch (error) {
        console.error("Erro ao buscar ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  if (!user) return null;
  if (loading) return <p className="text-white">Carregando...</p>;
  if (!ticket) return <p className="text-white">Ingresso não encontrado.</p>;

  const fanTokenPrice = ticket.details?.priceFanToken;
  const cashPrice = ticket.priceConversion?.reais;

  const generatePixCode = () => {
    // Aqui você poderia integrar com um gerador de payload real de Pix
    // Estou simulando um payload:
    const payload = `00020126360014BR.GOV.BCB.PIX0114+5581999999995204000053039865802BR5925Nome Do Evento LTDA6009SAO PAULO62070503***6304B13F`;
    setPixCode(payload);
  };

  const handlePurchase = async () => {
    if (selectedPayment === "pix") {
      generatePixCode();
      setShowPixModal(true);
      return;
    }

    try {
      // const response = await fetch("http://localhost:3001/purchase", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ticketId: ticket.id,
      //     userId: user.id,
      //     paymentMethod: selectedPayment,
      //   }),
      // });

      // if (!response.ok) throw new Error("Erro na compra");

      alert("Ingresso comprado com sucesso!");
      navigate("/profile");
    } catch (error) {
      alert("Erro ao comprar ingresso.");
      console.error(error);
    }
  };

  const handlePixPaid = async () => {
    try {
      // const response = await fetch("http://localhost:3001/purchase", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ticketId: ticket.id,
      //     userId: user.id,
      //     paymentMethod: selectedPayment,
      //   }),
      // });

      // if (!response.ok) throw new Error("Erro na compra");

      alert("Pagamento Pix confirmado!");
      navigate("/meus-ingressos");
    } catch (error) {
      alert("Erro ao confirmar pagamento.");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#1A1A1A] min-h-screen p-6 flex items-center justify-center">
        <div className="animate-gradient-border">
          <div className="border-4 border-transparent relative bg-gradient-to-br from-[#2B2B2B] to-[#1A1A1A] rounded-3xl p-10 shadow-2xl max-w-3xl w-full text-white space-y-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2B2B2B] to-[#1A1A1A] opacity-80 rounded-3xl"></div>

            {/* Informações do ingresso */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 relative z-10">
              <img
                src={ticket.tokenURI?.image || "/default-fantoken.png"}
                alt={ticket.name}
                className="w-40 h-40 object-contain rounded-xl"
              />
              <div className="mt-4 sm:mt-0 space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  {ticket.tokenURI.attributes[0].value}
                </h2>
                <p className="text-gray-400">
                  Data: {ticket.details?.lastTransactionDate || "Não informado"}
                </p>
                <p className="text-gray-400">
                  Setor:{" "}
                  {ticket.tokenURI.attributes[1].value || "Não informado"}
                </p>
                <p className="text-gray-400">
                  {ticket.tokenURI?.description || "Sem descrição"}
                </p>
              </div>
            </div>

            {/* Preços */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-xl font-semibold relative z-10">
              <span className="text-[#ffffff]">
                Valor FanToken: {fanTokenPrice}
              </span>
              <span className="text-gray-300">Valor em R$: R$ {cashPrice}</span>
            </div>

            {/* Formas de Pagamento */}
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-300">
                Escolha a forma de pagamento:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "FanToken", value: "fantoken" },
                  { label: "Pix", value: "pix" },
                  { label: "Cartão", value: "cartao" },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedPayment(value)}
                    className={`py-2 px-4 rounded-full font-medium text-sm transition-all ${
                      selectedPayment === value
                        ? "bg-[#FF595C] text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão Confirmar Compra */}
            <button
              onClick={handlePurchase}
              className="w-full mt-8 bg-[#FF595C] hover:bg-red-500 text-white py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 relative z-10"
            >
              Confirmar Compra
            </button>
          </div>
        </div>
      </div>

      {/* Modal Pix */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] p-8 rounded-3xl shadow-2xl text-center space-y-6 relative">
            <h2 className="text-2xl font-bold text-white mb-4">
              Pague com Pix
            </h2>
            {pixCode && (
              <div className="flex justify-center">
                <QRCode value={pixCode} />
              </div>
            )}
            <p className="text-gray-300 text-sm break-words">{pixCode}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePixPaid}
                className="bg-[#FF595C] hover:bg-red-500 text-white py-2 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                Já Paguei
              </button>
              <button
                onClick={() => setShowPixModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchasePage;
