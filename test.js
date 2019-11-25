var mong = require('mongoose')
var url = 'mongodb://eodiro:weloveeodiro2019@localhost:27017/eodiro_db'
mong.connect(url,{

	useUnifiedTopology: true,
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true

    })
