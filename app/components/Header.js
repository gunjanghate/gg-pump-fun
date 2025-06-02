"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"

function Header({ account, setAccount }) {

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);
        console.log("Connected Account:", account);
      }
      catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  }
  return (
    <header>

      <h1 className="brand">fun.pump</h1>
      {
      account ?
       (<button  className="btn--fancy">[ {account.slice(0, 6) + '...' + account.slice(38, 42)} ]</button>) 
      : (<button onClick={connectWallet} className="btn--fancy">[ Connect Wallet ]</button>)}

    </header>
  );
}

export default Header;