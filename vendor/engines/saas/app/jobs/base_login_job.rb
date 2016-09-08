class BaseLoginJob < ActiveJob::Base
  include ::ApplicationHelper

  def self.action(action)
    @action = action
  end

  def perform(params)
    user = map_user(params)
    Analytics::IdentifyUserJob.perform_later(user)

    req = couch.users.get(user['data']['id'])
    if req.status != 200
      Users::CreateUserJob.perform_later(user['data'])
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
    params['user']['action'] = self.class.instance_variable_get('@action')

    {
      'current_user' => params['user'],
      'data' => params['user'],
      'session_id' => params['session_id']
    }
  end
end
