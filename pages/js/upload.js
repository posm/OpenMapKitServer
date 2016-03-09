/**
 * Created by renerodriguez on 2/27/16.
 */


new Vue({
    el: '#uploadPage',
    props: ['info'],
    data: {

        fileName: '',
        fileData: '',
        hovering: false

    },
    methods: {
        onFileChange: function (e) {
            //e.preventDefault();
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;

            var data = new FormData();
            //var data = {}
            // for single file
            data.append('xls_file', files[0]);
            //data['xls_file'] = files;
            this.fileName = files[0].name;
            this.fileData = data;
            console.log("data: ", data);

        },
        upload: function(){

             //GET request
            this.$http({url: '/omk/odk/upload-form', method: 'POST', data: this.fileData}).then(function (response) {
                // success callback
                console.log(response);
            }, function (response) {
                // error callback
                console.log("error: ", response);
            });

            //this.$http.post('/omk/odk/upload-form', this.fileData, function (data, status, request) {
            //    //handling
            //    //console.log(data, status, request);
            //}).error(function (data, status, request) {
            //    //handling
            //    console.log(data, status, request);
            //});
        }
    }
})
