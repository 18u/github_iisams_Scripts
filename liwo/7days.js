/*【Loon 2.1+ 脚本配置】
 * 梨涡app： https://bit.ly/33BRwHW
 * [Script]
 *
 *梨涡签到领现金
 *cron "7 0 * * *" script-path=https://raw.githubusercontent.com/iisams/Scripts/master/liwo/7days.js,tag=梨涡签到领现金
 *http-request https:\/\/api\.m\.jd\.com\/api\/v1\/sign\/doSign script-path=https://raw.githubusercontent.com/iisams/Scripts/master/liwo/7dayscookie.js, requires-body=true, timeout=10, tag=梨涡签到领现金Cookie
 *
 *[MITM]
 *
 *hostname = api.m.jd.com
 */

 //支持QX loon surge

const sams = init()
const lwKey = 'CookieJD'
const lwVal = sams.getdata(lwKey)
const lwbodyKey = "Body"
const lwbody = sams.getdata(lwbodyKey)
const option = {"open-url":"yocial://webview/?url=https%3A%2F%2F2do.jd.com%2Fevents%2F7-days%2F%23%2F&login=1"}
const option2 = {"open-url":"yocial://webview/?url=https%3A%2F%2Flwxianshi.jd.com%2FidleHours%2Findex.html%23%2Fwallet&login=1"}

const headers = {"Accept": "application/json, text/plain, */*","Accept-Encoding": "gzip, deflate, br","Accept-Language": "zh-cn","Connection": "keep-alive","Content-Length": "246","Content-Type": "application/x-www-form-urlencoded","Cookie": lwVal,"Host": "api.m.jd.com","Origin": "https://2do.jd.com","Referer": "https://2do.jd.com/events/7-days/","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/yocial,"}

const nowtime = Date.now()
const changebody = lwbody.replace(/(&t=)\d*/,"&t=" + nowtime)
const resetboody =  changebody.replace(/v1_sign_doSign/,"v1_sign_resetSign")
sams.log("刷新时间成功 "+"Time:" + nowtime )

var params = {
    url:"https://api.m.jd.com/api/v1/sign/doSign",
    headers:headers,
    body:changebody
}

var resetparams = {
    url:"https://api.m.jd.com/api/v1/sign/resetSign",
    headers:headers,
    body:resetboody
}

var moneyparams = {
    url:"https://ms.jr.jd.com/gw/generic/bt/h5/m/queryUserAccount",
    headers:headers
}
var money = ''

getmoney()
sign()

function getmoney() {
  return new Promise((resolve) => {
    sams.get(moneyparams,
    (error,reponse,data) => {
      try {
        data = JSON.parse(data);
        sams.log(data)
        if (data.resultCode == 0) {
        money += data.resultData.data.amount
        }
       else{money +=`获取失败`}
      } catch (e) {
        sams.log(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}

function sign(){
    sams.post(params,
    (error,reponse,data)=>{
      let result = JSON.parse(data)
      sams.log(result)
      let title = `☺️梨涡签到领现金`
      // 签到OK
      if (result.status == true) {
         let subTitle = `💚签到成功`
         let detail = "✅" +result.data.message + "💰钱包 "+money+"元"
         sams.msg(title,
             subTitle, detail, option2)
         sams.log(detail)
      }
      //签过到了
      else if (result.status == false && result.error.code == 39002) {
         let subTitle = `💛您已签到`
         let detail = "❕" +result.error.message+ "💰钱包 "+money+"元"
         sams.msg(title,
             subTitle, detail, option2)
         sams.log(detail)
      }
     else if (result.status == false && result.error.code == 1007) {
         let subTitle = `😈登陆失效，点击通知签到重新获取cookie`
         let detail = "❕" +result.error.message
         sams.msg(title,
             subTitle, detail, option)
         sams.log(detail)
      }
      //重新新一轮签到
      else if (result.status == false  && result.error.code == 39004) {
        setTimeout(resetSign(),500)
        sams.log("重新新一轮签到")
       }
      //失败
      else {
         let subTitle = `💔失败详情`
         let detail = "❗" +result
         sams.log(detail)
         sams.msg(title,
             subTitle, detail)
      }
   })
}


function resetSign(){
  sams.post(resetparams,
      (error,reponse,data)=>{
        let result = JSON.parse(data)
        sams.log(result)
        let title = `☺️梨涡签到领现金`
        // 签到OK
        if (result.status == true) {
           let subTitle = `💚(Reset)签到成功`
           let detail = "✅" +result.data.message+ "💰钱包 "+money+"元"
           sams.msg(title,
               subTitle, detail, option2)
           sams.log(detail)
        }
        //签过到了
        else if (result.status == false ) {
           let subTitle = `💛(Reset)您已签到`
           let detail = "❕" +result.error.message+ "💰钱包 "+money+"元"
           sams.msg(title,
               subTitle, detail, option)
           sams.log(detail)
        }
        //失败
        else {
           let subTitle = `💔失败详情`
           let detail = "❗" +result
           sams.log(detail)
           sams.msg(title,
               subTitle, detail)
        }
     })
}
 
function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body, option) => {
    if (isSurge()) $notification.post(title, subtitle, body, option["open-url"])
    if (isQuanX()) $notify(title, subtitle, body, option)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return {
    isSurge,
    isQuanX,
    msg,
    log,
    getdata,
    setdata,
    get,
    post,
    done
  }
}
$done({})
