import React from 'react';
import { withRouter } from "react-router-dom";

class AddCake extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      price: 0,
      image: "",
      error: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    this.setState({[name]: val});
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const { addCake, account, history } = this.props
    const { name, price, image } = this.state
    
    let invalidForm = false;
    if (name.length === 0 || price <= 0 || image.length === 0 ) {
      invalidForm = true;
      this.setState({ error: true });
    } else {
      this.setState({ error: false });
    }

    if (!invalidForm) {
      try {
        await addCake(name, price, true, image).send({ from: account });
        history.push("/cakesubmitted");
      } catch(error) {
          this.setState({ error: true });
          console.log(error);
      }
    }
  }

  render() {
    return (
      <div>
        <h2 className="Section-title">Add new cake</h2>
        <form className="Form-items" onSubmit={this.handleSubmit}>
          <label className="Form-item">
            Name
            <input
              type='text'
              name='name'
              placeholder="Cake name"
              onChange={this.handleChange}
            />
          </label>
          <label className="Form-item">
            Price (Wei)
            <input
              type='text'
              name='price'
              data-type="currency"
              placeholder="1000000"
              onChange={this.handleChange}
            />
          </label>
          <label className="Form-item">
            Image link
            <input
              type='text'
              name='image'
              placeholder="https://cakeurl.com/cake.jpg"
              onChange={this.handleChange}
            />
          </label>
          {this.state.error &&
            <p className="Form-item-error">Missing or invalid fields.</p>
          }
          <input className="Form-item-submit" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default withRouter(AddCake);
