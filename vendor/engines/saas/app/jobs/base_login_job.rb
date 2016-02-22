class LoginJob < ActiveJob::Base

  def perform(params)
    payload = map_payload(params)
    Analytics::IdentifyUserJob.perform_later(payload)

    #email = map_email(params)
    #Queue job to send the email
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
    params['user']['action'] = @action

    {
      'current_user': params['user'],
      'data': params['user']
    }
  end

  def map_email(params)
    #some logic
  end
end
