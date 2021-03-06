define([
	'jquery',
	'underscore',
	'backbone',
    'marionette',
    'radio',
    'text!stepper/tpl-view.html',
    'bbForms'



], function($, _, Backbone, Marionette, Radio, tpl, BBForm) {

    'use strict';

    return Marionette.ItemView.extend({


        
        template: tpl,
        className: 'full-height',
        events: {
            'click #validate' : 'validate',

        },

        initialize: function(){

        },

        onRender: function(){
            var User = Backbone.Model.extend({
                schema: {
                    title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
                    name:       { type: 'Text', validators: ['required'] }
                }
            });

            var user = new User();

            var form = new BBForm({
                model: user
            }).render();



            this.$el.find('#form').append(form.el);

            this.form=form;
        },

        validate: function(){
        },
    });
});
