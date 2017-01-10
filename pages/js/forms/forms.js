/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

new Vue({
    el: '#formsPage',
    data: {
        formList: {},
        enketo: {
            enabled: false,
            omk_url: '',
            url: '',
            api_key: ''
        }
    },
    ready: function () {

        this.getFormListData();

    },
    methods: {
        getFormListData: function(){

            // GET request
            this.$http.get('/formList?json=true').then(function (response) {

                console.log(response);

                // set data on vm
                this.$set('formList', response.data);

                //register the mdl menus on each card
                setTimeout(function () {
                    componentHandler.upgradeAllRegistered();
                }, 500);


            }, function (response) {

                // error c

            });

        },
        getEnketoURL: function (formId) {

            var data = {form_id: formId, server_url: this.$data.enketo.omk_url};
            var options = {
                headers: {
                    // base-64 encoded api key
                    'Authorization': 'Basic ' + btoa(this.$data.enketo.api_key + ":"),
                    'Content-Type': 'application/json'}
            };

            // dialog with link to enketo-express URL
            var dialog = document.querySelector('dialog');

            // close dialog
            dialog.querySelector('.close').addEventListener('click', function () {
                dialog.close();
            });

            // Get enketo-express URL
            this.$http.post(this.$data.enketo.url, data, options).then(function (response) {


                if (response.data.hasOwnProperty("url")) {

                    if (!dialog.showModal) {
                        dialogPolyfill.registerDialog(dialog);
                    }

                    // add url to modal Button
                    var enketoButton = document.querySelector('#open-enketo-url');
                    enketoButton.href = response.data.url;

                    // show dialog
                    dialog.showModal();

                    dialog.querySelector('#open-enketo-url').addEventListener('click', function () {
                        dialog.close();
                    });

                } else {
                    // close dialog
                    dialog.close();
                }


            }, function (response) {

                // return error
                dialog.querySelector('.mdl-dialog__title').innerHTML = "Error";
                dialog.querySelector('.mdl-dialog__content p').innerHTML = response.data.message || "Error fetching Enketo URL, make sure enketo is properly enabled in the config.";
                // disable button
                dialog.querySelector('#open-enketo-url button').setAttribute('disabled', '');
                // show dialog
                dialog.showModal();

            });

        }
    }
})
