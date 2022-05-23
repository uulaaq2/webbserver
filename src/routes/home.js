import express from 'express'
import cors from 'cors'
import { headers } from '../options/corsOptions'
import { setWarning, setSuccess, setError } from '../functions/setReply'

const router = express.Router()

router.get('/', function(req, res) {
  res.send('home')
})

router.post('/getdrawings', cors(), headers, function(req, res) {
  if (!req.body.token) {
    res.send(setWarning('Missing parameters'))
    return
  }

  if (!req.body.searchText) {
    req.body.searchText = ''
  }

  const main = async () => {
    const token = new Token()
    const verifiedTokenResult = token.verifyToken(req.body.token, true)
    if (verifiedTokenResult.status !== 'ok') {
      res.send(verifiedTokenResult)
  
      return
    }

    const db = new DB()
    const sql = new SQLQueryBuilder()
    const sqlResult = sql.select('*')
                     .from('files')
                     .like({
                       File_Name: req.body.searchText
                     })
                     .orderBy('File_Name')
                    .get()
        
    const result = await db.query(sqlResult.sqlStatement, sqlResult.values)      

    res.send(result)
  }

  main()
})

router.post('/verifytoken', cors(), headers, function(req, res) {
  try {
    if (!req.body.token) {
      throw new Error('Missing parameters')
    }
  
    const main = async () => {
      const token = new Token()
      const verifiedTokenResult = token.verifyToken(req.body.token, true)
      
      res.send(verifiedTokenResult)
    }
  
    main()
  } catch (error) {
    res.send(setError(error))
  }
})

export default router