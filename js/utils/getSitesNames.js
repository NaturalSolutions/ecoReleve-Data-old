define([
	'jquery',
    'backbone',
    'config',
], function($,backbone, config) {
    'use strict';
    return {
        getElements: function(url, siteType) {
            var content ='';
            url = config.coreUrl + url;
            var query = $.ajax({
                context: this,
                url: url,
                dataType: "json",
                type:'POST',
                data : {type: siteType},
                async: false,
            })
            .done( function(data) {
                var len = data.length;
               for (var i = 0; i < len; i++) {
                    var label = data[i];
                    content += '<option value="' +  data[i] +'">'+  data[i] +'</option>';
                }
            })
            .fail( function() {
                alert("error loading items, please check connexion to webservice");
            });

            return content;
        }
    };
});

	




