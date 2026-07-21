const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/test', (req, res) => {
    res.render('themeTest');
});

app.use((req, res, next) => {
    res.status(404).render('404', {message: 'Oops! Looks like you found yourself in a pickle!'})
});

app.listen(HTTP_PORT, () => {
  console.log(`server listening on: ${HTTP_PORT}`);
});