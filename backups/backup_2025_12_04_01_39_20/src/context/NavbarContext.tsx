import { createContext, useContext, useState, ReactNode } from "react";

interface NavbarContextType {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(true);
  return (
    <NavbarContext.Provider value={{ visible, setVisible }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }
  return context;
};
