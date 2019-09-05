# 利用腾讯云cos搭建的静态博客，顺便用下SCF更新

## 前置条件
1. 申请腾讯云账号，开通一个免费cos [对象存储 COS_云存储服务_安全存储服务 - 腾讯云](https://cloud.tencent.com/product/cos)
2. 新建一个存储桶

## 用法
1. fork仓库，然后```npm i```
2. 根目录新建cos_config.json，内容参照cos_config_sample.js
3. ```cd blog && hexo new "new post title"```
4. 找到```blog/public/source/_posts```下的post，用MD语法写post
5. 跑```npm run localPublish``` 或者 ```npm run remotePublish```