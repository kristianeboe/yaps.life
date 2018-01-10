data = {
  destination_addresses: [
    "Karl Johans gate 23B, 0159 Oslo, Norway",
    "Bryggegata 6, 0250 Oslo, Norway"
  ],
  origin_addresses: [
    "Arnebråtveien 75D, 0771 Oslo, Norway",
    "Nydalsveien 33, 0484 Oslo, Norway"
  ],
  rows: [
    {
      elements: [
        {
          distance: {
            text: "7.0 km",
            value: 6957
          },
          duration: {
            text: "24 mins",
            value: 1456
          },
          status: "OK"
        },
        {
          distance: {
            text: "7.0 km",
            value: 7001
          },
          duration: {
            text: "29 mins",
            value: 1735
          },
          status: "OK"
        }
      ]
    },
    {
      elements: [
        {
          distance: {
            text: "7.5 km",
            value: 7459
          },
          duration: {
            text: "15 mins",
            value: 913
          },
          status: "OK"
        },
        {
          distance: {
            text: "7.5 km",
            value: 7503
          },
          duration: {
            text: "20 mins",
            value: 1192
          },
          status: "OK"
        }
      ]
    }
  ],
  status: "OK"
}

var response = data
var origins = data.origin_addresses;
var destinations = data.destination_addresses;

for (var i = 0; i < origins.length; i++) {
  var results = response.rows[i].elements;
  for (var j = 0; j < results.length; j++) {
    var element = results[j];
    var distance = element.distance.text;
    var duration = element.duration.text;
    var from = origins[i];
    var to = destinations[j];
    console.log('Duration', from, to, duration)
  }
}