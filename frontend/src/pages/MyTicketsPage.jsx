import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axios from "axios";

// Função para obter o gradiente baseado na cor do clube
const getClubGradient = (clubId) => {
  const gradients = {
    1: "linear-gradient(180deg, #ec1c24, #9c1c1c)", // SP
    2: "linear-gradient(180deg, #f20000, #9b0000)", // Mengo
    3: "linear-gradient(180deg, #1a1a1a, #000000)", // Vasco
    4: "linear-gradient(180deg, #006437, #004d2c)", // Palmeiras
    5: "linear-gradient(180deg, #9e1b32, #7a0f23)", // Internacional
    6: "linear-gradient(180deg, #009c3b, #007a2d)", // Fluminense
    7: "linear-gradient(180deg, #1a1a1a, #000000)", // Corinthians
  };

  return gradients[clubId] || "linear-gradient(180deg, #333333, #111111)"; // cor padrão
};

const MyTicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funções para os botões (implementar lógica depois)
  const handleUseTicket = (ticketId, e) => {
    e.stopPropagation();
    console.log("Usar ingresso:", ticketId);
    // Lógica para usar o ingresso
  };

  const handleSellTicket = (ticketId, e) => {
    e.stopPropagation();
    console.log("Vender ingresso:", ticketId);
    // Lógica para vender o ingresso
    navigate(`/sell-ticket/${ticketId}`);
  };

  const handleRentTicket = (ticketId, e) => {
    e.stopPropagation();
    console.log("Alugar ingresso:", ticketId);
    // Lógica para alugar o ingresso
    navigate(`/rent-ticket/${ticketId}`);
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:3001/ticket/${user.id}/tickets`
        );

        if (
          !response.data ||
          !response.data.success ||
          !Array.isArray(response.data.tickets)
        ) {
          throw new Error("Invalid data format received from server");
        }

        const ticketsWithDetails = await Promise.all(
          response.data.tickets.map(async (ticket) => {
            try {
              if (typeof ticket.tokenURI === "string") {
                const tokenData = await axios.get(ticket.tokenURI, {
                  headers: { Authorization: undefined },
                });
                return {
                  ...ticket,
                  tokenData: tokenData.data,
                  image: tokenData.data.image || "/default-fantoken.png",
                  name: tokenData.data.name || `Ingresso ${ticket.tokenId}`,
                };
              }

              return {
                ...ticket,
                image: "/default-fantoken.png",
                name: `Ingresso ${ticket.tokenId}`,
              };
            } catch (error) {
              console.error("Erro ao buscar detalhes do token:", error);
              return {
                ...ticket,
                image: "/default-fantoken.png",
                name: `Ingresso ${ticket.tokenId}`,
              };
            }
          })
        );

        setTickets(ticketsWithDetails);
      } catch (error) {
        console.error("Erro ao buscar ingressos:", error);
        setError(error.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTickets();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] min-h-screen p-6">
        <Header />
        <p className="text-white text-center py-12">
          Carregando seus ingressos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A] min-h-screen p-6">
        <Header />
        <div className="text-center py-12">
          <p className="text-red-400 text-xl">Erro: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#FF595C] hover:bg-red-500 text-white py-2 px-6 rounded-full"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#1A1A1A] min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Meus Ingressos</h1>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">
                Você ainda não possui ingressos
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-[#FF595C] hover:bg-red-500 text-white py-2 px-6 rounded-full transition-all"
              >
                Comprar Ingressos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.tokenId}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/ticket/${ticket.tokenId}`)}
                >
                  <div className="border border-gray-700 relative bg-[#1E1E1E] rounded-xl p-5 h-full text-white space-y-4 overflow-hidden hover:border-[#FF595C] transition-all duration-300">
                    {/* Imagem do ingresso */}
                    <div className="w-full aspect-square overflow-hidden rounded-lg mb-4 flex items-center justify-center bg-[#2B2B2B]">
                      <img
                        src={ticket.image}
                        alt={ticket.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: getClubGradient(ticket.clubId), // Aplica o gradiente aqui
                        }}
                      />
                    </div>

                    {/* Detalhes do ingresso */}
                    <div>
                      <h2 className="text-xl font-bold text-white truncate mb-2">
                        {ticket.tokenData?.attributes?.[0]?.value ||
                          ticket.name}
                      </h2>

                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Setor:</span>
                          <span className="text-white">
                            {ticket.sector || "N/I"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Validade:</span>
                          <span className="text-white">
                            {ticket.validUntil
                              ? new Date(ticket.validUntil).toLocaleDateString()
                              : "N/I"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span
                            className={
                              ticket.isValid ? "text-green-400" : "text-red-400"
                            }
                          >
                            {ticket.isValid ? "Válido" : "Expirado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ID e botão de detalhes */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                      <span className="text-[#FF595C] text-sm font-mono">
                        #{ticket.tokenId}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ticket/${ticket.tokenId}`);
                        }}
                        className="text-xs border border-[#FF595C] text-[#FF595C] hover:bg-[#FF595C] hover:text-white py-1 px-3 rounded-full transition-all"
                      >
                        Detalhes
                      </button>
                    </div>

                    {/* Botões de ação - estilo Web3 */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button
                        onClick={(e) => handleUseTicket(ticket.tokenId, e)}
                        className="border text-white py-2 px-4 rounded-full text-xs font-semibold"
                      >
                        Usar
                      </button>
                      <button
                        onClick={(e) => handleSellTicket(ticket.tokenId, e)}
                        className="border text-white py-2 px-4 rounded-full text-xs font-semibold"
                      >
                        Vender
                      </button>
                      <button
                        onClick={(e) => handleRentTicket(ticket.tokenId, e)}
                        className="border text-white py-2 px-4 rounded-full text-xs font-semibold"
                      >
                        Alugar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyTicketsPage;
