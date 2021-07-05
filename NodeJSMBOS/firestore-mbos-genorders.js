// import firestore, etc. configurations from config.js
var config = require('./config.js');

var dateFormat = require('dateformat');
var stdin = require('readline-sync');
var mb_menus = require("./mbmenus.json");
var mb_customers = require("./mbcustomers.json");

// get firestore db instance from config.js
var db = config.dbfs;

// JSON list variable to run function via its index
var func_calls = [
    { 'run': function () { addMenus(); } },
    { 'run': function () { addCustomers(); } },
    { 'run': function () { generateOrders(); } }
];

// Display task options
chooseTask();
function chooseTask() {
    console.log('\n' +
        '1. Add menus\n' +
        '2. Add customers\n' +
        '3. Generate orders\n' +
        '4. Exit\n');

    var choice = stdin.question("Your choice (1/2/3/4): ");

    if (choice > 0 && choice < 4) {
        var idx = choice - 1;
        func_calls[idx].run();

    } else if (choice != 4) {
        chooseTask();
    }
}

// Add menus from mb_menus array using batch processing
async function addMenus() {
    var batch = db.batch();
    mb_menus.forEach(
        async function (menu) {
            console.log(menu);
            // custom id - need to change to string as Firestore id only support string type id
            var new_doc = db.collection('menus').doc(menu.id.toString());  
            batch.set(new_doc, menu);
        }
    );

    batch.commit().then(function () {
        // Back to task options
        chooseTask();
    });
}

// Add customers from mb_customers array using batch processing
function addCustomers() {
    let batch = db.batch();

    mb_customers.forEach(
        function (cust) {
            console.log(cust);
            var new_doc = db.collection('customers').doc(); // auto id
            batch.set(new_doc, cust);
        }
    );
    batch.commit().then(function () {
        // Back to task options
        chooseTask();
    });
}


// Randomnly generate customer orders 
function generateOrders() {
    let batch = db.batch();

    db.collection('customers').get().then(cust_docs => {
        cust_docs.forEach(function (cust) {
            // Generate random number of customers repeating the orders (1 - 7)
            var order_repeat = Math.floor(Math.random() * 6 + 1);

            // Print customer's ID and number of time he/she repeat the orders
            console.log(cust.id + " - " + order_repeat);
            console.log('--------------------------------------');

            for (var repeat = 0; repeat < order_repeat; repeat++) {

                // Generate random date of customer order
                var date = new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
                var date_time = dateFormat(date, "yyyy-mm-dd h:MM:ss");

                // Print customer's name, number of items ordered and date of order
                console.log(`${cust.data().name}, ${date_time}`);

                // Save order data into 'custorders' collections
                var custorder = { 'id_customer': cust.id, 'date_time': date_time };
                var new_order = db.collection('custorders').doc(); // auto id

                console.log(`Save customer order in batch process`);
                batch.set(new_order, custorder);
                
                console.log('');
            }
        });
    }).then(function () {
        batch.commit().then(() => {
            addItems();
        });
    });
}

// Randomly generate menu items to be ordered by customers
function addItems() {
    let batch = db.batch();

    db.collection('custorders').get().then(custorder_docs => {
        custorder_docs.forEach(custorder => {
            // randomly generate total menu item ordered by customers (1 - 5)
            var item_total = Math.floor(Math.random() * 4 + 1);

            console.log(`Try to add items for orders with ID ${custorder.id} with total item = ${item_total}`);

            // hash to prevent identical menu id ordered by a single customer
            var id_menu_dict = {};

            for (var i = 0; i < item_total; i++) {
                var id_menu = undefined, stop = false;

                while (!stop) {
                    id_menu = Math.floor(Math.random() * 12 + 1); // randomly generate menu's id (1 - 13)

                    // prevent identical menu id ordered by a single customer
                    if (id_menu_dict[id_menu] != 1) {
                        id_menu_dict[id_menu] = 1;
                        stop = true;
                    }
                }

                // randomly generate number of menu item qty ordered by customers (1 - 5)
                var item_qty = Math.floor(Math.random() * 4 + 1);

                console.log(`Add menu item with ID = ${id_menu} and qty = ${item_qty}`);

                // Save item into 'itemorders' collections
                var itemorder = { 'id_custorder': custorder.id, 'id_menu': id_menu, 'qty': item_qty };
                var new_item = db.collection('itemorders').doc(); // auto id

                console.log(`Save item order in batch processing`);
                batch.set(new_item, itemorder);
            }

            console.log('\n');
        });

    }).then(function() {
        batch.commit().then(() => {
            chooseTask();
        });
    });
}


