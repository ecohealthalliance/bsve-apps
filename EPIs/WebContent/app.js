BSVE.init(initApp);

var user = null,
  authTicket = null,
  dataSource = null

function initApp()
{
  authTicket = BSVE.api.authTicket();
  user = BSVE.api.userData();
  fetchData();
}

function fetchData()
{
  var filter = "?$filter=flightyear+ge+2018"
  // start by seeing if we can simply list the data sources
  $.ajax({
    type: "GET",
    // url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_Airport_Data/data",
    url: "https://api.bsvecosystem.net/data/v2/sources/FLIRT_FlightCount_Data/data" + filter,
    beforeSend: function(xhr)
    {
      xhr.setRequestHeader("harbinger-auth-ticket", authTicket);
    },
    success: function(data)
    {
      console.log("success data", data)
      if ( data.result.length )
      {
        $('#table').bootstrapTable({
            columns: [{
                field: 'source',
                title: 'Source'
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
            } ],
            data: data.result
            
        });
      }
      else
      {
        // data is not indexed. Check again in thirty seconds
        setTimeout(fetchData, 1000 * 30);
      }
    }
  });
}