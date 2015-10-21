require Rails.root.join('lib', 'private_pub')
PrivatePub.set_config secret_token: ENV['SECRET_KEY']

