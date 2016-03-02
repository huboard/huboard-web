module Saas
  class ApplicationMailer < ActionMailer::Base
    include SendGrid
    sendgrid_enable :opentrack

    default from: 'no-reply@huboard.com'
    layout 'mailer'

    before_filter :add_inline_attachments

    :private

    def add_inline_attachments
      attachments.inline['huboard.png'] = File.read("#{Rails.root}/app/assets/images/HuBoardSplash.png")
    end
  end
end
