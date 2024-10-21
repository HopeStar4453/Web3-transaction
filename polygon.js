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
const agentAddress = '0xf8aae47a6A12552Bc714e47F8d98446d537634aA';//AgentAddress
const provider = new JsonRpcProvider('https://polygon-bor-rpc.publicnode.com/');
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
    const params = "0x01ffe1dfff1e01001e20000b0F58A1CBc73143DD71dFf9028615CC0438205677001e40001e44a9059cbb000bb05cf01231cf2ff99499682e64d3780d57c80fdd0015d3c21bcecceda1001e";
    const dParams = {
        hToken: "0x000be5Cf68aa3E2f0BfD6ACF53EfB06CB2E99941",//local Address
        token: "0xDDf7d080C82b8048BAAe54e376a3406572429b4e",//underlying Address
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


