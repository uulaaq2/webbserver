const express = require('express')
const router = express.Router()
const cors = require('cors')
const headers = require('../options/corsOptions')
const { setWarning, setSuccess, setError } = require('../functions/setReply')
const Token = require('../classes/Token')
const Password = require('../classes/Password')
const res = require('express/lib/response')
const User = require('../classes/User')


router.get('/', cors(), headers, function(req, res) {
  res.send('user page get');
})

router.post('/', cors(), headers, function(req, res) {
  res.send('user page post');
})

router.post('/me/verifypassword', cors(), headers, function(req, res) {
  try {
    // check if password and token is posted with body
    if (!req.body.currentPassword || !req.body.token) {
      res.send(setWarning('Missing parameters'))
      return
    }
  
    // wait for verify user password result and send result 
    const main = async () => {
      const verifyPasswordResult = await new User().verifyUserPassword(req.body.currentPassword, req.body.token)
      res.send(verifyPasswordResult)
    }
  
    main()    
  } catch (error) {
    res.send(setError(error))
  }
// me/verifypassword end  
})

router.post('/me/changepassword', cors(), headers, function(req, res) {
  console.log(req.body.newPassword)
  console.log(req.body.token)
  if (!req.body.newPassword || !req.body.token) {
    res.send(setWarning('Missing parameters'))
    return
  }

  const main = async () => {
    const userChangePasswordResult = await new User().changePassword(req.body.token, req.body.newPassword)

    res.send(userChangePasswordResult)
  }

  main()
})

router.post('/me/emailpasswordresetlink', cors(), headers, function(req, res) {
  if (!req.body.email || !req.body.linkToUrl) {
    res.send(setWarning('Missing parameters'))
    return
  }
  const main = async () => {
    const user = new User()
    const emailResetPasswordLinkResult = await user.emailResetPasswordLink(req.body.email, req.body.linkToUrl)   

    res.send(emailResetPasswordLinkResult)
  }

  main()
})

router.post('/me/generatetoken', cors(), headers, function(req, res) {
  try {
    if (!req.body.token) {
      res.send(setWarning('Missing parameters'))
      return
    }
    const main = async () => {
      const user = new User()
      const generateUserTokenResult = await user.generateNewUserToken(req.body.token, req.body.expiresIn || null)    

      res.send(generateUserTokenResult)
    }
  
    main()    
  } catch (error) {
    res.send(setError(error))
  }
})

router.post('/me/verifytoken', cors(), headers, function(req, res) {
  try {
    if (!req.body.token) {
      res.send(setWarning('Missing parameters - /me/verifytoken'))
      return
    }

    const main = async () => {
      const user = new User()
      const verifyTokenResult = await user.verifyUserToken(req.body.token, req.body.includeUserData || false)
      res.send(verifyTokenResult)
    }
  
    main()    
  } catch (error) {
    res.send(setError(error))
  }
})



module.exports = router