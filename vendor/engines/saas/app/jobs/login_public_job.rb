class LoginPublicJob < ActiveJob::Base

  def perform(params)
    data = {
      user: params['user'],
      emails: params['emails']
    }

    payload = {
      'current_user': params['user'],
      'data': data
    }
    Analytics::IdentifyUserJob.perform_later(payload)
  end
end
