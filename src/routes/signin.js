const express = require('express')
const router = express.Router()
const cors = require('cors')
const headers = require('../options/corsOptions')
const User = require('../classes/User')
const { setSucces, setWarning, setCustom, setError } = require('../functions/setReply')
module.exports = router


router.get('/', cors(), headers, function(req, res) {
  res.send('sign in page get');
})

router.post('/', cors(), headers, function(req, res) {
  const signIn = async () => {
    try {
      
      const email = req.body.email
      const password = req.body.password
      const rememberMe = req.body.rememberMe

      if (!email || !password || rememberMe === undefined) {        
        res.send(setWarning('Missing paramters'))
      }
  
      const user = new User()
      const userSigninResult = await user.signIn(email, password, rememberMe)
      
      res.send(await userSigninResult)
    } catch (error) {
      res.send(setError(error))
    }
  }

  signIn()
})

