module Mailers
  class CreateUserMailJob < BaseMailerJob
    from 'no-reply@huboard.com'
    subject 'Thanks for using HuBoard!'
    text ''
    html ''
    template '9720d646-ccf3-4497-bca5-6ba6e92a7797'
  end
end
