import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Order from './Order';

class ShowOrders extends Component {
  render() {
    const { title, orders, isCompanyTargeted, getOrder, account, linkToCreateOrder, startBakingCake,
      prepareForPickup, pickupCake, isCompany, isCustomer } = this.props
    return (
      <div>
        <h2 className="Section-title">{title}</h2>
        <div className="Show-Orders">
          <ul className="Orders-list">
            {orders.length === 0 && 
              <p className="Orders-list-null">You currently don't have any orders.</p>
            }
            {orders.length > 0 && (
              orders.map((order) => (
                <li key={order}>
                  <Order
                    orderID={order}
                    getDetails={getOrder}
                    account={account}
                    startBakingCake={startBakingCake}
                    prepareForPickup={prepareForPickup}
                    pickupCake={pickupCake}
                    isCompany={isCompany}
                    isCustomer={isCustomer}
                    isCompanyTargeted={isCompanyTargeted}
                  />
                </li>
              ))
            )}
          </ul>
          { linkToCreateOrder && <Link className="Create-order" to="/makeorder">Create a new order</Link> }
        </div>
      </div>
    );
  }
}
  
export default ShowOrders;
