require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("FarmLokal backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
