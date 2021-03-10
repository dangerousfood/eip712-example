import env from '../env.json'
const Web3 = require("web3")

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

// method signs data universally (works with EOAs and EIP1271 wallets)
const signData = (web3, message) => {
    return web3.eth.getCoinbase().then( address => web3.eth.personal.sign(web3.utils.fromUtf8(message), address))
}

// frontEndUtils.isEthEnabled(window)
// frontEndUtils.signMasterContractApproval(window.web3, "asdassa", "asdasda", true, 6, "asdas", 1)
const signMasterContractApproval = (web3, user, masterContract, approved, nonce, masterContractManager, chainId) => {
    const DOMAIN_SEPARATOR_SIGNATURE_HASH = web3.utils.keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
    const APPROVAL_SIGNATURE_HASH = web3.utils.keccak256("SetMasterContractApproval(string warning,address user,address masterContract,bool approved,uint256 nonce)")

    const DOMAIN_SEPARATOR = web3.utils.keccak256(DOMAIN_SEPARATOR_SIGNATURE_HASH, BENTOBOXV2, chainId, masterContractManager);
    let approval = web3.utils.keccak256(
                APPROVAL_SIGNATURE_HASH,
                approved ? APPROVE : REVOKE,
                user,
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

    //then sign the digest
}

export default { isEthEnabled, signData, signMasterContractApproval }