export const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
}

export const headers = (req, res, next) => {
	/*const origin = (req.headers.origin == 'http://localhost:9500') ? 'http://localhost:9500' : 'https://mywebsite.com'
	res.setHeader('Access-Control-Allow-Origin', origin)
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	res.setHeader('Access-Control-Allow-Credentials', true)*/
	next()
}

