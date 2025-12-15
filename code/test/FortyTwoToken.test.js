const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FortyTwoToken", function () {
  let token;
  let owner;
  let signer1;
  let signer2;
  let signer3;
  let nonSigner;

  const INITIAL_SUPPLY = 42000000n;
  const DECIMALS = 18n;
  const TOTAL_SUPPLY = INITIAL_SUPPLY * (10n ** DECIMALS);
  const REQUIRED_SIGNATURES = 2n;

  beforeEach(async function () {
    // Get test accounts
    [owner, signer1, signer2, signer3, nonSigner] = await ethers.getSigners();

    // Deploy contract with 3 signers, 2 required
    const FortyTwoToken = await ethers.getContractFactory("FortyTwoToken");
    token = await FortyTwoToken.deploy(
      INITIAL_SUPPLY,
      [signer1.address, signer2.address, signer3.address],
      REQUIRED_SIGNATURES
    );
  });

  // ============ Deployment Tests ============
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

    it("Should initialize signers correctly", async function () {
      expect(await token.getSignerCount()).to.equal(3n);
      expect(await token.isSigner(signer1.address)).to.be.true;
      expect(await token.isSigner(signer2.address)).to.be.true;
      expect(await token.isSigner(signer3.address)).to.be.true;
      expect(await token.isSigner(nonSigner.address)).to.be.false;
    });

    it("Should set required signatures correctly", async function () {
      expect(await token.requiredSignatures()).to.equal(REQUIRED_SIGNATURES);
    });
  });

  // ============ Transfer Tests ============
  describe("Transfer", function () {
    it("Should transfer tokens to another address", async function () {
      const amount = ethers.parseEther("100");
      await token.transfer(signer1.address, amount);

      expect(await token.balanceOf(signer1.address)).to.equal(amount);
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - amount);
    });

    it("Should emit Transfer event", async function () {
      const amount = ethers.parseEther("100");

      await expect(token.transfer(signer1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, signer1.address, amount);
    });

    it("Should fail with insufficient balance", async function () {
      const amount = ethers.parseEther("100");

      await expect(
        token.connect(signer1).transfer(signer2.address, amount)
      ).to.be.revertedWith("FortyTwoToken: insufficient balance");
    });

    it("Should fail when transferring to zero address", async function () {
      const amount = ethers.parseEther("100");

      await expect(
        token.transfer(ethers.ZeroAddress, amount)
      ).to.be.revertedWith("FortyTwoToken: transfer to zero address");
    });
  });

  // ============ Approve & TransferFrom Tests ============
  describe("Approve & TransferFrom", function () {
    const amount = ethers.parseEther("100");

    it("Should approve spending allowance", async function () {
      await token.approve(signer1.address, amount);
      expect(await token.allowance(owner.address, signer1.address)).to.equal(amount);
    });

    it("Should emit Approval event", async function () {
      await expect(token.approve(signer1.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, signer1.address, amount);
    });

    it("Should transfer approved tokens via transferFrom", async function () {
      await token.approve(signer1.address, amount);
      await token.connect(signer1).transferFrom(owner.address, signer2.address, amount);

      expect(await token.balanceOf(signer2.address)).to.equal(amount);
      expect(await token.allowance(owner.address, signer1.address)).to.equal(0n);
    });

    it("Should fail when exceeding allowance", async function () {
      await token.approve(signer1.address, amount);
      const excessAmount = amount + 1n;

      await expect(
        token.connect(signer1).transferFrom(owner.address, signer2.address, excessAmount)
      ).to.be.revertedWith("FortyTwoToken: insufficient allowance");
    });
  });

  // ============ Burn Tests ============
  describe("Burn", function () {
    const burnAmount = ethers.parseEther("1000");

    it("Should allow burning owned tokens", async function () {
      await token.burn(burnAmount);

      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - burnAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("Should fail when burning more than balance", async function () {
      await expect(
        token.connect(signer1).burn(burnAmount)
      ).to.be.revertedWith("FortyTwoToken: insufficient balance to burn");
    });
  });

  // ============ Multisig Mint Tests ============
  describe("Multisig Mint", function () {
    const mintAmount = ethers.parseEther("1000");

    it("Should allow signer to propose mint", async function () {
      await expect(token.connect(signer1).proposeMint(signer1.address, mintAmount))
        .to.emit(token, "TransactionProposed")
        .withArgs(0n, 0n, signer1.address, mintAmount, signer1.address);

      const tx = await token.getTransaction(0);
      expect(tx.txType).to.equal(0n); // Mint
      expect(tx.target).to.equal(signer1.address);
      expect(tx.amount).to.equal(mintAmount);
      expect(tx.executed).to.be.false;
    });

    it("Should not allow non-signer to propose mint", async function () {
      await expect(
        token.connect(nonSigner).proposeMint(nonSigner.address, mintAmount)
      ).to.be.revertedWith("FortyTwoToken: caller is not a signer");
    });

    it("Should allow signers to confirm transaction", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);

      await expect(token.connect(signer1).confirmTransaction(0))
        .to.emit(token, "TransactionConfirmed")
        .withArgs(0n, signer1.address);

      await expect(token.connect(signer2).confirmTransaction(0))
        .to.emit(token, "TransactionConfirmed")
        .withArgs(0n, signer2.address);

      const tx = await token.getTransaction(0);
      expect(tx.confirmations).to.equal(2n);
    });

    it("Should not allow double confirmation", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);
      await token.connect(signer1).confirmTransaction(0);

      await expect(
        token.connect(signer1).confirmTransaction(0)
      ).to.be.revertedWith("FortyTwoToken: transaction already confirmed");
    });

    it("Should execute mint after required confirmations", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);
      await token.connect(signer1).confirmTransaction(0);
      await token.connect(signer2).confirmTransaction(0);

      const balanceBefore = await token.balanceOf(signer1.address);

      await expect(token.connect(signer1).executeTransaction(0))
        .to.emit(token, "TransactionExecuted")
        .withArgs(0n);

      expect(await token.balanceOf(signer1.address)).to.equal(balanceBefore + mintAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY + mintAmount);
    });

    it("Should not execute without enough confirmations", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);
      await token.connect(signer1).confirmTransaction(0);

      await expect(
        token.connect(signer1).executeTransaction(0)
      ).to.be.revertedWith("FortyTwoToken: not enough confirmations");
    });

    it("Should not execute already executed transaction", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);
      await token.connect(signer1).confirmTransaction(0);
      await token.connect(signer2).confirmTransaction(0);
      await token.connect(signer1).executeTransaction(0);

      await expect(
        token.connect(signer1).executeTransaction(0)
      ).to.be.revertedWith("FortyTwoToken: transaction already executed");
    });
  });

  // ============ Multisig Ownership Transfer Tests ============
  describe("Multisig Ownership Transfer", function () {
    it("Should allow signer to propose ownership transfer", async function () {
      await expect(token.connect(signer1).proposeTransferOwnership(signer1.address))
        .to.emit(token, "TransactionProposed")
        .withArgs(0n, 1n, signer1.address, 0n, signer1.address);
    });

    it("Should execute ownership transfer after required confirmations", async function () {
      await token.connect(signer1).proposeTransferOwnership(signer1.address);
      await token.connect(signer1).confirmTransaction(0);
      await token.connect(signer2).confirmTransaction(0);

      await expect(token.connect(signer1).executeTransaction(0))
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, signer1.address);

      expect(await token.owner()).to.equal(signer1.address);
    });
  });

  // ============ Revoke Confirmation Tests ============
  describe("Revoke Confirmation", function () {
    const mintAmount = ethers.parseEther("1000");

    it("Should allow signer to revoke confirmation", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);
      await token.connect(signer1).confirmTransaction(0);

      await expect(token.connect(signer1).revokeConfirmation(0))
        .to.emit(token, "TransactionRevoked")
        .withArgs(0n, signer1.address);

      const tx = await token.getTransaction(0);
      expect(tx.confirmations).to.equal(0n);
    });

    it("Should fail if not confirmed", async function () {
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);

      await expect(
        token.connect(signer1).revokeConfirmation(0)
      ).to.be.revertedWith("FortyTwoToken: transaction not confirmed");
    });
  });

  // ============ Signer Management Tests ============
  describe("Signer Management", function () {
    it("Should allow owner to add signer", async function () {
      await expect(token.addSigner(nonSigner.address))
        .to.emit(token, "SignerAdded")
        .withArgs(nonSigner.address);

      expect(await token.isSigner(nonSigner.address)).to.be.true;
      expect(await token.getSignerCount()).to.equal(4n);
    });

    it("Should not allow non-owner to add signer", async function () {
      await expect(
        token.connect(signer1).addSigner(nonSigner.address)
      ).to.be.revertedWith("FortyTwoToken: caller is not the owner");
    });

    it("Should allow owner to remove signer", async function () {
      await expect(token.removeSigner(signer3.address))
        .to.emit(token, "SignerRemoved")
        .withArgs(signer3.address);

      expect(await token.isSigner(signer3.address)).to.be.false;
      expect(await token.getSignerCount()).to.equal(2n);
    });

    it("Should not allow removing signer if it breaks multisig", async function () {
      await token.removeSigner(signer3.address);

      await expect(
        token.removeSigner(signer2.address)
      ).to.be.revertedWith("FortyTwoToken: cannot remove, would break multisig");
    });

    it("Should allow owner to change required signatures", async function () {
      await token.addSigner(nonSigner.address);

      await expect(token.setRequiredSignatures(3n))
        .to.emit(token, "RequiredSignaturesChanged")
        .withArgs(2n, 3n);

      expect(await token.requiredSignatures()).to.equal(3n);
    });
  });

  // ============ View Functions Tests ============
  describe("View Functions", function () {
    it("Should return all signers", async function () {
      const signerList = await token.getSigners();
      expect(signerList.length).to.equal(3);
      expect(signerList).to.include(signer1.address);
      expect(signerList).to.include(signer2.address);
      expect(signerList).to.include(signer3.address);
    });

    it("Should check if transaction is confirmed", async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.connect(signer1).proposeMint(signer1.address, mintAmount);

      expect(await token.isConfirmed(0)).to.be.false;

      await token.connect(signer1).confirmTransaction(0);
      await token.connect(signer2).confirmTransaction(0);

      expect(await token.isConfirmed(0)).to.be.true;
    });
  });
});
