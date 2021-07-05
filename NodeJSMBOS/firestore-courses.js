var config = require('./config.js');

// get firestore db instance from config.js
var db = config.dbfs;

var new_course = undefined;

// 1. Add data (custom id) ///////////////////////////////////////////////
//new_course = {'code': 'SECJ1013', 'name': 'Programming Technique 1'};
//db.collection('courses').doc('SECJ1013').set(new_course); // using code as id

// 2. Add data (auto id) ///////////////////////////////////////////////
//new_course = {'code': 'SCSV3263', 'name': 'Multimedia Web Programming'};
//db.collection('courses').add(new_course);


// 3. Add multiple records using batch processing /////////////
/*
var batch = db.batch();
var new_courses = [{'code':'SCSR1013', 'name':'Digital Logic'}, 
                   {'code':'SCSP1513', 'name':'Teknologi & Sistem Maklumat'}];

new_courses.forEach(
    function (course) {
        console.log(course.code);
        var new_doc = db.collection('courses').doc(course.code); // custom id - course code
        batch.set(new_doc, course); // can also do the update or delete
    }
);

batch.commit();
*/


// 4. Update data (direct id) ////////////////////////////////
//db.collection('courses').doc('SECJ1013').update({'name':'Teknik Pengaturcaraan 1'});


// 5. Delete data (direct id) ////////////////////////////////
//db.collection('courses').doc('SECJ1013').delete();


// 6. Update/delete data (where) ///////////////////////////
/*
db.collection('courses').where('code', '==', 'SCSV3263').get().then(
    function (docs) {
        console.log(docs.empty);
        console.log(docs.size);

        if (!docs.empty) {
            docs.forEach((doc) => {
                console.log(doc.id);

                // Enable the next line to update
                //db.collection('courses').doc(doc.id).update({ 'name': 'MWP' });

                // Enable the next line to delete
                //db.collection('courses').doc(doc.id).delete();
            });
        }
    }
);
*/


// 7. Query using document id /////////////////////////////
/*
db.collection('courses').doc('SCSR1013').get().then((doc) => { 
    viewCourse(doc.data()); 
});
*/

// 8. Query using field value /////////////////////////////
/*
db.collection('courses').where('code', '==', 'SCSP1513').get().then(
    function (docs) {
        listCourse(docs);
    }
);
*/

// 9. Query all collections //////////////////////////////////
//queryAll();
function queryAll() {
    db.collection('courses').get().then( 
        (docs) => { 
            listCourse(docs); 
        }
    );
}

// Callback Functions /////////////////////////////////////
function listCourse(list) {
    list.forEach(doc => {
        console.log(doc.id);
        viewCourse(doc.data());
    });
}

function viewCourse(course) {
    console.log('Code: ' + course.code);
    console.log('Name: ' + course.name);
    console.log('');
}

