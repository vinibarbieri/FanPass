import { useState, useEffect } from 'react';

const ActivateDiscounts = () => {
  const [selectedClub, setSelectedClub] = useState(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [stakingPeriod, setStakingPeriod] = useState(30); // default 30 days
  const [availableTokens, setAvailableTokens] = useState(5000); // mock data

  const clubs = [
    {
      id: 1,
      name: 'São Paulo FC',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/250px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png',
      fanTokenImage: 'https://s2.coinmarketcap.com/static/img/coins/200x200/14661.png',
      tokenSymbol: '$SPFC'
    },
    // Add more clubs as needed
  ];

  // Calculate discount based on amount and time
  const calculateDiscount = () => {
    if (!tokenAmount || !stakingPeriod) return 0;
    const amount = parseInt(tokenAmount);
    const baseDiscount = (amount / 1000) * 0.5; // 0.5% per 1000 tokens
    const timeMultiplier = stakingPeriod / 30; // 30 days as base
    return Math.min(Math.round(baseDiscount * timeMultiplier * 10) / 10, 15); // max 15%
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form className="space-y-6">
        {/* Club Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Clube
          </label>
          <div className="grid grid-cols-2 gap-4">
            {clubs.map((club) => (
              <button
                key={club.id}
                type="button"
                onClick={() => setSelectedClub(club)}
                className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                  selectedClub?.id === club.id
                    ? 'border-vermelho bg-cinza-claro'
                    : 'border-cinza hover:border-vermelho/50 bg-cinza'
                }`}
              >
                <img
                  src={club.logo}
                  alt={`${club.name} logo`}
                  className="w-8 h-8 mr-3 p-1"
                />
                <span className="font-medium text-white">{club.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Token Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Quantos tokens quer usar?
          </label>
          <div className="relative">
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="w-full p-3 bg-cinza border border-cinza-claro text-white rounded-xl pr-24 focus:outline-none focus:border-vermelho"
              placeholder="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <span className="text-gray-400 mr-2">
                {selectedClub?.tokenSymbol || 'Tokens'}
              </span>
              <span className="text-sm text-gray-500">
                Disponível: {availableTokens}
              </span>
            </div>
          </div>
        </div>

        {/* Staking Period */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Por quanto tempo?
          </label>
          <select
            value={stakingPeriod}
            onChange={(e) => setStakingPeriod(Number(e.target.value))}
            className="w-full p-3 bg-cinza border border-cinza-claro text-white rounded-xl focus:outline-none focus:border-vermelho"
          >
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
            <option value={180}>180 dias</option>
          </select>
        </div>

        {/* Expected Discount */}
        <div className="bg-cinza p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Desconto previsto:</span>
            <span className="text-2xl font-bold text-vermelho">
              {calculateDiscount()}%
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-vermelho hover:bg-[#FF4C4F] text-white py-3 px-4 rounded-xl transition-all"
        >
          Ativar Desconto
        </button>

        <p className="text-sm text-gray-500 text-center">
          O desconto vale apenas para compras feitas diretamente com o clube
        </p>
      </form>
    </div>
  );
};

export default ActivateDiscounts; 