class WelcomeController < ApplicationController
  layout false
  def index;
    redirect_to(dashboard_path) if logged_in? && current_user.has_scope?("read:org")
  end
end
