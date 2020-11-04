const express = require("express");
const hbs = require("express-handlebars");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const app = express();

app.engine("hbs", hbs({ defaultLayout: "default.hbs" }));
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/static"));

const pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.PORT) || 3306,
	database: process.env.DB_NAME || "leisure",
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
	timezone: "+08:00",
});

//SQL
const SQL_LIST_TV_DESC =
	"SELECT name, tvid,image FROM leisure.tv_shows ORDER BY name DESC limit ?";
const listRouter = require('./list')(pool)
app.use('/list', listRouter)

app.get("/", async (req, res) => {
	pool.getConnection()
		.then((conn) => {
			const p0 =  conn //Promise.resolve(conn);
			const p1 = conn.query(SQL_LIST_TV_DESC, [20]);
			return Promise.all([p0, p1]);
		})
		.then((result) => {
			const [records, _] = result[1];
			res.status(200);
			res.type("text/html");
			res.render("index", {
				records,
				hasRecords: records.length > 0,
            });
            console.log(result[0])
           /*  console.log(Promise.resolve(result[0])) */
			return result[0];
		})
		.catch((error) => {
			res.status(500);
			res.type("text/html");
			console.log(error);
			res.send(JSON.stringify(error));
		})
		.then((conn) => {
			console.log(conn + "we reached the end");
			return conn.release();
		});
	/*  const conn = await pool.getConnection()
    try{
        const result = await conn.query(SQL_LIST_TV_DESC, [20])
        const records = result[0]
   
        res.status(200)
        res.type('text/html')
        res.render('index', {
            records,
            hasRecords : records.length > 0
        })
        
    }catch(e) {
        res.status(500)
        res.type('text/html')
        res.send(JSON.stringify(e))
    } finally{
        conn.release()
    } */
});


app.use((req, res) => {
	res.redirect("/");
});
pool.getConnection()
	.then((conn) => {
		console.log("pinging database");
		const p0 = Promise.resolve(conn);
		const p1 = conn.ping();
		return Promise.all([p0, p1]);
	})
	.then((results) => {
		const conn = results[0];
		console.log(conn);
		conn.release();
		app.listen(PORT, () => {
			console.log(`${PORT} started`);
		});
	})
	.catch((error) => console.log(error));
