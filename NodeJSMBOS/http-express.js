var express = require('express');
var bodyParser = require("body-parser"); // need this to handle POST method
var config = require('./config.js');
// var dateFormat = require('dateformat');
var app = express();

app.use(express.static('public')); // directory publish static files

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    //res.send('Hello! welcome to http-express.js Web Service');
    return res.redirect('/menus.html');
});

// get firestore db instance from config.js
var db = config.dbfs;

// GET method - query string
app.get('/plus2num/', function (req, res) {
    var num1 = req.query.num1;
    var num2 = req.query.num2;

    var result = parseInt(num1) + parseInt(num2);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send('' + result);
});

// POST method - JSON data
app.post('/plus2num/', function (req, res) {
    console.log(req.body);
    var num1 = req.body.num1;
    var num2 = req.body.num2;

    var result = parseInt(num1) + parseInt(num2);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send('' + result);
});

// GET method - REST
app.get('/plus2num/:num1/:num2', function (req, res) {
    var num1 = req.params.num1;
    var num2 = req.params.num2;

    var result = parseInt(num1) + parseInt(num2);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send('' + result);
});


// POST method - REST
app.post('/plus2num/:num1/:num2', function (req, res) {
    var num1 = req.params.num1;
    var num2 = req.params.num2;

    var result = parseInt(num1) + parseInt(num2);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send('' + result);
});


// Test Firebase query
app.get('/courses', function (req, res) {
    db.collection('courses').get().then((docs) => {
        var courses = [];

        docs.forEach((doc) => {
            courses.push({ id: doc.id, data: doc.data() });
        });

        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(courses);
    });
});

///////////////////////////////////////////////////////////////////////////////
// REST paths for MBOS project
///////////////////////////////////////////////////////////////////////////////

// Paths for menus ////////////////////////////////////////
app.get('/mbos/menus', function (req, res) {
    console.log(`/mbos/menus`);
    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.redirect('/mbos/menus/id/asc');
});

app.get('/mbos/menus/:orderby/:sequence', function (req, res) {
    var orderby = req.params.orderby;
    var sequence = req.params.sequence;
    var valid_orderby = { 'id': 1, 'name': 1, 'price': 1 };

    if (!valid_orderby[orderby]) orderby = 'id';
    if (sequence != 'desc') sequence = 'asc';

    console.log(`/mbos/menus/${orderby}/${sequence}\n`);

    db.collection('menus').orderBy(orderby, sequence).get().then((docs) => {
        var menus = [];
        docs.forEach(doc => {
            //console.log(doc.data().name);
            var data = doc.data();
            data.id = doc.id; // add doc id as part of doc data
            menus.push(data);
        });

        var pretty_json = JSON.stringify(menus, null, 2);

        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(pretty_json);
    });
});

app.get('/mbos/menu/:id', function (req, res) {
    console.log(`/mbos/menus/${req.params.id}\n`);

    db.collection('menus').doc(req.params.id).get().then((doc) => {
        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(doc.data());
    });
});

app.post('/mbos/menu/create', function (req, res) {
    console.log('/mbos/menu/create');
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var new_menu = { 'id': req.body.id, 'name': req.body.name, 'price': req.body.price };
    var result = { 'status': null, 'message': null };

    db.collection('menus').doc(new_menu.id.toString()).get().then(function (doc) {
        if (doc.exists) {
            result.status = 'fail';
            result.message = `Can't add, menu with ID ${new_menu.id} already exists in the database!`;

            res.send(result);

        } else {
            db.collection('menus').doc(new_menu.id.toString()).set(new_menu).then(function (doc) {
                result.status = 'success';
                result.message = `Successful save new menu into database`;

                res.send(result);
            });
        }
    });
});

app.put('/mbos/menu/update/:id', function (req, res) {
    console.log(`/mbos/menu/update/${req.params.id}`);
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var update_menu = { 'name': req.body.name, 'price': req.body.price };
    var result = { 'status': null, 'message': null };

    db.collection('menus').doc(req.params.id).update(update_menu).then(function (doc) {
        result.status = 'success';
        result.message = `Successful update menu into database`;
        res.send(result);
    });
});

app.delete('/mbos/menu/delete/:id', function (req, res) {
    console.log(`/mbos/menu/delete/${req.params.id}`);
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var result = { 'status': null, 'message': null };

    // need extra caution here since 'id_menu' field is numeric type (integer)
    db.collection('itemorders').where('id_menu', '==', parseInt(req.params.id)).get().then(function (docs) {
        console.log(docs.empty);
        if (!docs.empty) {
            result.status = 'fail';
            result.message = `Can't delete, menu with ID ${req.params.id} was currently ordered by some customers!`;

            res.send(result);

        } else {
            db.collection('menus').doc(req.params.id).delete().then(function (doc) {

                result.status = 'success';
                result.message = `Successful delete menu from database`;
                res.send(result);
            });
        }
    });


});

// Paths for customers ////////////////////////////////////
app.get('/mbos/customers', function (req, res) {
    console.log(`/mbos/customers`);
    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.redirect('/mbos/customers/name/asc');
});

app.get('/mbos/customers/:orderby/:sequence', function (req, res) {
    var orderby = req.params.orderby;
    var sequence = req.params.sequence;
    var valid_orderby = { 'name': 1, 'area': 1, 'address': 1 };

    if (!valid_orderby[orderby]) orderby = 'name';
    if (sequence != 'desc') sequence = 'asc';

    console.log(`/mbos/customers/${orderby}/${sequence}\n`);

    db.collection('customers').orderBy(orderby, sequence).get().then((docs) => {
        var customers = [];
        docs.forEach(doc => {
            //console.log(doc.data().name);
            var data = doc.data();
            data.id = doc.id; // add doc id as part of doc data
            customers.push(data);
        });

        var pretty_json = JSON.stringify(customers, null, 2);

        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(pretty_json);
    });
});

app.get('/mbos/customer/:id', function (req, res) {
    console.log(`/mbos/customers/${req.params.id}\n`);

    db.collection('customers').doc(req.params.id).get().then((doc) => {
        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(doc.data());
    });
});

//Post Customer
app.post('/mbos/customer/create', async function (req, res) {
    console.log('/mbos/customer/create');
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    var currid;
    // var new_cust = { 'name': req.body.name, 'address': req.body.address, 'area':req.body.area };
    var result = { 'status': null, 'message': null };
    // var date = new Date();
    // var date_time = dateFormat(date, "yyyy-mm-dd h:MM:ss");
    const custRef = db.collection('customers');
    const snapshot = await custRef.where('name', '==', req.body.name).get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        //create new cust
        const newcust = await db.collection('customers').add({
            name: req.body.name,
            address: req.body.address,
            area: req.body.area
        });
        currid = newcust.id;
        console.log('Added document with ID: ', currid);
        console.log("new cust");

    }

    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        currid = doc.id;
        console.log('Added document with ID: ', currid);
        console.log("old cust");
    })


    // const newcustorder = await db.collection('custorders').add({
    //     id_customer: currid,
    //     date_time: date_time
    // });

    result.status = 'success';
    result.message = `Successful update customer into database`;
    res.send(result);

});
//End Post Customer

app.delete('/mbos/customer/delete/:id', function (req, res) {
    console.log(`/mbos/customer/delete/${req.params.id}`);
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var result = { 'status': null, 'message': null };

    // need extra caution here since 'id_menu' field is numeric type (integer)
    db.collection('customers').where('id_customer', '==', parseInt(req.params.id)).get().then(function (docs) {
        console.log(docs.empty);
        if (!docs.empty) {
            result.status = 'fail';
            // result.message = `Can't delete, menu with ID ${req.params.id} was currently ordered by some customers!`;

            res.send(result);

        } else {
            db.collection('customers').doc(req.params.id).delete().then(function (doc) {

                result.status = 'success';
                result.message = `Successful delete customers from database`;
                res.send(result);
            });
        }
    });
});

app.put('/mbos/customer/update/:id', function (req, res) {
    console.log(`/mbos/customer/update/${req.params.id}`);
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var update_customer = { 'name': req.body.name, 'address': req.body.address, 'area': req.body.area };
    var result = { 'status': null, 'message': null };

    db.collection('customers').doc(req.params.id).update(update_customer).then(function (doc) {
        result.status = 'success';
        result.message = `Successful update customer into database`;
        res.send(result);
    });
});

// Paths for customer orders ////////////////////////////////////
app.get('/mbos/custorders', function (req, res) {
    console.log(`/mbos/custorders`);
    return res.redirect('/mbos/custorders/date_time/desc');
});

app.get('/mbos/custorders/:orderby/:sequence', function (req, res) {
    var orderby = req.params.orderby;
    var sequence = req.params.sequence;
    var valid_orderby = { 'date_time': 1 };

    if (!valid_orderby[orderby]) orderby = 'date_time';
    if (sequence != 'desc') sequence = 'asc';

    console.log(`/mbos/custorders/${orderby}/${sequence}`);

    db.collection('custorders').orderBy(orderby, sequence).get().then((docs) => {
        var custorders = [];
        docs.forEach(doc => {
            //console.log(doc.data().date_time);
            var data = doc.data();
            data.id = doc.id; // add doc id as part of doc data
            custorders.push(data);
        });

        // get items ordered for each order made by
        // all customers
        getItems(custorders, res);
    });
});

app.get('/mbos/custorders/:id_customer', function (req, res) {
    var id_customer = req.params.id_customer;

    console.log(`/mbos/custorders/${id_customer}\n`);

    db.collection('custorders').where('id_customer', '==', id_customer).get().then((docs) => {
        var custorders = [];
        docs.forEach(doc => {
            //console.log(doc.data().date_time);
            var data = doc.data();
            data.id = doc.id; // add doc id as part of doc data
            custorders.push(data);
        });

        // get items ordered for each order made by 
        // current selected customer
        getItems(custorders, res);
    });
});

function getItems(custorders, res) {
    var order_count = 0;
    custorders.forEach(function (odr, idx) {
        //console.log(odr);

        // to store items ordered for each customer's order
        odr.items = [];

        db.collection('itemorders').where('id_custorder', '==', odr.id).get().then(docs => {
            //console.log(odr.date_time);
            docs.forEach(item => {
                var id_menu = item.data().id_menu;
                var qty = item.data().qty;
                //console.log(`${odr.id} - ${id_menu} - ${qty}`);

                odr.items.push(item.data());

                //console.log(odr);
            });

            order_count++;
            //console.log('order_count = ' +  order_count);

            // only send result after complete query the items ordered 
            // in each customer's order
            if (order_count == custorders.length) {
                var pretty_json = JSON.stringify(custorders, null, 2);

                res.setHeader('Content-type', 'text/plain');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.send(pretty_json);
            }
        });
    });
}

//Add new custorder
app.post('/mbos/custorder/create', async function (req, res) {
    console.log('/mbos/custorder/create');
    console.log(req.body);

    res.setHeader('Content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var custId;
    const snapshot = await db.collection('customers').where('name', '==', req.body.name.toString()).get();
    var result = { 'status': null, 'message': null };

    db.collection('customers').where('name', '==', req.body.name.toString()).get().then(function (docs) {
        if (docs.empty) {
            result.status = 'fail';
            result.message = `Error in completing task!`;
            res.send(result);

        } else {
            snapshot.forEach(docs => {
                custId = docs.id;
            });

            var new_custorder = { 'id_customer': custId, 'date_time': req.body.date_time };

            db.collection('custorders').doc().set(new_custorder).then(function (doc) {
                result.status = 'success';
                result.message = `Successful save new custorder into database`;

                res.send(result);
            });
        }
    });
});
//End Add new custorder

// Paths for menu items ordered ////////////////////////////////////
app.get('/mbos/itemorders', function (req, res) {
    console.log(`/mbos/itemorders`);

    db.collection('itemorders').get().then((docs) => {
        var itemorders = [];
        docs.forEach(doc => {
            //console.log(doc.data().name);
            var data = doc.data();
            data.id = doc.id; // add doc id as part of doc data
            itemorders.push(data);
        });

        var pretty_json = JSON.stringify(itemorders, null, 2);

        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(pretty_json);
    });
});

app.get('/mbos/itemorders/:id_custorder', function (req, res) {
    var id_custorder = req.params.id_custorder;

    console.log(`/mbos/itemorders/${id_custorder}`);

    db.collection('itemorders').where('id_custorder', '==', id_custorder).get().then((docs) => {
        var itemorders = [];
        docs.forEach(doc => {
            //console.log(doc.data().name);
            var data = doc.data();
            data.id = doc.id; // add doc id as part of doc data
            itemorders.push(data);
        });

        var pretty_json = JSON.stringify(itemorders, null, 2);

        res.setHeader('Content-type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(pretty_json);
    });
});

// Start the server ///////////////////////////////////////////////////////////
var server = app.listen(8080, function () {
    var port = this.address().port;
    console.log("Express HTTP server listening at http://localhost:%s", port);
});
