import React, { useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";

const RegisterPage = () => {
  const { connectWallet, account, error } = useWeb3();

  useEffect(() => {
    if (!account) {
      connectWallet();
    }
  }, [account, connectWallet]);

  return (
    <div>
      <h1>Cadastro</h1>
      {error && <p>{error}</p>}
      <div>
        {account ? (
          <p>Conectado: {account}</p>
        ) : (
          <button onClick={connectWallet}>Conectar MetaMask</button>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
