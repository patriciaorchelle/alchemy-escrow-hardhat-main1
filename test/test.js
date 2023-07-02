const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Escrow', function () {
  let contract;
  let depositor;
  let beneficiary;
  let arbiter;
  const deposit = ethers.utils.parseEther('1');
  beforeEach(async () => {
    depositor = ethers.provider.getSigner(0);
   /* beneficiary = ethers.provider.getSigner(1);
    arbiter = ethers.provider.getSigner(2);*/
    beneficiary = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    arbiter = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const Escrow = await ethers.getContractFactory('Escrow');
    contract = await Escrow.deploy(
      /*arbiter.getAddress(),
      beneficiary.getAddress(),*/
      arbiter,
      beneficiary,
      {
        value: deposit,
      }
    );
    await contract.deployed();
  });

  it('should be funded initially', async function () {
    let balance = await ethers.provider.getBalance(contract.address);
    expect(balance).to.eq(deposit);
  });

  describe('after approval from address other than the arbiter', () => {
    it('should revert', async () => {
      await expect(contract.connect(beneficiary).approve()).to.be.reverted;
    });
  });

  describe('after approval from the arbiter', () => {
    it('should transfer balance to beneficiary', async () => {
      const before = await ethers.provider.getBalance(beneficiary.getAddress());
      const approveTxn = await contract.connect(arbiter).approve();
      await approveTxn.wait();
      const after = await ethers.provider.getBalance(beneficiary.getAddress());
      expect(after.sub(before)).to.eq(deposit);
    });
  });
});
