
new Vue({
  el: '#main-menu',
  data: {
    isAuthenticated: false,
    username: null
  },
  ready: function() {
    this.getAuthentication();
  },
  methods: {
    getAuthentication: function() {
      this.$http.get('/current-user').then(function(response){
        if (response.ok) {
          this.$set('isAuthenticated', true);
          this.$set('username', response.data.username);
        } else {
          this.$set('isAuthenticated', false);
          this.$set('username', null);
        }
      });
    }
  }
});
