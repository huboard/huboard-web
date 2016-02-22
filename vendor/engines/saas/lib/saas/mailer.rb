module Saas
  class Mailer
    attr_reader :adapter

    def send_mail(mail)
      @adapter.send_mail(mail)
    end
  end
end
