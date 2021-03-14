import env from '../env.json'
const Web3 = require("web3")
const Contract = require('web3-eth-contract');
var BN = Web3.utils.BN;
const ethers = require('ethers');
import bentoBoxV1 from './abi/bentoBoxV1.json'

const EIP191_PREFIX_FOR_EIP712_STRUCTURED_DATA = "\x19\x01"

const APPROVE = "Give FULL access to funds in (and approved to) BentoBox?"
const REVOKE = "Revoke access to BentoBox?"

const BENTOBOXV2 = "BentoBox V2"
// method used to detect an instance of a wallet
// method makes a request to enable the wallet and attaches a web3 instance to the window
const isEthEnabled = (window) => {
    if (window.ethereum) { 
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
        return true;
    }
    return false;
}

// Ropsten procedure
// frontEndUtils.isEthEnabled(window)
// frontEndUtils.setMasterContractApproval(window.web3, "0x1Ec0eECed89D8c4840cBC0Dd554F83A5Da6a1a2B", true, 0, "0xB5891167796722331b7ea7824F036b3Bdcb4531C", 3)
const setMasterContractApproval = async (web3, masterContract, approved, nonce, masterContractManager, chainId) => {
    let account = await web3.eth.getAccounts().then( addresses => addresses[0] )
    let masterContractManagerInstance = new web3.eth.Contract( bentoBoxV1, masterContractManager )

    //bytes32 DOMAIN_SEPARATOR_SIGNATURE_HASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    const EIP712Domain = [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ]

    const domain = {
        name: BENTOBOXV2,
        chainId: chainId,
        verifyingContract: masterContractManager
    };
    
    //bytes32 APPROVAL_SIGNATURE_HASH = keccak256("SetMasterContractApproval(string warning,address user,address masterContract,bool approved,uint256 nonce)");
    const SetMasterContractApproval = [
        { name: "warning", type: "string" },
        { name: "user", type: "address" },
        { name: "masterContract", type: "address" },
        { name: "approved", type: "bool" },
        { name: "uint256", type: "nonce" },
    ]

    let warning = approved ? APPROVE : REVOKE
    
    nonce = new BN(nonce)
    const message = {
        warning: warning,
        user: account,
        masterContract: masterContract,
        approved: approved,
        nonce: nonce
    };

    const data = JSON.stringify({
        types: {
            EIP712Domain,
            SetMasterContractApproval,
        },
        domain,
        primaryType: "SetMasterContractApproval",
        message
    });
    
    console.log(data)

    return web3.currentProvider
    .send('eth_signTypedData_v4', [account, data])
    .then((result) => {
        const signature = result.result.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);    // The signature is now comprised of r, s, and v.

        console.log("details", account, masterContract, approved, v, r, s)
        return { r: r, s: s, v: v }
    })
    .then(signature => {
        console.log(signature)
        masterContractManagerInstance.methods.setMasterContractApproval(account, masterContract, approved, signature.v, signature.r, signature.s).send({from: account})
    })
}

export default { isEthEnabled,  setMasterContractApproval }