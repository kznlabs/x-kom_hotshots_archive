import express from "express";
import * as https from "node:https";
import * as fs from "node:fs";
import * as http from "node:http";
import serveIndex from "serve-index";
import cors from "cors";

export const app = express()

app.use(cors())
app.use(express.static('./static', {dotfiles: 'allow'}))
app.use('/.well-known', express.static('.well-known'), serveIndex('.well-known'));

http.createServer(app).listen(80, () => {
    console.log('Nasłuchiwanie na ::80')
})

if (fs.existsSync('/etc/letsencrypt/live/api.purpurmc.pl/privkey.pem')) {
    https.createServer(
        {
            key: fs.readFileSync('/etc/letsencrypt/live/api.purpurmc.pl/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/api.purpurmc.pl/cert.pem'),
            ca: fs.readFileSync('/etc/letsencrypt/live/api.purpurmc.pl/chain.pem'),
        },
        app
    )
        .listen(443, () => {
            console.log('Nasłuchiwanie na ::443')
        })
}