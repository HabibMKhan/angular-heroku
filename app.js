var express = require('express');
let cors = require('cors');

var app = express();
app.use(express.static(__dirname + '/app'));
app.use(cors({credentials: true}));

app.listen(process.env.PORT || 3000);
