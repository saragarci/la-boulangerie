import React from 'react';
import { withRouter } from "react-router-dom";

class AddAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newAccount: "",
      error: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (event) => {
    this.setState({newAccount: event.target.value});
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const { newAccount } = this.state
    const { add, account, web3, history } = this.props
    
    let invalidForm = false;
    if (!web3.utils.isAddress(newAccount)) {
      invalidForm = true;
      this.setState({ error: true });
    } else {
      this.setState({ error: false });
    }

    if (!invalidForm) {
      try {
        await add(newAccount).send({ from: account });
        history.push("/accountsubmitted");
      } catch(error) {
          this.setState({ error: true });
          console.log(error);
      }
    }
  }

  render() {
    const { sectionTitle } = this.props
    return (
      <div>
        <h2 className="Section-title">{sectionTitle}</h2>
        <form className="Form-items" onSubmit={this.handleSubmit}>
          <label className="Form-item">
            Ethereum Account
            <input
              type='text'
              name='image'
              placeholder="0x0000000000000000000000000000000000000000"
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

export default withRouter(AddAccount);
