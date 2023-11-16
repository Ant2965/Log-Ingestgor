const readline = require('readline');
const {Client} = require('pg');
require('dotenv').config();

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});
var conString = process.env.DATABASE_URL;


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

rl.question('Enter search query\t',async (query)=>{
    const resultLogs = await searchLogs(query);
    if (resultLogs.length > 0) {
        console.log('\nSearch Results:');
        resultLogs.forEach(log => console.log(JSON.stringify(log, null, 2)));
    } else {
        console.log('\nNo matching logs found.');
    }
    rl.close();
});
