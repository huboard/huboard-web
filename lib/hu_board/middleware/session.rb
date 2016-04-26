module HuBoard
  module Middleware
    class Session
      def initialize(app)
        @app = app
      end

      def call(env)
        if env['rack.session']['guid'].nil?
          env['rack.session']['guid'] = SecureRandom.uuid
        end

        @app.call(env)
      end
    end
  end
end
