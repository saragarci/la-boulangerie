import React, { Component } from 'react';

class Cake extends Component {
  constructor(props) {
    super(props);
    this.state = {
        name: null,
        price: null,
        image: null
    };
  }

  componentDidMount = async () => {
    try {
      const { cakeID, getDetails, account } = this.props
      const cakeDetails = await getDetails(cakeID).call({ from: account });
      this.setState({
          name: cakeDetails[3],
          price: cakeDetails[4],
          image: cakeDetails[6]
      });
    } catch(error) {
      console.log(error);
    }
  }

  render() {
      const price = parseFloat(this.state.price).toLocaleString('us-US', { style: 'currency', currency: 'Wei' });
      return (
        <div className="Cake">
          <img className="Cake-image" src={this.state.image} alt={this.state.name}/>
          <p className="Cake-name">{this.state.name}</p>
          <p className="Cake-price">{price}</p>
        </div>
      );
  }
}

export default Cake;
