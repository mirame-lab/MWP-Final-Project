// import firestore configuration from config.js
var config = require('./config'); 

var stdin = require('readline-sync');

// get firestore db instance from config.js
var db = config.dbfs; 
var batch = db.batch();

var customers = {}; // JSON data to store customer info
var menus = {}; // JSON data to store menu info

console.log("Check customers' orders\n");

db.collection('customers').orderBy('name', 'asc').get().then(
    function (docs) {
        listSetCustomers(docs);
    }
);

function listSetCustomers(docs) {
    docs.forEach(
        function (cust) {
            var data = cust.data();
            console.log(`${cust.id} - ${data.name}`);
            customers[cust.id] = { 'name': data.name, 'address': data.address, 'area': data.area };
        }
    );
    // Retrieve menus and call setMenus function
    db.collection('menus').get().then(
        function (docs) {
            setMenus(docs);
        }
    );
}

function setMenus(docs) {
    docs.forEach(
        function (menu) {
            var data = menu.data();
            //console.log(`${menu.id} -  ${data.name}`);
            menus[menu.id] = { 'name': data.name, 'price': data.price };
        }
    );

    // Call getOrders function
    getOrders();
}

function getOrders() {
    var cust_id = stdin.question("\nCustomer ID: ");
    var cust = customers[cust_id];
    console.log(cust_id);
    console.log('');
    console.log(cust.name);
    console.log(`${cust.address}, ${cust.area}`);
    console.log('');

    var orders = [];

    db.collection('custorders').where('id_customer', '==', cust_id).get().then(
        function (docs) {
            docs.forEach(
                function (custorder) {
                    //console.log(`${custorder.id} - ${custorder.data().date_time}`);
                    let data = custorder.data();
                    data['id'] = custorder.id;
                    orders.push(data);
                }
            );

            getItems(orders);

            return orders;
        }
    );
}

function getItems(custorders) {
    custorders.forEach(function (odr, idx) {
        //console.log(odr);
        db.collection('itemorders').where('id_custorder', '==', odr.id).get().then(docs => {
            console.log(odr.date_time);
            docs.forEach(item => {
                var id_menu = item.data().id_menu;
                var menu_name = menus[id_menu].name;
                var menu_price = menus[id_menu].price;
                var qty = item.data().qty;

                console.log(`${odr.id} - ${menu_name} - ${menu_price} - ${qty}`);
                
                odr['items']=item.data();
            });
            console.log('');
        });
    });

    //listOrderItems(custorders);
    return custorders;
}

function listOrderItems(custorders) {
    custorders.forEach(function (odr, idx) {
        console.log(odr.items);
    });
}