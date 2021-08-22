// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import "./Roles.sol";

contract CompanyRole {
  using Roles for Roles.Role;

  event CompanyAdded(address indexed account);
  event CompanyRemoved(address indexed account);

  Roles.Role private company;

  constructor() {
    _addCompany(msg.sender);  
  }

  modifier onlyCompany() {
    require(isCompany(msg.sender));
    _;
  }

  function isCompany(address account) public view returns (bool) {
    return company.has(account);
  }

  function addCompany(address account) public onlyCompany {
    _addCompany(account);
  }

  function renounceCompany() public {
    _removeCompany(msg.sender);
  }

  function _addCompany(address account) internal {
    company.add(account);
    emit CompanyAdded(account);
  }

  function _removeCompany(address account) internal {
    company.remove(account);
    emit CompanyRemoved(account);
  }
}
