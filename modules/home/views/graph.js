define([
    'jquery',
    'chart',
    'config',
    'marionette',
    'moment',
    'text!modules2/home/templates/graph.html'
], function($, Chart, config, Marionette, moment, template) {
    'use strict';
    return Marionette.ItemView.extend( {
        template: template,

        onRender: function() {
            this.drawGraph();
        },

        drawGraph: function() {
            var canvas = this.$el.find('canvas');
            //caching graph data for a day
            var dataGraph = localStorage.getItem("ecoreleveChart");
            // get current day and compare it with stored day
            var d = (new Date() + '').split(' ');
            // ["Mon", "Feb", "1", "2014"....
            var day = d[2];
            var storedDay = localStorage.getItem("ecoreleveChartDay");
            if (dataGraph && (day == storedDay)) {
                var gData = JSON.parse(dataGraph);
                this.chart = new Chart(canvas[0].getContext("2d")).Line(gData, {scaleShowLabels: false, scaleFontColor: "transparent"});
            } else {
                var url = config.coreUrl + "stations/graph";
                $.ajax({
                    context: this,
                    url: url,
                    dataType: "json"
                }).done( function(data) {
                    var labels = [];
                    var lineData = [];
                    var colors = ["#F38630", "#E0E4CC", "#69D2E7", "#3F9F3F", "#A4A81E", "#F0F70C", "#0CF7C4", "#92D6C7", "#2385b8", "#E0C8DD", "#F38630", "#E0E4CC"];
                    var legend = "<div id='graphLegend' style='text-align: left;'><b>stations number per month</b><br/>";
                    var i = 0;
                    for (var key in data) {
                        var dataObj = {};
                        var month = key;
                        var value = data[key] || 0;
                        labels.push(month);
                        lineData.push(parseInt(value));
                    }
                    var gData = {
                        labels: labels,
                        datasets: [{
                            fillColor: "transparent",
                            strokeColor: "rgba(100,100,100,0.7)",
                            data: lineData
                        }]
                    };
                    var strData = JSON.stringify(gData);
                    // store data in localstorage
                    localStorage.setItem("ecoreleveChart", strData);
                    // store month in localstrorage to update data every month
                    var d = (new Date() + '').split(' ');
                    // ["Mon", "Feb", "1", "2014"....
                    var day_ = d[2];
                    localStorage.setItem("ecoreleveChartDay", day_);
                    this.chart = new Chart(canvas[0].getContext('2d')).Line(gData,  {scaleShowLabels: false});
                }).fail( function(msg) {
                    console.error(msg);
                });
            }
        },

        onDestroy: function() {
            if(this.chart) {
                this.chart.destroy();
            }
        }
    });
});
