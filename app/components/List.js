import { ethers } from "ethers"

function List({ toggleCreate, fee, provider, factory }) {

  return (
    <div className="list">
      <p className="brand">Create Token</p>

      <button className="btn--fancy" onClick={toggleCreate}>
        {"[Back]"}
      </button>
    </div>
  );
}

export default List;