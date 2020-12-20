var e = require('express')();
const fetch = require('node-fetch');
var qs = require('querystring');
const cheerio = require('cheerio')
const htmlToText = require('html-to-text');
const fs = require("fs");

var datas = JSON.parse(fs.readFileSync('json/data.json')) ;  // {"items": []}
console.log(datas.items.length);

async function fetchUrl(url) {
	var a = await fetch(url);
	var txt = await a.text();
	const $ = cheerio.load(txt);
	var text = "";
	text = htmlToText.fromString($(".rich_media_content").html(), {
		ignoreHref: true,
		ignoreImage: true,
		noLinkBrackets: true
	});
	var match = /^(http|\*|文\s|作者\s|转载\s|原创\s)/i;
	text = text.split("\n").filter(
		(t) => {
			if (match.test(t.trim())) return false;
			if (t.trim() == "") return false;
			return true;
		}
	).map(v => v.trim());
	console.log(text);

	// console.log(text.join())
	text = text.join().replace(/,/g, ' ');
	var reg = new RegExp(/^([`~!@#$^&*()=|{}':;',\[\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？])/, 'i');
	text = text.split("。").map(v => v.trim().replace(reg, '')).join("。")
	text = text.split("，").map(v => v.trim().replace(reg, '')).join("，")
	// return text.substring(0, 300);
	return text;
}

// 每个历史列表包含10个文章url
async function get_page_0(params) {
	try {
		// params.offset = 0; // 从列表第几个开始
		params.action = "getmsg";
		var str = qs.stringify(params);
		var r = await fetch('https://mp.weixin.qq.com/mp/profile_ext?' + str);
		var json = await r.json();
		var data = JSON.parse(json.general_msg_list).list;
		// data.length = 3; // 控制文章数量，取topN
		var content;
		var url = null;
		for (var i = 0; i < data.length; i++) {
			content = await fetchUrl(data[i].app_msg_ext_info.content_url);
			url = data[i].app_msg_ext_info.content_url.replace(/amp;/g, "").split("?")
			url[1] = qs.parse(url[1]);
			url[1] = {
				__biz: url[1].__biz,
				mid: url[1].mid,
				sn: url[1].sn,
				idx: url[1].idx
			}
			url[1] = qs.stringify(url[1]);

			let title = data[i].app_msg_ext_info.title;
			title = title.replace(/&(l|g|quo)t;/g, function(a,b){
				return {
					l   : '<',
					g   : '>',
					quo : '"'
				}[b];
			})

			datas.items.push({
				id: data[i].comm_msg_info.id,
				title: title,
				link: url.join("?"),
				author: data[i].app_msg_ext_info.author,
				date: getMyDate(data[i].comm_msg_info.datetime * 1000).base,
				content
			})
			console.log(data[i]. app_msg_ext_info.title);

		}
		var str = JSON.stringify(datas);
		fs.writeFileSync("json/data.json", str);
	} catch (e) {
		console.error(e);
	}
}

e.get("*", (req, res) => {
	// console.log(req.originalUrl, req);
	get_page_0(qs.parse(req.originalUrl.substring(1)));
	return fetch('https://mp.weixin.qq.com/mp/profile_ext?action=getmsg' + req.originalUrl.substring(1))
		.then(res => res.json())
		.then(json => res.json(json).end());
});

e.listen(9999);

// 转换日期
function getMyDate(str) {
	var oDate = new Date(str),
		oYear = oDate.getFullYear(),
		oMonth = oDate.getMonth() + 1,
		oDay = oDate.getDate(),
		oHour = oDate.getHours(),
		oMin = oDate.getMinutes(),
		oSen = oDate.getSeconds(),
		oBase = oYear + '/' + oMonth + '/' + oDay,
		oFull = oYear + '/' + oMonth + '/' + oDay + " " + oHour + ":" + oMin + ":" + oSen
	return {
		years: oYear,
		months: oMonth,
		days: oDay,
		hours: oHour,
		minutes: oMin,
		seconds: oSen,
		base: oBase,
		full: oFull,
		ms: oDate.getTime()
	}
}
