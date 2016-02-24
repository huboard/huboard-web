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

      Mailers::CreateUserMailJob.perform_later(params)
    end
  end
end
