module Saas
  class UserOnboarding < ActionMailer::Base
    include SendGrid
    default from: 'no-reply@huboard.com'

    def welcome_email(params)
      mail({
        to: params['email'],
        subject: 'Welcome to HuBoard'
      })
    end
  end
end
