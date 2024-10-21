import { JsonRpcProvider, Contract, Wallet } from "ethers";
import { promises as fs } from 'fs';
import axios from "axios";
async function loadABI() {
    const data = await fs.readFile('./scripts/abi.json', 'utf-8');
    return JSON.parse(data);
}
async function loadTokenABI() {
    const data = await fs.readFile('./scripts/tokenABI.json', 'utf-8');
    return JSON.parse(data);
}
const contractABI = await loadABI();
const tokenABI = await loadTokenABI();
const tokenAddress = '0xDDf7d080C82b8048BAAe54e376a3406572429b4e';//underlying
const agentAddress = '0x0Ddd085536E2531c75C692C78F8Ad30b07Fe8E89';//brigeAgent
const provider = new JsonRpcProvider('https://endpoints.omniatech.io/v1/fantom/mainnet/public');
const signer = new Wallet(process.env.PRIVATE_KEY, provider);
const tokenContract = new Contract(tokenABI, tokenAddress, signer);
const agentContract = new Contract(contractABI, agentAddress, signer);

try {
    const tokenAmount = 250000 * 1e18;
    const approveTx = await tokenContract.approve(agentAddress, BigInt(tokenAmount));
    console.log("Approve Transaction sent! Hash:", approveTx.hash);
    await approveTx.wait();
    console.log("approve transaction success")
} catch (err) {
    console.log("approve failed: ", err);
}

try {
    const params = "0x01ffe1dfff1e01001e20000ba28C4D42269087d6Cd2812412Db711c10161204D001e40001e44a9059cbb000bb05cf01231cf2ff99499682e64d3780d57c80fdd0015d3c21bcecceda1001e";
    const dParams = {
        hToken: "0x26964c55c80B508402d1be5C54268bd6026E4194",//localAddress
        token: "0xDDf7d080C82b8048BAAe54e376a3406572429b4e",//underlying
        amount: ethers.BigNumber.from("250000000000000000000000"),
        deposit: ethers.BigNumber.from("250000000000000000000000")
    };
    const gParams = {
        gasLimit: ethers.BigNumber.from("500000"),
        remoteBranchExecutionGas: ethers.BigNumber.from("100000000000000")
    };
    const hasFallbackToggled = true;
    const depositTx = await agentContract.callOutSignedAndBridge(
        params, dParams, gParams, hasFallbackToggled
    );
    console.log("Deposit Transaction sent! Hash:", depositTx.hash);
    await depositTx.wait();
} catch (err) {
    console.log("deposit transaction failed: ", err);
}


