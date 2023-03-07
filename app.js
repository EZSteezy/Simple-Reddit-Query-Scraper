let inputStr;
let queryArr = [];

$('#submitBtn').on('click', getStr);
$('#submitBtn2').on('click', postQuery);

function getStr() {
  $(document).ready(function () {
    $('body2').empty()
    //inputStr = $("#searchInput").val();
    // for each table result from db queries saved, perform below func
    for (let i = 0; i < queryArr.length; i++) {
      inputStr = queryArr[i];
      getResults()
    }
    //getResults()
  });
};
function postQuery() {
  var queryStr = $("#queryInput").val();
  var queryObj = { "query": queryStr };

  $.post('https://query-page.onrender.com/api/queries/', queryObj, function (response) {
    console.log(response);
    console.log(queryObj);
  });
}

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


    $.each(queryData, function (i) {
      $(document).ready(function () {
        $("#saved-queries").append("<div>" + queryData[i]['query'] + "</div>");
        queryArr.push(queryData[i]['query'])
      })
    })
    console.log(queryArr)
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
        let id = results['data']['children'][i]['data']['id']
        jQuery('<div/>', {
          id: id,
          class: "showclass",
          text: results['data']['children'][i]['data']['title']
        }).appendTo('body2');

        jQuery('<div/>', {
          id: 'morename' + id,
          class: 'moreclass',
          text: 'view here...'
        }).appendTo($('#' + id));

        $('#morename' + id).contents().wrap('<a href=https://www.reddit.com/' + results['data']['children'][i]['data']['permalink'] + '" target="_blank"></a>');

        let utcSeconds = results['data']['children'][i]['data']['created']
        let newDate = new Date(0);
        newDate.setUTCSeconds(utcSeconds)

        jQuery('<div/>', {
          id: "channelname" + i,
          class: "channelclass",
          text: 'Time/Date Posted: ' + newDate
        }).appendTo($("#" + id));

      });

    });

  });
}