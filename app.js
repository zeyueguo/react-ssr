const express = require('express')
const next = require('next')
const compression = require('compression')
const LRUCache = require('lru-cache')
const path = require('path')
const config = require('./config')
// const log4js = require('log4js')
const axios = require('axios');
const _ = require('lodash');

// const port = parseInt(process.env.PORT, 10) || 3000
const port = config.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// 缓存设置
const ssrCache = new LRUCache({
    max: 100,
    maxAge: 1000 * 60 * 60 // 1hour
})

function headers() {
    return {
        'Content-type': 'application/json',
    };
}

app.prepare()
    .then(() => {
        const server = express()
        const staticDir = path.resolve(__dirname, '.next/static')
        // 设置gzip
        server.use(compression())
        // 设置静态目录
        server.use('/_next/static', express.static(staticDir))
        // express设置/根目录的响应
        server.get('/', (req, res) => {
            // 请求/list接口获取图片列表
            axios({
                url: 'http://127.0.0.1:3000/list',
                headers: headers(),
                timeout: 8000
            }).then((response) => {
                if (response.data) {
                    const queryParams = { data: response.data }
                    // 1.使用缓存 renderAndCache
                    return renderAndCache(req, res, '/', queryParams)
                    // 2. 不使用缓存 app.render(req, res, '/', queryParams)
                }
                else {
                    return app.render(req, res, '/_error', req.query)
                }
            }).catch(function (error) {
                console.log(error);
                return app.render(error, req, res, '/_error', req.query)
            });
        })
        // express设置/list接口的响应
        server.get('/list', (req, res) => {
            res.setHeader('content-type', 'application/json');
            return res.json([
                { image: "https://zos.alipayobjects.com/rmsportal/DGOtoWASeguMJgV.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/BXJNKCeUSkhQoSS.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/TDIbcrKdLWVeWJM.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/SDLiKqyfBvnKMrA.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/UcVbOrSDHCLPqLG.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/QJmGZYJBRLkxFSy.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/PDiTkHViQNVHddN.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/beHtidyjUMOXbkI.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/vJcpMCTaSKSVWyH.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/dvQuFtUoRmvWLsZ.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/QqWQKvgLSJaYbpr.png" },
                { image: "https://zos.alipayobjects.com/rmsportal/pTfNdthdsUpLPLJ.png" }
            ]);
        })

        server.get('*', (req, res) => {
            return handle(req, res)
        })

        server.listen(port, (err) => {
            if (err) throw err
            console.log(`> Ready on http://localhost:${port}`)
        })
    })


function renderHtml(req, res, pagePath, queryParams, key) {
    // 无缓存，重新渲染
    app.renderToHTML(req, res, pagePath, queryParams)
        .then((html) => {
            // 缓存页面
            console.log(`CACHE MISS: ${key}`)
            // console.log(queryParams.data);
            ssrCache.set(key, {
                data: queryParams.data,
                html
            })
            res.send(html)
        })
        .catch((err) => {
            app.renderError(err, req, res, pagePath, queryParams)
        })
}
function renderAndCache(req, res, pagePath, queryParams) {
    const key = `${req.url}`
    // 如果访问域名在缓存中存在则使用缓存，没有则生成一个
    if (ssrCache.has(key)) {
        console.log(`CACHE HIT: ${key}`)
        // console.log(queryParams.data);
        const cachedata = ssrCache.get(key);
        // 执行深比较来决定两者的值是否相等
        if (_.isEqual(cachedata.data, queryParams.data)) {
            res.send(ssrCache.get(key).html)
        }
        else {
            renderHtml(req, res, pagePath, queryParams, key)
        }
        return
    } else {
        renderHtml(req, res, pagePath, queryParams, key)
    }
}