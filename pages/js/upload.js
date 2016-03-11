/**
 * Created by renerodriguez on 2/27/16.
 */

/* globals FormData, Vue */

var AjaxFormComponent = Vue.extend({
    template: '<form id="{{ id }}" class="{{ class }}" name="{{ name }}" action="{{ action }}" method="{{ method }}" v-on:submit.prevent="handleAjaxFormSubmit" @change="onFileChange"><slot></slot></form>',
    props: {
        'id': String,
        'fileName': '',
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
                    case 'CONNECT': return true
                    case 'DELETE': return true
                    case 'GET': return true
                    case 'HEAD': return true
                    case 'OPTIONS': return true
                    case 'POST': return true
                    case 'PUT': return true
                    case 'TRACE': return true
                    case 'TRACK': return true
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


            this.fileName = files[0].name;

            // fires when files has been loaded
            this.$dispatch('getFilesName', this.fileName);


        },
        handleAjaxFormSubmit: function() {
            // fires before we do anything
            this.$dispatch('beforeFormSubmit', this);

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
                    } else {
                        this.$dispatch('onFormError', this, xhr.statusText);
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

            data.append('xls_file', event.target[0].files[0]);



            //If there's no name there's no data
            if(this.fileName){
                this.fileName = event.target[0].files[0].name;
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
        showProgess: false,
        uploadMessage: '',
        fileName: ''
    },
    ready: function (){

        //componentHandler.upgradeAllRegistered();
        componentHandler.upgradeDom();
    },
    events: {
        getFilesName: function(el){
            this.fileName = el;
        },
        beforeFormSubmit: function(el) {
            // fired after form is submitted
            console.log('beforeFormSubmit', el);
            this.showProgess = true;

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

            this.progress = 0;

            this.uploadMessage = "Uploaded " + this.fileName + " file successfully";

            this.fileName = '';


            this.showDialod();
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
            this.uploadMessage = "Failed uploading" + this.fileName + " file"
            this.response = err;
        }
    },
    methods: {
        showDialod: function(){
            setTimeout(function () {
                componentHandler.upgradeAllRegistered();
            });

            var dialog = document.querySelector('dialog');
            dialog.showModal();
            setTimeout(function () {
                dialog.close();
                this.showProgess = false;
            }, 5000);
        }
    }
})
