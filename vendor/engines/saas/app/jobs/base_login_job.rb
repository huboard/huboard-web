class BaseLoginJob < ActiveJob::Base

  def perform(params)
    payload = map_payload(params)
    Analytics::IdentifyUserJob.perform_later(payload)

    payload['url'] = "/login/#{params['action_controller.params']['action']}/authorized"
    Analytics::PageJob.perform_later(payload)
  end

  def self.action(action)
    @action = action
  end

  :private

  def map_payload(params)
    if params['emails'].is_a?(Array)
      email = params['emails'].detect{|e| e['primary'] == true} || {}
      params['user']['email'] = email['email']
      params['user']['email_verified'] = email['verified']
    end

    params['user']['emails'] = params['emails']
    params['user']['action'] = self.instance_variable_get('@action')

    {
      'current_user' => params['user'],
      'data' => params['user']
    }
  end
end
