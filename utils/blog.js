const fs = require('fs');
const path = require('path');
const promisifyFs = require('./promisifyFs.js');
const postsDir = path.normalize(__dirname + "/../content/blog");

/*
    All helpers related to blogging.
*/

module.exports.postsDir = postsDir;

/*
    Sort posts based on the key supplied. Supports both descending and acsending order.
*/

const postSort = function (posts, key, order) {
    let sortFunction = order == "desc"
    ? (a, b) => { return b[key] - a[key] }
    : (a, b) => { return a[key] - b[key] };

    posts.sort(sortFunction);
    return posts;
};

module.exports.postSort = postSort;

/*
    Get the posts from the file system located at postsDir
*/

const getPosts = async function () {
    let postsFileNames = await promisifyFs.readdirAsync(postsDir);
    return postsFileNames.map(fileName => {
        /*
            A blog post date is the first 3 parts of the dash separted post file name.
            Extract these into a string with a forward slash separator between the date parts.
            This is later converted into a javascript date using the Date class.
            Slashes are used because the Date class is funky.
            e.g. "2018-02-23 to 2018/02/23"
        */
        let date = new Date(fileName.split("-")
            .slice(0, 3)
            .toString()
            .replace(/-/g, '\/'));

        /*
            A blog post name is ever part of the dash separted post file name except the first 3 parts which is the date.
            Strip out the date and .md from the file name but keep the dash separators between the file parts.
            This is used for locating the blog post within the system using findPostByPostName().
            e.g. "first-post"
        */
        let postName = fileName.split("-")
            .slice(3)
            .toString()
            .replace(/,/gi, "-")
            .split(".")[0];

        /*
            A blog post title is the post name but with the dashes stripped out and replaced with spaces with each part capitalized.
            e.g. "First Post"
        */
        let title = postName.split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .toString()
            .replace(/,/gi, " ");

        return {
            title: title,
            postName: postName,
            publishDate: date,
            fileName: fileName,
        };
    });
};

module.exports.getPosts = getPosts;

/*
    Find the post based on the key and the value passed in from posts gathered by getPosts()
*/

const findPostByPostName = async function(posts, key, value) {
    return posts.find(post => post[key] == value);
}

module.exports.findPostByPostName = findPostByPostName;
