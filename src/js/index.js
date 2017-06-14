import $ from 'jquery'
import 'normalize.css'
import '../css/common.css'
import '../css/iconfont.css'
import '../css/timeline.scss'
import '../css/index.scss'

var audioObject = new Audio()
audioObject.autoPlay = true
audioObject.loop = false

var $album = $(".album")
var $albumList = $(".album-list")
var $play = $(".control .icon-play")
var $pause = $(".control .icon-pause")
var $next = $(".control .next")
var $pre = $(".control .pre")
var $disc = $(".disc")

var timeNode = $('.timeline .time')
var progressBarNode = $('.timeline .progress .bar')

var progressNowNode = $('.timeline .progress-now')

var voiceBarNode = $('.adjust-volume .progress .bar')
var voiceNowNode = $('.adjust-volume .progress-now')

var $lrc = $(".lrc .icon-lrc")
var $dis = $(".lrc .icon-dis")

var $picCt = $("main .pic-ct")
var $lrcCt = $("main .lrc-ct")

var $loop = $(".adjust-loop .icon-loop")
var $random = $(".adjust-loop .icon-random")
var isLoop = false;
// console.log($lrcCt);

var music = {
  channelId: "", //专辑的ID
  atrist: "", //演唱者
  lrc: "", //歌词的下载地址
  picture: "", //歌曲的图片
  sid: "", //歌词的 ID
  title: "", //歌曲的标题
  url: "", //歌曲的地址
}

//页面加载完成即获取随机音乐
$(function(){
  getMusicRandom()
})

//点击获取专辑按钮
$album.on("click", function() {
  getMusicAlbum()
  $albumList.toggleClass("hidden")
})

//给专辑的每个列表绑定点击获取随机音乐事件
$album.on("click", "li", function(e) {
  e.stopPropagation();
  var id = $(this).data("channel-id")
  music.channelId = id;
  // console.log(id);
  getMusicRandom(music.channelId) //根据 id 获取随机音乐
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
  $albumList.addClass("hidden")
})

//点击获取下一首，本专辑内
$next.on("click", function() {
  getMusicRandom(music.channelId)
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
})

//点击获取上一首，本专辑内
$pre.on("click", function() {
  getMusicRandom(music.channelId)
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
})

//点击播放按钮，变成暂停状态
$play.on("click", function() {
  audioObject.pause()
  $play.css("display", "none")
  $pause.css("display", "flex")
  $disc.removeClass("active")
})

//点击暂停按钮，变成播放状态
$pause.on("click", function() {
  audioObject.play()
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
})

//点击进度条，调整播放时间
progressBarNode.on("click", function(e) {
  // console.log("clicked");
  // console.log($(this).width());
  var percent = e.offsetX / parseInt($(this).width())
  audioObject.currentTime = percent * audioObject.duration
  progressNowNode.width(percent * 100 + "%")
})

//播放时候触发函数
audioObject.ontimeupdate = function() {
  setProgress() //设置进度条
  setTimeNode() //设置播放时间
  setVoice() //设置当前音量
  slideLrc() //滑动歌词
  if(audioObject.ended && isLoop){
    audioObject.loop = true;
    audioObject.play()
  }
  if(audioObject.ended && !isLoop){
    audioObject.loop = false
    getMusicRandom(music.channelId)
  }

}

//设置音量
voiceBarNode.on("click", function(e) {
  var percent = e.offsetX / parseInt($(this).width())
  audioObject.volume = percent
  voiceNowNode.width(percent * 100 + "%")
})

//点击显示歌词
$lrc.on("click", function() {
  $lrc.css('display', 'none')
  $dis.css('display', 'inline-block')
  $picCt.css('display', 'none')
  $lrcCt.css('display', 'flex')
})

//点击显示唱片
$dis.on("click", function() {
  $lrc.css('display', 'inline-block')
  $dis.css('display', 'none')
  $picCt.css('display', 'flex')
  $lrcCt.css('display', 'none')
})

//点击设置为随机播放
$loop.on("click", function(){
  $loop.css("display","none")
  $random.css("display","inline-block")
  isLoop = false;
})

//点击设置为循环播放
$random.on("click", function(){
  $random.css("display","none")
  $loop.css("display","inline-block")
    isLoop = true;
})

//获取音乐专辑
function getMusicAlbum() {
  $.ajax({
    type: 'get',
    url: "https://jirenguapi.applinzi.com/fm/getChannels.php",
    dataType: "json",
  }).then((data) => {
    appendMusicAlbum(data);
  }, (error) => {
    alert('获取专辑失败');
  })
}

//渲染音乐专辑
function appendMusicAlbum(data) {
  var albumString = ""
  // console.log(data);
  data.channels.forEach((item) => {
    albumString += `<li data-channel-id = ${item.channel_id}> ${item.name} </li>`
  })

  $albumList.html(albumString);
  //...............
}

//获取随机音乐
function getMusicRandom(id) {
  var id = id || 'public_yuzhong_huayu' //如果没有专辑id,默认为华语专辑
  var musicUrl = "https://jirenguapi.applinzi.com/fm/getSong.php?channel=" + id
  // console.log(musicUrl);
  $.ajax({
    type: 'get',
    url: musicUrl,
    dataType: "json",
  }).then((data) => {
    //console.log(data);
    appendMusicInfo(data);
    getLrc()
  }, (error) => {
    alert('音乐播放失败')
  })
}

//渲染音乐信息
function appendMusicInfo(data) {
  //console.log(data.song[0]);
  music.artist = data.song[0].artist
  music.lrc = data.song[0].lrc
  music.picture = data.song[0].picture
  music.sid = data.song[0].sid
  music.title = data.song[0].title
  music.url = data.song[0].url
  //console.log(music);
  var musicDetail =
    `<p> <h3>atrist</h3> ${music.atrist} <p>
    <p> <h3>lrc</h3> ${music.lrc} </p>
    <p> <h3>picture</h3> ${music.picture}</p>
    <p> <h3>sid</h3> ${music.sid} </p>
    <p> <h3>title</h3> ${music.title} </p>
    <p> <h3>url</h3> ${music.url} </p>
    `
  // $musicInfo.html(musicDetail)
  $("main>h2").text(music.title)
  $("main>p").text(music.artist)
  $("main .pic").html(`<img src="${music.picture}">`)
  $lrcCt.css({
    "background-image": `url(${music.picture})`,
    "background-size": `cover`,
    "background-repeat":`no-repeat`,
    "background-position": `center`,
    "box-shadow": `inset 0px 0px 20px #fff`
  })
  audioObject.src = music.url
  audioObject.play()

}

//获取歌词
function getLrc() {
  var lrcUrl = "https://jirenguapi.applinzi.com/fm/getLyric.php?&sid=" + music.sid;
  // console.log(lrcUrl);
  $.ajax({
    type: 'get',
    url: lrcUrl,
    dataType: "json",
  }).then((data) => {
    // console.log(data);
    arrLic(data); //把歌词做成一个二维数组
  }, (error) => {
    alert('歌词获取失败')
  })
}

//把歌词做成一个二维数组
function arrLic(data) {
  var lyricArr = [];
  var lyric = data.lyric
  // console.log(typeof lyric);
  var lines = lyric.split("\n")
  // console.log(lines);
  var timeRegular = /\[\d{2}:\d{2}\.\d{2}\]/g
  lines.forEach((item) => {
    if (!timeRegular.test(item)) {
      lines.splice(item, 1)
      return;
    }
    var time = item.match(timeRegular)
    // console.log(time[0]);
    // console.log(typeof time[0]);
    // console.log(time[0][1]);
    var lyric = item.split(time)
    // console.log(lyric);
    var seconds = time[0][1] * 600 + time[0][2] * 60 + time[0][4] * 10 + time[0][5] * 1
    // console.log(seconds);
    lyricArr.push([seconds, lyric[1]])
    // console.log(lyricArr);
  })
  appendLic(lyricArr) //渲染歌词
}

function appendLic(lyricArr) {
  var lyricLength = 0;
  var html = `<div class="lyric-ani" data-height="20">`;
  lyricArr.forEach((element, index) => {
    var ele = element[1] === undefined ? '歌词错误^_^' : element[1];
    html += `<p class="lyric-line" data-id="${index}"  data-time="${element[0]}" > ${ele} </p> \n`
    lyricLength++;
  })
  html += `</div>`
  // console.log(html);
  // console.log(lyricLength);
  $lrcCt.html(html)
  // onTimeUpdate(lyricLength);
}

// function onTimeUpdate(lyricLength){
//   // console.log($lrcCt);
//   var lyricAni = $(".lyric-ani")
//   // console.log(lyricAni);
//   var lyricH = lyricAni.data("height")
//   // console.log($lrcCt);
//   var lyricP = $lrcCt.find('.lyric-ani p');
//   // console.log(lyricP);
//   var curTime = audioObject.currentTime;
//   var content = audioObject.duration;
// }



//设置进度条
function setProgress() {
  var timeGo = (audioObject.currentTime / audioObject.duration) * progressBarNode.width()
  progressNowNode.width(timeGo)
}

//设置剩余时间显示
function setTimeNode() {
  var minute = parseInt(audioObject.currentTime / 60)
  var second = parseInt(audioObject.currentTime % 60)
  var minuteTotal = parseInt(audioObject.duration / 60)
  var secondTotal = parseInt(audioObject.duration % 60)

  if (second < 10) {
    second = "0" + second
  }

  if(secondTotal < 10){
    secondTotal="0"+secondTotal
  }

  if(isNaN(secondTotal)){
    secondTotal = "00"
  }

  if(isNaN(minuteTotal)){
    minuteTotal = "00"
  }

  // console.log(second);
  timeNode.text(minute + ":" + second +" / "+ minuteTotal+":"+secondTotal)
}

//设置音量条的长度
function setVoice() {
  var voice = audioObject.volume
  // console.log(voice);
  voiceNowNode.width(voice * 100 + "%")
}

//设置歌词滚动
function slideLrc() {
  //............根据时间滚动歌词
  // console.log($lrcCt);
  var lyricAni = $(".lyric-ani")
  // console.log(lyricAni);
  // var lyricH = lyricAni.data("height")
  var lyricH = lyricAni.find("p").height()
  // console.log(lyricH);
  var lyricP = $lrcCt.find('.lyric-ani p');
  // console.log(lyricP);
  var curTime = audioObject.currentTime;
  var content = audioObject.duration;
  // console.log(lyricP.length);
  for (var i = 0; i < lyricP.length; i++) {
    var curT = lyricP.eq(i).data("time")
    var nexT = lyricP.eq(i + 1).data("time")
    if ((curTime > curT) && (curTime < nexT)) {
      lyricP.eq(i).addClass("active");
    }
    if (curTime > nexT) {
      lyricP.removeClass('active');
      lyricAni.css({
        'height': lyricH * lyricP.length + 'px',
        'marginTop': -parseInt(lyricH * i - 100) + 'px',
        "transition": "2s"
      });
    }
  }

}
