const express = require('express');
const util = require('util');
const path = require('path');
const fs = require('fs');
const marked = require('marked');
const blog = require('./utils/blog.js');
const promisifyFs = require('./utils/promisifyFs.js');

const hbs = require('hbs');
const app = express();
const port = 3000;

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('hbs').__express);
hbs.registerPartials(__dirname + '/views/partials');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/blog/:postName', async (req, res) => {
    let data = undefined;
    let postName = req.params.postName;
    try {
        let postFiles = await blog.getPosts();
        let post = await blog.findPostByPostName(postFiles, "postName", postName);
        data = await promisifyFs.readFileAsync(__dirname + `/content/blog/${post.fileName}`, 'utf8');
        res.render('post', {
                content: marked(data)
            }
        );
    } catch {
        res.redirect("/");
    }
});

app.get('/blog', async (req, res) => {
    try {
        let postFiles = await blog.getPosts();
        postFiles = await blog.postSort(postFiles, "publishDate", "desc");
        res.render('blog', {
            posts: postFiles
        });
    } catch {
        res.redirect("/");
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
