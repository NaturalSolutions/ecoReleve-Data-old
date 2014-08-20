define([
    'jquery',
    'underscore',
    'backbone',
    'chart',
    'config',
    'moment',
    'router',
    'views/base_view',
    'text!templates/home.html'
], function($, _, Backbone, Chart, config, moment, router, BaseView, template){
    'use strict';
    return BaseView.extend({
        template: _.template(template),

        events: {
            'click #alldata': 'alldata'
        },

        model: new Backbone.Model({
            config: config,
            date: moment().format()
        }),

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this._dfds = {};
            window.addEventListener('online', this.updateOnlineStatus);
            window.addEventListener('offline', this.updateOnlineStatus);
            this.listenTo(this.model, 'change', this.render);
        },

        remove: function(options) {
            BaseView.prototype.remove.apply(this, arguments);
            console.log("remove home page");
        },

        render: function(){
            console.log('render home');
            var compiledTemplate = this.template({model: this.model});
            this.$el.html(compiledTemplate);
        },

        afterRender: function() {
            if (screenfull.enabled) {
                screenfull.request();
            } else {
            // Ignore or do something else
            }

            var body_width = $(window).width();
            // stats displayed only for screens with width > 640
            if (body_width > 640 ){
                $('#supersized').html('');
                $.supersized({
                    slides: [{
                        //image: 'images/home_outarde_paysage.jpg'
                        image: 'img/home_fond.jpg'
                    }]
                });
                this.serverUrl = config.serverUrl;
                this.loadStats();
                var d = (new Date() + '').split(' ');
                // ["Mon", "Feb", "1", "2014"....
                d[1] = this.convertMonth(d[1]);
                var date = [d[1], d[2], d[3]].join(' ');
                // Feb 1  2014 ...
                $("#date").html(date);
            }

            $("div.modal-backdrop").removeClass("modal-backdrop");

            // number of stored observations
            //var ln = app.collections.observations.length;
            var ln = 1000;
            $("#homeNbObs").text(ln);
            // get nb argos to check
            this.getArgosLocations();
            // global var used to manage indiv list
            /*
            TODO
            app.utils.argosIndivList = null;
            */
        },

        alldata: function(e) {
            if (navigator.onLine === true) {
                if ((this.serverUrl === undefined) || (this.serverUrl === null)) {
                    alert("Please configurate the server url ");
                } else {
                    router.navigate('#allData', {
                        trigger: true
                    });
                }
            } else {
                alert("you are not connected ! Please check your connexion ");
            }
        },

        updateOnlineStatus: function(event) {
            var condition = navigator.onLine ? "online" : "offline";
            //alert(condition);
            if (condition == "offline") {
                $(".connected").each(function() {
                    $(this).addClass("tile-grey");
                });
            } else {
                $(".connected").each(function() {
                    $(this).removeClass("tile-grey");
                });
            }
        },

        resizeImage: function() {
            var $image = $('img#superbg'),
                image_width = $image.width(),
                image_height = $image.height(),
                over = image_width / image_height,
                under = image_height / image_width,
                body_width = $(window).width(),
                body_height = $(window).height();

            if (body_width / body_height >= over) {
                $image.css({
                    'width': body_width + 'px',
                    'height': Math.ceil(under * body_width) + 'px',
                    'left': '0px',
                    'top': Math.abs((under * body_width) - body_height) / -2 + 'px'
            });
            } else {
                $image.css({
                    'width': Math.ceil(over * body_height) + 'px',
                    'height': body_height + 'px',
                    'top': '0px',
                    'left': Math.abs((over * body_height) - body_width) / -2 + 'px'
                });
            }
        },

        loadStats: function() {
            //caching graph data for a day
            var dataGraph = localStorage.getItem("ecoreleveChart");
            // get current day and compare it with stored day
            var d = (new Date() + '').split(' ');
            // ["Mon", "Feb", "1", "2014"....
            var day = d[2];
            var storedDay = localStorage.getItem("ecoreleveChartDay");
            if (dataGraph && (day == storedDay)) {
                var gData = JSON.parse(dataGraph);
                //var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
                var myChart = new Chart(document.getElementById("graph").getContext("2d")).Line(gData, null);
                $("#homeGraphLegend").html("<h3>number of observations</h3>");
            } else {
                var url = config.coreUrl + "/stations/graph";
                $.ajax({
                    url: url,
                    dataType: "json"
                }).done( function(data) {
                    var stat = data;
                    var pieData = [];
                    var labels = [];
                    var barData = [];
                    var colors = ["#F38630", "#E0E4CC", "#69D2E7", "#3F9F3F", "#A4A81E", "#F0F70C", "#0CF7C4", "#92D6C7", "#2385b8", "#E0C8DD", "#F38630", "#E0E4CC"];
                    var legend = "<div id='graphLegend' style='text-align: left;'><b>stations number per month</b><br/>";
                    var i = 0;
                    for (var key in stat) {
                        var dataObj = {};
                        var month = key;
                        var value = stat[key] || 0;
                        labels.push(month);
                        barData.push(parseInt(value));
                    }
                    labels = labels.reverse();
                    barData = barData.reverse();
                    var gData = {
                        labels: labels,
                        datasets: [{
                            fillColor: "rgba(100,100,100,0.7)",
                            strokeColor: "rgba(220,220,220,1)",
                            data: barData
                        }]
                    };
                    console.log(gData);
                    var strData = JSON.stringify(gData);
                    // store data in localstorage
                    localStorage.setItem("ecoreleveChart", strData);
                    // store month in localstrorage to update data every month
                    var d = (new Date() + '').split(' ');
                    // ["Mon", "Feb", "1", "2014"....
                    var day_ = d[2];
                    localStorage.setItem("ecoreleveChartDay", day_);
                    //var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
                    var myChart = new Chart(document.getElementById("graph").getContext("2d")).Line(gData, {});
                    $("#homeGraphLegend").html("<h3>stations number per month</h3>");
                }).fail( function(data) {
                    $("#homeGraphLegend").html("error in loading data");
                });
            }
            // update individuals number
            var indivUrl = config.coreUrl + "/individuals/count";
            $.ajax({
                url: indivUrl,
                dataType: "json"
            }).done( function(data) {
                $("#infos span").text(data);
            });
        },

        getArgosLocations: function() {
            var url = config.sensorUrl + '/argos/unchecked/count';
            $.ajax({
                url:url,
                dataType:"json",
                success: function(data) {
                    $("#homeArgosNb").text(data.count);
                }
            });
        },

        convertMonth: function(month) {
            var monthUpper = month.toUpperCase();
            switch (monthUpper) {
                case "JAN":
                    return "January";
                case "FEB":
                    return "February";
                case "MAR":
                    return "March";
                case "APR":
                    return "April";
                case "MAY":
                    return "May";
                case "JUN":
                    return "June";
                case "JUL":
                    return "July";
                case "AUG":
                    return "August";
                case "SEP":
                    return "September";
                case "OCT":
                    return "October";
                case "NOV":
                    return "November";
                case "DEC":
                    return "December";
            }
        }
    });
});
