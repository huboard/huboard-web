if ENV['EMAIL_CLIENT_KEY']
  rails.configuration.mailer = Saas::Mailer.new
  rails.configuration.mailer.adapter = Saas::Mailers::Sendgrid.new({
    api_key: ENV['EMAIL_CLIENT_KEY']
  })
end
