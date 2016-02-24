class BaseLoginJob < ActiveJob::Base
  include ::ApplicationHelper

  def self.action(action)
    @action = action
  end

  def perform(params)
    user = map_user(params)
    Analytics::IdentifyUserJob.perform_later(user)

    q = Queries::CouchUser.get(user[:data]['id'], couch)
    doc = QueryHandler.exec(&q)
    if doc[:rows].nil? || doc[:rows].size == 0
      Users::CreateUserJob.perform_later(user[:data])
    end
  end

  :private

  def map_user(params)
    if params['emails'].is_a?(Array)
      email = params['emails'].detect{|e| e['primary'] == true} || {}
      params['user']['email'] = email['email']
      params['user']['email_verified'] = email['verified']
    end

    params['user']['emails'] = params['emails']
    params['user']['action'] = @action

    {
      'current_user' => params['user'],
      'data' => params['user']
    }
  end
end
