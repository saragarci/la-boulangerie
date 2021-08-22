const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const infuraKey = process.env.INFURA_KEY // project id
const mnemonicPhrase = process.env.MNEMONIC

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase
          },
          providerOrUrl: `https://rinkeby.infura.io/v3/${infuraKey}`,
          numberOfAddresses: 1,
          shareNonce: true
        }),
      network_id: '4', // rinkeby's id
    }
  },
  compilers: {
    solc: {
      version: "0.8.6",
    }
  }
};
