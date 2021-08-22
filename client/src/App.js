import React, { Component } from "react";
import SupplyChainContract from "./contracts/SupplyChain.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import NoMatch from './NoMatch';
import CakeCatalog from './CakeCatalog';
import ShowOrders from './ShowOrders';
import CreateOrder from './CreateOrder';
import AddAccount from './AddAccount';
import AddCake from './AddCake';
import SuccessSubmitting from "./SuccessSubmitting";

class App extends Component {
  state = { 
    web3: null,
    accounts: null,
    contract: null,
    isCompany: false,
    isCustomer: false,
    companyCakeIds: null,
    companyOrderIds: null,
    customerOrderIds: null,
    cakeIds: null
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
  
      const company = await instance.methods.isCompany(accounts[0]).call({ from: accounts[0] });
      const customer = await instance.methods.isCustomer(accounts[0]).call({ from: accounts[0] });
      let companyCakes = [];
      let companyOrders = [];
      let customerOrders = [];
  
      if (company) {
        companyCakes = await instance.methods.fetchCompanyCakes().call({ from: accounts[0] });
        companyOrders = await instance.methods.fetchCompanyAssignedOrders().call({ from: accounts[0] });
      }
  
      if (customer) {
        customerOrders = await instance.methods.fetchCustomerOrders().call({ from: accounts[0] });
      }

      let cakes = await instance.methods.fetchAllCakeIDs().call({ from: accounts[0] });

      this.setState({
        web3,
        accounts,
        contract: instance,
        isCompany: company,
        isCustomer: customer,
        companyCakeIds: companyCakes,
        companyOrderIds: companyOrders,
        customerOrderIds: customerOrders,
        cakeIds: cakes
      });
    } catch (error) {
      console.error(`Failed to load web3, accounts, or contract: ${error}`);
    }
  };

  render() {
    if (!this.state.web3) {
      return (<p>Loading...</p>)
    }
    const { accounts, contract, isCompany, isCustomer, companyCakeIds,
      companyOrderIds, customerOrderIds, cakeIds, web3 } = this.state
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Link className="App-title" to="/">La Boulangerie</Link>
          </header>
          <div className="App-body">
            <Switch>
              <Route exact path="/" render={() => (
                  <div className="App-home">
                    { isCustomer && <Link className="App-home-item" to="/makeorder">Make order</Link> }
                    { isCompany && <Link className="App-home-item" to="/receivedorders">Received orders</Link> }
                    { isCustomer && <Link className="App-home-item" to="/placedorders">Placed orders</Link> }
                    { isCompany && <Link className="App-home-item" to="/cakecatalog">Cake catalog</Link> }
                    { isCompany && <Link className="App-home-item" to="/addcompany">Add company</Link> }
                    { isCustomer && <Link className="App-home-item" to="/addcustomer">Add customer</Link> }
                    { !isCustomer && !isCompany && (
                      <CreateOrder cakeIDs={cakeIds} getCake={contract.methods.fetchCake} account={accounts[0]} isCustomer={isCustomer} />
                    )}
                  </div>
                )}
              />
              <Route path="/newcake" render={() => (
                  <AddCake addCake={contract.methods.addAvailableCake} account={accounts[0]} />
                )}
              />
              <Route path="/cakesubmitted" render={() => (
                  <SuccessSubmitting
                    title="Cake successfully added!"
                    subtitle="It can take some time until you are able to see it available."
                  />
                )}
              />
              <Route path="/ordersubmitted" render={() => (
                  <SuccessSubmitting
                    title="Your order has been created!"
                    subtitle="It can take some time until it is displayed in Placed orders."
                  />
                )}
              />
              <Route path="/accountsubmitted" render={() => (
                  <SuccessSubmitting
                    title="Account successfully added!"
                    subtitle="It can take some time until the account gets access."
                  />
                )}
              />
              <Route path="/stepcompleted" render={() => (
                  <SuccessSubmitting
                    title="Step successfully marked as completed!"
                    subtitle="It can take some time until the status gets updated."
                  />
                )}
              />
              <Route path="/receivedorders" render={() => (
                  <ShowOrders
                    title="Received Orders"
                    orders={companyOrderIds}
                    isCompanyTargeted={true}
                    getOrder={contract.methods.fetchOrder}
                    account={accounts[0]}
                    linkToCreateOrder={false}
                    startBakingCake={contract.methods.startBakingCake}
                    prepareForPickup={contract.methods.prepareForPickup}
                    pickupCake={contract.methods.pickupCake}
                    isCompany={isCompany}
                    isCustomer={isCustomer}
                  />
                )}
              />
              <Route path="/cakecatalog" render={() => (
                  <CakeCatalog companyCakes={companyCakeIds} getCake={contract.methods.fetchCake} account={accounts[0]} />
                )}
              />
              <Route path="/addcompany" render={() => (
                  <AddAccount add={contract.methods.addCompany} account={accounts[0]} web3={web3} sectionTitle="Add company" />
                )}
              />
              <Route path="/makeorder" render={() => (
                  <CreateOrder
                    cakeIDs={cakeIds}
                    getCake={contract.methods.fetchCake}
                    createOrder={contract.methods.makeOrder}
                    account={accounts[0]}
                    isCustomer={isCustomer}
                    web3={web3}
                  />
                )}
              />
              <Route path="/placedorders" render={() => (
                  <ShowOrders
                    title="Placed Orders"
                    orders={customerOrderIds}
                    isCompanyTargeted={false}
                    getOrder={contract.methods.fetchOrder}
                    account={accounts[0]}
                    linkToCreateOrder={true}
                    startBakingCake={contract.methods.startBakingCake}
                    prepareForPickup={contract.methods.prepareForPickup}
                    pickupCake={contract.methods.pickupCake}
                    isCompany={isCompany}
                    isCustomer={isCustomer}
                  />
                )}
              />
              <Route path="/addcustomer" render={() => (
                  <AddAccount add={contract.methods.addCustomer} account={accounts[0]} web3={web3} sectionTitle="Add customer" />
                )}
              />
              <Route component={NoMatch} />
            </Switch>
          </div>
          <footer className="App-footer">
            <p>© Copyright 2021 by Sara Garci.<br/>All rights reserved.</p>
          </footer>
        </div>
      </Router>
    );
  }
}

export default App;
