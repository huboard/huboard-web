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

      Saas::UserOnboarding.welcome_email(params).deliver
    end
  end
end
