import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderID: null,
      cakeName: null,
      price: null,
      status: null,
      shouldShowButton: false
    };

    this.shouldShowCompleteStep = this.shouldShowCompleteStep.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount = async () => {
    try {
      const { orderID, getDetails, account } = this.props
      const orderDetails = await getDetails(orderID).call({ from: account });
      this.setState({
        orderID: orderDetails[0],
        cakeName: orderDetails[3],
        price: orderDetails[6],
        status: orderDetails[7],
        orderCompany: orderDetails[8],
        orderCustomer: orderDetails[9]
      });
      this.shouldShowCompleteStep();
    } catch(error) {
      console.log(error);
    }
  }

  shouldShowCompleteStep = async () => {
    const { isCompanyTargeted, account, isCompany, isCustomer } = this.props
    const { status, orderCompany, orderCustomer } = this.state

    if (isCompanyTargeted && (status === "Created" || status === "Ongoing")) {
      if (isCompany && account === orderCompany)
        this.setState({ shouldShowButton: true });
    }
    
    else if (!isCompanyTargeted && status === "ReadyForPickup") {
      if (isCustomer && account === orderCustomer)
        this.setState({ shouldShowButton: true });
    }
  }

  handleClick = async () => {
    const { account, startBakingCake, prepareForPickup, pickupCake, history } = this.props
    const { orderID, status } = this.state
    try {
      if (status === "Created")
        await startBakingCake(orderID).send({ from: account })
      
      else if (status === "Ongoing")
        await prepareForPickup(orderID).send({ from: account })
      
      else if (status === "ReadyForPickup")
        await pickupCake(orderID).send({ from: account })

      history.push("/stepcompleted");
    } catch(error) {
      alert("Error processing order. Try again later.");
      console.log(`Error while completing step: ${error}`);
    }
  }

  render() {
    const { orderID, cakeName, price, status, shouldShowButton } = this.state
    const displayPrice = parseFloat(price).toLocaleString('us-US', { style: 'currency', currency: 'Wei' });
    return (
      <div className="Order">
        <p className="Order-id">Order-{orderID}</p>
        <p className="Order-cakeName">{cakeName}</p>
        <p className="Order-price">{displayPrice}</p>
        <p className="Order-status">Status: {status}</p>
        { shouldShowButton && 
          <button
            className="Order-complete-step-button"
            onClick={this.handleClick}>
            Complete step
          </button>
        }
      </div>
    );
  }
}

export default withRouter(Order);
