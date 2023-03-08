let inputStr;
let queryArr = [];
let allResultsCount = 0;

$('#submitBtn').on('click', getStr);
$('#submitBtn2').on('click', postQuery);
$('#submitBtn3').on('click', deleteQuery);
getQueries()

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
        $("#saved-queries").append("<div>" + queryData[i]['query'] + ' | ID: ' + queryData[i]['id'] + "</div>");

        queryArr.push(queryData[i]['query'])
      })
    })
    console.log(queryArr)
  })

}

function getStr() {
  $(document).ready(function () {
    $('body2').empty()
    for (let i = 0; i < queryArr.length; i++) {
      inputStr = queryArr[i];
      getResults(inputStr)
    }
  });
};

function postQuery() {
  var query = $("#queryInput").val();
  var data = JSON.stringify({ "query": query });

  $.post({
    url: "https://query-page.onrender.com/api/queries/",
    data: data,
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      console.log(response);
      console.log(data);
      console.log(query);
      location.reload()
    },
    error: function (xhr, status, error) {
      console.log("Error: " + error);
    }
  });

}

function deleteQuery() {
  var queryId = $("#queryInput").val();

  $.ajax({
    url: "https://query-page.onrender.com/api/queries/" + queryId,
    type: "DELETE",
    success: function (response) {
      console.log(response);
      console.log(queryId);
      location.reload()
    },
    error: function (xhr, status, error) {
      console.log("Error: " + error);
    }
  });

}

function getResults(inputStr) {
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
    allResultsCount++;
    // Create a new div to hold all the results
    const allResultsId = 'allResults-' + inputStr + '-' + allResultsCount;
    const $allResults = $('<div>', { id: allResultsId, class: 'allResults' });
    $allResults.append('<p>Results for: ' + inputStr + '</p>');

    $.each(results['data']['children'], function (i) {

      // Create a new div for each individual result
      const $resultDiv = $('<div>', {
        id: results['data']['children'][i]['data']['id'],
        class: "titleclass",
        text: results['data']['children'][i]['data']['title']
      });

      // Append the "view here..." link to the individual result div
      const $moreLink = $('<div>', {
        id: 'morename' + results['data']['children'][i]['data']['id'],
        class: 'moreclass',
        text: 'view here...'
      });
      $moreLink.appendTo($resultDiv);
      $moreLink.contents().wrap('<a href=https://www.reddit.com/' + results['data']['children'][i]['data']['permalink'] + '" target="_blank"></a>');

      // Append the time/date posted to the individual result div
      const utcSeconds = results['data']['children'][i]['data']['created'];
      const newDate = new Date(0);
      newDate.setUTCSeconds(utcSeconds);
      const $postTime = $('<div>', {
        id: "postTime" + i,
        class: "postTimeclass",
        text: 'Time/Date Posted: ' + newDate
      });
      $postTime.appendTo($resultDiv);

      // Append the individual result div to the "all results" div
      $resultDiv.appendTo($allResults);
    });

    // Append the "all results" div to the document
    $allResults.appendTo('body2');
  });
}
