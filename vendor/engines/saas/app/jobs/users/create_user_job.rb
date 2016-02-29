module Users
  class CreateUserJob < ActiveJob::Base
    include ::ApplicationHelper

    def perform(params)
      couch.users.save({
        'id' => params['id'],
        user: params,
        emails_sent: {},
        last_login: Time.now
      })

      UserOnboardMailer.delay.welcome_email(params)
    end
  end
end
