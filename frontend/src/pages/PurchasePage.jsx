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
  const [pixCode, setPixCode] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [bidHistory, setBidHistory] = useState([
    { bidder: "0x123...789", amount: "120 SPFC", time: "há 2 horas" },
    { bidder: "0x456...012", amount: "100 SPFC", time: "há 3 horas" },
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fanTokenImages = {
    1: "/sp.png",
    2: "/mengo.png",
    3: "/vasco.jpeg",
    4: "/palmeiras.png",
    5: "/inter.png",
    6: "/flu.png",
    7: "/corinthians.png",
  };

  const fanTokenSymbols = {
    1: "SPFC",
    2: "MENGO",
    3: "VASCO",
    4: "VERDAO",
    5: "INTER",
    6: "FLU",
    7: "SCCP",
  };

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

    return gradients[clubId] || "linear-gradient(180deg, #333333, #111111)";
  };

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

  useEffect(() => {
    // Mock: Leilão termina em 2 dias a partir de agora
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2); // 2 dias a partir de agora

    const updateTimeLeft = () => {
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000); // Atualiza a cada segundo
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;
  if (loading) return <p className="text-white">Carregando...</p>;
  if (!ticket) return <p className="text-white">Ingresso não encontrado.</p>;

  const fanTokenPrice = ticket.details?.priceFanToken;
  const cashPrice = ticket.priceConversion?.reais;
  const getFanTokenImage = (clubId) => {
    return fanTokenImages[clubId] || "/default-fantoken.png";
  };

  const getFanTokenSymbol = (clubId) => {
    return fanTokenSymbols[clubId] || "FT";
  };

  const generatePixCode = () => {
    const payload = `00020126360014BR.GOV.BCB.PIX0114+5581999999995204000053039865802BR5925Nome Do Evento LTDA6009SAO PAULO62070503***6304B13F`;
    setPixCode(payload);
  };

  const handlePurchase = async () => {
    setShowPaymentModal(true);
  };

  const processPayment = async (method) => {
    try {
      if (method === "pix") {
        generatePixCode();
        setShowPaymentModal(false);
        setShowPixModal(true);
        return;
      }

      alert(`Pagamento com ${method} realizado com sucesso!`);
      navigate("/profile");
    } catch (error) {
      alert("Erro ao processar pagamento.");
      console.error(error);
    }
  };

  const handlePixPaid = async () => {
    try {
      alert("Pagamento Pix confirmado!");
      navigate("/meus-ingressos");
    } catch (error) {
      alert("Erro ao confirmar pagamento.");
      console.error(error);
    }
  };

  const handleBid = async () => {
    if (!bidAmount) return;
    try {
      alert("Lance realizado com sucesso!");
      setShowBidModal(false);
    } catch (error) {
      alert("Erro ao dar lance.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Image */}
          <div className="lg:w-1/2">
            <div className="rounded-2xl overflow-hidden bg-[#2B2B2B]">
              {/* Fundo com o Degradê */}
              <div
                className="w-full aspect-square flex items-center justify-center"
                style={{ background: getClubGradient(ticket.clubId) }}
              >
                <img
                  src={ticket.tokenURI?.image || "/default-fantoken.png"}
                  alt={ticket.name}
                  className="object-contain w-4/5 h-4/5"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-1/2 space-y-6">
            {/* Informações Principais */}
            <div className="bg-[#2B2B2B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-2xl">
                    {ticket.tokenURI.attributes[0].value}
                  </span>
                </div>
                <div className="text-gray-400">
                  <span>Vendedor: </span>
                  <span className="text-[#FF595C]">FanPass Official</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-[#3B3B3B] p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Setor</p>
                  <p className="text-white font-semibold">
                    {ticket.tokenURI.attributes[1].value || "Não informado"}
                  </p>
                </div>
                <div className="bg-[#3B3B3B] p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Temporada</p>
                  <p className="text-white font-semibold">
                    {ticket.tokenURI.attributes[2].value.replace(/\D/g, "")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-400 text-sm">Descrição</p>
                <p className="text-white mt-1">
                  {ticket.tokenURI?.description || "Sem descrição"}
                </p>
              </div>
            </div>

            {/* Leilão e Preço Card */}
            <div className="bg-[#2B2B2B] rounded-2xl p-6">
              <div className="space-y-6">
                {/* Timer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Leilão termina em</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="bg-[#3B3B3B] px-3 py-2 rounded-lg">
                        <span className="text-white font-bold text-xl">
                          {timeLeft.days}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">d</span>
                      </div>
                      <div className="bg-[#3B3B3B] px-3 py-2 rounded-lg">
                        <span className="text-white font-bold text-xl">
                          {timeLeft.hours.toString().padStart(2, "0")}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">h</span>
                      </div>
                      <div className="bg-[#3B3B3B] px-3 py-2 rounded-lg">
                        <span className="text-white font-bold text-xl">
                          {timeLeft.minutes.toString().padStart(2, "0")}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">m</span>
                      </div>
                      <div className="bg-[#3B3B3B] px-3 py-2 rounded-lg">
                        <span className="text-white font-bold text-xl">
                          {timeLeft.seconds.toString().padStart(2, "0")}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">s</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Lance atual</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <img
                        src={getFanTokenImage(ticket.clubId)}
                        alt="FanToken"
                        className="w-6 h-6"
                      />
                      <p className="text-white font-bold text-xl">
                        100 {getFanTokenSymbol(ticket.clubId)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preço Compre Agora */}
                <div className="border-t border-[#3B3B3B] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Preço Compre Agora</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={getFanTokenImage(ticket.clubId)}
                        alt="FanToken"
                        className="w-8 h-8"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          {fanTokenPrice}
                        </span>
                        <span className="text-2xl font-bold text-white">
                          {getFanTokenSymbol(ticket.clubId)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preço em Reais */}
                <div className="border-t border-[#3B3B3B] pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-400">Preço em Reais</span>
                      <p className="text-sm text-[#FF595C] mt-1">
                        Taxa de 15% por não usar FanToken
                      </p>
                    </div>
                    <span className="text-xl font-bold text-white">
                      R$ {cashPrice}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-[#FF595C] hover:bg-[#FF4C4F] text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all"
                  >
                    Comprar agora
                  </button>
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="w-full bg-[#3B3B3B] hover:bg-[#4B4B4B] text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all"
                  >
                    Dar lance
                  </button>
                </div>
              </div>
            </div>

            {/* Histórico de Lances */}
            <div className="bg-[#2B2B2B] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Histórico de Lances
              </h3>
              <div className="space-y-4">
                {bidHistory.map((bid, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-[#3B3B3B] last:border-0"
                  >
                    <div>
                      <p className="text-white font-medium">{bid.bidder}</p>
                      <p className="text-gray-400 text-sm">{bid.time}</p>
                    </div>
                    <p className="text-white font-medium">{bid.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Lance */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Dar Lance</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-2">Lance mínimo</p>
                <div className="flex items-center gap-2">
                  <img
                    src={getFanTokenImage(ticket.clubId)}
                    alt="FanToken"
                    className="w-6 h-6"
                  />
                  <p className="text-white">
                    105 {getFanTokenSymbol(ticket.clubId)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Seu lance</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bg-[#3B3B3B] text-white px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#FF595C]"
                    placeholder="Digite o valor do lance"
                  />
                  <span className="text-white font-medium">
                    {getFanTokenSymbol(ticket.clubId)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleBid}
                className="flex-1 bg-[#FF595C] hover:bg-[#FF4C4F] text-white py-3 rounded-xl font-semibold"
              >
                Confirmar Lance
              </button>
              <button
                onClick={() => setShowBidModal(false)}
                className="flex-1 bg-[#3B3B3B] hover:bg-[#4B4B4B] text-white py-3 rounded-xl font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pix */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              Pague com Pix
            </h2>
            {pixCode && (
              <div className="bg-white p-4 rounded-xl mb-6">
                <QRCode value={pixCode} className="w-full" />
              </div>
            )}
            <p className="text-gray-400 text-sm break-words mb-6">{pixCode}</p>
            <div className="flex gap-4">
              <button
                onClick={handlePixPaid}
                className="flex-1 bg-[#FF595C] hover:bg-[#FF4C4F] text-white py-3 rounded-xl font-semibold"
              >
                Já Paguei
              </button>
              <button
                onClick={() => setShowPixModal(false)}
                className="flex-1 bg-[#3B3B3B] hover:bg-[#4B4B4B] text-white py-3 rounded-xl font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Opções de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Escolha o método de pagamento
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Opção Fan Tokens */}
              <button
                onClick={() => processPayment("fantoken")}
                className="w-full bg-[#2B2B2B] hover:bg-[#3B3B3B] border border-[#3B3B3B] rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getFanTokenImage(ticket.clubId)}
                      alt="FanToken"
                      className="w-10 h-10"
                    />
                    <div className="text-left">
                      <p className="text-white font-semibold">Fan Tokens</p>
                      <p className="text-gray-400 text-sm">
                        Pague com {getFanTokenSymbol(ticket.clubId)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {fanTokenPrice} {getFanTokenSymbol(ticket.clubId)}
                    </p>
                    <p className="text-green-500 text-sm">Melhor preço</p>
                  </div>
                </div>
              </button>

              {/* Opção PIX */}
              <button
                onClick={() => processPayment("pix")}
                className="w-full bg-[#2B2B2B] hover:bg-[#3B3B3B] border border-[#3B3B3B] rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B3B3B] rounded-lg flex items-center justify-center">
                      <img
                        src="https://img.icons8.com/fluent/512/pix.png"
                        alt="PIX"
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">PIX</p>
                      <p className="text-gray-400 text-sm">
                        Pagamento instantâneo
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">R$ {cashPrice}</p>
                    <p className="text-[#FF595C] text-sm">Taxa de 15%</p>
                  </div>
                </div>
              </button>

              {/* Opção Cartão */}
              <button
                onClick={() => processPayment("cartao")}
                className="w-full bg-[#2B2B2B] hover:bg-[#3B3B3B] border border-[#3B3B3B] rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B3B3B] rounded-lg flex items-center justify-center">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/657/657076.png"
                        alt="Cartão"
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        Cartão de Crédito
                      </p>
                      <p className="text-gray-400 text-sm">
                        Parcele em até 12x
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">R$ {cashPrice}</p>
                    <p className="text-[#FF595C] text-sm">Taxa de 15%</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center text-gray-400 text-sm">
              <p>Pagamentos processados com segurança</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasePage;
