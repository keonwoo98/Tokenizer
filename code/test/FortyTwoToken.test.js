const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FortyTwoToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  const INITIAL_SUPPLY = 42000000n; // 42 million tokens
  const DECIMALS = 18n;
  const TOTAL_SUPPLY = INITIAL_SUPPLY * (10n ** DECIMALS);

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const FortyTwoToken = await ethers.getContractFactory("FortyTwoToken");
    token = await FortyTwoToken.deploy(INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("Forty Two Token");
      expect(await token.symbol()).to.equal("F42T");
    });

    it("Should have 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18n);
    });

    it("Should set the correct total supply", async function () {
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign all tokens to deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens to another address", async function () {
      const amount = ethers.parseEther("100");

      await token.transfer(addr1.address, amount);

      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - amount);
    });

    it("Should emit Transfer event", async function () {
      const amount = ethers.parseEther("100");

      await expect(token.transfer(addr1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should fail with insufficient balance", async function () {
      const amount = ethers.parseEther("100");

      // addr1 has no tokens
      await expect(
        token.connect(addr1).transfer(addr2.address, amount)
      ).to.be.revertedWith("FortyTwoToken: insufficient balance");
    });

    it("Should fail when transferring to zero address", async function () {
      const amount = ethers.parseEther("100");

      await expect(
        token.transfer(ethers.ZeroAddress, amount)
      ).to.be.revertedWith("FortyTwoToken: transfer to zero address");
    });
  });

  describe("Approve & TransferFrom", function () {
    const amount = ethers.parseEther("100");

    it("Should approve spending allowance", async function () {
      await token.approve(addr1.address, amount);

      expect(await token.allowance(owner.address, addr1.address)).to.equal(amount);
    });

    it("Should emit Approval event", async function () {
      await expect(token.approve(addr1.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should transfer approved tokens via transferFrom", async function () {
      await token.approve(addr1.address, amount);

      await token.connect(addr1).transferFrom(owner.address, addr2.address, amount);

      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(0n);
    });

    it("Should fail when exceeding allowance", async function () {
      await token.approve(addr1.address, amount);

      const excessAmount = amount + 1n;
      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, excessAmount)
      ).to.be.revertedWith("FortyTwoToken: insufficient allowance");
    });
  });

  describe("Mint", function () {
    const mintAmount = ethers.parseEther("1000");

    it("Should allow owner to mint new tokens", async function () {
      await token.mint(addr1.address, mintAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY + mintAmount);
    });

    it("Should prevent non-owner from minting", async function () {
      await expect(
        token.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWith("FortyTwoToken: caller is not the owner");
    });
  });

  describe("Burn", function () {
    const burnAmount = ethers.parseEther("1000");

    it("Should allow burning owned tokens", async function () {
      await token.burn(burnAmount);

      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - burnAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("Should fail when burning more than balance", async function () {
      // addr1 has no tokens
      await expect(
        token.connect(addr1).burn(burnAmount)
      ).to.be.revertedWith("FortyTwoToken: insufficient balance to burn");
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await token.transferOwnership(addr1.address);

      expect(await token.owner()).to.equal(addr1.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(token.transferOwnership(addr1.address))
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      await expect(
        token.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("FortyTwoToken: caller is not the owner");
    });

    it("Should fail when transferring ownership to zero address", async function () {
      await expect(
        token.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("FortyTwoToken: new owner is zero address");
    });
  });
});
