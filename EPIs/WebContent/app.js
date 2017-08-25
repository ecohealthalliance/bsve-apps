BSVE.init(initApp);

var user = null,
  authTicket = null,
  dataSource = null

function initApp()
{
  authTicket = BSVE.api.authTicket();
  user = BSVE.api.userData();
  fetchData();

  $(function(){
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
    getAirports()
    $(".typeahead").change(function(){
      console.log("Change!")
      fetchData()
    })
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
      xhr.setRequestHeader("harbinger-auth-ticket", authTicket);
    },
    success: function(data)
    {
      setupTypeAhead($.map(data.result, function(a) { return a["code"]; }))
    }
  });
}

function buildFilter()
{
  var origin = $("#origin").val()
  var dest = $("#destination").val()
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
  $.ajax({
    type: "GET",
    // url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_Airport_Data/data",
    url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_FlightCount_Data/data?" + filter,
    beforeSend: function(xhr)
    {
      xhr.setRequestHeader("harbinger-auth-ticket", authTicket);
    },
    success: function(data)
    {
      console.log("success data", data)
      if ( data.result.length )
      {
        // $('#table').bootstrapTable({
        //     columns: [{
        //         field: 'source',
        //         title: 'Origin'
        //     }, {
        //         field: 'destination',
        //         title: 'Destination'
        //     }, {
        //         field: 'flightyear',
        //         title: 'Year'
        //     }, {
        //         field: 'flightcount',
        //         title: 'Flight Count'
        //     }, {
        //         field: 'passengercount',
        //         title: 'Passenger Count'
        //     } ],
        //     data: data.result
            
        // });
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