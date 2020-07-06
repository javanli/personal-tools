var argv = require('yargs').argv;
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var TurndownService = require('turndown');
var turndownService = new TurndownService({ codeBlockStyle: 'fenced' });
var fs = require('fs');
const { head } = require('request');
console.log('example: node exportToGithubIssue.js --id segmentfault --token xxxxx --user xxx --repo xxx --proxy http://xxx:xxx');
if (argv.id) {
    globalID = argv.id;
}

if (argv.token) {
    token = argv.token;
}
if (argv.user) {
    user = argv.user;
}
if (argv.repo) {
    repo = argv.repo;
}
if (argv.proxy) {
    proxy = argv.proxy;
}
turndownService.addRule('img', {
    filter: function (node, options) {
        return (
            node.nodeName === 'IMG' && node.getAttribute('data-src')
        )
    },
    replacement: function (content, node) {
        console.log(content);
        return `![${node.getAttribute('title')}](https://segmentfault.com${node.getAttribute('data-src')})`
    }
})
async function requestAsync(value) {
    return new Promise((resolve, reject) => {
        request(value, (error, response, data) => {
            if (error) reject(error)
            else resolve(data)
        })
    })
}
async function create_issue(title, body, token, user, repo) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`,
        'User-Agent': 'javanli-blog-export'
    }
    let params = {
        'title': title,
        'body': body
    }
    let res = await requestAsync({
        headers: headers,
        method: 'POST',
        json: params,
        proxy: proxy ? proxy : '',
        url: `https://api.github.com/repos/${user}/${repo}/issues`
    })
    console.log(res)
}
async function main() {
    let articleURLs = [];

    let page = 1;
    let currentPageArticles = 0;
    console.log(`fetch article urls : ${globalID}`);
    do {
        let rootURL = `https://segmentfault.com/blog/${globalID}?page=${page}`;
        let res = await requestAsync(rootURL);
        const rootPage = new JSDOM(res);
        const articleElements = rootPage.window.document.querySelectorAll(".summary .title a");
        currentPageArticles = articleElements.length;
        for (let articleElement of articleElements) {
            articleURLs.unshift('https://segmentfault.com/' + articleElement.getAttribute('href'));
        }
        console.log(`page ${page} has ${currentPageArticles} articles`);
        page++;
    }
    while (currentPageArticles > 0);
    var i = 1;
    for (let articleURL of articleURLs) {
        let res = await requestAsync(articleURL);
        const articlePage = new JSDOM(res);
        let title = articlePage.window.document.querySelector("h1.h2 a.text-body").textContent;
        title = title.replace('/','-');
        let contentHTML = articlePage.window.document.querySelector("article.article.fmt.article-content").innerHTML;
        let markdown = turndownService.turndown(contentHTML);
        await create_issue(title,markdown,token,user,repo);
        console.log(`${i}/${articleURLs.length}:${title}`);
        i++;
    }
}
main();