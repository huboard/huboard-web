class Huboard
  class Client
    class Mimetype < Faraday::Middleware
      def initialize(app, *args)
        @app = app
      end

      def call(env)
        env[:request][:timeout] = 25
        env[:request][:open_timeout] = Rails.env.production? ? 5 : 10

        @app.call env
      end
    end
  end
end
