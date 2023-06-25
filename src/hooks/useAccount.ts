// not in use after rainbowkit integration
import { AccountContext } from "@/context/accountContext";
import React from "react";

export default function useAccount() {
    const context = React.useContext(AccountContext);
    if (context === undefined) {
      throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
  }