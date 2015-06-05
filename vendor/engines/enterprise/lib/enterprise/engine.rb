module Enterprise
  class Engine < ::Rails::Engine
    isolate_namespace Enterprise
    initializer "enterprise.register_before_action" do
      ActiveSupport.on_load :action_controller do
        include Enterprise::BeforeAction
        before_action :check_account
      end
    end
  end
end
