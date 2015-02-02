define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'bootstrap_slider',
    'modules2/import/_rfid/views/step2',
    'grid/model-grid',
    'backgrid',
    'modules2/rfid/layouts/rfid-deploy',
    'modules2/rfid/views/rfid-map',
    'sweetAlert',
    'stepper/lyt-step',
    
], function($, _, Backbone, Marionette, config, Radio, bootstrap_slider, Step2, NSGrid, Backgrid, DeployRFID, Map, swal, Step) {
    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/

        collection: new Backbone.Collection(),
        className: 'import-container-rfid container',

        events: {
            /*'click .finished': 'importFile',*/
            'click #input-file': 'clear',
        
        },

        ui: {
            progress: '.progress',
            progressBar: '.progress-bar',
            fileHelper: '#help-file',
            fileGroup: '#group-file',
            modHelper: '#help-mod',
            modGroup: '#group-mod',
            modInput: '#input-mod'
        },

        onDestroy: function(){
           
        },
        initModel: function() {
           /*this.deploy_rfid = new DeployRFID();*/
 
            this.parseOneTpl(this.template);
            var obj={name : this.name + '_fileName',required : true};
            this.stepAttributes = [obj] ;
            
        },
        onShow : function() {
        
        },
        importFile: function(event) {
            var self = this;
         /*   event.stopPropagation();
            event.preventDefault();*/
            this.clear();

            var module = this.ui.modInput.val();

            if( module !== '') {

                var reader = new FileReader();
                var file = $('#input-file').get(0).files[0] || null;
                var url = config.coreUrl + 'rfid/import';
                var data = new FormData();
                console.log($(this.ui.modInput));
                var self = this;

                reader.onprogress = function(data) {
                    if (data.lengthComputable) {
                        var progress = parseInt(data.loaded / data.total * 100).toString();
                        self.ui.progressBar.width(progress + '%');
                       
                    }
                };

                reader.onload = function(e, fileName) {
                    data.append('data', e.target.result);
                    console.log(self.model.get(self.parent.steps[self.parent.currentStep-1].name+'_RFID_identifer'));
                    data.append('module', self.model.get(self.parent.steps[self.parent.currentStep-1].name+'_RFID_identifer'));
                    console.log(data)
                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: data,
                        processData: false,
                        contentType: false
                    }).done(function(data) {
                        $('#btnNext').removeAttr('disabled');
                        $('.sweet-alert').append('<a href="#validate/rfid" class="sweet-validate"><button  tabindex="3" style="display: inline-block;box-shadow: none; background-color:#5cb85c;">Go to validate</button></a>');
                        $('.sweet-alert button').on('click',function(){
                            $('.sweet-validate').remove();
                        });
                        self.ui.progressBar.css({'background-color':'green'})
                        swal(
                            {
                              title: 'Well done !',
                              text: data.responseText,
                              type: 'success',
                              showCancelButton: true,
                              confirmButtonColor: 'green',
                              confirmButtonText: 'New import',
                              cancelButtonColor: 'blue',
                              cancelButtonText: 'Finish',
                                
                              closeOnConfirm: true,
                             
                            },
                            function(isConfirm){
                               
                                self.ui.progress.hide();
                                if (isConfirm){
                                    Radio.channel('route').trigger('import');
                                } else {
                                    Radio.channel('route').command('home');

                                }
                                
                            });

                    }).fail( function(data) {
                        
                        $('#btnNext').attr('disabled');
                        if (data.status == 500 || data.status == 510  ) {
                            var type = 'warning';
                            self.ui.progressBar.css({'background-color':'rgb(218, 146, 15)'})
                            var color = 'rgb(218, 146, 15)';
                            var displayCancel = true;

                            if (data.status == 500) {
                                $('.sweet-alert').append('<a href="#validate/rfid" class="sweet-validate"><button  tabindex="3" style="display: inline-block;box-shadow: none; background-color:#5cb85c;">Go to validate</button></a>');
                                $('.sweet-alert button').on('click',function(){
                                    $('.sweet-validate').remove();
                                });
                                var confirmText = 'Finish';
                                var cancelText = 'Select another file';
                                var swal_choice = function(isConfirm) {
                                    if (isConfirm) {
                                        Radio.channel('route').command('home');
                                    }                               
                                };
                            } else {
                                var confirmText = 'Deploy RFID decoder';
                                var cancelText = 'Return';
                                var swal_choice = function(isConfirm) {
                                    self.parent.toStep(0)
                                    if (isConfirm) {
                                        var prevStep = self.parent.steps[0];                                                                      
                                        prevStep.deployRFID();
                                    }                               
                                };
                            }
                        }
                        else {
                            var type = 'error';
                            self.ui.progressBar.css({'background-color':'rgb(147, 14, 14)'})
                            var color = 'rgb(147, 14, 14)';
                            var displayCancel=false;
                            var confirmText = 'OK';
                            }

                         
                        swal(
                            {
                              title: "Warning ",
                              text: data.responseText,
                              type: type,
                              showCancelButton: displayCancel,
                              confirmButtonColor: color,
                              confirmButtonText: confirmText,
                              cancelButtonColor: 'blue',
                              cancelButtonText: cancelText,
                                
                              closeOnConfirm: true,
                             
                            },
                            function(isConfirm){
                                swal_choice(isConfirm);
                                self.ui.progress.hide();
                                
                            }

                        );

                    });
                };

                if(file) {
                    this.clear();
                    this.ui.progress.show();
                    reader.readAsText(file);
                }
                else {
                    this.ui.fileGroup.addClass('has-error');
                    this.ui.fileHelper.text('Required');
                }
            }
            else {
                this.ui.modGroup.addClass('has-error');
                this.ui.modHelper.text('Required');
            }
        },

        clear: function() {
            this.ui.progressBar.width('0%');
            this.ui.progress.hide();
            this.ui.fileHelper.text('');
            this.ui.fileGroup.removeClass('has-error');
            this.ui.modHelper.text('');
            this.ui.modGroup.removeClass('has-error');
        },
     
    });

});