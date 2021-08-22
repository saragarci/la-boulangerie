// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

library Roles {
  struct Role {
    mapping (address => bool) bearer;
  }

  function add(Role storage role, address account) internal
  {
    require(account != address(0));
    require(!has(role, account));

    role.bearer[account] = true;
  }

  function remove(Role storage role, address account) internal
  {
    require(account != address(0));
    require(has(role, account));

    role.bearer[account] = false;
  }

  function has(Role storage role, address account) internal view returns (bool)
  {
    require(account != address(0));
    return role.bearer[account];
  }
}
