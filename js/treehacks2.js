if (Meteor.isServer) {
    Meteor.methods({
        checkSentiment: function (searchTerm) {
            this.unblock();
            return Meteor.http.call("GET", "https://guarded-fortress-22776.herokuapp.com/newsbiasapp/getData?q=" + searchTerm);
        }
    });
}

if (Meteor.isClient) {
  // This code only runs on the client

  Template.search.jsonparser = function(){
    return JSON.parse(this.MESSAGE);
  };

  Template.search.events({
        'submit form' : function (event) {
          event.preventDefault();
          var searchTerm = event.target.search.value;
          console.log(searchTerm);
          Meteor.call("checkSentiment", searchTerm, function(error, results) {

            Chart.defaults.global.responsive = true;
            Chart.defaults.global.animation = false;

            $(function(){

            var data = [
              {
                label: 'Sentiment',
                strokeColor: 'rgba(75, 180, 75, 0.3)',
                data: []
              }
            ];

            var links = {};
            var arr = $.parseJSON(results.content);
            $(arr).each(function() {
              data[0].data.push({x: (this.bucket - 10), y: 0, r: 2})
              if (!(this.bucket in links)) {
                links[this.bucket] = {title: this.title, link: this.link};
              }
            });

            var ctx = document.getElementById("myBubbleChart").getContext("2d");
            var myBubbleChart = new Chart(ctx).Scatter(data, {
              bezierCurve: true,
              showTooltips: true,
              scaleShowHorizontalLines: true,
              scaleShowLabels: true,
              scaleBeginAtZero: false,
              datasetStroke: false
              });

            document.getElementById("myBubbleChart").onclick = function(evt){
            var activePoints = myBubbleChart.getPointsAtEvent(evt);
            var firstPoint = activePoints[0];
            if (firstPoint !== undefined)
              window.open(links[data[0].data[firstPoint.arg].x].link, '_blank');
            // use _datasetIndex and _index from each element of the activePoints array
            };

            });


          });
        }
    });
}