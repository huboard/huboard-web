module Warden
  module GitHub
    class Verifier
      def self.dump(user)
        new.serialize(user)
      end

      def self.load(key)
        new.deserialize(key)
      end

      def serialize(user)
        cookie_verifier.generate(user.marshal_dump)
      end

      def deserialize(key)
        User.new.tap do |u|
          u.marshal_load(cookie_verifier.verify(key))
        end
      rescue ::ActiveSupport::MessageVerifier::InvalidSignature
        nil
      end

      def verifier_key
        self.class.verifier_key
      end

      private
      def self.verifier_key
        @verifier_key ||= ENV['WARDEN_GITHUB_VERIFIER_SECRET'] || SecureRandom.hex
      end

      def cookie_verifier
        @cookie_verifier ||= ::ActiveSupport::MessageVerifier.new(verifier_key, serializer: JSON)
      end
    end
  end
end
