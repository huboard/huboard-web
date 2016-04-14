module Saas
  module App
    class BoardCreateJob < ActiveJob::Base

      def perform(params)
        if params[:event] == 'board_created'
          params['url'] = "/#{params['action_controller.params']['user']}/#{params['action_controller.params']['repo']}/board/creating"
          Analytics::PageJob.perform_later(params)
        end
      end
    end
  end
end
