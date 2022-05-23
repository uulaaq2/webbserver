import jwt from 'jsonwebtoken'
import DateUtils from './DateUtils'
import { setSuccess, setWarning, setCustom, setError } from '../functions/setReply'
import config from '../config'

class Token {
  // start of generate token function
  generateToken(payload = {}, expiresIn = null) {
    try {      
        let jwtOptions = {
          expiresIn: config.tokenExpiresIn + 'd'
        }            
        if (expiresIn) {
          jwtOptions.expiresIn = expiresIn + 'h'
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOptions)

        const data = {
          token
        }

        return setSuccess(data)
    } catch (error) {
        return setError(error)
    }    
  // end of generate token function
  }

  // start of verify token function
  verifyToken(token, ignoreShouldChangePassword = false) {
    try {
      if (!token) {
        throw new Error('No token is provided')
      }
     
      const result = jwt.verify(token, process.env.JWT_SECRET)  
      const accountExpiresAt = result.accountExpiresAt

      const dateUtils = new DateUtils()
      const diffToDate = dateUtils.diffToDate(accountExpiresAt)
      if (diffToDate.status === 'error') {
        throw new Error(diffToDate.message)
      }      
      if (diffToDate.status !== 'ok') {
        return setWarning(diffToDate.message)
      }

      if (diffToDate.days < 0) {
        return setCustom('accountIsExpired', 'Your account is Expired, please contact to your system administrator')
      }

      if (!ignoreShouldChangePassword) {
        if (result.shouldChangePassword) {
          return setCustom('shouldChangePassword', 'Please change your password', { token })
        }
      }
      
      let data = {
        token,
        decryptedData: result
      }

      return setSuccess(data)
      
    } catch (error) {
      return setCustom('invalidToken', 'Invalid token')
    }
  // end of verify token function
  }
}

export default Token