import { ethers } from "ethers"

function List({ toggleCreate, fee, provider, factory }) {
  async function listHandler(form) {
    const name = form.get("name");
    const ticker = form.get("ticker");

    const signer = await provider.getSigner();
    const transaction = await factory.connect(signer).create(name, ticker, { value: fee });
    await transaction.wait();

    

    toggleCreate()

  }
  return (
    <div className="list">
      <p className="brand">List new Token</p>

      <div className="list_description">
        <p>fee: {ethers.formatUnits(fee, 18)}ETH</p>

      </div>
      <form action={listHandler}>
        <input type="text" name="name" placeholder="name" />
        <input type="text" name="ticker" placeholder="ticker" />
        <input type="submit" value="[ list ]" />
      </form>

      <button className="btn--fancy" onClick={toggleCreate}>
        {"[Back]"}
      </button>
    </div>
  );
}

export default List;