define([
    'moment',
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'radio',
    'config',
    'text!modules2/input/templates/stations-list.html',
    'models/station'

], function(moment, $, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, Radio, config, template, Station) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        className: 'full-height',
        events :{
            'click tbody > tr': 'detail',
            'dblclick tbody > tr' : 'navigate'
        },
        initialize: function(options) {
            console.log(' global model :' );
            console.log(this.model);
            this.radio = Radio.channel('input');
            this.radio.comply('updateStationsGrid', this.update, this);
            var Stations = PageableCollection.extend({
                sortCriteria: {'PK':'desc'},
                url: config.coreUrl + 'search/station',
                mode: 'server',
                model: Station,
                state:{
                    pageSize: 25,
                },
                queryParams: {
                    offset: function() {return (this.state.currentPage - 1) * this.state.pageSize;},
                    criteria: function() {return JSON.stringify(this.searchCriteria);},
                    order_by: function() {
                        var criteria = [];
                        for(var crit in this.sortCriteria){
                            criteria.push(crit + ':' + this.sortCriteria[crit]);
                        }
                        return JSON.stringify(criteria);},
                },
                fetch: function(options) {
                    options.type = 'POST';
                    PageableCollection.prototype.fetch.call(this, options);
                }
            });

            var stations = new Stations();

            var myHeaderCell = Backgrid.HeaderCell.extend({
                onClick: function (e) {
                    e.preventDefault();
                    var that=this;
                    var column = this.column;
                    var collection = this.collection;
                    var sortCriteria = (collection.sortCriteria && typeof collection.sortCriteria.PK === 'undefined') ? collection.sortCriteria : {};
                    switch(column.get('direction')){
                        case null:
                            column.set('direction', 'ascending');
                            sortCriteria[column.get('name')] = 'asc';
                            break;
                        case 'ascending':
                            column.set('direction', 'descending');
                            sortCriteria[column.get('name')] = 'desc';
                            break;
                        case 'descending':
                            column.set('direction', null);
                            delete sortCriteria[column.get('name')];
                            break;
                        default:
                            break;
                    }
                    collection.sortCriteria = (Object.keys(sortCriteria).length > 0) ? sortCriteria : {'PK': 'desc'};
                    collection.fetch({reset: true, success : function(resp){ 
                        }});
                },
            });
            var myCell = Backgrid.NumberCell.extend({
                decimals: 5
            });
            
            var columns = [{
                name: 'PK',
                label: 'ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                  orderSeparator: ''
                }),
                headerCell: myHeaderCell
            }, {
                name: 'Name',
                label: 'Name',
                editable: false,
                cell:'string',
                headerCell: myHeaderCell
            }, {
                name: 'Date_',
                label: 'date',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }, {
                name: 'LAT',
                label: 'Lat',
                editable: false,
                cell: myCell,
                headerCell: myHeaderCell
            }, {
                name: 'LON',
                label: 'Lon',
                editable: false,
                cell: myCell,
                headerCell: myHeaderCell
            }, {
                name: 'FieldActivity_Name',
                label: 'field activity',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }, {
                name: 'FieldWorker1',
                label: 'field worker 1',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }];
            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: stations,
            });
            var that=this;
            var searchCriteria ={};
            var oldStations = this.model.get('oldStations');
            if(oldStations){searchCriteria = oldStations.searchCriteria || {}; }
            stations.searchCriteria = searchCriteria;
            stations.fetch( {reset: true,   success : function(resp){ 
                        that.$el.find('#stations-count').html(stations.state.totalRecords+' stations');
                        that.model.set('oldStations', that.grid.collection);
                        }
            } );

            this.paginator = new Backgrid.Extension.Paginator({
                collection: stations
            });
        
            //$('#stationsGridContainer').css('height','90%');
        },
        update: function(args) {
            var that=this;
            this.grid.collection.searchCriteria = args.filter;
            // Go to page 1
            this.grid.collection.state.currentPage = 1;
            this.grid.collection.fetch({reset: true, success:function(){
               that.$el.find('#stations-count').html(that.grid.collection.state.totalRecords+' stations');
               that.model.set('oldStations' , that.grid.collection);
            }
            });
            
        },
        onShow: function() { 
            this.$el.parent().addClass('no-padding');
            $('#main-panel').css({'padding-top': '0'});
            this.$el.addClass('grid');
            $('#stationsGridContainer').append(this.grid.render().el);
            this.$el.append(this.paginator.render().el);
        },
        onDestroy: function(){
            $('#main-panel').css('padding-top', '20');
            this.grid.remove();
            this.grid.stopListening();
            this.grid.collection.reset();
            this.grid.columns.reset();
            delete this.grid.collection;
            delete this.grid.columns;
            delete this.grid;
        },
        detail: function(evt) {
            var row = $(evt.currentTarget);
            var id = parseInt($(row).find(':first-child').text());
            var currentStation = this.grid.collection.where({ PK: id})[0];
            this.radio.command('generateStation', currentStation);
            $('table.backgrid tr').removeClass('backgrid-selected-row');
            $(row).addClass('backgrid-selected-row');
        },
        navigate : function(evt){
            //alert('double click');
            this.detail(evt);
            this.radio.command('navigateNextStep');
        }
    });
});
