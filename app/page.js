"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"

// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"
import images from "./images.json"

export default function Home() {
  const [provider, setprovider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setfactory] = useState(null)
  const [fee, setfee] = useState(0)
  const [showCreate, setshowCreate] = useState(false)
  const [token, setToken] = useState(null)
  const [tokens, setTokens] = useState([])
  const [showtrade, setshowTrade] = useState(false)


  function toggleCreate() {
    showCreate ? setshowCreate(false) : setshowCreate(true);
  }
  function toggleTrade(token) {
    setToken(token);
    showtrade ? setshowTrade(false) : setshowTrade(true);
    
  }

  async function loadBlockchainData() {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setprovider(provider);
    const network = await provider.getNetwork();
    console.log("Network:", network.chainId);
    console.log("Address:", config[network.chainId].factory.address);
    console.log("Factory ABI:", Factory);

    const factory = new ethers.Contract(config[network.chainId].factory.address, Factory, provider);
    console.log("Factory Contract:", factory);
    setfactory(factory);

    const fee = await factory.fee();
    console.log("Factory Fee:", fee);
    setfee(fee);

    const totalTokens = await factory.totaltokens();
    const tokens = [];
    for (let i = 0; i < totalTokens; i++) {
      const tokenSale = await factory.getTokenSales(i);

      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: images[i]
      }
      tokens.push(token);

    }
        setTokens(tokens.reverse())

  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />
      <main>

        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy">

            {!factory ? (
              "[Contract Not deployed]"

            ) : !account ? (
              "[Please connect]"
            ) : (
              "[Start a new token]"
            )}
          </button>
        </div>
         <div className="listings">
          <h1>new listings</h1>

          <div className="tokens">
            {!account ? (
              <p>please connect wallet</p>
            ) : tokens.length === 0 ? (
              <p>No tokens listed</p>
            ) : (
              tokens.map((token, index) => (
                <Token
                  toggleTrade={toggleTrade}
                  token={token}
                  key={index}
                />
              ))
            )}
          </div>
        </div>


          
      </main>
      {showCreate &&
        <>
          <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
        </>
      }
      {showtrade &&
        <>
          <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory}/>
        </>
      }

    </div>
  );
}
