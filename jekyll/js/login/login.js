
new Vue({
  el: '#login-form',
  data: {
    failure: false,
  },
  ready: function() {
    this.checkFailure();
  },
  methods: {
    checkFailure: function() {
      var url = this.$el.baseURI.split('/');
      this.$set('failure', url[url.length - 1].includes('failure=true'));
    }
  }
});
