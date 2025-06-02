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

  function toggleCreate() {
     showCreate ? setshowCreate(false) : setshowCreate(true);
    // Logic to toggle create token modal or component
  }

  async function loadBlockchainData(){
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


  }

  useEffect(() => {
      loadBlockchainData()
  }, [])
  
  return (
    <div className="page">
      <Header account={account} setAccount={setAccount}/>
      <main>

        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy"> 

          {!factory?(
            "[Contract Not deployed]"
            
          ) : !account?(
            "[Please connect]"
          ):(
            "[Start a new token]"
          )}
          </button>
        </div>
      </main>
      {showCreate &&
      <>
      <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory}/>
      </>
      }

    </div>
  );
}
