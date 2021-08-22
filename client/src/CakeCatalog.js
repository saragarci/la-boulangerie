import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Cake from './Cake';

class CakeCatalog extends Component {
  render() {
    const { companyCakes, getCake, account } = this.props
    return (
      <div>
        <h2 className="Section-title">Cake Catalog</h2>
        <div className="Cake-catalog">
          <ul className="Cakes-list">
            {companyCakes.length === 0 && 
              <p className="Cake-list-null">No available cakes. Add one to be able to sell it.</p>
            }
            {companyCakes.length > 0 && (
              companyCakes.map((cake) => (
                <li key={cake}>
                  <Cake cakeID={cake} getDetails={getCake} account={account}/>
                </li>
              ))
            )}
          </ul>
          <Link className="Add-cake" to="/newcake">Add new cake</Link>
        </div>
      </div>
    );
  }
}
  
export default CakeCatalog;
