module Saas
  module App
    class BoardIndexJob < ActiveJob::Base
      def perform(params)
        if params['repo'] and params["current_user"]["id"]
          Analytics::Core.group({
            user_id: params['current_user']['id'],
            group_id: params['repo']['repo']['owner']['id'],
            traits: {
              name: params['repo']['repo']['owner']['name'] || params['repo']['repo']['owner']['login'],
              login: params['repo']['repo']['owner']['login'],
            }
          })
        end
      end
    end
  end
end
