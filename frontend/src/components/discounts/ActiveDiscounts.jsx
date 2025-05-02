import { useState, useEffect } from 'react';

const ActiveDiscounts = () => {
  const [activeStakings, setActiveStakings] = useState([
    {
      id: 1,
      club: {
        name: 'São Paulo FC',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/250px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png',
        fanTokenImage: 'https://s2.coinmarketcap.com/static/img/coins/200x200/14661.png',
        tokenSymbol: '$SPFC'
      },
      stakedAmount: 1000,
      remainingTime: 15, // days
      totalTime: 30, // days
      discount: 10, // percentage
    },
    // Add more mock data as needed
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeStakings.map((staking) => (
        <div key={staking.id} className="bg-cinza-claro rounded-xl p-6 hover:transform hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center mb-4">
            <img
              src={staking.club.logo}
              alt={`${staking.club.name} logo`}
              className="w-20 h-20 mr-4 p-1"
            />
            <h1 className="text-3xl font-semibold text-white">{staking.club.name}</h1>
          </div>

          {/* Progress bar for staking time */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Tempo restante</span>
              <span className="text-white">{staking.remainingTime} dias</span>
            </div>
            <div className="w-full bg-cinza rounded-full h-2">
              <div
                className="bg-vermelho h-2 rounded-full"
                style={{
                  width: `${((staking.totalTime - staking.remainingTime) / staking.totalTime) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Desconto gerado:</span>
              <span className="font-semibold text-vermelho">{staking.discount}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fan Tokens em stake:</span>
              <div className="flex items-center">
                <span className="font-semibold text-white">{staking.stakedAmount}</span>
                <span className="ml-1 text-white">{staking.club.tokenSymbol}</span>
                <img
                  src={staking.club.fanTokenImage}
                  alt="Token"
                  className="w-5 h-5 ml-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/sp.png";
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <button className="flex-1 bg-vermelho hover:bg-vermelho text-white py-2 px-4 rounded-xl transition-all">
                + Desconto
              </button>
              {staking.remainingTime === 0 && (
                <button className="flex-1 bg-cinza hover:bg-cinza-claro text-white py-2 px-4 rounded-xl transition-all">
                  Resgatar Fan Tokens
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveDiscounts; 