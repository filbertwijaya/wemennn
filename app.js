const express = require("express");
const { query } = require("express");
const app = express();
const port = 8080;

const moment = require('moment');

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Disable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const ObjectId = mongo.ObjectId;
const uri = "mongodb+srv://pervasiv:kentuvalair@cluster0.ncsxd.mongodb.net/plcmonitor?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

let database = null;
let bahan_coll = null;
let campuran_coll = null;
let hasil_coll = null;
let history_coll = null;
let recent_coll = null;

const db = [
    {
        id_bahan: "1",
        nama_bahan: "antis a",
        tipe_bahan: "a",
        qty: "1",
        tgl_dimasukan: "10-10-2020",
        tgl_expired_otomatis: "10-10-2021",
    },
    {
        id_bahan: "2",
        nama_bahan: "antis b",
        tipe_bahan: "a",
        qty: "1",
        tgl_dimasukan: "10-10-2020",
        tgl_expired_otomatis: "10-10-2021",
    },
    {
        id_bahan: "1",
        nama_bahan: "antis c",
        tipe_bahan: "a",
        qty: "1",
        tgl_dimasukan: "10-10-2020",
        tgl_expired_otomatis: "10-10-2021",
    },
    {
        id_bahan: "1",
        nama_bahan: "antis d",
        tipe_bahan: "a",
        qty: "1",
        tgl_dimasukan: "10-10-2020",
        tgl_expired_otomatis: "10-10-2021",
    },
    {
        id_bahan: "1",
        nama_bahan: "antis e",
        tipe_bahan: "a",
        qty: "1",
        tgl_dimasukan: "10-10-2020",
        tgl_expired_otomatis: "10-10-2021",
    },
    {
        id_bahan: "1",
        nama_bahan: "antis f",
        tipe_bahan: "a",
        qty: "1",
        tgl_dimasukan: "10-10-2020",
        tgl_expired_otomatis: "10-10-2021",
    },
];

app.listen(port, async () => {
    console.log("app listening port " + port);
    await client.connect(err => {
        database = client.db("plcmonitor");
        bahan_coll = database.collection("bahan");
        campuran_coll = database.collection("campuran");
        hasil_coll = database.collection("hasil");
        history_coll = database.collection("history");
        recent_coll = database.collection("recent");
    });
});

//!BAHAN
// GET all bahan
app.get("/bahan", async (req, res) => {
    if (database === null || bahan_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    const coll = bahan_coll.find() // Untuk Query All
    let result = [];

    try {
        await coll.forEach(doc => {
            result.push(doc);
        });

        const response = {
            status: "success",
            count: result.count,
            data: result,
        }

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        const response = {
            status: "db_query_failed",
            message: "Failed to run database query"
        }

        res.status(500).send(response);
    }
});

// GET bahan dengan id :bahan_id
app.get("/bahan/:bahan_id", async (req, res) => {
    if (database === null || bahan_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    try {
        const doc = await bahan_coll.findOne({ // Untuk Query Spesifik
            _id: ObjectId(req.params.bahan_id)
        })

        const status_code = doc ? 200 : 404;

        const response = {
            status: "success",
            data: doc,
        }

        res.status(status_code).send(response);
    } catch (error) {
        console.log(error);
        const response = {
            status: "db_query_failed",
            message: "Failed to run database query"
        }

        res.status(500).send(response);
    }
});

// Update stok bahan 
app.post("/bahan/stok", async (req, res) => {
    if (database === null || bahan_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    // Menerima dan sanitasi
    let {
        qty_alkohol,
        qty_aloevera,
        qty_hidrogen
    } = req.body;

    // Validasi
    if (
        qty_alkohol === null || 
        qty_aloevera === null ||
        qty_hidrogen === null
    ) {
        const response = {
            status: "invalid_params",
            message: "One of the required fields are null",
        }

        res.status(400).send(response);
        return;
    }


    if(
        Number.parseFloat(qty_alkohol) === Number.NaN ||
        Number.parseFloat(qty_aloevera) === Number.NaN ||
        Number.parseFloat(qty_hidrogen) === Number.NaN
    ) {
        const response = {
            status: "not_a_number",
            message: "One of the parameters given is not a number",
        }

        res.status(400).send(response);
        return;
    } else {
        qty_alkohol = parseFloat(qty_alkohol);
        qty_aloevera = parseFloat(qty_aloevera);
        qty_hidrogen = parseFloat(qty_hidrogen);
    }

    let updates = [];

    if(qty_alkohol > 0){
        updates.push({
            updateOne:{
                "filter"    : {nama_bahan: "Alkohol"},
                "update": {
                    $inc: {qty: Math.abs(qty_alkohol)},
                    $set: {
                        tgl_dimasukkan : Date(),
                        tgl_expired    : moment(Date()).add(14, 'days').toDate(),
                    }
                }
            }
        });
    }

    if(qty_aloevera > 0){
        updates.push({
            updateOne:{
                "filter"    : {nama_bahan: "Aloevera"},
                "update": {
                    $inc: {qty: Math.abs(qty_aloevera)},
                    $set: {
                        tgl_dimasukkan : Date(),
                        tgl_expired    : moment(Date()).add(1, 'months').toDate(),
                    }
                }
            }
        });
    }

    if(qty_hidrogen > 0){
        updates.push({
            updateOne:{
                "filter"    : {nama_bahan: "Hidrogen Peroxide"},
                "update": {
                    $inc: {qty: Math.abs(qty_hidrogen)},
                    $set: {
                        tgl_dimasukkan : Date(),
                        tgl_expired    : moment(Date()).add(1, 'months').toDate(),
                    }
                }
            }
        });
    }

    console.log("Test")

    // Interaksi ke database
    const insertResult = await bahan_coll.bulkWrite(updates);

    const response = {
        status: "success",
        message: "Stock updated successfully!"
    }

    // Mengurus Response
    res.status(200).send(response);
});

//!CAMPURAN
// GET all campuran
app.get("/campuran", async (req, res) => {
    if (database === null || campuran_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    const coll = campuran_coll.find() // Untuk Query All
    let result = [];

    try {
        await coll.forEach(doc => {
            result.push(doc);
        });

        const response = {
            status: "success",
            count: result.count,
            data: result,
        }

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        const response = {
            status: "db_query_failed",
            message: "Failed to run database query"
        }

        res.status(500).send(response);
    }
});

// GET campuran dengan id :campuran_id
app.get("/campuran/:campuran_id", async (req, res) => {
    if (database === null || campuran_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    try {
        const doc = await campuran_coll.findOne({ // Untuk Query Spesifik
            _id: ObjectId(req.params.campuran_id)
        })

        const response = {
            status: "success",
            data: doc,
        }

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        const response = {
            status: "db_query_failed",
            message: "Failed to run database query"
        }

        res.status(500).send(response);
    }
});

// Bikin campuran baru
app.post("/campuran", async (req, res) => {
    if (database === null || campuran_coll === null || bahan_coll === null || recent_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    // Menerima dan sanitasi
    let {
        qty_alkohol,
        qty_aloevera,
        qty_hidrogen,
    } = req.body


    // Validasi
    if (
        qty_alkohol === null || 
        qty_aloevera === null ||
        qty_hidrogen === null
    ) {
        const response = {
            status: "invalid_params",
            message: "One of the required fields are null",
        }

        res.status(400).send(response);
        return;
    }


    if(
        Number.parseFloat(qty_alkohol) === Number.NaN ||
        Number.parseFloat(qty_aloevera) === Number.NaN ||
        Number.parseFloat(qty_hidrogen) === Number.NaN
    ) {
        const response = {
            status: "not_a_number",
            message: "One of the parameters given is not a number",
        }

        res.status(400).send(response);
        return;
    } else {
        qty_alkohol = parseFloat(qty_alkohol);
        qty_aloevera = parseFloat(qty_aloevera);
        qty_hidrogen = parseFloat(qty_hidrogen);
    }

    const session = client.startSession();

    try {
        const alkohol = await bahan_coll.findOne({nama_bahan : "Alkohol", qty:{$gt:  qty_alkohol}});
        const aloevera = await bahan_coll.findOne({nama_bahan : "Aloevera", qty:{$gt: qty_aloevera}});
        const hidrogen = await bahan_coll.findOne({nama_bahan : "Hidrogen Peroxide", qty:{$gt: qty_hidrogen}});

        if(alkohol === null || aloevera === null || hidrogen === null){
            const response = {
                status  : "invalid_qty",
                message : "An ingredient doesn't have enough stock"
            }
    
            res.status(400).send(response);
            return;
        }

        const new_campuran = {
            alkohol:{
                id: ObjectId(alkohol._id),
                qty: qty_alkohol,
            },
            aloevera:{
                id: ObjectId(aloevera._id),
                qty: qty_aloevera,
            },
            hidrogen_peroxide:{
                id: ObjectId(hidrogen._id),
                qty: qty_hidrogen,
            },
        }

        // Transaction

        await session.withTransaction(async () => {
            const result = await campuran_coll.insertOne(new_campuran);

            const history_entry = {
                PIC: "dummy_user",
                id_campuran: result.insertedId,
                id_hasil: null,
                Timestamp:{
                    created_mix: Date(),
                    start_mix: null,
                    finished_mix: null
                }
            }

            await history_coll.insertOne(history_entry);
            console.log(result.insertedId)
            await recent_coll.findOneAndUpdate({}, {$set: {
                PIC: "dummy_user",
                id_campuran: result.insertedId,
                id_hasil: null,
                Timestamp:{
                    created_mix: Date(),
                    start_mix: null,
                    finished_mix: null
                }
            }}, {upsert: true});

            await bahan_coll.bulkWrite([
                {
                    updateOne:{
                        "filter" : {nama_bahan: "Alkohol"},
                        "update" : {$inc: {qty: -Math.abs(qty_alkohol)}}
                    }
                },
                {
                    updateOne:{
                        "filter" : {nama_bahan: "Aloevera"},
                        "update" : {$inc: {qty: -Math.abs(qty_aloevera)}}
                    }
                },
                {
                    updateOne:{
                        "filter" : {nama_bahan: "Hidrogen Peroxide"},
                        "update" : {$inc: {qty: -Math.abs(qty_hidrogen)}}
                    }
                }
            ]);
        })

        const response = {
            status: "success",
            message: "Mixture input received!"
        }

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        const response = {
            status: "db_query_failed",
            message: "Failed to run database query"
        }

        res.status(500).send(response);
    } finally {
        session.endSession();
    }
});

//!HASIL

//!Recent
// GET all bahan
app.get("/recent", async (req, res) => {
    if (database === null || recent_coll === null) {
        const response = {
            "status": "database_connect_failed",
            "message": "Server failed to connect to database"
        };

        res.status(500).send(response);
        return;
    }

    try {
        const aggr = await recent_coll.aggregate([
            {
                $lookup: {
                    from: "campuran",
                    localField: "id_campuran",
                    foreignField: "_id",
                    as: "campuran"
                }
            }
        ]);

        const doc = await aggr.next();

        const status_code = doc ? 200 : 404;

        const response = {
            status: "success",
            data: doc,
        }

        res.status(status_code).send(response);
    } catch (error) {
        console.log(error);
        const response = {
            status: "db_query_failed",
            message: "Failed to run database query"
        }

        res.status(500).send(response);
    }
});
