let inputStr;

$('#submitBtn').on('click', getStr);

function getStr() {
  $(document).ready(function () {
    $('body2').empty()
    inputStr = $("#searchInput").val();
    // for each table result from db queries saved, perform below func
    getResults()
  });
};

function getQueries() {
  const savedQueries = {
    "async": true,
    "crossDomain": true,
    "url": 'https://query-page.onrender.com/api/queries/',
    "method": "GET",
    "headers": {}
  };
$.get(savedQueries, (data) => {
  let stringData = JSON.stringify(data);
  let queryData = JSON.parse(stringData);
  console.log(queryData);
})
}

getQueries()

function getResults() {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": 'https://www.reddit.com/search.json?q=' + inputStr + '&sort=new',
    "method": "GET",
    "headers": {}
  };

  $.get(settings, (data) => {
    let stringData = JSON.stringify(data);
    let results = JSON.parse(stringData);
    console.log(results);

    $.each(results['data']['children'], function (i) {

      $(document).ready(function () {

        jQuery('<div/>', {
          id: "showname" + i,
          class: "showclass",
          text: results['data']['children'][i]['data']['title']
        }).appendTo('body2');

        jQuery('<div/>', {
          id: 'morename' + i,
          class: 'moreclass',
          text: 'view here...'
        }).appendTo($('#showname' + i));

        $('#morename' + i).contents().wrap('<a href=https://www.reddit.com/' + results['data']['children'][i]['data']['permalink'] + '" target="_blank"></a>');

let utcSeconds = results['data']['children'][i]['data']['created']
let newDate = new Date(0);
newDate.setUTCSeconds(utcSeconds)

        jQuery('<div/>', {
          id: "channelname" + i,
          class: "channelclass",
          text: 'Time/Date Posted: ' + newDate
        }).appendTo($("#showname" + i));

      });

    });

  });
}
/*
        jQuery('<div/>', {
          id: "channelname" + i,
          class: "channelclass",
          text: 'Channel: ' + results.contents[i]['video']['channelName']
        }).appendTo($("#showname" + i));

        jQuery('<div/>', {
          id: 'morename' + i,
          class: 'moreclass',
          text: 'watch here...'
        }).appendTo($('#showname' + i));

        $('#morename' + i).contents().wrap('<a href=https://www.youtube.com/watch?v=' + results.contents[i]['video']['videoId'] + '" target="_blank"></a>');

        var img = $('<img />', {
          id: 'imgid',
          src: results.contents[i]['video']['thumbnails'][0]['url']
        }); img.appendTo($('#showname' + i));

        jQuery('<a/>', {
          href: '#',
          id: 'dlname',
          class: 'dlclass' + i
        })
          .text('download')
          .appendTo($('#showname' + i));

        $(".dlclass" + i).click(function () {
          const videoId = results.contents[i]['video']['videoId'];
          getDownload(videoId);
          return false;
        });
      });

      function getDownload(videoId) {
        const settings2 = {
          "async": true,
          "crossDomain": true,
          "url": 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=' + videoId,
          "method": "GET",
          "headers": {
            "X-RapidAPI-Key": "23a647df49msh11266a68daf3297p10456ejsncf98c1f93b4f",
            "X-RapidAPI-Host": "ytstream-download-youtube-videos.p.rapidapi.com"
          }
        };

        $.get(settings2, (data) => {
          let stringData2 = JSON.stringify(data);
          let results2 = JSON.parse(stringData2);
          const url = results2.formats[results2.formats.length - 1].url
          window.open(url, "_blank");
        });
      }*/
