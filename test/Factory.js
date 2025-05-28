const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
    const FEE = ethers.parseUnits("0.01", "ether");


    async function deployFactoryFixture() {
        //Fetch Accounts
        const [deployer, creator, buyer] = await ethers.getSigners();
        // Fetch the contract factory
        const Factory = await ethers.getContractFactory("Factory");
        // Deploy the contract
        const factory = await Factory.deploy(FEE);
        //Create a token
        const transaction = await factory.connect(creator).create("GG Token", "GGT", { value: FEE });
        await transaction.wait();
        //Get Token Address
        const tokenAddress = await factory.tokens(0);
        const token = await ethers.getContractAt("Token", tokenAddress);

        return { factory, token, deployer, creator, buyer }
    }

    async function buyTokenFixture() {
        const { factory, token, creator, buyer } = await deployFactoryFixture();

        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("1", 18);

        //Buy tokens
        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST });
        await transaction.wait();
        return { factory, token, creator, buyer };
    }


    describe("Deployment", function () {
        it("Should set the fee", async function () {
            const { factory } = await loadFixture(deployFactoryFixture);
            expect(await factory.fee()).to.equal(FEE);
        })
        it("Should set the owner", async function () {
            const { factory, deployer } = await loadFixture(deployFactoryFixture);
            expect(await factory.owner()).to.equal(deployer.address);
        })
    })
    describe("Creating", function () {
        it("Should set the owner of token", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture);
            expect(await token.owner()).to.equal(await factory.getAddress());
        })
        it("Should set the creator of token", async function () {
            const { token, creator } = await loadFixture(deployFactoryFixture);
            expect(await token.creator()).to.equal(creator.address);
        })
        it("Should set the total supply of token", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture);
            const totalSupply = ethers.parseUnits("1000000", 18);
            expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply);
        })
        it("Should update the ETH balance of token", async function () {
            const { factory } = await loadFixture(deployFactoryFixture);
            const balance = await ethers.provider.getBalance(await factory.getAddress());
            expect(balance).to.equal(FEE);
        })
        it("Should create the sale of token", async function () {
            const { factory, token, creator } = await loadFixture(deployFactoryFixture);
            const count = await await factory.totaltokens();
            expect(count).to.equal(1);

            const sale = await factory.getTokenSales(0);
            expect(sale.token).to.equal(await token.getAddress());
            expect(sale.creator).to.equal(creator.address);
            expect(sale.sold).to.equal(0);
            expect(sale.raised).to.equal(0);
            expect(sale.isOpen).to.equal(true);
        })

    })
    describe("Buying", function () {
        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("1", 18);

        // Check contract recieves ETH

        it("Should Update ETH Balance of token", async function () {
            const { factory } = await loadFixture(buyTokenFixture);
            const balance = await ethers.provider.getBalance(await factory.getAddress());
            expect(balance).to.equal(FEE + COST);
        })

        //Check that buyer receives token
        it("Should Update balance of token", async function () {
            const { token, buyer } = await loadFixture(buyTokenFixture);
            const balance = await token.balanceOf(buyer.address);
            expect(balance).to.equal(AMOUNT);
        })
        
        it("Should Update sale of token", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture);
            const sale = await factory.tokenToSale(await token.getAddress());
            expect(sale.sold).to.equal(AMOUNT);
            expect(sale.raised).to.equal(COST);
            expect(sale.isOpen).to.equal(true);
        })
        it("Should increase base cost of token", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture);
            const sale = await factory.tokenToSale(await token.getAddress());
            const cost = await factory.getCost(sale.sold);
            expect(cost).to.be.equal(ethers.parseUnits("0.0002"));
        })
    })
    describe("Depositing", function () {
    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("2", 18)

    it("Sale should be closed and successfully deposits", async function () {
      const { factory, token, creator, buyer } = await loadFixture(buyTokenFixture)

      // Buy tokens again to reach target
      const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
      await buyTx.wait()

      const sale = await factory.tokenToSale(await token.getAddress())
      expect(sale.isOpen).to.equal(false)

      const depositTx = await factory.connect(creator).deposit(await token.getAddress())
      await depositTx.wait()

      const balance = await token.balanceOf(creator.address)
      expect(balance).to.equal(ethers.parseUnits("980000", 18))
    })
  })

  describe("Withdrawing Fees", function () {
    it("Should update ETH balances", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture)

      const transaction = await factory.connect(deployer).withdraw(FEE)
      await transaction.wait()

      const balance = await ethers.provider.getBalance(await factory.getAddress())

      expect(balance).to.equal(0)
    })
  })

})
