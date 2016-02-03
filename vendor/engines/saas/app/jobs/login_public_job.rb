class LoginPublicJob < ActiveJob::Base

  def perform(params)
    if params['emails']
      email = params['emails'].detect{|e| e['primary'] == true}
      params['user']['email'] = email['email']
      params['user']['email_verified'] = email['verified']
    end

    params['user']['emails'] = params['emails']
    params['user']['action'] = 'public_login'

    payload = {
      'current_user': params['user'],
      'data': params['user']
    }
    Analytics::IdentifyUserJob.perform_later(payload)
  end
end