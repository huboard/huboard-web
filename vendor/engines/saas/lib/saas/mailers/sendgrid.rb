module Saas
  module Mailers
    class Sendgrid

      def initialize(config)
        @api_key = config[:api_key]
      end

      def api_key
        @api_key || raise("#{self.class} missing api_key")
      end
    end
  end
end
