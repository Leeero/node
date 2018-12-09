const request = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

let url = 'http://cosplay.la/photo/index/0-0-'

/**
 * 生成[n, m]随机数
 * @param {number} min 
 * @param {number} max 
 */
function random(min,max){
  let range = max - min
  let rand = Math.random()
  let num = min + Math.round(rand * range)
  return num
}


async function getUrl() {
  let linkArr = []
  for (let i = 1; i <= 2; i++) {
    const res = await request.get(url + i)
    const $ = cheerio.load(res.text)
    $('.pics li').each(function (i, elem) {
      let link = $(this).find('a').attr('href')
      const href = $(this).find('a').attr('href') //为了展示，纯属好看
      const title = $(this).find('p').text() //为了展示，纯属好看
      console.log(title, href)          //为了展示，纯属好看
      linkArr.push(link)
    })
  }

  return linkArr

}

//获取到单个图片URL后，我们可以通过图片的src属性去拿到真实的图片地址，然后实现下载保存

async function getPic(urls) {
  const res = await request.get('http://cosplay.la'+urls)
  const $ = cheerio.load(res.text)
  // 以图集名称来分目录
  var dir = $('.box_talk h1').text()
  dir = dir.replace(/[\'\"\\\/\b\f\n\r\t]/g, '')
  dir = dir.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/)
  var ss =urls.replace(/[\'\"\\\/\b\f\n\r\t]/g, '').replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/)
  console.log(`创建${ss}文件夹`)
  await fs.mkdir(path.join(__dirname, '/cosplay',ss))
    console.log(111)
    console.log($('.talk_pic p').length)
    console.log(222)
    const pageCount = $('.talk_pic p').length
    // 获取图片的真实地址
    for (let i = 0; i < pageCount; i++) {
      const imgUrl = $('.talk_pic .mbottom10').eq(i).find("img").attr('src')
      console.log(imgUrl)
      download(ss, imgUrl) // TODO
    }
    await sleep(random(1500, 5000))   
}

//实现下载保存图片的方法，这儿我们使用了stream(流) 来保存图片
function download(dir, imgUrl) {
  const uer = imgUrl.split('?')
  console.log(uer[0])
  var bure = uer[0]
  console.log(`正在下载${bure}`)
  const filename = bure.split('/').pop()  
  const req = request.get(bure)
  req.pipe(fs.createWriteStream(path.join(__dirname, 'cosplay', dir, filename)))
}

// sleep函数
function sleep(time) {
  return new Promise(function (resolve, reject) {
      setTimeout(function () {
          resolve()
      }, time)
  })
};

//各个功能的函数连起来
async function init(){
  let urls = await getUrl()
  for (let url of urls) {
    await getPic(url)
  }
}
init()
