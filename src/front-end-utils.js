import env from '../env.json'
const Web3 = require("web3")
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

const signMasterContractApproval = (web3, account, masterContract, approved, nonce, masterContractManager, chainId) => {
    const DOMAIN_SEPARATOR_SIGNATURE_HASH = web3.utils.keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
    const APPROVAL_SIGNATURE_HASH = web3.utils.keccak256("SetMasterContractApproval(string warning,address user,address masterContract,bool approved,uint256 nonce)")

    const DOMAIN_SEPARATOR = web3.utils.keccak256(DOMAIN_SEPARATOR_SIGNATURE_HASH, BENTOBOXV2, chainId, masterContractManager);
    let approval = web3.utils.keccak256(
                APPROVAL_SIGNATURE_HASH,
                approved ? APPROVE : REVOKE,
                account,
                masterContract,
                approved,
                nonce
    )

    console.log(approval)

    let digest = web3.utils.keccak256(
        EIP191_PREFIX_FOR_EIP712_STRUCTURED_DATA,
        DOMAIN_SEPARATOR,
        approval
    )

    console.log(digest)

    return web3.eth.personal.sign(web3.utils.fromUtf8(digest), account)
}

const parseSignature = (signature) => {
    let web3 = new Web3()
    let r = web3.utils.hexToBytes(signature.substr(0, 66))
    let s = web3.utils.hexToBytes('0x' + signature.substr(66, 64))
    let v = web3.utils.hexToNumber('0x' + signature.substr(130, 2))

    return { r: r, s: s, v: v }
}

// Ropsten procedure
// frontEndUtils.isEthEnabled(window)
// frontEndUtils.setMasterContractApproval(window.web3, "0x1Ec0eECed89D8c4840cBC0Dd554F83A5Da6a1a2B", true, 6, "0xB5891167796722331b7ea7824F036b3Bdcb4531C", 3)
const setMasterContractApproval = async (web3, masterContract, approved, nonce, masterContractManager, chainId) => {
    let account = await web3.eth.getAccounts().then( addresses => addresses[0] )
    let masterContractManagerInstance = new ethers.Contract( masterContractManager , bentoBoxV1 )
    let signature = await signMasterContractApproval(web3, account, masterContract, approved, nonce, masterContractManager, chainId)
    
    let sig = parseSignature(signature)
    
    return masterContractManagerInstance.setMasterContractApproval(account, masterContract, approved, nonce, sig.v, sig.r, sig.s)
}

export default { isEthEnabled, signMasterContractApproval,  setMasterContractApproval }