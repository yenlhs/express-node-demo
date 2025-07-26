const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Single API endpoint at root
app.get("/", (req, res) => {
	res.json({ message: "hello World Adrian Li Hung shun" });
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on port ${PORT}`);
});
