import dotenv from 'dotenv'
const path = require('path')
dotenv.config({ path: '../.env' })

import express from 'express'
import cors from 'cors'

import routerHome from './routes/home'
import routerSignIn from './routes/signin'
import routerUser from './routes/user'

const app = express();
const port = process.env.APP_PORT || 3003

app.use(express.static('public'))

app.use(express.json());
app.use(cors())

app.use(routerHome)
app.use('/signin', routerSignIn)
app.use('/user', routerUser)

async function main(){

}

main().catch(error => console.log('main function error ', error))

app.listen(port, () => {
  try {
      console.log(`listening at ${port} ...`);      
  } catch (error) {
      console.log(error);
  }   
});

process.on('SIGINT', () =>{
  console.log("\nExiting ...");
  //db.connection.end();
  console.log("\nExited ...");
  process.exit(0);   
});