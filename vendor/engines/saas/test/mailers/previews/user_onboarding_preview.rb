module Saas
  class UserOnboardingPreview < ActionMailer::Preview
    def welcome_email
      Saas::UserOnboarding.welcome_email({
        email: "huboard@huboard.com"
      })
    end
  end
end
