class LoginPublicJob < ActiveJob::Base

  def perform(params)
    data = {
      user: params['user'],
      emails: params['emails'],
      event: 'public_login'
    }

    payload = {
      'current_user': params['user'],
      'data': data
    }
    Analytics::IdentifyUserJob.perform_later(payload)
  end
end
