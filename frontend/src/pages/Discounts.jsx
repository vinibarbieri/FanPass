import { useState } from 'react';
import ActiveDiscounts from '../components/discounts/ActiveDiscounts';
import ActivateDiscounts from '../components/discounts/ActivateDiscounts';
import Header from '../components/Header';

const Discounts = () => {
  const [activeView, setActiveView] = useState('active'); // 'active' or 'activate'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meus Descontos</h1>
          <p className="text-lg text-gray-400">
            Use Fan Tokens para ganhar até 15% de desconto em ingressos!
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveView('active')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              activeView === 'active'
                ? 'bg-vermelho text-white'
                : 'bg-cinza text-gray-400 hover:bg-cinza-claro'
            }`}
          >
            Descontos Ativos
          </button>
          <button
            onClick={() => setActiveView('activate')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              activeView === 'activate'
                ? 'bg-vermelho text-white'
                : 'bg-cinza text-gray-400 hover:bg-cinza-claro'
            }`}
          >
            Ativar Descontos
          </button>
        </div>

        <div className="bg-cinza rounded-2xl p-6">
          {activeView === 'active' ? <ActiveDiscounts /> : <ActivateDiscounts />}
        </div>
      </div>
    </div>
  );
};

export default Discounts; 