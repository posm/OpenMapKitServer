/**
 * Created by renerodriguez on 2/27/16.
 */

/* globals FormData, Vue */

var AjaxFormComponent = Vue.extend({
    template: '<form id="{{ id }}" class="{{ class }}" name="{{ name }}" action="{{ action }}" method="{{ method }}" v-on:submit.prevent="handleAjaxFormSubmit" @change="onFileChange"><slot></slot></form>',
    props: {
        'id': String,
        'fileName': '',
        fileData: null,
        'class': String,
        'action': {
            type: String,
            required: true
        },
        'method': {
            type: String,
            required: true,
            validator: function(value){
                switch(value.toUpperCase()){
                    case 'POST': return true
                    default: return false
                }
            }
        },
        'v-response-type': String
    },
    methods: {
        onFileChange: function (e) {
            //e.preventDefault();
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;

            //capture values from file
            var fileNameString = files[0].name;
            if (fileNameString.indexOf('.xlsx') < 0) {
                // fires when files has been loaded
                this.$dispatch('NotifyWrongFile');
            }else{
                this.fileName = files[0].name;
                this.fileData = files[0];
            }


            // fires when files has been loaded
            this.$dispatch('getFilesName', this.fileName);


        },
        handleAjaxFormSubmit: function() {

            // fires whenever an error occurs
            var handleError = (function(err) {
                this.$dispatch('onFormError', this, err);
            }).bind(this);

            // set a default form method
            if (!this.method) {
                this.method = 'post';
            }

            // fires when the form returns a result
            var handleFinish = (function(data) {
                if (xhr.readyState == 4) {
                    // a check to make sure the result was a success
                    if (xhr.status < 400) {
                        this.$dispatch('onFormComplete', this, xhr.response);
                        this.fileData = null;
                        this.fileName = null;
                    } else {
                        this.$dispatch('onFormError', this, xhr.response);
                    }
                }
            }).bind(this);

            var handleProgress = (function(evt) {
                // flag indicating if the resource has a length that can be calculated
                if (evt.lengthComputable) {
                    // create a new lazy property for percent
                    evt.percent = (evt.loaded / evt.total) * 100;

                    this.$dispatch('onFormProgress', this, evt);
                }
            }).bind(this);

            var xhr = new XMLHttpRequest();
            xhr.open(this.method, this.action, true);

            // you can set the form response type via v-response-type
            if (this.vResponseType) {
                xhr.responseType = this.vResponseType;
            } else {
                xhr.responseType = 'json';
            }

            xhr.upload.addEventListener('progress', handleProgress);
            xhr.addEventListener('readystatechange', handleFinish);
            xhr.addEventListener('error', handleError);
            xhr.addEventListener('abort', handleError);
            var data = new FormData();

            data.append('xls_file', this.fileData);



            //Check if there's data
            if(this.fileData){
                xhr.send(data);
            }

            // we have setup all the stuff we needed to
            this.$dispatch('afterFormSubmit', this);
        }
    }
});

// register
Vue.component('ajax-form', AjaxFormComponent);


new Vue({
    el: '#uploadPage',
    data: {
        response: {},
        progress: 0,
        showProgess: true,
        uploadMessage: '',
        fileName: ''
    },
    ready: function (){
        componentHandler.upgradeDom();
    },
    events: {
        getFilesName: function(el){
            this.fileName = el;


        },
        NotifyWrongFile: function(){
            this.uploadMessage = "This file is not a valid XLSForm .xlsx file.";
            //toaster
            var toastOptions = {
                style: {
                    main: {
                        background: "#f2dede",
                        color: "#a94442",
                        'box-shadow': '0 0 0px'
                    }
                }
            };
            iqwerty.toast.Toast(this.uploadMessage, toastOptions);
        },
        afterFormSubmit: function(el) {
            // fired after fetch is called
            console.log('afterFormSubmit', el);
        },
        onFormComplete: function(el, res) {
            // the form is done, but there could still be errors
            console.log('onFormComplete', el, res);
            // indicate the changes
            this.response = res;

            //Success message
            this.uploadMessage = "Uploaded " + this.fileName + " successfully";
            //reset values
            this.progress = 0;
            this.fileName = '';
            //toaster
            iqwerty.toast.Toast(this.uploadMessage, toastOptions);

        },
        onFormProgress: function(el, e) {
            // the form is done, but there could still be errors
            console.log('onFormProgress', el, e);
            // indicate the changes
            this.progress = e.percent;
        },
        onFormError: function(el, err) {
            // handle errors
            console.log('onFormError', el, err);
            // indicate the changes
            //Failed message
            this.uploadMessage = "Failed uploading " + this.fileName + ": " + err.msg;
            this.response = err;

            //toaster
            var toastOptions = {
                style: {
                    main: {
                        background: "#f2dede",
                        color: "#a94442",
                        'box-shadow': '0 0 0px'
                    }
                }
            };
            iqwerty.toast.Toast(this.uploadMessage, toastOptions);
        }
    },
    methods: {

    }
})

var toastOptions = {
    style: {
        main: {
            background: "#7ebc6f",
            color: "white",
            'box-shadow': '0 0 0px'
        }
    }
};
