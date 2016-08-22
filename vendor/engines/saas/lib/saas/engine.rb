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
    end
  end
end
