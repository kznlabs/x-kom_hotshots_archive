import {app} from "./server.js";
import {getHotshotsWithPagination, getNewHotshot} from "./methods.js";
import {insertIntoDatabase} from "./database.js";
import {hotshot} from "./hotshot.js";

// app.get("/", (req,res)=>{
//     res.send("Health check! ⛹️")
// })

app.get("/current", async (req, res) => {
    await getNewHotshot().then(() => {
        res.send(hotshot)
    })
})

app.get("/insert", async (req, res) => {
    await insertIntoDatabase().then((a) => {
        res.send({message: `${a}`})
    })
})

app.get("/list", async (req, res) => {
    await getHotshotsWithPagination(req, res).then((a) => {
        res.send(a)
    })
})