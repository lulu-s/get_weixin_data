# 微信公众号历史文章爬取


## 步骤一：按键精灵 [下载](https://dl.pconline.com.cn/html_2/1/59/id=2598&pn=0.html "下载") 如不需要自动化可忽略
* 利用按键精灵软件生成一套按键list
* 保存到script.txt
* 执行 `node mouse.js`

## 步骤二：Fiddler Everywhere [下载](https://www.telerik.com/download/fiddler/fiddler-everywhere-osx "下载")
* Settings -> HTTPS -> 勾选 `Capture HTTPS traffic` 
* 打开浏览器输入 `http://ip:8866`，下载证书并双击安装（在电脑端抓包），端口号根据 Fiddler Config
* 开启 `Auto Responder` -> Add New Rule -> 
    * MATCH: `regex:https://mp.weixin.qq.com/mp/profile_ext\?action\=getmsg(\w*)` 
    * ACTION: `http://localhost:9999/`

## 步骤三：proxy
```
    node main.js
```

## 步骤四：滑动微信公众号历史列表

## 步骤五: test