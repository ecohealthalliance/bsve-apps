BSVE.init(initApp);

// var user = null,
//   authTicket = null,
//   dataSource = null

var user = null,
  authTicket = "apikey=AK9dc4549a-2f2f-4f96-9a0b-a614fded12cb;timestamp=1503411781906;nonce=915077438;signature=d11e2435e0d230b6c450f5883e5363b3b42c7a04",
  dataSource = null
$(function(){
  $("nav li.flirt").click(function(){
    $("nav li").toggleClass("active")
    $("#hotpots").hide()
    $("#flirt").show()
  });

  $("nav li.hotspots").click(function(){
    $("nav li").toggleClass("active")
    $("#hotpots").show()
    $("#flirt").hide()
  });

  $('#table').bootstrapTable({
    columns: [{
        field: 'source',
        title: 'Origin'
    }, {
        field: 'destination',
        title: 'Destination'
    }, {
        field: 'flightyear',
        title: 'Year'
    }, {
        field: 'flightcount',
        title: 'Flight Count'
    }, {
        field: 'passengercount',
        title: 'Passenger Count'
    } ]
  })
  fetchData()
})

function initApp()
{
  authTicket = BSVE.api.authTicket();
  user = BSVE.api.userData();
  fetchData();

  getAirports()
  $(".typeahead").keyup(function(){
    if($(this).is(':input') && $(this).val().length > 0 && $(this).val().length < 3){
      console.log("skip updating data", $(this).val().length)
      return
    }
    fetchData()
  })
  $("#year").change(function(){
    fetchData()
  })
}

function setupTypeAhead(airportCodes)
{
  $("#origin").typeahead({source: airportCodes})
  $("#destination").typeahead({source: airportCodes})
}

function getAirports()
{
  $.ajax({
    type: "GET",
    url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_Airport_Data/data",
    beforeSend: function(xhr)
    {
      xhr.setRequestHeader("harbinger-authentication", authTicket);
    },
    success: function(data)
    {
      setupTypeAhead($.map(data.result, function(a) { return a["code"]; }))
    }
  });
}

function buildFilter()
{
  var origin = $("#origin").val().toUpperCase()
  var dest = $("#destination").val().toUpperCase()
  var year = $("#year :selected").text()
  var filter = []
  if(origin){
    filter.push("source+eq+'"+origin + "'")
  }
  if(dest){
    filter.push("destination+eq+'"+dest + "'")
  }
  filter.push("flightyear+eq+" + year)
  return "$filter=" + filter.join("+and+")
}

function fetchData()
{
  var filter = buildFilter()
  console.log("filter","https://api.bsvecosystem.net/data/v2/sources/FLIRT_FlightCount_Data/data?" + filter)
  console.log("auth header", authTicket)
  $.ajax({
    type: "GET",
    // url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_Airport_Data/data",
    url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_FlightCount_Data/data?" + filter,
    beforeSend: function(xhr)
    {
      xhr.setRequestHeader("harbinger-authentication", authTicket);
      console.log("xhr", xhr)
    },
    error: function(data, status, error){
      console.log("ERROR!", data, status, error)
    },
    complete: function(xhr, data){
      console.log("complete", xhr, data)
    },
    success: function(data)
    {
      console.log("success data", data)
      if ( data.result.length )
      {
        $('#table').bootstrapTable('load', data.result)
      }
      else
      {
        // data is not indexed. Check again in thirty seconds
        setTimeout(fetchData, 1000 * 30);
      }
    }
  });
}