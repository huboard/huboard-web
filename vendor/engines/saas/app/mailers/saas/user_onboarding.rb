module Saas
  class UserOnboarding < Saas::ApplicationMailer
    def welcome_email(params)
      mail({
        to: params['email'],
        subject: 'Welcome to HuBoard'
      })
    end
  end
end
