module Saas
  class Mailer
    attr_accessor :adapter

    def send_mail(mail)
      @adapter.send_mail(mail)
    end
  end
end
