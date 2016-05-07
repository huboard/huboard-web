module Saas
  class Engine < ::Rails::Engine
    isolate_namespace Saas

    initializer "saas.register_before_action" do
      ActiveSupport.on_load :action_controller do
        include Saas::BeforeAction
        before_action :check_account
      end
    end

    initializer "saas.initialize_analytics" do 
      if ENV["SEGMENTIO_KEY"]
        require 'segment'
        Analytics::Core.adapter = Segment::Analytics.new({
          write_key: ENV["SEGMENTIO_KEY"]
        })
      end

      LoginController.class_eval do
        before_action :page_job, only: [:public, :private]

        :private

        def page_job
          auth_request = request.params['code'] && request.params['state']
          if request.referer !~ /github\.com/ && !logged_in? && !auth_request
            Analytics::PageJob.perform_later({
              'url' => "/login/#{params['action']}",
              'session_id' => request.session['guid']
            })
          end
        end
      end
    end
  end
end
