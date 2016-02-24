if ENV['EMAIL_CLIENT_KEY']
  Rails.configuration.mailer = Saas::Mailer.new
  Rails.configuration.mailer.adapter = Saas::Mailers::Sendgrid.new({
    api_key: ENV['EMAIL_CLIENT_KEY']
  })
end
