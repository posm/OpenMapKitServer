new Vue({
  el: '.admin-dv-restricted',
  data: {
    adminDVPermission: false,
    role: null,
  },
  ready: function() {
    this.getAuthentication();
  },
  methods: {
    getAuthentication: function() {
      this.$http.get('/current-user').then(function(response){
        if (response.ok) {
          this.$set(
            'adminDVPermission',
            ['admin', 'data-viewer'].includes(response.data.role)
          );
          this.$set('role', response.data.role);
        } else {
          this.$set('adminDVPermission', false);
          this.$set('role', null);
        }
      });
    }
  }
});
