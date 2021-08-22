const CompanyRole = artifacts.require("CompanyRole");
const CustomerRole = artifacts.require("CustomerRole");
const SupplyChain = artifacts.require("SupplyChain");

module.exports = function(deployer) {
  deployer.deploy(CompanyRole);
  deployer.deploy(CustomerRole);
  deployer.deploy(SupplyChain);
};
