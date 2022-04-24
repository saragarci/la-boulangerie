# La Boulangerie

This application implements an Ethereumm DApp supply chain that replicates a marketplace functionality, where companies and customers are allowed to sell and buy respectively. In particular, La Boulangerie targets selling and buying cakes, and gives the user the possibility to follow up on the order status (`created`, `ongoing`, `readyForPickup` and `delivered`). The smart contract is implemented in Solidity.
The client side is build using the React framework and gives companies and sellers access to all the [existing functionality](#application-functionality).

The smart contract has been deployed into the Rinkeby Test Network and can be used at https://laboulangerie.saragarci.com/.

Truffle, Infura and MetaMask were used for the deployment.

## Usage

### Dependencies

* node v14.17.0
* npm 6.14.13
* Truffle v5.3.9
* Ganache CLI v6.12.2

### Installation

First, `cd` into the project and install all the npm dependencies:
```
npm install
```
The same needs to be done for the client. `cd` into `client` and install all the npm dependencies.

### Development of smart contracts

```
truffle develop
```

1. Compile and migrate smart contracts
```
compile
migrate
```

2. Run tests
```
test
```

### Development of react app

First, any smart contract changes must be manually recompiled and migrated.
Then, run the react app:
```
// in another terminal (i.e. not in the truffle develop prompt)
cd client
npm run start
```

## Application functionality

* **addCompany** and **addCompany**: Allows an already existing customer to add new customers to the platform and an already existing company to add more companies.
* **addAvailableCake**: Allows an existing company to add a new cake to be able to put it for sale.
* **makeOrder**: This function allows a customer to make a cake order.
* **startBakingCake**: Allows a company to change the status of an order from `created` to `ongoing`.
* **prepareForPickup**: Allows a company to change the status of an order from `ongoing` to `readyForPickUp`.
* **pickupCake**: Allows a customer to change the status of an order from `readyForPickup` to `delivered`.

## Credits

### Used resources

* [React Truffle Box](https://trufflesuite.com/boxes/react/)
* [Solidity](https://docs.soliditylang.org/en/latest/)
* [web3.js - Ethereum JavaScript API](https://web3js.readthedocs.io/en/v1.7.3/)

### Contributors

* [Sara Garci](s@saragarci.com)

## License

© Copyright 2021 by Sara Garci. All rights reserved.
