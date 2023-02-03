import express from "express"
import fs from "fs"
import cors from "cors"
import rateLimit from "express-rate-limit"
import config from "./config.json" assert { type: "json" }
import { Configuration, OpenAIApi } from "openai"

const { host, port, openai_key } = config
// const port = process.env.PORT || config.port
const app = express()
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})
const configuration = new Configuration({
    apiKey: openai_key,
})
const openai = new OpenAIApi(configuration)
const defaultMSG = `use: ${host}:${port}/openai?text=hello`

app.use(express.static("public"))
app.use(limiter)
app.use(cors())
app.get("/", (req, res) => {
    res.send(defaultMSG)
})
app.get("/openai", async (req, res) => {
    // const key = req.query.apikey
    const text = req.query.text
    
    let result = {}

    if (!text) {
        result.code = 403
        result.openai = defaultMSG
        return res.send(JSON.stringify(result, null, 2))
    }
    result.code = 200
    const api_res = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: decodeURIComponent(text),//decodeURIComponent
    })

    if (api_res.status == 200) {
        result.openai = api_res.data.choices[0].text
        console.log(`> req: ${text}\n> res: ${result.openai}\n`)
        return res.send(JSON.stringify(result, null, 2))
    }
    
    res.header("Content-type", "application/json charset=utf-8")
})
app.listen(port, "0.0.0.0", function () {
    console.log(`Server listening on port ${port}\n`)
})
