const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const DB = require('./DB')
const User = require('./User')
const SQLQueryBuilder = require('./SQLQueryBuilder')

const db = new DB()
const user = new User()
const sqlQueryBuilder = new SQLQueryBuilder()

const permissions = {                
  'user': {      
    'type': 'Global admin'
  }
}

const permissions2 = 'aaa'

const sqlStatement = sqlQueryBuilder
                    .update(process.env.TABLE_USERS)
                    .set({
                      permissions: JSON.stringify(permissions)
                    })
                    .where({
                      Email: 'muhittin.yendun@au.indorama.net'
                    })
                    .get()

db.query(sqlStatement.sqlStatement, sqlStatement.values)
console.log(sqlStatement)



