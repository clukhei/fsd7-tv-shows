const express = require("express");
const SQL_TV_DETAIL = "SELECT * FROM leisure_kboard.tv_shows WHERE tvid = ?";

const mkQuery = (sqlStmt, pool) => {
	const f = async(params) => {
		const conn = await pool.getConnection()
		try{
			const results = await pool.query(sqlStmt, params)
			return results[0]
		}catch(e) {
			return Promise.reject(e)
		}finally {
			conn.release()
		}
		
	}
	return f
}
module.exports = function (pool) {
	const router = express.Router();
	const getTVDetail = mkQuery(SQL_TV_DETAIL, pool)
	router.get("/:id", async (req, res) => {

		const tvId = req.params.id;
		console.log(tvId);
		try {
			const result = await getTVDetail([tvId]);
			const record = result[0];
			console.log(record)
			console.log(record.official_site);
		
			res.status(200);
			res.type("text/html");
			res.render("tvShow", {
				hasRecord: record.length > 0,
				record,
				hasLink: !!record.official_site,
			});
		} catch (e) {
			res.status(500);
			res.type("text/html");
			res.send(JSON.stringify(e));
		} 
	});
	return router;
};
