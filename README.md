# react-ssr 服务器渲染demo

## 1. 快速使用

### 1.1 安装依赖包

``` js
npm install
```

### 1.2 运行项目

在开发环境下，执行：

``` js
npm run dev
```

在生产环境下，执行：

``` js
npm run build //先打包

npm start //最后运行
```

## 2. 目录说明：

``` text
├── README.md
├── app.js                        // 主要程序入口、路由、接口处理，缓存设置等
├── config                        // 配置目录
│   └── index.js                  // 配置文件
├── next.config.js                // next.js配置文件
├── package-lock.json
├── package.json
├── pages                         // next.js路由目录
│   └── index.js                  // react首页组件
└── static                        // express和next.js静态文件目录
    └── index.css

```

## 3. app.js 程序入口说明

1. 配置next.js和express
2. express设置/根目录的响应
3. express设置/list接口的响应
4. 如果访问域名在缓存中存在则使用缓存，没有则生成一个

PS：更详细参照源码的app.js注释说明

> 缓存规则：域名路径为key，如访问域名127.0.0.1:3000，则key为`/`

## 4. pages/index.js React组件说明

### getInitialProps

当加载页面获取数据的时候，我们使用了一个异步(async)的静态方法 getInitialProps。
此静态方法能够获取所有的数据，并将其解析成一个 JavaScript对象，然后将其作为属性附加到 props对象上。

```js
  static async getInitialProps({ query, err, req, res }) {}
```

getInitialProps的参数

- pathname - URL的 path部分
- query - URL的 query string部分，并且其已经被解析成了一个对象
- asPath - 在浏览器上展示的实际路径(包括 query字符串)
- req - HTTP request 对象 (只存在于服务器端)
- res - HTTP response 对象 (只存在于服务器端)
- jsonPageRes - 获取的响应数据对象 Fetch Response (只存在于客户端)
- err - 渲染时发生错误抛出的错误对象

## next.js的基本原理

getInitialProps()能够在服务端的运行，也能够在客户端运行。

当页面第一次加载时，服务器收到请求，getInitialProps()会执行，getInitialProps()返回的数据，会序列化后添加到 `window.__NEXT_DATA__.props`上，写入HTML源码里，类似于<script>window.__NEXT_DATA__={props:{xxx}}</script>。这样服务端的getInitialProps()就实现了把数据传送给了客户端。

客户端的收到了HTML源码，有了数据，想做什么都可以。比如可以拿着window.__NEXT_DATA__.props的数据来初始化React组件的props属性。具体过程如下：当页面是用户通过超链接跳转过去，而不是用户输入网址或刷新来访问的，这时候是纯客户端的行为，没有HTTP请求发出去。用户如果通过超链接跳转回这个页面，客户端的getInitialProps()开始起作用了，它会自动读取HTML源码里 window.__NEXT_DATA__.props里的数据并作为React组件的props。

[next.js的基本原理出处](https://www.zhihu.com/question/54877807/answer/269123325)

## 参考

[react-next](https://github.com/hyy1115/react-next)

[Next.js中文文档](https://github.com/accforgit/DayLearnNote/blob/master/translation/Next.js-README.md)