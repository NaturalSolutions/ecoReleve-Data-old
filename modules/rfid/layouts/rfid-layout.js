define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'modules2/rfid/layouts/rfid-deploy',
    'modules2/rfid/views/rfid-add',
    'modules2/rfid/views/rfid-import',
    'modules2/rfid/views/rfid-validate',
    'text!modules2/rfid/templates/rfid.html'
], function($, _, Backbone, Marionette, config, Radio, DeployView, AddView,
    ImportView, ValidateView, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container full-height',
        template: template,

        regions: {
            mainRegion: '#main-panel'
        },

        events: {
            'click #deploy'   : 'showDeploy',
            'click #import'   : 'showImport',
            'click #add'      : 'showAdd',
            'click #validate' : 'showValidate'
        },
        initialize: function(options) {
            this.options = options;
             Radio.channel('rfid').comply('showValidate', this.showValidate, this);
        },
        onShow: function() {
            $(this.$el).css({'padding-top':'0%'});
        },

        showDeploy: function() {
            this.mainRegion.show(new DeployView(this.options));
            //Backbone.history.navigate('rfid_deploy');
        },

        showImport: function() {
            this.mainRegion.show(new ImportView());
            //Backbone.history.navigate('rfid_import');
        },

        showAdd: function() {
            this.mainRegion.show(new AddView());
            //Backbone.history.navigate('rfid_add');
        },

        showValidate: function() {
            this.mainRegion.show(new ValidateView());
            //Backbone.history.navigate('rfid_validate');
        }
    });
});
