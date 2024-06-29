import React, { createContext, useState } from "react";

const UploadContext = createContext({});

export const UploadProvider = ({ children }) => {
  const [fileStorage, setFileStorage] = useState([]);

  return (
    <UploadContext.Provider
      value={{
        fileStorage,
        setFileStorage,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export default UploadContext;
