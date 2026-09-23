const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

// where contact form messages are delivered
const CONTACT_TO = 'judytramnguyen@gmail.com';

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.get('/', (req, res) => {
    res.render('home', { sent: req.query.sent || null });
});

app.get('/test', (req, res) => {
    res.render('themeTest');
});

app.post('/contact', async (req, res) => {
    const { name = '', email = '', message = '', website = '' } = req.body || {};

    // honeypot: hidden from people, commonly filled in by bots
    if (website.trim()) {
        return res.redirect('/?sent=ok#contact');
    }

    const contact = {
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 254),
        message: message.trim().slice(0, 5000),
    };

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
    if (!contact.name || !contact.message || !emailLooksValid) {
        return res.redirect('/?sent=invalid#contact');
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('contact form: GMAIL_USER / GMAIL_APP_PASSWORD are not set');
        return res.redirect('/?sent=error#contact');
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: { name: 'Portfolio contact form', address: process.env.GMAIL_USER },
            to: CONTACT_TO,
            replyTo: { name: contact.name, address: contact.email },
            subject: `Portfolio Website - message from ${contact.name}`,
            text: `Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}\n`,
        });

        res.redirect('/?sent=ok#contact');
    } catch (err) {
        console.error('contact form: could not send message', err);
        res.redirect('/?sent=error#contact');
    }
});

app.use((req, res, next) => {
    res.status(404).render('404', {message: 'Oops! Looks like you found yourself in a pickle!'})
});

app.listen(HTTP_PORT, () => {
  console.log(`server listening on: ${HTTP_PORT}`);
});
