import $ from 'jquery'
import 'normalize.css'
import '../css/common.css'
import '../css/iconfont.css'
import '../css/timeline.scss'
import '../css/index.scss'

var audioObject = new Audio()
audioObject.autoPlay = true

var $album = $(".album")
var $albumList = $(".album-list")
var $play = $(".control .icon-play")
var $pause = $(".control .icon-pause")
var $next = $(".control .next")
var $pre = $(".control .pre")
var $disc = $(".disc")



var music = {
  channelId: "", //专辑的ID
  atrist: "", //演唱者
  lrc: "", //歌词的下载地址
  picture: "", //歌曲的图片
  sid: "", //歌词的 ID
  title: "", //歌曲的标题
  url: "", //歌曲的地址
}

$(getMusicRandom)

//点击获取专辑按钮
$album.on("click", function(){
  getMusicAlbum()
  $albumList.toggleClass("hidden")
})

//给专辑的每个列表绑定点击获取随机音乐事件
$album.on("click", "li", function(e) {
  e.stopPropagation();
  var id = $(this).data("channel-id")
  music.channelId = id;
  console.log(id);
  getMusicRandom(music.channelId) //根据 id 获取随机音乐
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
  $albumList.css('display', 'none')
})

$next.on("click", function(){
  getMusicRandom(music.channelId)
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
})

$pre.on("click", function(){
  getMusicRandom(music.channelId)
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
})

$play.on("click", function() {
  audioObject.pause()
  $play.css("display", "none")
  $pause.css("display", "flex")
  $disc.removeClass("active")
})

$pause.on("click", function() {
  audioObject.play()
  $pause.css("display", "none")
  $play.css("display", "flex")
  $disc.addClass("active")
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
  var musicUrl = "https://jirenguapi.applinzi.com/fm/getSong.php?channel=" + id
  //console.log(url);
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
    console.log(data);
    appendLic(data);
  }, (error) => {
    alert('歌词获取失败')
  })
}

//渲染歌词
function appendLic(data) {
  $("main>pre").html(data.lyric)
}
