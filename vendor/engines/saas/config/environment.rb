ActionMailer::Base.smtp_settings = {
  :password => ENV['EMAIL_CLIENT_KEY'],
  #:domain => 'yourdomain.com',
  :address => 'smtp.sendgrid.net',
  :port => 587,
  :authentication => :plain,
  :enable_starttls_auto => true
}
