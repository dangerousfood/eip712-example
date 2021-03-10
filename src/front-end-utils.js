import env from '../env.json'
const Web3 = require("web3")

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


export default { isEthEnabled, signData }