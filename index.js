require("dotenv").config()
const { app, server } = require("./src/app")
const dbConnect = require("./src/config/db")
const PORT = process.env.PORT || 3001

dbConnect()

app.get("/", async (req, res) => {
    res.send("Server Running Successfly 🌿")
})

server.listen(PORT, () => {
    console.log(`server running on : http://localhost:${PORT}`)
    console.log(`✓ Socket.IO ready for connections`)
})
