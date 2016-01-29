class LoginPrivateJob < ActiveJob::Base

  def perform(params)
    if params['emails']
      email = params['emails'].detect{|e| e['primary'] == true}
      params['user']['email'] = email['email']
      params['user']['email_verified'] = email['verified']
    end

    data = {
      user: params['user'],
      emails: params['emails'],
      event: 'private_login'
    }

    payload = {
      'current_user': params['user'],
      'data': data
    }
    Analytics::IdentifyUserJob.perform_later(payload)
  end
end
