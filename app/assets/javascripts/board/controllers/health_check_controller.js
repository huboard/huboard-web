var HealthCheckController = Ember.ArrayController.extend({
  model: [
    {
     name: 'health_check_1',
     message: 'This is a warning about something',
     weight: 'warning'
    },
    {
     name: 'health_check_1',
     message: 'This is a very long warning about something to test what a real long message would look like',
     weight: 'warning'
    },
    {
     name: 'health_check_2',
     message: 'This is an Error',
     weight: 'error'
    }
  ]
});

module.exports = HealthCheckController
