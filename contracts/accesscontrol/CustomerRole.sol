// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import "./Roles.sol";

contract CustomerRole {
  using Roles for Roles.Role;

  event CustomerAdded(address indexed account);
  event CustomerRemoved(address indexed account);

  Roles.Role private customers;

  constructor() {
    _addCustomer(msg.sender);  
  }

  modifier onlyCustomer() {
    require(isCustomer(msg.sender));
    _;
  }

  function isCustomer(address account) public view returns (bool) {
    return customers.has(account);
  }

  function addCustomer(address account) public onlyCustomer {
    _addCustomer(account);
  }

  function renounceCustomer() public {
    _removeCustomer(msg.sender);
  }

  function _addCustomer(address account) internal {
    customers.add(account);
    emit CustomerAdded(account);
  }

  function _removeCustomer(address account) internal {
    customers.remove(account);
    emit CustomerRemoved(account);
  }
}
