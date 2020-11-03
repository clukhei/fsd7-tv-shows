const express = require("express");
const SQL_TV_DETAIL = "SELECT * FROM leisure_kboard.tv_shows WHERE tvid = ?";

module.exports = function (pool) {
	const router = express.Router();
	router.get("/:id", async (req, res) => {
		const conn = await pool.getConnection();
		const tvId = req.params.id;
		console.log(tvId);
		try {
			const result = await conn.query(SQL_TV_DETAIL, [tvId]);
			const record = result[0][0];
			console.log(record.official_site);
			console.log(record);
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
		} finally {
			conn.release();
		}
	});
	return router;
};
