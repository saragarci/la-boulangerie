import React, { Component } from 'react';
import Cake from './Cake';
import { withRouter } from "react-router-dom";

class CreateOrder extends Component {
  handleClick = async (event, cakeId) => {
    event.preventDefault();
    const { createOrder, getCake, account, web3, history } = this.props
    try {
      const cakeDetails = await getCake(cakeId).call({ from: account });
      const cakePrice = cakeDetails[4];

      if (!web3.eth.getBalance(account) > cakePrice)
        throw new Error("Account doesn't have enough Ether.");

      await createOrder(parseInt(cakeId), parseInt(1)).send({ from: account, value: cakePrice });
      history.push("/ordersubmitted");
    } catch(error) {
      alert("Error processing order. Try again later.");
      console.log(`Error while creating order: ${error}`);
    }
  }
  
  render() {
    const { cakeIDs, getCake, account, isCustomer } = this.props
    return (
      <div>
        <h2 className="Section-title">Make order</h2>
        <div className="Create-order">
          <ul className="Cakes-list">
            {cakeIDs.length === 0 && 
                <p className="Cake-list-null">No available cakes.</p>
            }
            {cakeIDs.length > 0 && (
              cakeIDs.map((cake) => (
                <li key={cake}>
                  <Cake cakeID={cake} getDetails={getCake} account={account} />
                  { isCustomer && 
                    <button className="Order-cake-button" onClick={(event) => this.handleClick(event, cake)}>Order cake</button> }
                  { !isCustomer && (
                    <div className="Order-cake-button-disabled">Order cake
                      <span className="tooltip">You need to be a customer to order</span>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    );
  }
}
  
export default withRouter(CreateOrder);
