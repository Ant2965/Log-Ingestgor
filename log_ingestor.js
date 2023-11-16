const express = require('express');
const bodyparser = require('body-parser');
const {Client} = require('pg');
require('dotenv').config();

var conString = process.env.DATABASE_URL;
const app = express();

const port = 3000;

app.use(bodyparser.json());

let logs = [];

async function ingestdataintoDB(logdata){
    // const client = new Client({
    //     user:'postgres',
    //     host:'localhost',
    //     database:'logingest',
    //     password:'admin',
    //     port:5432,
    // });
    const client = new Client(conString);
    try{
        await client.connect();
        console.log("connected!");
    }catch(e){
        console.log(e);
        return;
    }
    try{
        for(const logEntry in logdata){
            const query = `
                INSERT INTO logs (level, message, resourceId, timestamp, traceId, spanId, commit, parentResourceId)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;

            const values = [
                logdata[logEntry].level,
                logdata[logEntry].message,
                logdata[logEntry].resourceId,
                new Date(logdata[logEntry].timestamp),
                logdata[logEntry].traceId,
                logdata[logEntry].spanId,
                logdata[logEntry].commit,
                logdata[logEntry].metadata.parentResourceId,
            ];
            await client.query(query, values);
        }
        console.log('Log entry ingested successfully!');
    } catch (error) {
        console.error('Error ingesting log entry:', error);
    } finally {
        await client.end();
    }
}

app.post('/',async (req,res)=>{
    const newLogs = req.body;
    logs = logs.concat(newLogs);
    try{
    await ingestdataintoDB(logs);
    res.json({ message: 'Logs ingested successfully' });
    }catch(error){
        console.log(error);
        res.json({ message: 'Logs ingest failed' });
    }
});

app.listen(port,()=>{
    console.log(`Log Ingestor listening at http://localhost:${port}`);
});