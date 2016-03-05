/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

 new Vue({
  el: '#formsPage',
  data: {
  	formList:{}
  },
  ready: function() {

  	this.getFormListData();



  },
  methods:{
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

  }
  }
})
