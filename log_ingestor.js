const express = require('express');
const bodyparser = require('body-parser');
const {Client} = require('pg');
const {ejs} = require('ejs');
const morgan = require('morgan');
const responseTime = require('response-time');
require('dotenv').config();

var conString = process.env.DATABASE_URL;
const app = express();
const port = 3000;

app.use(express.static('views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true}));
app.use(express.json());
app.set('view engine','ejs');
app.use(morgan('dev')); // Log requests
app.use(responseTime()); // Add response time header

// log the response time in the console simple
app.use((req, res, next) => {
    res.on('finish', () => {
      const responseTimeInMs = res.get('X-Response-Time');
      console.log(`Request to ${req.path} took ${responseTimeInMs}`);
    });
    next();
});
  

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

async function searchLogs(queryText){
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
    }catch(e){
        console.log(e);
        return;
    }
    const query = 'SELECT * FROM logs WHERE level ILIKE $1 OR message ILIKE $1 OR resourceId ILIKE $1 OR traceId ILIKE $1 OR spanId ILIKE $1 OR commit ILIKE $1 OR parentResourceId ILIKE $1 OR timestamp::TEXT ILIKE $1;';
    const values = [`%${queryText}%`];
    const result = await client.query(query, values);
    await client.end();
    return result.rows;
}


app.get('/',(req,res)=>{
    res.render('index', {'data':null});
})

app.post('/',async(req,res)=>{
    let data;
    try{
        data = await searchLogs(req.body.textquery);
        res.render('index',{'data': data});
    }
    catch(err){
        res.render('index',{'data': JSON.stringify(err)});
    }
})

app.post('/ingest',async (req,res)=>{
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
async function startsrver(){
    await app.listen(port,()=>{
        console.log(`Log Ingestor listening at http://localhost:${port}`);
    });
}

startsrver();