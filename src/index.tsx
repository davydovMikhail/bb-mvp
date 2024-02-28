import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { Config, BSCTestnet, DAppProvider } from "@usedapp/core";
import { config } from './config';

const DAppConfig: Config = {
  readOnlyChainId: BSCTestnet.chainId,
  readOnlyUrls: {
    [BSCTestnet.chainId]: config.network.bsctestnet.url
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <DAppProvider config={DAppConfig}>
      <Provider store={store}>
        <App />
      </Provider>
    </DAppProvider>
);
