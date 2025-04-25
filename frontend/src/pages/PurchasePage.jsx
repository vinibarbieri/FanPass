import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const PurchasePage = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("fantoken");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/ticket/${ticketId}`
        );
        if (!response.ok) throw new Error("Erro ao buscar ticket");
        const data = await response.json();
        console.log(data);

        if (data.tokenURI) {
          const tokenURIResponse = await fetch(data.tokenURI);
          if (!tokenURIResponse.ok)
            throw new Error("Erro ao buscar dados do tokenURI");
          const tokenURIData = await tokenURIResponse.json();

          setTicket({
            ...data,
            tokenURI: tokenURIData,
          });
        } else {
          setTicket(data);
        }
      } catch (error) {
        console.error("Erro:", error);
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
  const rate = ticket.priceConversion?.rate || 1.3;
  const cashPrice = ticket.priceConversion?.reais;

  const handlePurchase = async () => {
    try {
      const response = await fetch("http://localhost:3001/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          userId: user.id,
          paymentMethod: selectedPayment,
        }),
      });

      if (!response.ok) throw new Error("Erro na compra");

      alert("Ingresso comprado com sucesso!");
      navigate("/profile");
    } catch (error) {
      alert("Erro ao comprar ingresso.");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-black min-h-screen p-6 flex items-center justify-center">
        <div className="bg-gradient-to-br from-red-600 to-black rounded-3xl p-10 shadow-2xl max-w-3xl w-full text-white space-y-8 relative">
          {/* Fundo com Degradê Atrás do Escudo */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-black opacity-50 rounded-3xl"></div>

          {/* Informações do Ingresso */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 relative z-10">
            <img
              src={ticket.tokenURI?.image || "/default-fantoken.png"}
              alt={ticket.name}
              className="w-40 h-40 object-contain rounded-xl border-2 border-white" // Ajustado para 'object-contain' para ajustar a imagem sem cortar
            />
            <div className="mt-4 sm:mt-0 space-y-1">
              <h2 className="text-2xl font-semibold text-white">
                {ticket.name}
              </h2>
              <p className="text-gray-300">
                Categoria: {ticket.details?.category || "N/A"}
              </p>
              <p className="text-gray-300">
                Data: {ticket.details?.date || "Não informado"}
              </p>
              <p className="text-gray-300">
                Local: {ticket.details?.location || "Não informado"}
              </p>
              <p className="text-gray-300">
                Descrição: {ticket.details?.description || "Sem descrição"}
              </p>
            </div>
          </div>

          {/* Preço */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-lg font-medium">
            <span className="text-red-500">
              Valor FanToken: {fanTokenPrice}
            </span>
            <span className="text-white">Valor em R$: R$ {cashPrice}</span>
          </div>

          {/* Opções de Pagamento */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Forma de Pagamento:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "FanToken", value: "fantoken" },
                { label: "Chiliz", value: "chiliz" },
                { label: "Pix", value: "pix" },
                { label: "Crédito", value: "credito" },
                { label: "Débito", value: "debito" },
                { label: "Boleto", value: "boleto" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setSelectedPayment(value)}
                  className={`py-2 px-4 rounded-full font-medium transition-all ${
                    selectedPayment === value
                      ? "bg-red-600 text-white"
                      : "bg-white text-black hover:bg-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Compra */}
          <button
            onClick={handlePurchase}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </>
  );
};

export default PurchasePage;
