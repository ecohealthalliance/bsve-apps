db.flights.aggregate([
	{$group: {
	  		_id: {
	  		  "origin": "$departureAirport",
	  		  "destination": "$arrivalAirport",
	  		  "year": {$year: "$departureDateTime"}
	  		},
	  		"flightCount": {"$sum": 1},
	  		"passengerCount": {"$sum": "$totalSeats"}
		}
	},
	{$project:
		{
		  _id: 0,
		  origin: "$_id.origin",
		  destination: "$_id.destination",
		  year: "$_id.year",
		  flightCount: "$flightCount",
		  passengerCount: "$passengerCount"
		
		}
	}
],
{allowDiskUse: true}
).toArray().forEach(function(data){
  print(data.origin+","+data.destination+","+data.year+","+data.flightCount+","+data.passengerCount);
});