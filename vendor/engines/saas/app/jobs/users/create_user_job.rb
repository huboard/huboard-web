module Users
  class CreateUserJob < ActiveJob::Base
    include ::ApplicationHelper

    def perform(params)
      couch.users.save({
        'id' => params['id'],
        user: params,
        last_login: Time.now
      })
    end
  end
end
