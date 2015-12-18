class LoginController < ApplicationController
  layout false
  def logout
    omniauth_logout
    redirect_to "/"
  end
  def public
    omniauth_logout if github_authenticated? :private
    github_authenticate! :default
  end
  def private
    omniauth_logout if github_authenticated? :default
    github_authenticate! :private
  end
end
