const { setError, setWarning, setSuccess } = require('../functions/setReply')
const DB = require('./DB')
const sqlQueryBuilder = require('./SQLQueryBuilder')
const Password = require('../classes/Password')
const Token = require('../classes/Token')
const axios = require('axios')

class User {

    // start of getUserByEmail function
    async getUserByEmail(emailAddress) {
        try {
            const db = new DB()            
            const sqlQuery = new sqlQueryBuilder()            
                                 .select('*')
                                 .from(process.env.TABLE_USERS)
                                 .where({Email: emailAddress})
                                 .get()
            
            const results = await db.query(sqlQuery.sqlStatement, sqlQuery.values)

            if (results.status === 'error') {
                throw new Error(results.message)
            }            

            if (results.status !== 'ok'){
                return results
            }

            if (results.results.length > 1) {
                return setWarning('Ambigious email address')
            }

            const data = {
                user: results.results[0]
            }
            
            return setSuccess(data)
        // end of try
        } catch (error) {
            return setError(error)
        // end of catch
        }

    // end of getUserByEmail function
    }

    prepareUserTokenFields(user) {
        try {
            const data = {
                userTokenFields : {
                    accountExpiresAt: user.Expires_At,
                    email: user.Email,
                    //password: user.Password,
                    avatar: user.Avatar,
                    site: user.Site,
                    homePage: user.Home_Page,
                    canBeRemembered: user.Can_Be_Remembered,
                    shouldChangePassword: user.Should_Change_Password
                }
            }

            return setSuccess(data)
        } catch (error) {
            return setError(error)
        }
    }

    checkUserPasswordByToken(password, token) {
        try {
         const verifiedToken = new Token().verifyToken(token)
         if (verifiedToken.status === 'error') {
             throw new Error(verifiedToken.message)
         }
         if (verifiedToken.status !== 'ok') {
             return verifiedToken
         }

         const encryptedPassword = verifiedToken.decryptedData.password
         const verifiedPassword = new Password().decryptPassword(password, encryptedPassword)
         if (verifiedPassword.status === 'error') {
            throw new Error(verifiedPassword.message)    
         }

         if (verifiedPassword.status !== 'ok') {
             return verifiedPassword
         }

         return setSuccess()
        } catch (error) {
            return setError(error)
        }
    }

    async signin(emailAddress, password) {
        try {
            const userResult = await this.getUserByEmail(emailAddress)

            if (userResult.status !== 'ok') {
                return userResult
            }

            let passwordVerifiedResult = new Password()
            passwordVerifiedResult = passwordVerifiedResult.decryptPassword(password, userResult.user.Password)
            if (passwordVerifiedResult.status !== 'ok') {
                return passwordVerifiedResult
            }
            
            const userTokenFieldsResult = this.prepareUserTokenFields(userResult.user)
            if (userTokenFieldsResult.status !== 'ok') {
                return userTokenFieldsResult
            }

            let token = new Token()
            const tokenGeneratedResult = token.generateToken(userTokenFieldsResult.userTokenFields)
            if (tokenGeneratedResult.status !== 'ok') {
                return tokenGeneratedResult
            }            

            const tokenVerifiedResult = token.verifyToken(tokenGeneratedResult.token)
            if (tokenVerifiedResult.status !== 'ok') {
                return tokenVerifiedResult
            }

            const data = {
                token: tokenGeneratedResult.token,
                user: userResult.user
            }


            return setSuccess(data)
        } catch (error) {
            return setError(error)
        }
    }

    async changePassword(token, newPassword) {
        try {
            const verifyTokenResult = new Token().verifyToken(req.body.token, true)
            if (verifyTokenResult.status !== 'ok') {
         
              return verifyTokenResult
            }        
            const emailAddress = verifyTokenResult.decryptedData.email    

            const encryptPasswordResult = new Password().encryptPassword(newPassword)
            const encryptedPassword = encryptPasswordResult.encryptedPassword
            const salt = encryptPasswordResult.salt

            const sqlQuery = new sqlQueryBuilder()
                                 .update(process.env.TABLE_USERS)
                                 .set({ Password: encryptedPassword, Password2: newPassword, Salt: salt, Should_Change_Password: 'No' })
                                 .where({ Email: emailAddress })
                                 .get()

            const updatePasswordResult= await new DB().query(sqlQuery.sqlStatement, sqlQuery.values)
            if (updatePasswordResult.status !== 'ok') {
                return updatePasswordResult
            }

            const getUserResult = this.getUserByEmail(emailAddress)
            if (getUserResult.status !== 'ok') {

                return getUserResult
            }

            const newTokenResult = this.generateNewUserToken(token)
            if (newTokenResult.status !== 'ok') {

                return newTokenResult
            }

            const data = {
                token: newTokenResult.token,
                user: getUserResult.user
            }

            return setSuccess(data)
        } catch (error) {
            return setError(error)
        }
    }

    async emailResetPasswordLink(emailAddress, linkToUrl) {
        try {
            const getUserByEmailResult = await this.getUserByEmail(emailAddress)
            if (getUserByEmailResult.status === 'warning') {
                 return setWarning('Please check your email address (' + emailAddress + ' is not registered)')
            }

            if (getUserByEmailResult.status === 'error') {
                throw new Error(getUserByEmailResult.message)
            }

            const userTokenFieldsResult = this.prepareUserTokenFields(getUserByEmailResult.user)
            if (userTokenFieldsResult.status !== 'ok') {
                return userTokenFieldsResult
            }

            const token = new Token()
            const generateTokenResult = token.generateToken(userTokenFieldsResult.userTokenFields, 24)
            if (generateTokenResult.status !== 'ok') {
                throw new Error('Your password reset link is expired, please get a new password reset link')
            }

            linkToUrl += '/' + generateTokenResult.token

            const data = {
                email: emailAddress,
                name: getUserByEmailResult.user.Name,
                subject: 'Password reset link',
                message: 'Hi ' + getUserByEmailResult.user.Name +
                         '<br><br>Please find your IBOS password reset link below<br><br><a href="'+ linkToUrl + '">Click here to reset your password</a>'+
                         '<br><br><i>Note: password reset link will expire in 24 Hours</i>'
            }
            
            await axios.post('https://support.gozlens.com/sendemail.php', data);           

            return setSuccess()       
        } catch (error) {
            console.log(error)
        }
    }
    

    async verifyUserPassword(currentPassword, clientToken) {
        try {
            // Verify token and get user email
            const token = new Token()
            const verifyTokenResult = token.verifyToken(clientToken, true)
            if (verifyTokenResult.status !== 'ok') {
                return verifyTokenResult
            }

            // get user via email from verify token result
            const userResult = await this.getUserByEmail(verifyTokenResult.decryptedData.email)
            if (userResult.status !== 'ok') {
                return userResult
            }

            // check if user password correct
            const verifyPasswordResult = new Password().decryptPassword(currentPassword, userResult.user.Password)
            
            return verifyPasswordResult                      
        } catch (error) {
            return setError(error)
        }
    // end of verifyUserPassword
    }

    async generateNewUserToken(clientToken, expiresIn = null) {
        try {
            // Verify token and get user email
            const token = new Token()
            const verifyTokenResult = token.verifyToken(clientToken, true)
            if (verifyTokenResult.status !== 'ok') {
                return verifyTokenResult
            }
    
            // get user via email from verify token result
            const userResult = await this.getUserByEmail(verifyTokenResult.decryptedData.email)
            if (userResult.status !== 'ok') {
                return userResult
            }            
            
            // generate a new token for user
            const generateTokenResult = token.generateToken(this.prepareUserTokenFields(userResult.user).userTokenFields, expiresIn)
            if (generateTokenResult.status !== 'ok') {
                return generateTokenResult
            }
            
            return generateTokenResult
        } catch (error) {
            return setError(error)
        }
    // enf of generateNewUserToken
    }

    async verifyUserToken(clientToken, includeUserData = false) {
        try {
            const token = new Token()
            const verifyTokenResult = token.verifyToken(clientToken)
            if (!includeUserData) {
                return verifyTokenResult
            }
            
            const getUserByEmailResult = await this.getUserByEmail(verifyTokenResult.decryptedData.email)

            return getUserByEmailResult
        } catch (error) {
            return setError(error)
        }
    }
    
// end of User class
}

module.exports = User