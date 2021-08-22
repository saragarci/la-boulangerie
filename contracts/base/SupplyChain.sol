// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import "../core/Ownable.sol";
import "../accesscontrol/CompanyRole.sol";
import "../accesscontrol/CustomerRole.sol";

contract SupplyChain is Ownable, CompanyRole, CustomerRole {

	uint cakeIDCount;
	
  uint [] cakeIDs;
  mapping (uint => Cake) availableCakes;
  mapping (address => uint []) companyCakes;
  mapping (address => uint []) companyAssignedOrders;
  
  struct Cake {
    uint    cakeID;
    address ownerID;
	  address companyID;
    string  cakeName;
		uint		cakePrice;
		bool		onSale;
    string  imageUrl;
  }

  event NewAvailableCake(uint cakeID);

  uint orderIDCount;
  
  mapping (uint => Order) orders;
  mapping (address => uint []) customerOrders;

  enum State { 
    Created,
    Ongoing,
    ReadyForPickup,
    Delivered
	}

  State constant defaultState = State.Created;

  struct Order {
    uint    orderID;
    address ownerID;
    uint    cakeID;
	  string  cakeName;
    uint    quantity;
    uint    cakePrice;
    uint    totalPrice;
    State   orderState;
    address companyID;
    address customerID;
		bool paid;
  }

  event OrderCreated(uint orderID);
  event OrderOngoing(uint orderID);
  event OrderReadyForPickup(uint orderID);
  event OrderDelivered(uint orderID);

  modifier verifyCaller(address _address) {
    require(msg.sender == _address); 
    _;
  }

  modifier paidEnough(uint _price) { 
    require(msg.value >= _price, "Account does not have enough Ether"); 
    _;
  }
  
  modifier checkValue(uint _price, address _consumerID) {
    _;
    uint amountToReturn = msg.value - _price;
    address payable consumerAddressPayable = _make_payable(_consumerID);
    consumerAddressPayable.transfer(amountToReturn);
  }

  modifier cakeAvailable(uint _cakeID) {
		require(availableCakes[_cakeID].cakeID == _cakeID);
    _;
  }

  modifier orderExists(uint _orderID) {
		require(orders[_orderID].orderID == _orderID);
    _;
  }

  modifier created(uint _orderID) {
    require(orders[_orderID].orderState == State.Created);
    _;
  }

  modifier ongoing(uint _orderID) {
		require(orders[_orderID].orderState == State.Ongoing);
    _;
  }

  modifier readyForPickup(uint _orderID) {
		require(orders[_orderID].orderState == State.ReadyForPickup);
    _;
  }

  modifier delivered(uint _orderID) {
		require(orders[_orderID].orderState == State.Delivered);
    _;
  }

  modifier minQuantity(uint _quantity) {
		require(_quantity >= 1);
    _;
  }

  constructor() payable {
    orderIDCount = 1;
		cakeIDCount = 1;
  }

  function _make_payable(address x) internal pure returns (address payable) {
      return payable(x);
  }

  function kill() public onlyOwner {
    address payable ownerAddressPayable = _make_payable(owner());
    selfdestruct(ownerAddressPayable);
  }

  function addAvailableCake(string memory _cakeName, uint _cakePrice,
    bool _onSale, string memory _imageUrl) public onlyCompany
  {
		uint _cakeID = cakeIDCount;
		availableCakes[_cakeID] = Cake({
      cakeID: _cakeID,
    	ownerID: owner(),
		  companyID: msg.sender,
    	cakeName: _cakeName,
			cakePrice: _cakePrice,
			onSale: _onSale,
      imageUrl: _imageUrl
		});
    companyCakes[msg.sender].push(_cakeID);
    cakeIDs.push(_cakeID);

    cakeIDCount = cakeIDCount + 1;
    emit NewAvailableCake(_cakeID);
  }

  function toggleCakeOnSale(uint _cakeID, bool _onSale) public
  cakeAvailable(_cakeID)
  verifyCaller(availableCakes[_cakeID].companyID)
  {
    availableCakes[_cakeID].onSale = _onSale;
  }

  function makeOrder(uint _cakeID, uint _quantity) public payable
	onlyCustomer
  minQuantity(_quantity)
	cakeAvailable(_cakeID)
	paidEnough(availableCakes[_cakeID].cakePrice*_quantity)
	checkValue(availableCakes[_cakeID].cakePrice*_quantity, msg.sender)
  {
		uint _orderID = orderIDCount;
		orders[_orderID] = Order({
	    orderID: _orderID,
			ownerID: owner(),
			cakeID: _cakeID,
			cakeName: availableCakes[_cakeID].cakeName,
      quantity: _quantity,
			cakePrice: availableCakes[_cakeID].cakePrice,
      totalPrice: availableCakes[_cakeID].cakePrice*_quantity,
			orderState: defaultState,
			companyID: availableCakes[_cakeID].companyID,
			customerID: msg.sender,
			paid: true
		});

    address payable companyAddressPayable = _make_payable(availableCakes[_cakeID].companyID);
    companyAddressPayable.transfer(orders[_orderID].cakePrice);

    customerOrders[msg.sender].push(_orderID);
    companyAssignedOrders[availableCakes[_cakeID].companyID].push(_orderID);

    orderIDCount = orderIDCount + 1;
    emit OrderCreated(_orderID);
  }

  function startBakingCake(uint _orderID) public
	orderExists(_orderID)
  onlyCompany
  created(_orderID)
  verifyCaller(orders[_orderID].companyID)
  {
		orders[_orderID].orderState = State.Ongoing;
    emit OrderOngoing(_orderID);
  }

  function prepareForPickup(uint _orderID) public
	orderExists(_orderID)
	onlyCompany
  ongoing(_orderID)
  verifyCaller(orders[_orderID].companyID)
  {
		orders[_orderID].orderState = State.ReadyForPickup;
    emit OrderReadyForPickup(_orderID); 
  }

  function pickupCake(uint _orderID) public
	orderExists(_orderID)
	onlyCustomer
  readyForPickup(_orderID)
  verifyCaller(orders[_orderID].customerID)
  {
		orders[_orderID].orderState = State.Delivered;
    emit OrderDelivered(_orderID);
  }

  function fetchCake(uint _cakeID) public view cakeAvailable(_cakeID) returns (
    uint cakeID,
    address ownerID,
	  address companyID,
    string memory cakeName,
		uint cakePrice,
		bool onSale,
    string memory imageUrl
  )
  {
    cakeID = availableCakes[_cakeID].cakeID;
		ownerID =	availableCakes[_cakeID].ownerID;
		companyID =	availableCakes[_cakeID].companyID;
		cakeName = availableCakes[_cakeID].cakeName;
		cakePrice = availableCakes[_cakeID].cakePrice;
		onSale = availableCakes[_cakeID].onSale;
    imageUrl = availableCakes[_cakeID].imageUrl;

    return (
    	cakeID,
			ownerID,
			companyID,
			cakeName,
			cakePrice,
			onSale,
      imageUrl
		);
  }

  function fetchAllCakeIDs() public view returns (uint [] memory)
  {
    return cakeIDs;
  }

  function fetchCompanyCakes() public view onlyCompany returns (uint [] memory)
  {
    return companyCakes[msg.sender];
  }

  function orderStateToString(State _orderState) internal pure returns (
    string memory)
  { 
    if (_orderState == State.Created) return "Created";
    if (_orderState == State.Ongoing) return "Ongoing";
    if (_orderState == State.ReadyForPickup) return "ReadyForPickup";
    if (_orderState == State.Delivered) return "Delivered";

    return "Invalid Status";
  }

  function fetchOrder(uint _orderID) public view orderExists(_orderID) returns (
    uint orderID,
    address ownerID,
    uint cakeID,
    string memory cakeName,
    uint quantity,
    uint cakePrice,
    uint totalPrice,
    string memory orderState,
    address companyID,
    address customerID,
		bool paid
  )
  {
    orderID =	orders[_orderID].orderID;
		ownerID =	orders[_orderID].ownerID;
		cakeID = orders[_orderID].cakeID;
		cakeName = orders[_orderID].cakeName;
    quantity = orders[_orderID].quantity;
		cakePrice = orders[_orderID].cakePrice;
		totalPrice = orders[_orderID].totalPrice;
		orderState = orderStateToString(orders[_orderID].orderState);
		companyID = orders[_orderID].companyID;
		customerID = orders[_orderID].customerID;
		paid = orders[_orderID].paid;
    
		return (
      orderID,
      ownerID,
      cakeID,
      cakeName,
      quantity,
      cakePrice,
      totalPrice,
      orderState,
      companyID,
      customerID,
      paid
		);
  }

  function fetchCustomerOrders() public view onlyCustomer returns (uint [] memory)
  {
    return customerOrders[msg.sender];
  }

  function fetchCompanyAssignedOrders() public view onlyCompany returns (uint [] memory)
  {
    return companyAssignedOrders[msg.sender];
  }
}
