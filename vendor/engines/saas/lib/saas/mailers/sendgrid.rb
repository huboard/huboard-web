module Saas
  module Mailers
    class Sendgrid

      def initialize(config)
        @api_key = config[:api_key]
        @client = SendGrid::Client.new({api_key: api_key})
      end

      def api_key
        @api_key || raise("#{self.class} missing api_key")
      end

      def send_mail(mail)
        mail_object = SendGrid::Mail.new(mail)
        mail_object.template = SendGrid::Template.new(mail[:template]) if mail[:template]
        @client.send(mail_object)
      end
    end
  end
end
