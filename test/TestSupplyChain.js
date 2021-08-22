var SupplyChain = artifacts.require('SupplyChain')
const truffleAssert = require('truffle-assertions')

contract('SupplyChain', function(accounts) {   
    let supplyChain
    let err

    // Roles
    const owner = accounts[0]
    const company1 = accounts[1]
    const customer1 = accounts[2]
    const company2 = accounts[3]
    const customer2 = accounts[4]
   
    // Cake details
    let testCakes = []
    let cakeIDCount = 1
    const cakeName = "Red Velvet"
    const cakePrice = web3.utils.toWei(".01", "ether");
    const onSale = true
    const imageUrl = "http://redvelvet.html"
    
    // Order Details
    let testOrders = []
    let orderIDCount = 1

    it("Allows a customer to add customers and a company to add companies", async() => {
      supplyChain = await SupplyChain.deployed()
      
      // the owner is a company and a customer by default
      await supplyChain.addCompany(company1, {from: owner})
      await supplyChain.addCustomer(customer1, {from: owner})
      
      await supplyChain.addCompany(company2, {from: company1})
      await supplyChain.addCustomer(customer2, {from: customer1})
    })

    it("Prevents a customer from uploading a new cake using addAvailableCake()", async() => {
      try {
        await supplyChain.addAvailableCake(cakeName, cakePrice, onSale, imageUrl, {from: customer1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)
    })

    it("Prevents from looking up a cake that doesn't exist using fetchCake()", async() => {
      try {
        await supplyChain.fetchCake(1234)
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)
    })

    it("Allows a company to add a new cake using addAvailableCake() and retrieve it using fetchCake()", async() => {
      // add a cake
      const cakeID = cakeIDCount
      const tx = await supplyChain.addAvailableCake(cakeName, cakePrice, onSale, imageUrl, {from: company1})
      cakeIDCount = cakeIDCount + 1

      truffleAssert.eventEmitted(tx, 'NewAvailableCake', (ev) => {
        return ev.cakeID.toNumber() === cakeID
      });
      testCakes.push(cakeID)
      
      // fetch cake
      const cakeInfo = await supplyChain.fetchCake(cakeID)

      assert.equal(cakeInfo[0], cakeID, 'Error: Invalid cakeID')
      assert.equal(cakeInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(cakeInfo[2], company1, 'Error: Invalid companyID')
      assert.equal(cakeInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(cakeInfo[4], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(cakeInfo[5], onSale, 'Error: Invalid onSale')
      assert.equal(cakeInfo[6], imageUrl, 'Error: Invalid imageUrl')
    })

    it("Prevents from looking up an order that doesn't exist using fetchOrder()", async() => {
      try {
        await supplyChain.fetchOrder(1234)
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)
    })

    it("Prevents a customer from making an order when quantity is less than 1 using makeOrder()", async() => {
      // add cake
      const cakeID = cakeIDCount
      const cakeTx = await supplyChain.addAvailableCake(cakeName, cakePrice, onSale, imageUrl, {from: company1})
      cakeIDCount = cakeIDCount + 1
    
      truffleAssert.eventEmitted(cakeTx, 'NewAvailableCake', (ev) => {
        return ev.cakeID.toNumber() === cakeID
      });
      testCakes.push(cakeID)

      let quantity

      // make order with quantity of 0
      quantity = 0
      try {
        await supplyChain.makeOrder(cakeID, quantity, {from: customer1, value: cakePrice*quantity})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)
      
      // make order with quantity of -1
      quantity = -1
      try {
        await supplyChain.makeOrder(cakeID, quantity, {from: customer1, value: cakePrice*quantity})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)
    })

    it("Allows a customer to create an order of a cake using makeOrder() and retrieve it using fetchOrder()", async() => {
      // add cake
      const cakeID = cakeIDCount
      const cakeTx = await supplyChain.addAvailableCake(cakeName, cakePrice, onSale, imageUrl, {from: company1})
      cakeIDCount = cakeIDCount + 1
    
      truffleAssert.eventEmitted(cakeTx, 'NewAvailableCake', (ev) => {
        return ev.cakeID.toNumber() === cakeID
      });
      testCakes.push(cakeID)

      // make order
      const orderID = orderIDCount
      const quantity = 2
      const orderTx = await supplyChain.makeOrder(cakeID, quantity, {from: customer1, value: cakePrice*quantity})
      orderIDCount = orderIDCount + 1

      truffleAssert.eventEmitted(orderTx, 'OrderCreated', (ev) => {
        return ev.orderID.toNumber() === orderID
      });
      testOrders.push(orderID)
      
      // fetch order
      const orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "Created", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid')
    })

    it("Allows a company to change the status of an order from created to ongoing using startBakingCake()", async() => {
      // fetch an order with status created
      assert(testOrders.length > 0)
      assert(testCakes.length > 0)
      const orderID = testOrders[0]
      const cakeID = testCakes[testCakes.length-1]
      const quantity = 2
      let orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "Created", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid') 

      // prevents company from changing status to readyToPickup
      try {
        await supplyChain.prepareForPickup(orderID, {from: company1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents customer from changing status to delivered
      try {
        await supplyChain.pickupCake(orderID, {from: customer1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents customer from changing status to ongoing
      try {
        await supplyChain.startBakingCake(orderID, {from: customer1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents company not owning the order from changing status to ongoing
      try {
        await supplyChain.startBakingCake(orderID, {from: company2})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // change status to Ongoing
      const toOngoingOrderTx = await supplyChain.startBakingCake(orderID, {from: company1})

      truffleAssert.eventEmitted(toOngoingOrderTx, 'OrderOngoing', (ev) => {
        return ev.orderID.toNumber() === orderID
      });
      
      // fetch order
      orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "Ongoing", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid') 
    })    

    it("Allows a company to change the status of an order to readyForPickUp using prepareForPickup()", async() => {
      // fetch an order with status ongoing
      assert(testOrders.length > 0)
      assert(testCakes.length > 0)
      const orderID = testOrders[0]
      const cakeID = testCakes[testCakes.length-1]
      const quantity = 2
      let orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "Ongoing", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid') 

      // prevents company from changing status to ongoing
      try {
        await supplyChain.startBakingCake(orderID, {from: company1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents customer from changing status to delivered
      try {
        await supplyChain.pickupCake(orderID, {from: customer1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents customer from changing status to readyForPickup
      try {
        await supplyChain.prepareForPickup(orderID, {from: customer1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents company not owning the order from changing status to readyForPickup
      try {
        await supplyChain.prepareForPickup(orderID, {from: company2})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // change status to ReadyForPickup
      const toReadyForPickupOrderTx = await supplyChain.prepareForPickup(orderID, {from: company1})

      truffleAssert.eventEmitted(toReadyForPickupOrderTx, 'OrderReadyForPickup', (ev) => {
        return ev.orderID.toNumber() === orderID
      });
      
      // fetch order
      orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "ReadyForPickup", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid') 
    })

    it("Allows a customer to change the status of an order to delivered using pickupCake()", async() => {
      // fetch an order with status readyForPickUp
      assert(testOrders.length > 0)
      assert(testCakes.length > 0)
      const orderID = testOrders[0]
      const cakeID = testCakes[testCakes.length-1]
      const quantity = 2
      let orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "ReadyForPickup", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid') 

      // prevents company from changing status to ongoing
      try {
        await supplyChain.startBakingCake(orderID, {from: company1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents company from changing status to readyForPickup
      try {
        await supplyChain.prepareForPickup(orderID, {from: company1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents company from changing status to delivered
      try {
        await supplyChain.pickupCake(orderID, {from: company1})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // prevents customer not owning the order from changing status to delivered
      try {
        await supplyChain.pickupCake(orderID, {from: customer2})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      // change status to Delivered
      const toDeliveredOrderTx = await supplyChain.pickupCake(orderID, {from: customer1})

      truffleAssert.eventEmitted(toDeliveredOrderTx, 'OrderDelivered', (ev) => {
        return ev.orderID.toNumber() === orderID
      });
      
      // fetch order
      orderInfo = await supplyChain.fetchOrder(orderID)

      assert.equal(orderInfo[0], orderID, 'Error: Invalid orderID')
      assert.equal(orderInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(orderInfo[2], cakeID, 'Error: Invalid cakeID')
      assert.equal(orderInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(orderInfo[4], quantity, 'Error: Invalid quantity')
      assert.equal(orderInfo[5], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(orderInfo[6], cakePrice*quantity, 'Error: Invalid totalPrice')
      assert.equal(orderInfo[7], "Delivered", 'Error: Invalid orderState')
      assert.equal(orderInfo[8], company1, 'Error: Invalid companyID')   
      assert.equal(orderInfo[9], customer1, 'Error: Invalid customerID')
      assert(orderInfo[10], 'Error: Invalid paid')     
    })

    it("Allows getting all cake ids using fetchAllCakeIDs()", async() => {
      const cakeIDs = await supplyChain.fetchAllCakeIDs()
      const ids = cakeIDs.map(id => id.toNumber())
      assert.deepEqual(ids, testCakes, 'Error: Invalid cakeIDs')
    })

    it("Allows a company to toggle OnSale property of an already created cake using toggleCakeOnSale()", async() => {
      let _onSale = true;
      
      // fetch cake
      assert(testCakes.length > 0)
      const cakeID = testCakes[testCakes.length-1]
      let cakeInfo = await supplyChain.fetchCake(cakeID)

      assert.equal(cakeInfo[0], cakeID, 'Error: Invalid cakeID')
      assert.equal(cakeInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(cakeInfo[2], company1, 'Error: Invalid companyID')
      assert.equal(cakeInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(cakeInfo[4], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(cakeInfo[5], _onSale, 'Error: Invalid onSale')
      assert.equal(cakeInfo[6], imageUrl, 'Error: Invalid imageUrl')
    
      // only the company that added the cake can modify it
      try {
        await supplyChain.toggleCakeOnSale(cakeID, false, {from: company2})
      } catch (error) {
        err = error
      }
      assert.ok(err instanceof Error)

      _onSale = false;
      // owner company can modify existing cake
      await supplyChain.toggleCakeOnSale(cakeID, false, {from: company1})
      cakeInfo = await supplyChain.fetchCake(cakeID)

      assert.equal(cakeInfo[0], cakeID, 'Error: Invalid cakeID')
      assert.equal(cakeInfo[1], owner, 'Error: Invalid ownerID')
      assert.equal(cakeInfo[2], company1, 'Error: Invalid companyID')
      assert.equal(cakeInfo[3], cakeName, 'Error: Invalid cakeName')
      assert.equal(cakeInfo[4], cakePrice, 'Error: Invalid cakePrice')
      assert.equal(cakeInfo[5], _onSale, 'Error: Invalid onSale')
      assert.equal(cakeInfo[6], imageUrl, 'Error: Invalid imageUrl')
    })
});
