module Bridge
  module Middleware
    class Postgres
      def initialize(app)
        Rails.logger << "Postgres cache: init"
        @app = app
      end
      def call(env)
        Rails.logger.info env
        if :get == env[:method]
          if env[:parallel_manager]
            # callback mode
            cache_on_complete(env)
          else
            if env[:url].path.end_with? "comments"
              Rails.logger.info ":get comments"
              response = @app.call(env)
              GithubResponse.create(
                owner: 'rauhryan',
                repo: 'skipping_stones_repo',
                identifier: "81",
                #type: "issue/comments",
                payload: response.body
              )
              response
            else
              # synchronous mode
              response = @app.call(env)
              Rails.logger.info ":get method"
              Rails.logger.info response
              response
            end
          end
        elsif :patch == env[:method] || :post == env[:method] || :delete == env[:method]
            response = @app.call(env)
            Rails.logger.info ":patch :post :delete method"
            Rails.logger.info response
            response
        else
            Rails.logger.info "else do me"
            response = @app.call(env)
            Rails.logger.info response
            response
        end
      end
      def cache_on_complete(env)
        response = @app.call(env)
        response.on_complete { 
          # stuffs maybe?
        }
      end
    end
  end
end
