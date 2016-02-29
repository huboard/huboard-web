module Saas
  class UserOnboarding < ActionMailer::Base
    include SendGrid
    sendgrid_enable :opentrack

    default from: 'no-reply@huboard.com'

    def welcome_email(params)
      mail({
        to: params['email'],
        subject: 'Welcome to HuBoard'
      })
    end
  end
end
