import { ethers } from 'ethers';

const NETWORKS = {
  "44787": {
    name: "Celo Alfajores",
    USDC: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
  },
  "11142220": {
    name: "Celo Sepolia",
    USDC: "0x01C5C0122039549AD1493B8220cABEdD739BC44E"
  }
};

const GATEWAY_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_ADDRESS || "0xC6C60617763cE420c4F56b3aA1F3A8023EdDE554";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

const GATEWAY_ABI = [
  "function payForAudit(string calldata contractHash) external returns (uint256 paymentId)",
  "function auditFee() public view returns (uint256)",
  "event AuditPaid(uint256 indexed paymentId, address indexed payer, uint256 amount, string contractHash)"
];

export const getWeb3 = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();
    const USDC_ADDRESS = NETWORKS[chainId]?.USDC || process.env.NEXT_PUBLIC_CUSD_TOKEN_ADDRESS || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

    console.log("Connected to Network:", network.name, "ChainId:", chainId);
    console.log("USDC_ADDRESS:", USDC_ADDRESS);
    console.log("GATEWAY_ADDRESS:", GATEWAY_ADDRESS);
    
    const signer = await provider.getSigner();
    return { provider, signer, address: await signer.getAddress() };
  }
  return null;
};

export const payForAudit = async (contractHash) => {
  const { signer, provider } = await getWeb3();
  if (!signer) throw new Error("Wallet not connected");

  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();
  const USDC_ADDRESS = NETWORKS[chainId]?.USDC || process.env.NEXT_PUBLIC_CUSD_TOKEN_ADDRESS || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  const gateway = new ethers.Contract(GATEWAY_ADDRESS, GATEWAY_ABI, signer);
  const fee = await gateway.auditFee();

  const USDC = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  const allowance = await USDC.allowance(await signer.getAddress(), GATEWAY_ADDRESS);

  if (allowance < fee) {
    const tx = await USDC.approve(GATEWAY_ADDRESS, ethers.MaxUint256);
    await tx.wait();
  }

  const payTx = await gateway.payForAudit(contractHash);
  const receipt = await payTx.wait();

  // Extract paymentId from event using correct interface parsing
  const log = receipt.logs
    .map((l) => {
      try { return gateway.interface.parseLog(l); } 
      catch (e) { return null; }
    })
    .find((x) => x && x.name === "AuditPaid");

  if (!log) throw new Error("Payment event not found in logs");
  return log.args[0].toString();
};
