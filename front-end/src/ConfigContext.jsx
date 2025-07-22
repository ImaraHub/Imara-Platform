import { createContext, useContext } from 'react';

const ConfigContext = createContext();

export const ConfigProvider = ({ config, children }) => {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
