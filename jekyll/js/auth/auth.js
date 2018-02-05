new Vue({
  el: '.auth-required',
  data: {
    isAuthenticated: false,
    username: null,
    role: null
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
          this.$set('role', response.data.role);
        } else {
          this.$set('isAuthenticated', false);
          this.$set('username', null);
          this.$set('role', null);
        }
      });
    }
  }
});
