import React, { Component } from 'react';
import { Link } from "react-router-dom";

class SuccessSubmitting extends Component {
  render() {
    const { title, subtitle } = this.props
    return (
      <div className="Submitted">
        <p className="Submitted-item">{title}</p>
        <p className="Submitted-item">{subtitle}</p>
        <Link className="Submitted-item Back-home" to="/">Go back home</Link>
      </div>
    );
  }
}
  
export default SuccessSubmitting;
